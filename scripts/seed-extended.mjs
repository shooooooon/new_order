import { drizzle } from "drizzle-orm/mysql2";
import { items, suppliers, stockLots, purchaseOrders, purchaseOrderItems, stockAdjustments } from "../drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

console.log("🌱 拡張ダミーデータを投入します...");

// 追加の仕入先データ（10件）
const additionalSuppliers = [
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

console.log("仕入先データを投入中...");
for (const supplier of additionalSuppliers) {
  await db.insert(suppliers).values(supplier);
}
console.log(`✅ 仕入先 ${additionalSuppliers.length}件を追加しました`);

// 追加の品目データ（20件）
const additionalItems = [
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

console.log("品目データを投入中...");
for (const item of additionalItems) {
  await db.insert(items).values(item);
}
console.log(`✅ 品目 ${additionalItems.length}件を追加しました`);

// 追加の在庫データ（30件）
const additionalStockLots = [
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
  { itemId: 22, lotNumber: "LOT2025010617", quantity: 25, receivedDate: new Date("2024-12-29"), expiryDate: null },
  { itemId: 23, lotNumber: "LOT2025010618", quantity: 30, receivedDate: new Date("2024-12-29"), expiryDate: null },
  { itemId: 24, lotNumber: "LOT2025010619", quantity: 35, receivedDate: new Date("2024-12-28"), expiryDate: null },
  { itemId: 25, lotNumber: "LOT2025010620", quantity: 20, receivedDate: new Date("2024-12-28"), expiryDate: null },
  // 低在庫アラート用（在庫10以下）
  { itemId: 6, lotNumber: "LOT2024120601", quantity: 5, receivedDate: new Date("2024-12-06"), expiryDate: null },
  { itemId: 7, lotNumber: "LOT2024120602", quantity: 8, receivedDate: new Date("2024-12-06"), expiryDate: null },
  { itemId: 10, lotNumber: "LOT2024120603", quantity: 3, receivedDate: new Date("2024-12-05"), expiryDate: null },
  { itemId: 14, lotNumber: "LOT2024120604", quantity: 7, receivedDate: new Date("2024-12-05"), expiryDate: null },
  { itemId: 18, lotNumber: "LOT2024120605", quantity: 9, receivedDate: new Date("2024-12-04"), expiryDate: null },
  { itemId: 22, lotNumber: "LOT2024120606", quantity: 2, receivedDate: new Date("2024-12-04"), expiryDate: null },
  { itemId: 23, lotNumber: "LOT2024120607", quantity: 4, receivedDate: new Date("2024-12-03"), expiryDate: null },
  { itemId: 24, lotNumber: "LOT2024120608", quantity: 6, receivedDate: new Date("2024-12-03"), expiryDate: null },
  { itemId: 25, lotNumber: "LOT2024120609", quantity: 1, receivedDate: new Date("2024-12-02"), expiryDate: null },
  { itemId: 20, lotNumber: "LOT2024120610", quantity: 10, receivedDate: new Date("2024-12-02"), expiryDate: null },
];

console.log("在庫データを投入中...");
for (const stock of additionalStockLots) {
  await db.insert(stockLots).values(stock);
}
console.log(`✅ 在庫ロット ${additionalStockLots.length}件を追加しました`);

// 追加の発注データ（15件）
const additionalPurchaseOrders = [
  { orderNumber: "PO2025-0004", supplierId: 4, orderDate: new Date("2025-01-05"), expectedDeliveryDate: new Date("2025-01-12"), status: "pending", totalAmount: 22500 },
  { orderNumber: "PO2025-0005", supplierId: 5, orderDate: new Date("2025-01-05"), expectedDeliveryDate: new Date("2025-01-13"), status: "pending", totalAmount: 18400 },
  { orderNumber: "PO2025-0006", supplierId: 6, orderDate: new Date("2025-01-04"), expectedDeliveryDate: new Date("2025-01-14"), status: "ordered", totalAmount: 102500 },
  { orderNumber: "PO2025-0007", supplierId: 7, orderDate: new Date("2025-01-04"), expectedDeliveryDate: new Date("2025-01-15"), status: "ordered", totalAmount: 40000 },
  { orderNumber: "PO2025-0008", supplierId: 8, orderDate: new Date("2025-01-03"), expectedDeliveryDate: new Date("2025-01-16"), status: "ordered", totalAmount: 46500 },
  { orderNumber: "PO2025-0009", supplierId: 9, orderDate: new Date("2025-01-03"), expectedDeliveryDate: new Date("2025-01-17"), status: "shipped", totalAmount: 28500 },
  { orderNumber: "PO2025-0010", supplierId: 10, orderDate: new Date("2025-01-02"), expectedDeliveryDate: new Date("2025-01-09"), status: "shipped", totalAmount: 17500 },
  { orderNumber: "PO2025-0011", supplierId: 11, orderDate: new Date("2025-01-02"), expectedDeliveryDate: new Date("2025-01-10"), status: "shipped", totalAmount: 21600 },
  { orderNumber: "PO2024-0012", supplierId: 12, orderDate: new Date("2024-12-28"), expectedDeliveryDate: new Date("2025-01-05"), status: "received", totalAmount: 38000 },
  { orderNumber: "PO2024-0013", supplierId: 13, orderDate: new Date("2024-12-28"), expectedDeliveryDate: new Date("2025-01-06"), status: "received", totalAmount: 56500 },
  { orderNumber: "PO2024-0014", supplierId: 4, orderDate: new Date("2024-12-27"), expectedDeliveryDate: new Date("2025-01-04"), status: "received", totalAmount: 31500 },
  { orderNumber: "PO2024-0015", supplierId: 5, orderDate: new Date("2024-12-27"), expectedDeliveryDate: new Date("2025-01-05"), status: "cancelled", totalAmount: 0 },
  { orderNumber: "PO2024-0016", supplierId: 6, orderDate: new Date("2024-12-26"), expectedDeliveryDate: new Date("2025-01-03"), status: "received", totalAmount: 85000 },
  { orderNumber: "PO2024-0017", supplierId: 7, orderDate: new Date("2024-12-26"), expectedDeliveryDate: new Date("2025-01-04"), status: "received", totalAmount: 48000 },
  { orderNumber: "PO2024-0018", supplierId: 8, orderDate: new Date("2024-12-25"), expectedDeliveryDate: new Date("2025-01-02"), status: "received", totalAmount: 32500 },
];

console.log("発注データを投入中...");
for (const po of additionalPurchaseOrders) {
  const result = await db.insert(purchaseOrders).values(po);
  const poId = Number(result[0].insertId);
  
  // 各発注に2-4個の明細を追加
  const itemCount = Math.floor(Math.random() * 3) + 2;
  for (let i = 0; i < itemCount; i++) {
    const randomItemId = Math.floor(Math.random() * 20) + 6; // ITEM006-025
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
console.log(`✅ 発注 ${additionalPurchaseOrders.length}件を追加しました`);

// 在庫調整履歴データ（10件）
const additionalAdjustments = [
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

console.log("在庫調整履歴データを投入中...");
for (const adj of additionalAdjustments) {
  await db.insert(stockAdjustments).values(adj);
}
console.log(`✅ 在庫調整履歴 ${additionalAdjustments.length}件を追加しました`);

console.log("\n🎉 拡張ダミーデータの投入が完了しました！");
console.log("\n📊 投入データサマリー:");
console.log(`  - 仕入先: ${additionalSuppliers.length}件`);
console.log(`  - 品目: ${additionalItems.length}件`);
console.log(`  - 在庫ロット: ${additionalStockLots.length}件`);
console.log(`  - 発注: ${additionalPurchaseOrders.length}件`);
console.log(`  - 在庫調整履歴: ${additionalAdjustments.length}件`);

process.exit(0);
