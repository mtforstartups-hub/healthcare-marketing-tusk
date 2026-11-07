import {
  bigint,
  index,
  int,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const requests = mysqlTable(
  "requests",
  {
    reference: varchar("reference", { length: 32 }).primaryKey(),
    kind: varchar("kind", { length: 20 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("new"),
    idempotencyKey: varchar("idempotency_key", { length: 80 }).notNull(),
    fingerprint: varchar("fingerprint", { length: 64 }).notNull(),
    encryptedPayload: text("encrypted_payload").notNull(),
    resourceId: varchar("resource_id", { length: 100 }),
    service: varchar("service", { length: 40 }),
    icp: varchar("icp", { length: 80 }),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
  },
  (table) => [
    uniqueIndex("request_idempotency").on(table.idempotencyKey),
    index("request_expiry").on(table.expiresAt),
    index("request_created").on(table.createdAt),
  ],
);

export const rateLimits = mysqlTable("rate_limits", {
  limitKey: varchar("limit_key", { length: 64 }).primaryKey(),
  count: int("count").notNull().default(1),
  expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
});

export const deliveries = mysqlTable(
  "deliveries",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    reference: varchar("reference", { length: 32 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    attempts: int("attempts").notNull().default(0),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    nextAt: bigint("next_at", { mode: "number" }).notNull(),
  },
  (table) => [index("delivery_pending").on(table.status, table.nextAt)],
);
