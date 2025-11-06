import { drizzle } from "drizzle-orm/mysql2";
import { items, suppliers, stockLots, purchaseOrders, purchaseOrderItems, stockAdjustments } from "../drizzle/schema.ts";
import { sql } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

console.log("🗑️  既存データをクリアします...");

// 外部キー制約を一時的に無効化
await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);

// 各テーブルをクリア
await db.delete(stockAdjustments);
await db.delete(purchaseOrderItems);
await db.delete(purchaseOrders);
await db.delete(stockLots);
await db.delete(items);
await db.delete(suppliers);

// 外部キー制約を再度有効化
await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);

console.log("✅ 既存データをクリアしました\n");

console.log("🌱 統合ダミーデータを投入します...\n");

// ======================
// 仕入先データ（13件）
// ======================
const allSuppliers = [
  // 元のサンプルデータ（3件）
  { code: "SUP001", name: "株式会社山田商店", contactPerson: "山田太郎", phone: "03-1234-5678", email: "yamada@example.com", address: "東京都千代田区丸の内1-1-1" },
  { code: "SUP002", name: "田中物産株式会社", contactPerson: "田中花子", phone: "06-9876-5432", email: "tanaka@example.com", address: "大阪府大阪市中央区本町2-2-2" },
  { code: "SUP003", name: "鈴木工業", contactPerson: "鈴木一郎", phone: "052-1111-2222", email: "suzuki@example.com", address: "愛知県名古屋市中村区名駅3-3-3" },
  // 追加データ（10件）
  { code: "SUP004", name: "グローバル商事", contactPerson: "鈴木太郎", phone: "03-5555-6666", email: "suzuki@global-shoji.co.jp", address: "東京都港区六本木1-2-3" },
  { code: "SUP005", name: "ユニバーサル物産", contactPerson: "佐藤花子", phone: "06-7777-8888", email: "sato@universal-bussan.co.jp", address: "大阪府大阪市北区梅田2-3-4" },
  { code: "SUP006", name: "ワールドトレード", contactPerson: "高橋一郎", phone: "052-9999-0000", email: "takahashi@world-trade.co.jp", address: "愛知県名古屋市中区栄3-4-5" },
  { code: "SUP007", name: "インターナショナル商会", contactPerson: "田中美咲", phone: "092-1111-2222", email: "tanaka@intl-shokai.co.jp", address: "福岡県福岡市博多区博多駅前4-5-6" },
  { code: "SUP008", name: "パシフィック貿易", contactPerson: "伊藤健太", phone: "011-3333-4444", email: "ito@pacific-trade.co.jp", address: "北海道札幌市中央区大通西5-6-7" },
  { code: "SUP009", name: "アジア物流", contactPerson: "渡辺さくら", phone: "022-5555-6666", email: "watanabe@asia-logistics.co.jp", address: "宮城県仙台市青葉区中央6-7-8" },
  { code: "SUP010", name: "メトロポリタン商事", contactPerson: "山本大輔", phone: "045-7777-8888", email: "yamamoto@metro-shoji.co.jp", address: "神奈川県横浜市西区みなとみらい7-8-9" },
  { code: "SUP011", name: "コスモス物産", contactPerson: "中村愛", phone: "075-9999-0000", email: "nakamura@cosmos-bussan.co.jp", address: "京都府京都市下京区烏丸通8-9-10" },
  { code: "SUP012", name: "オーシャントレード", contactPerson: "小林拓也", phone: "082-1111-2222", email: "kobayashi@ocean-trade.co.jp", address: "広島県広島市中区紙屋町9-10-11" },
  { code: "SUP013", name: "サンライズ商会", contactPerson: "加藤麻衣", phone: "087-3333-4444", email: "kato@sunrise-shokai.co.jp", address: "香川県高松市丸亀町10-11-12" },
];

console.log("📦 仕入先データを投入中...");
await db.insert(suppliers).values(allSuppliers);
console.log(`✅ 仕入先 ${allSuppliers.length}件を追加しました\n`);

// ======================
// 品目データ（25件）
// ======================
const allItems = [
  // 元のサンプルデータ（5件）
  { code: "ITEM001", name: "ボールペン(黒)", unit: "本", requiresLot: false, notes: "一般事務用" },
  { code: "ITEM002", name: "A4コピー用紙", unit: "箱", requiresLot: true, notes: "500枚×5冊入り" },
  { code: "ITEM003", name: "クリアファイル", unit: "枚", requiresLot: false, notes: "A4サイズ" },
  { code: "ITEM004", name: "マスク", unit: "箱", requiresLot: true, notes: "50枚入り、要期限管理" },
  { code: "ITEM005", name: "消毒液", unit: "本", requiresLot: true, notes: "500ml、要期限管理" },
  // 追加データ（20件）
  { code: "ITEM006", name: "ステンレスボルト M8x50", unit: "本", requiresLot: false, notes: "金属部品" },
  { code: "ITEM007", name: "六角ナット M10", unit: "個", requiresLot: false, notes: "金属部品" },
  { code: "ITEM008", name: "ワッシャー M8", unit: "枚", requiresLot: false, notes: "金属部品" },
  { code: "ITEM009", name: "スプリングワッシャー M10", unit: "枚", requiresLot: false, notes: "金属部品" },
  { code: "ITEM010", name: "アルミ板 1mm厚", unit: "枚", requiresLot: true, notes: "要ロット管理" },
  { code: "ITEM011", name: "銅板 0.5mm厚", unit: "枚", requiresLot: true, notes: "要ロット管理" },
  { code: "ITEM012", name: "真鍮棒 φ10mm", unit: "本", requiresLot: true, notes: "要ロット管理" },
  { code: "ITEM013", name: "ステンレス棒 φ12mm", unit: "本", requiresLot: true, notes: "要ロット管理" },
  { code: "ITEM014", name: "樹脂プレート 5mm厚", unit: "枚", requiresLot: false, notes: "樹脂製品" },
  { code: "ITEM015", name: "ゴムシート 3mm厚", unit: "枚", requiresLot: false, notes: "ゴム製品" },
  { code: "ITEM016", name: "シリコンチューブ φ8mm", unit: "m", requiresLot: true, notes: "要ロット管理" },
  { code: "ITEM017", name: "ビニールチューブ φ6mm", unit: "m", requiresLot: false, notes: "チューブ類" },
  { code: "ITEM018", name: "電線 1.25sq 赤", unit: "m", requiresLot: true, notes: "電気部品" },
  { code: "ITEM019", name: "電線 1.25sq 黒", unit: "m", requiresLot: true, notes: "電気部品" },
  { code: "ITEM020", name: "熱収縮チューブ φ10mm", unit: "m", requiresLot: false, notes: "電気部品" },
  { code: "ITEM021", name: "結束バンド 200mm", unit: "本", requiresLot: false, notes: "消耗品" },
  { code: "ITEM022", name: "接着剤 エポキシ系", unit: "本", requiresLot: true, notes: "要期限管理" },
  { code: "ITEM023", name: "潤滑油 スプレー式", unit: "本", requiresLot: true, notes: "要期限管理" },
  { code: "ITEM024", name: "防錆剤 スプレー式", unit: "本", requiresLot: true, notes: "要期限管理" },
  { code: "ITEM025", name: "洗浄剤 業務用", unit: "本", requiresLot: true, notes: "要期限管理" },
];

console.log("📋 品目データを投入中...");
await db.insert(items).values(allItems);
console.log(`✅ 品目 ${allItems.length}件を追加しました\n`);

// ======================
// 在庫データ（36件）
// ======================
const allStockLots = [
  // 元のサンプルデータ（6件）
  { itemId: 1, lotNumber: "LOT2025010101", quantity: 100, receivedDate: new Date("2025-01-01"), expiryDate: null },
  { itemId: 2, lotNumber: "LOT2025010201", quantity: 50, receivedDate: new Date("2025-01-02"), expiryDate: null },
  { itemId: 3, lotNumber: "LOT2025010301", quantity: 200, receivedDate: new Date("2025-01-03"), expiryDate: null },
  { itemId: 4, lotNumber: "LOT2024120401", quantity: 30, receivedDate: new Date("2024-12-04"), expiryDate: new Date("2025-06-04") },
  { itemId: 5, lotNumber: "LOT2024120501", quantity: 40, receivedDate: new Date("2024-12-05"), expiryDate: new Date("2025-12-05") },
  { itemId: 2, lotNumber: "LOT2024120201", quantity: 25, receivedDate: new Date("2024-12-02"), expiryDate: null },
  // 追加データ（30件）
  { itemId: 6, lotNumber: "LOT2025010601", quantity: 500, receivedDate: new Date("2025-01-06"), expiryDate: null },
  { itemId: 7, lotNumber: "LOT2025010602", quantity: 800, receivedDate: new Date("2025-01-06"), expiryDate: null },
  { itemId: 8, lotNumber: "LOT2025010603", quantity: 1200, receivedDate: new Date("2025-01-05"), expiryDate: null },
  { itemId: 9, lotNumber: "LOT2025010604", quantity: 1000, receivedDate: new Date("2025-01-05"), expiryDate: null },
  { itemId: 10, lotNumber: "LOT2025010605", quantity: 50, receivedDate: new Date("2025-01-04"), expiryDate: null },
  { itemId: 11, lotNumber: "LOT2025010606", quantity: 30, receivedDate: new Date("2025-01-04"), expiryDate: null },
  { itemId: 12, lotNumber: "LOT2025010607", quantity: 80, receivedDate: new Date("2025-01-03"), expiryDate: null },
  { itemId: 13, lotNumber: "LOT2025010608", quantity: 60, receivedDate: new Date("2025-01-03"), expiryDate: null },
  { itemId: 14, lotNumber: "LOT2025010609", quantity: 40, receivedDate: new Date("2025-01-02"), expiryDate: null },
  { itemId: 15, lotNumber: "LOT2025010610", quantity: 70, receivedDate: new Date("2025-01-02"), expiryDate: null },
  { itemId: 16, lotNumber: "LOT2025010611", quantity: 200, receivedDate: new Date("2025-01-01"), expiryDate: null },
  { itemId: 17, lotNumber: "LOT2025010612", quantity: 300, receivedDate: new Date("2025-01-01"), expiryDate: null },
  { itemId: 18, lotNumber: "LOT2025010613", quantity: 500, receivedDate: new Date("2024-12-31"), expiryDate: null },
  { itemId: 19, lotNumber: "LOT2025010614", quantity: 500, receivedDate: new Date("2024-12-31"), expiryDate: null },
  { itemId: 20, lotNumber: "LOT2025010615", quantity: 150, receivedDate: new Date("2024-12-30"), expiryDate: null },
  { itemId: 21, lotNumber: "LOT2025010616", quantity: 2000, receivedDate: new Date("2024-12-30"), expiryDate: null },
  { itemId: 22, lotNumber: "LOT2025010617", quantity: 25, receivedDate: new Date("2024-12-29"), expiryDate: new Date("2025-12-29") },
  { itemId: 23, lotNumber: "LOT2025010618", quantity: 30, receivedDate: new Date("2024-12-29"), expiryDate: new Date("2025-12-29") },
  { itemId: 24, lotNumber: "LOT2025010619", quantity: 35, receivedDate: new Date("2024-12-28"), expiryDate: new Date("2025-12-28") },
  { itemId: 25, lotNumber: "LOT2025010620", quantity: 20, receivedDate: new Date("2024-12-28"), expiryDate: new Date("2025-12-28") },
  // 低在庫アラート用（在庫10以下）
  { itemId: 6, lotNumber: "LOT2024120601", quantity: 5, receivedDate: new Date("2024-12-06"), expiryDate: null },
  { itemId: 7, lotNumber: "LOT2024120602", quantity: 8, receivedDate: new Date("2024-12-06"), expiryDate: null },
  { itemId: 10, lotNumber: "LOT2024120603", quantity: 3, receivedDate: new Date("2024-12-05"), expiryDate: null },
  { itemId: 14, lotNumber: "LOT2024120604", quantity: 7, receivedDate: new Date("2024-12-05"), expiryDate: null },
  { itemId: 18, lotNumber: "LOT2024120605", quantity: 9, receivedDate: new Date("2024-12-04"), expiryDate: null },
  { itemId: 22, lotNumber: "LOT2024120606", quantity: 2, receivedDate: new Date("2024-12-04"), expiryDate: new Date("2025-12-04") },
  { itemId: 23, lotNumber: "LOT2024120607", quantity: 4, receivedDate: new Date("2024-12-03"), expiryDate: new Date("2025-12-03") },
  { itemId: 24, lotNumber: "LOT2024120608", quantity: 6, receivedDate: new Date("2024-12-03"), expiryDate: new Date("2025-12-03") },
  { itemId: 25, lotNumber: "LOT2024120609", quantity: 1, receivedDate: new Date("2024-12-02"), expiryDate: new Date("2025-12-02") },
  { itemId: 20, lotNumber: "LOT2024120610", quantity: 10, receivedDate: new Date("2024-12-02"), expiryDate: null },
];

console.log("📦 在庫データを投入中...");
await db.insert(stockLots).values(allStockLots);
console.log(`✅ 在庫ロット ${allStockLots.length}件を追加しました\n`);

// ======================
// 発注データ（18件）
// ======================
const allPurchaseOrders = [
  // 元のサンプルデータ（3件）
  { orderNumber: "PO2025-0001", supplierId: 1, orderDate: new Date("2025-01-05"), expectedDeliveryDate: new Date("2025-01-10"), status: "pending", orderedBy: 1 },
  { orderNumber: "PO2025-0002", supplierId: 2, orderDate: new Date("2025-01-04"), expectedDeliveryDate: new Date("2025-01-11"), status: "pending", orderedBy: 1 },
  { orderNumber: "PO2025-0003", supplierId: 3, orderDate: new Date("2025-01-03"), expectedDeliveryDate: new Date("2025-01-12"), status: "pending", orderedBy: 1 },
  // 追加データ（15件）
  { orderNumber: "PO2025-0004", supplierId: 4, orderDate: new Date("2025-01-05"), expectedDeliveryDate: new Date("2025-01-12"), status: "pending", orderedBy: 1 },
  { orderNumber: "PO2025-0005", supplierId: 5, orderDate: new Date("2025-01-05"), expectedDeliveryDate: new Date("2025-01-13"), status: "pending", orderedBy: 1 },
  { orderNumber: "PO2025-0006", supplierId: 6, orderDate: new Date("2025-01-04"), expectedDeliveryDate: new Date("2025-01-14"), status: "pending", orderedBy: 1 },
  { orderNumber: "PO2025-0007", supplierId: 7, orderDate: new Date("2025-01-04"), expectedDeliveryDate: new Date("2025-01-15"), status: "pending", orderedBy: 1 },
  { orderNumber: "PO2025-0008", supplierId: 8, orderDate: new Date("2025-01-03"), expectedDeliveryDate: new Date("2025-01-16"), status: "pending", orderedBy: 1 },
  { orderNumber: "PO2025-0009", supplierId: 9, orderDate: new Date("2025-01-03"), expectedDeliveryDate: new Date("2025-01-17"), status: "pending", orderedBy: 1 },
  { orderNumber: "PO2025-0010", supplierId: 10, orderDate: new Date("2025-01-02"), expectedDeliveryDate: new Date("2025-01-09"), status: "pending", orderedBy: 1 },
  { orderNumber: "PO2025-0011", supplierId: 11, orderDate: new Date("2025-01-02"), expectedDeliveryDate: new Date("2025-01-10"), status: "pending", orderedBy: 1 },
  { orderNumber: "PO2024-0012", supplierId: 12, orderDate: new Date("2024-12-28"), expectedDeliveryDate: new Date("2025-01-05"), status: "received", orderedBy: 1 },
  { orderNumber: "PO2024-0013", supplierId: 13, orderDate: new Date("2024-12-28"), expectedDeliveryDate: new Date("2025-01-06"), status: "received", orderedBy: 1 },
  { orderNumber: "PO2024-0014", supplierId: 4, orderDate: new Date("2024-12-27"), expectedDeliveryDate: new Date("2025-01-04"), status: "received", orderedBy: 1 },
  { orderNumber: "PO2024-0015", supplierId: 5, orderDate: new Date("2024-12-27"), expectedDeliveryDate: new Date("2025-01-05"), status: "received", orderedBy: 1 },
  { orderNumber: "PO2024-0016", supplierId: 6, orderDate: new Date("2024-12-26"), expectedDeliveryDate: new Date("2025-01-03"), status: "received", orderedBy: 1 },
  { orderNumber: "PO2024-0017", supplierId: 7, orderDate: new Date("2024-12-26"), expectedDeliveryDate: new Date("2025-01-04"), status: "received", orderedBy: 1 },
  { orderNumber: "PO2024-0018", supplierId: 8, orderDate: new Date("2024-12-25"), expectedDeliveryDate: new Date("2025-01-02"), status: "received", orderedBy: 1 },
];

console.log("📝 発注データを投入中...");
for (const po of allPurchaseOrders) {
  const result = await db.insert(purchaseOrders).values(po);
  const poId = Number(result[0].insertId);
  
  // 各発注に2-4個の明細を追加
  const itemCount = Math.floor(Math.random() * 3) + 2;
  const usedItemIds = new Set();
  
  for (let i = 0; i < itemCount; i++) {
    let randomItemId;
    do {
      randomItemId = Math.floor(Math.random() * 25) + 1; // ITEM001-025
    } while (usedItemIds.has(randomItemId));
    usedItemIds.add(randomItemId);
    
    const randomQuantity = Math.floor(Math.random() * 100) + 50;
    const randomPrice = Math.floor(Math.random() * 500) + 50;
    
    await db.insert(purchaseOrderItems).values({
      purchaseOrderId: poId,
      itemId: randomItemId,
      quantity: randomQuantity,
      unitPrice: randomPrice,
    });
  }
}
console.log(`✅ 発注 ${allPurchaseOrders.length}件（明細含む）を追加しました\n`);

// ======================
// 在庫調整履歴データ（10件）
// ======================
const allAdjustments = [
  { itemId: 6, lotNumber: "LOT2025010601", adjustmentType: "increase", quantity: 50, reason: "棚卸差異による追加", adjustedBy: "倉庫担当A", adjustedAt: new Date("2025-01-06 10:00:00") },
  { itemId: 7, lotNumber: "LOT2025010602", adjustmentType: "decrease", quantity: 20, reason: "破損品の廃棄", adjustedBy: "倉庫担当B", adjustedAt: new Date("2025-01-06 11:00:00") },
  { itemId: 10, lotNumber: "LOT2025010605", adjustmentType: "increase", quantity: 10, reason: "返品受入", adjustedBy: "倉庫担当A", adjustedAt: new Date("2025-01-05 14:00:00") },
  { itemId: 14, lotNumber: "LOT2025010609", adjustmentType: "decrease", quantity: 5, reason: "サンプル出荷", adjustedBy: "営業担当C", adjustedAt: new Date("2025-01-05 15:00:00") },
  { itemId: 18, lotNumber: "LOT2025010613", adjustmentType: "increase", quantity: 100, reason: "棚卸差異による追加", adjustedBy: "倉庫担当A", adjustedAt: new Date("2025-01-04 09:00:00") },
  { itemId: 20, lotNumber: "LOT2025010615", adjustmentType: "decrease", quantity: 15, reason: "品質不良による廃棄", adjustedBy: "品質管理D", adjustedAt: new Date("2025-01-04 10:00:00") },
  { itemId: 22, lotNumber: "LOT2025010617", adjustmentType: "increase", quantity: 5, reason: "誤出荷の返品", adjustedBy: "倉庫担当B", adjustedAt: new Date("2025-01-03 13:00:00") },
  { itemId: 23, lotNumber: "LOT2025010618", adjustmentType: "decrease", quantity: 3, reason: "社内使用", adjustedBy: "製造担当E", adjustedAt: new Date("2025-01-03 14:00:00") },
  { itemId: 24, lotNumber: "LOT2025010619", adjustmentType: "increase", quantity: 8, reason: "棚卸差異による追加", adjustedBy: "倉庫担当A", adjustedAt: new Date("2025-01-02 11:00:00") },
  { itemId: 25, lotNumber: "LOT2025010620", adjustmentType: "decrease", quantity: 10, reason: "期限切れによる廃棄", adjustedBy: "品質管理D", adjustedAt: new Date("2025-01-02 12:00:00") },
];

console.log("📊 在庫調整履歴データを投入中...");
await db.insert(stockAdjustments).values(allAdjustments);
console.log(`✅ 在庫調整履歴 ${allAdjustments.length}件を追加しました\n`);

console.log("🎉 統合ダミーデータの投入が完了しました！\n");
console.log("📊 投入データサマリー:");
console.log(`  - 仕入先: ${allSuppliers.length}件`);
console.log(`  - 品目: ${allItems.length}件`);
console.log(`  - 在庫ロット: ${allStockLots.length}件`);
console.log(`  - 発注: ${allPurchaseOrders.length}件（明細含む）`);
console.log(`  - 在庫調整履歴: ${allAdjustments.length}件`);

process.exit(0);
