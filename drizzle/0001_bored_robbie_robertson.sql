ALTER TABLE "orders" ADD COLUMN "idempotency_key" uuid NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "orders_idempotency_key_unique" ON "orders" USING btree ("idempotency_key");