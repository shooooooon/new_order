import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ========== Suppliers ==========
  suppliers: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllSuppliers();
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getSupplierById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        code: z.string().min(1),
        name: z.string().min(1),
        contactPerson: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createSupplier({
          ...input,
          email: input.email || undefined,
        });
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().min(1).optional(),
        name: z.string().min(1).optional(),
        contactPerson: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateSupplier(id, {
          ...data,
          email: data.email || undefined,
        });
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSupplier(input.id);
        return { success: true };
      }),
  }),

  // ========== Items ==========
  items: router({
    list: protectedProcedure
      .input(z.object({ search: z.string().optional() }))
      .query(async ({ input }) => {
        return await db.getAllItems(input.search);
      }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getItemById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        code: z.string().min(1),
        name: z.string().min(1),
        unit: z.string().min(1).default("個"),
        requiresLot: z.boolean().default(false),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createItem(input);
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().min(1).optional(),
        name: z.string().min(1).optional(),
        unit: z.string().min(1).optional(),
        requiresLot: z.boolean().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateItem(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteItem(input.id);
        return { success: true };
      }),
  }),

  // ========== Stock ==========
  stock: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllStockWithItems();
    }),
    
    byItem: protectedProcedure
      .input(z.object({ itemId: z.number() }))
      .query(async ({ input }) => {
        return await db.getStockLotsByItemId(input.itemId);
      }),
  }),

  // ========== Purchase Orders ==========
  purchaseOrders: router({
    list: protectedProcedure
      .input(z.object({ 
        status: z.enum(["pending", "received"]).optional() 
      }))
      .query(async ({ input }) => {
        return await db.getAllPurchaseOrders(input.status);
      }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const order = await db.getPurchaseOrderById(input.id);
        if (!order) return null;
        
        const items = await db.getPurchaseOrderItems(input.id);
        return { ...order, items };
      }),
    
    create: protectedProcedure
      .input(z.object({
        supplierId: z.number(),
        orderDate: z.date(),
        expectedDeliveryDate: z.date(),
        notes: z.string().optional(),
        items: z.array(z.object({
          itemId: z.number(),
          lotNumber: z.string().optional(),
          quantity: z.number().min(1),
          unitPrice: z.number().optional(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        // Generate order number
        const orderNumber = `PO-${Date.now()}`;
        
        // Create order
        const result = await db.createPurchaseOrder({
          orderNumber,
          supplierId: input.supplierId,
          orderDate: input.orderDate,
          expectedDeliveryDate: input.expectedDeliveryDate,
          orderedBy: ctx.user.id,
          notes: input.notes,
          status: "pending",
        });
        
        const orderId = Number((result as any).insertId);
        
        // Create order items
        for (const item of input.items) {
          await db.createPurchaseOrderItem({
            purchaseOrderId: orderId,
            ...item,
          });
        }
        
        return { success: true, orderId };
      }),
    
    receive: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Get order items
        const orderItems = await db.getPurchaseOrderItems(input.id);
        
        // Create stock lots for each item
        for (const item of orderItems) {
          await db.createStockLot({
            itemId: item.itemId,
            lotNumber: item.lotNumber || undefined,
            quantity: item.quantity,
            receivedDate: new Date(),
          });
          
          // Record adjustment
          await db.createStockAdjustment({
            itemId: item.itemId,
            lotId: null,
            quantityChange: item.quantity,
            reason: "入荷処理",
            adjustedBy: ctx.user.id,
            notes: `発注番号: ${input.id}`,
          });
        }
        
        // Update order status
        await db.updatePurchaseOrderStatus(input.id, "received");
        
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deletePurchaseOrder(input.id);
        return { success: true };
      }),
  }),

  // ========== CSV Export ==========
  export: router({ items: protectedProcedure.query(async () => {
      const items = await db.getAllItems();
      const csv = [
        'コード,品目名,単位,ロット管理,備考',
        ...items.map(item => 
          `${item.code},${item.name},${item.unit},${item.requiresLot ? '必要' : '不要'},"${item.notes || ''}"`
        )
      ].join('\n');
      return { csv, filename: `items_${new Date().toISOString().split('T')[0]}.csv` };
    }),
    
    suppliers: protectedProcedure.query(async () => {
      const suppliers = await db.getAllSuppliers();
      const csv = [
        'コード,仕入先名,連絡先,住所,備考',
        ...suppliers.map(s => 
          `${s.code},${s.name},"${s.contactPerson || ''}","${s.phone || ''}","${s.notes || ''}"`
        )
      ].join('\n');
      return { csv, filename: `suppliers_${new Date().toISOString().split('T')[0]}.csv` };
    }),
    
    stock: protectedProcedure.query(async () => {
      const stock = await db.getAllStockWithItems();
      
      const csv = [
        '品目コード,品目名,ロット番号,数量,単位,入荷日',
        ...stock.map((s: any) => {
          return `${s.item.code},${s.item.name},${s.lotNumber || '-'},${s.quantity},${s.item.unit},${s.receivedDate?.toISOString().split('T')[0] || '-'}`;
        })
      ].join('\n');
      return { csv, filename: `stock_${new Date().toISOString().split('T')[0]}.csv` };
    }),
  }),

  // ========== Shipments ==========
  shipments: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllShipments();
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const shipment = await db.getShipmentById(input.id);
        if (!shipment) return null;
        
        const items = await db.getShipmentItems(input.id);
        return { ...shipment, items };
      }),
    
    create: protectedProcedure
      .input(z.object({
        shipmentDate: z.date(),
        destination: z.string().min(1),
        notes: z.string().optional(),
        items: z.array(z.object({
          itemId: z.number(),
          lotId: z.number().optional(),
          quantity: z.number().min(1),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        // Generate shipment number
        const shipmentNumber = `SHIP-${Date.now()}`;
        
        // Create shipment
        const result = await db.createShipment({
          shipmentNumber,
          shipmentDate: input.shipmentDate,
          destination: input.destination,
          shippedBy: ctx.user.id,
          notes: input.notes,
        });
        
        const shipmentId = Number((result as any).insertId);
        
        // Create shipment items and reduce stock
        for (const item of input.items) {
          await db.createShipmentItem({
            shipmentId,
            ...item,
          });
          
          // Reduce stock quantity
          if (item.lotId) {
            const lots = await db.getStockLotsByItemId(item.itemId);
            const lot = lots.find(l => l.id === item.lotId);
            if (lot) {
              const newQuantity = lot.quantity - item.quantity;
              await db.updateStockLotQuantity(item.lotId, Math.max(0, newQuantity));
            }
          }
          
          // Record adjustment
          await db.createStockAdjustment({
            itemId: item.itemId,
            lotId: item.lotId || null,
            quantityChange: -item.quantity,
            reason: "出荷処理",
            adjustedBy: ctx.user.id,
            notes: `出荷番号: ${shipmentNumber}`,
          });
        }
        
        return { success: true, shipmentId };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteShipment(input.id);
        return { success: true };
      }),
  }),

  // ========== Stock Adjustments ==========
  stockAdjustments: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllStockAdjustments();
    }),
    
    create: protectedProcedure
      .input(z.object({
        itemId: z.number(),
        lotId: z.number().optional(),
        quantityChange: z.number(),
        reason: z.string().min(1),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Create adjustment record
        await db.createStockAdjustment({
          ...input,
          adjustedBy: ctx.user.id,
        });
        
        // Update stock lot quantity if lotId is provided
        if (input.lotId) {
          const lots = await db.getStockLotsByItemId(input.itemId);
          const lot = lots.find(l => l.id === input.lotId);
          if (lot) {
            const newQuantity = lot.quantity + input.quantityChange;
            await db.updateStockLotQuantity(input.lotId, Math.max(0, newQuantity));
          }
        }
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
