import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL 환경 변수가 필요합니다.");
}

const globalForDatabase = globalThis as unknown as {
  postgresClient?: ReturnType<typeof postgres>;
};

export const postgresClient =
  globalForDatabase.postgresClient ??
  postgres(databaseUrl, {
    max: process.env.NODE_ENV === "production" ? 1 : 10,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.postgresClient = postgresClient;
}

export const db = drizzle(postgresClient, { schema });
