import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 仕入先マスタテーブル
 */
export const suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  contactPerson: varchar("contactPerson", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

/**
 * 品目マスタテーブル
 */
export const items = mysqlTable("items", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  requiresLot: boolean("requires_lot").default(false).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Item = typeof items.$inferSelect;
export type InsertItem = typeof items.$inferInsert;

/**
 * ロット在庫テーブル
 */
export const stockLots = mysqlTable("stockLots", {
  id: int("id").autoincrement().primaryKey(),
  itemId: int("itemId").notNull(),
  lotNumber: varchar("lotNumber", { length: 100 }),
  quantity: int("quantity").notNull().default(0),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }),
  receivedDate: timestamp("receivedDate").notNull(),
  expiryDate: timestamp("expiryDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StockLot = typeof stockLots.$inferSelect;
export type InsertStockLot = typeof stockLots.$inferInsert;

/**
 * 発注ヘッダテーブル
 */
export const purchaseOrders = mysqlTable("purchaseOrders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  supplierId: int("supplierId").notNull(),
  orderDate: timestamp("orderDate").notNull(),
  expectedDeliveryDate: timestamp("expectedDeliveryDate").notNull(),
  status: mysqlEnum("status", ["pending", "received"]).notNull().default("pending"),
  orderedBy: int("orderedBy").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = typeof purchaseOrders.$inferInsert;

/**
 * 発注明細テーブル
 */
export const purchaseOrderItems = mysqlTable("purchaseOrderItems", {
  id: int("id").autoincrement().primaryKey(),
  purchaseOrderId: int("purchaseOrderId").notNull(),
  itemId: int("itemId").notNull(),
  lotNumber: varchar("lotNumber", { length: 100 }),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertPurchaseOrderItem = typeof purchaseOrderItems.$inferInsert;

/**
 * 在庫調整履歴テーブル
 */
export const stockAdjustments = mysqlTable("stockAdjustments", {
  id: int("id").autoincrement().primaryKey(),
  itemId: int("itemId").notNull(),
  lotId: int("lotId"),
  quantityChange: int("quantityChange").notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  adjustedBy: int("adjustedBy").notNull(),
  adjustedAt: timestamp("adjustedAt").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StockAdjustment = typeof stockAdjustments.$inferSelect;
export type InsertStockAdjustment = typeof stockAdjustments.$inferInsert;

/**
 * 出荷ヘッダテーブル
 */
export const shipments = mysqlTable("shipments", {
  id: int("id").autoincrement().primaryKey(),
  shipmentNumber: varchar("shipmentNumber", { length: 50 }).notNull().unique(),
  shipmentDate: timestamp("shipmentDate").notNull(),
  destination: varchar("destination", { length: 255 }).notNull(),
  shippedBy: int("shippedBy").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = typeof shipments.$inferInsert;

/**
 * 出荷明細テーブル
 */
export const shipmentItems = mysqlTable("shipmentItems", {
  id: int("id").autoincrement().primaryKey(),
  shipmentId: int("shipmentId").notNull(),
  itemId: int("itemId").notNull(),
  lotId: int("lotId"),
  quantity: int("quantity").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ShipmentItem = typeof shipmentItems.$inferSelect;
export type InsertShipmentItem = typeof shipmentItems.$inferInsert;
