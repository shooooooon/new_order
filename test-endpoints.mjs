import { drizzle } from "drizzle-orm/mysql2";
import { items, suppliers, stockLots } from "./drizzle/schema.ts";

const testEndpoints = async () => {
  console.log("🧪 Starting stability tests...\n");

  // Test 1: Database connection
  console.log("1️⃣ Testing database connection...");
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL not found");
    }
    const db = drizzle(process.env.DATABASE_URL);
    const result = await db.select().from(items).limit(1);
    console.log("✅ Database connection: OK");
  } catch (error) {
    console.log("❌ Database connection: FAILED");
    console.error(error.message);
    process.exit(1);
  }

  // Test 2: Items table
  console.log("\n2️⃣ Testing items table...");
  try {
    const db = drizzle(process.env.DATABASE_URL);
    const result = await db.select().from(items);
    console.log(`✅ Items table: OK (${result.length} records)`);
  } catch (error) {
    console.log("❌ Items table: FAILED");
    console.error(error.message);
  }

  // Test 3: Suppliers table
  console.log("\n3️⃣ Testing suppliers table...");
  try {
    const db = drizzle(process.env.DATABASE_URL);
    const result = await db.select().from(suppliers);
    console.log(`✅ Suppliers table: OK (${result.length} records)`);
  } catch (error) {
    console.log("❌ Suppliers table: FAILED");
    console.error(error.message);
  }

  // Test 4: Stock lots table
  console.log("\n4️⃣ Testing stock_lots table...");
  try {
    const db = drizzle(process.env.DATABASE_URL);
    const result = await db.select().from(stockLots);
    console.log(`✅ Stock lots table: OK (${result.length} records)`);
  } catch (error) {
    console.log("❌ Stock lots table: FAILED");
    console.error(error.message);
  }

  console.log("\n🎉 All tests completed!");
};

testEndpoints().catch(console.error);
