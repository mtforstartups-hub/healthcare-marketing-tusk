import mysql, {
  type Pool,
  type PoolConnection,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";

declare global {
  var __mthMysqlPool: Pool | undefined;
}

function poolLimit() {
  const value = Number(process.env.DATABASE_POOL_SIZE);
  return Number.isInteger(value) && value > 0 && value < 50 ? value : 5;
}

/**
 * A single pool is reused across invocations of the same serverless instance.
 * Keep it small: many Vercel instances can connect to the same MySQL server.
 */
export function getPool(): Pool {
  if (globalThis.__mthMysqlPool) return globalThis.__mthMysqlPool;

  const uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new Error(
      "DATABASE_URL is not set. Add the MySQL connection string to the Vercel environment variables.",
    );
  }

  globalThis.__mthMysqlPool = mysql.createPool({
    uri,
    waitForConnections: true,
    connectionLimit: poolLimit(),
    maxIdle: poolLimit(),
    idleTimeout: 60_000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    ...(process.env.DATABASE_SSL === "true"
      ? {
          ssl: {
            rejectUnauthorized:
              process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false",
          },
        }
      : {}),
  });

  return globalThis.__mthMysqlPool;
}

export function getDb() {
  return drizzle(getPool(), { schema, mode: "default" });
}

/** Values accepted by mysql2 prepared statements. */
export type SqlParameter =
  | string
  | number
  | boolean
  | null
  | Date
  | Buffer
  | Uint8Array;

/** Run a parameterised SELECT and return every row. */
export async function queryRows<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const [rows] = await getPool().query(sql, params);
  return rows as T[];
}

/** Run a parameterised SELECT and return the first row, if any. */
export async function queryRow<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await queryRows<T>(sql, params);
  return rows[0] ?? null;
}

/** Run a write statement. */
export async function execute(
  sql: string,
  params: SqlParameter[] = [],
): Promise<ResultSetHeader> {
  const [result] = await getPool().execute(sql, params);
  return result as ResultSetHeader;
}

/** Run several statements atomically on one pooled connection. */
export async function transaction<T>(
  run: (connection: PoolConnection) => Promise<T>,
): Promise<T> {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await run(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ER_DUP_ENTRY"
  );
}

export type { RowDataPacket };
