import { eq, desc, and, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  suppliers,
  items,
  stockLots,
  purchaseOrders,
  purchaseOrderItems,
  stockAdjustments,
  shipments,
  shipmentItems,
  InsertSupplier,
  InsertItem,
  InsertStockLot,
  InsertPurchaseOrder,
  InsertPurchaseOrderItem,
  InsertStockAdjustment,
  InsertShipment,
  InsertShipmentItem
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ========== Suppliers ==========

export async function getAllSuppliers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
}

export async function getSupplierById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
  return result[0];
}

export async function createSupplier(data: InsertSupplier) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(suppliers).values(data);
  return result;
}

export async function updateSupplier(id: number, data: Partial<InsertSupplier>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(suppliers).set(data).where(eq(suppliers.id, id));
}

export async function deleteSupplier(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(suppliers).where(eq(suppliers.id, id));
}

// ========== Items ==========

export async function getAllItems(search?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (search) {
    return await db.select().from(items)
      .where(or(
        like(items.code, `%${search}%`),
        like(items.name, `%${search}%`)
      ))
      .orderBy(desc(items.createdAt));
  }
  
  return await db.select().from(items).orderBy(desc(items.createdAt));
}

export async function getItemById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(items).where(eq(items.id, id)).limit(1);
  return result[0];
}

export async function createItem(data: InsertItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(items).values(data);
  return result;
}

export async function updateItem(id: number, data: Partial<InsertItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(items).set(data).where(eq(items.id, id));
}

export async function deleteItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(items).where(eq(items.id, id));
}

// ========== Stock Lots ==========

export async function getStockLotsByItemId(itemId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(stockLots)
    .where(eq(stockLots.itemId, itemId))
    .orderBy(desc(stockLots.receivedDate));
}

export async function getAllStockWithItems() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    id: stockLots.id,
    itemId: stockLots.itemId,
    itemCode: items.code,
    itemName: items.name,
    unit: items.unit,
    requiresLot: items.requiresLot,
    lotNumber: stockLots.lotNumber,
    quantity: stockLots.quantity,
    receivedDate: stockLots.receivedDate,
    expiryDate: stockLots.expiryDate,
  })
  .from(stockLots)
  .leftJoin(items, eq(stockLots.itemId, items.id))
  .orderBy(desc(stockLots.receivedDate));
}

export async function createStockLot(data: InsertStockLot) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(stockLots).values(data);
  return result;
}

export async function updateStockLotQuantity(id: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(stockLots).set({ quantity }).where(eq(stockLots.id, id));
}

// ========== Purchase Orders ==========

export async function getAllPurchaseOrders(status?: "pending" | "received") {
  const db = await getDb();
  if (!db) return [];
  
  const query = db.select({
    id: purchaseOrders.id,
    orderNumber: purchaseOrders.orderNumber,
    supplierId: purchaseOrders.supplierId,
    supplierName: suppliers.name,
    orderDate: purchaseOrders.orderDate,
    expectedDeliveryDate: purchaseOrders.expectedDeliveryDate,
    status: purchaseOrders.status,
    orderedBy: purchaseOrders.orderedBy,
    orderedByName: users.name,
    notes: purchaseOrders.notes,
    createdAt: purchaseOrders.createdAt,
  })
  .from(purchaseOrders)
  .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
  .leftJoin(users, eq(purchaseOrders.orderedBy, users.id));
  
  if (status) {
    return await query.where(eq(purchaseOrders.status, status)).orderBy(desc(purchaseOrders.orderDate));
  }
  
  return await query.orderBy(desc(purchaseOrders.orderDate));
}

export async function getPurchaseOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select({
    id: purchaseOrders.id,
    orderNumber: purchaseOrders.orderNumber,
    supplierId: purchaseOrders.supplierId,
    supplierName: suppliers.name,
    orderDate: purchaseOrders.orderDate,
    expectedDeliveryDate: purchaseOrders.expectedDeliveryDate,
    status: purchaseOrders.status,
    orderedBy: purchaseOrders.orderedBy,
    orderedByName: users.name,
    notes: purchaseOrders.notes,
    createdAt: purchaseOrders.createdAt,
  })
  .from(purchaseOrders)
  .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
  .leftJoin(users, eq(purchaseOrders.orderedBy, users.id))
  .where(eq(purchaseOrders.id, id))
  .limit(1);
  
  return result[0];
}

export async function getPurchaseOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    id: purchaseOrderItems.id,
    purchaseOrderId: purchaseOrderItems.purchaseOrderId,
    itemId: purchaseOrderItems.itemId,
    itemCode: items.code,
    itemName: items.name,
    unit: items.unit,
    requiresLot: items.requiresLot,
    lotNumber: purchaseOrderItems.lotNumber,
    quantity: purchaseOrderItems.quantity,
    unitPrice: purchaseOrderItems.unitPrice,
  })
  .from(purchaseOrderItems)
  .leftJoin(items, eq(purchaseOrderItems.itemId, items.id))
  .where(eq(purchaseOrderItems.purchaseOrderId, orderId));
}

export async function createPurchaseOrder(data: InsertPurchaseOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(purchaseOrders).values(data);
  return result;
}

export async function createPurchaseOrderItem(data: InsertPurchaseOrderItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(purchaseOrderItems).values(data);
  return result;
}

export async function updatePurchaseOrderStatus(id: number, status: "pending" | "received") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(purchaseOrders).set({ status }).where(eq(purchaseOrders.id, id));
}

export async function deletePurchaseOrder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete order items first
  await db.delete(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, id));
  // Then delete the order
  await db.delete(purchaseOrders).where(eq(purchaseOrders.id, id));
}

// ========== Stock Adjustments ==========

export async function getAllStockAdjustments() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    id: stockAdjustments.id,
    itemId: stockAdjustments.itemId,
    itemCode: items.code,
    itemName: items.name,
    lotId: stockAdjustments.lotId,
    lotNumber: stockLots.lotNumber,
    quantityChange: stockAdjustments.quantityChange,
    reason: stockAdjustments.reason,
    adjustedBy: stockAdjustments.adjustedBy,
    adjustedByName: users.name,
    adjustedAt: stockAdjustments.adjustedAt,
    notes: stockAdjustments.notes,
  })
  .from(stockAdjustments)
  .leftJoin(items, eq(stockAdjustments.itemId, items.id))
  .leftJoin(stockLots, eq(stockAdjustments.lotId, stockLots.id))
  .leftJoin(users, eq(stockAdjustments.adjustedBy, users.id))
  .orderBy(desc(stockAdjustments.adjustedAt));
}

export async function createStockAdjustment(data: InsertStockAdjustment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(stockAdjustments).values(data);
  return result;
}

// ========== Shipments ==========

export async function getAllShipments() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    id: shipments.id,
    shipmentNumber: shipments.shipmentNumber,
    shipmentDate: shipments.shipmentDate,
    destination: shipments.destination,
    shippedBy: shipments.shippedBy,
    shippedByName: users.name,
    notes: shipments.notes,
    createdAt: shipments.createdAt,
  })
  .from(shipments)
  .leftJoin(users, eq(shipments.shippedBy, users.id))
  .orderBy(desc(shipments.shipmentDate));
}

export async function getShipmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select({
    id: shipments.id,
    shipmentNumber: shipments.shipmentNumber,
    shipmentDate: shipments.shipmentDate,
    destination: shipments.destination,
    shippedBy: shipments.shippedBy,
    shippedByName: users.name,
    notes: shipments.notes,
    createdAt: shipments.createdAt,
  })
  .from(shipments)
  .leftJoin(users, eq(shipments.shippedBy, users.id))
  .where(eq(shipments.id, id))
  .limit(1);
  
  return result[0];
}

export async function getShipmentItems(shipmentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    id: shipmentItems.id,
    shipmentId: shipmentItems.shipmentId,
    itemId: shipmentItems.itemId,
    itemCode: items.code,
    itemName: items.name,
    unit: items.unit,
    lotId: shipmentItems.lotId,
    lotNumber: stockLots.lotNumber,
    quantity: shipmentItems.quantity,
  })
  .from(shipmentItems)
  .leftJoin(items, eq(shipmentItems.itemId, items.id))
  .leftJoin(stockLots, eq(shipmentItems.lotId, stockLots.id))
  .where(eq(shipmentItems.shipmentId, shipmentId));
}

export async function createShipment(data: InsertShipment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(shipments).values(data);
  return result;
}

export async function createShipmentItem(data: InsertShipmentItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(shipmentItems).values(data);
  return result;
}

export async function deleteShipment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete shipment items first
  await db.delete(shipmentItems).where(eq(shipmentItems.shipmentId, id));
  // Then delete the shipment
  await db.delete(shipments).where(eq(shipments.id, id));
}


