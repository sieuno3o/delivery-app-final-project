import { config } from "dotenv";
import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { menuItems, restaurants } from "../src/db/schema";

config({ path: ".env.local" });
config({ path: ".env" });

const databaseUrl = process.env.DATABASE_URL ?? "";

if (!databaseUrl) {
  throw new Error("DATABASE_URL 환경 변수가 필요합니다.");
}

async function checkDatabase() {
  const client = postgres(databaseUrl, { max: 1, prepare: false });
  const db = drizzle(client);

  try {
    const [restaurantResult] = await db
      .select({ count: count() })
      .from(restaurants);
    const [menuResult] = await db.select({ count: count() }).from(menuItems);

    const restaurantCount = restaurantResult?.count ?? 0;
    const menuCount = menuResult?.count ?? 0;

    if (restaurantCount < 6 || menuCount < 30) {
      throw new Error(
        `시드 검증 실패: 식당 ${restaurantCount}개, 메뉴 ${menuCount}개`,
      );
    }

    console.info(
      `DB 검증 통과: 식당 ${restaurantCount}개, 메뉴 ${menuCount}개`,
    );
  } finally {
    await client.end();
  }
}

checkDatabase().catch((error: unknown) => {
  console.error("DB 검증 실패", error);
  process.exitCode = 1;
});
