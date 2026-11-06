import {sqliteTable,text,integer,index,uniqueIndex} from 'drizzle-orm/sqlite-core';
export const requests=sqliteTable('requests',{
 reference:text('reference').primaryKey(),kind:text('kind').notNull(),status:text('status').notNull().default('new'),
 idempotencyKey:text('idempotency_key').notNull(),fingerprint:text('fingerprint').notNull(),
 encryptedPayload:text('encrypted_payload').notNull(),resourceId:text('resource_id'),
 service:text('service'),icp:text('icp'),createdAt:integer('created_at').notNull(),expiresAt:integer('expires_at').notNull()
},t=>[uniqueIndex('request_idempotency').on(t.idempotencyKey),index('request_expiry').on(t.expiresAt),index('request_created').on(t.createdAt)]);
export const rateLimits=sqliteTable('rate_limits',{key:text('key').primaryKey(),count:integer('count').notNull().default(1),expiresAt:integer('expires_at').notNull()});
export const deliveries=sqliteTable('deliveries',{id:text('id').primaryKey(),reference:text('reference').notNull(),status:text('status').notNull().default('pending'),attempts:integer('attempts').notNull().default(0),createdAt:integer('created_at').notNull(),nextAt:integer('next_at').notNull()},t=>[index('delivery_pending').on(t.status,t.nextAt)]);
