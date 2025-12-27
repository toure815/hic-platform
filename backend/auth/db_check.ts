import { api, APIError } from "encore.dev/api";
import { authDB } from "./db";

interface DbCheckResponse {
  tables: { name: string }[];
  usersCount?: number;
}

// Checks database status and returns table information.
export const dbCheck = api<void, DbCheckResponse>(
  {
    method: "GET",
    path: "/auth/db-check",
    auth: true,
    expose: true,
  },
  async () => {
    try {
      const tables = await authDB.queryAll<{ name: string }>`
        SELECT table_name AS name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `;

      let usersCount: number | undefined;
      if (tables.some(t => t.name === "users")) {
        const row = await authDB.queryRow<{ c: number }>`SELECT COUNT(*)::int AS c FROM users`;
        usersCount = row?.c;
      }

      return { tables, usersCount };
    } catch (e: any) {
      throw APIError.internal("DB check failed: " + (e?.message ?? String(e)));
    }
  }
);
