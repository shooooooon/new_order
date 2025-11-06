import { drizzle } from "drizzle-orm/mysql2";
import {
  users,
  suppliers,
  items,
  stockLots,
  purchaseOrders,
  purchaseOrderItems,
} from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("🌱 サンプルデータを投入中...");

  try {
    // 仕入先データ
    console.log("📦 仕入先データを投入中...");
    await db.insert(suppliers).values([
      {
        code: "SUP001",
        name: "株式会社山田商店",
        contactPerson: "山田太郎",
        phone: "03-1234-5678",
        email: "yamada@example.com",
        notes: "主要仕入先",
      },
      {
        code: "SUP002",
        name: "田中物産株式会社",
        contactPerson: "田中花子",
        phone: "06-9876-5432",
        email: "tanaka@example.com",
        notes: "食品系仕入先",
      },
      {
        code: "SUP003",
        name: "鈴木工業",
        contactPerson: "鈴木一郎",
        phone: "052-1111-2222",
        email: "suzuki@example.com",
        notes: "工業製品仕入先",
      },
    ]);

    // 品目データ
    console.log("📋 品目データを投入中...");
    await db.insert(items).values([
      {
        code: "ITEM001",
        name: "ボールペン(黒)",
        unit: "本",
        requiresLot: false,
        notes: "一般事務用",
      },
      {
        code: "ITEM002",
        name: "A4コピー用紙",
        unit: "箱",
        requiresLot: true,
        notes: "500枚×5冊入り",
      },
      {
        code: "ITEM003",
        name: "クリアファイル",
        unit: "枚",
        requiresLot: false,
        notes: "A4サイズ",
      },
      {
        code: "ITEM004",
        name: "マスク",
        unit: "箱",
        requiresLot: true,
        notes: "50枚入り、要期限管理",
      },
      {
        code: "ITEM005",
        name: "消毒液",
        unit: "本",
        requiresLot: true,
        notes: "500ml、要期限管理",
      },
    ]);

    // 在庫ロットデータ
    console.log("📊 在庫データを投入中...");
    const today = new Date();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);

    await db.insert(stockLots).values([
      {
        itemId: 1, // ボールペン
        lotNumber: null,
        quantity: 150,
        receivedDate: new Date("2024-10-01"),
        expiryDate: null,
      },
      {
        itemId: 2, // コピー用紙
        lotNumber: "LOT-2024-001",
        quantity: 25,
        receivedDate: new Date("2024-10-15"),
        expiryDate: null,
      },
      {
        itemId: 2, // コピー用紙
        lotNumber: "LOT-2024-002",
        quantity: 30,
        receivedDate: new Date("2024-11-01"),
        expiryDate: null,
      },
      {
        itemId: 3, // クリアファイル
        lotNumber: null,
        quantity: 200,
        receivedDate: new Date("2024-10-20"),
        expiryDate: null,
      },
      {
        itemId: 4, // マスク
        lotNumber: "MASK-2024-A",
        quantity: 50,
        receivedDate: new Date("2024-10-10"),
        expiryDate: futureDate,
      },
      {
        itemId: 5, // 消毒液
        lotNumber: "DISINFECT-2024-B",
        quantity: 30,
        receivedDate: new Date("2024-10-25"),
        expiryDate: futureDate,
      },
    ]);

    console.log("✅ サンプルデータの投入が完了しました!");
    console.log("");
    console.log("📊 投入されたデータ:");
    console.log("  - 仕入先: 3件");
    console.log("  - 品目: 5件");
    console.log("  - 在庫ロット: 6件");
    console.log("");
    console.log("🎉 アプリケーションにログインして確認してください!");
  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
