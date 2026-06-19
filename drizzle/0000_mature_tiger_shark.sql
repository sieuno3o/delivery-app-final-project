CREATE TYPE "public"."order_status" AS ENUM('received', 'preparing', 'delivering', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('customer', 'admin');--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(40) NOT NULL,
	"image_url" text,
	"price" integer NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_popular" boolean DEFAULT false NOT NULL,
	"is_sold_out" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "menu_items_price_nonnegative" CHECK ("menu_items"."price" >= 0),
	CONSTRAINT "menu_items_position_nonnegative" CHECK ("menu_items"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"menu_item_id" uuid,
	"menu_name" varchar(120) NOT NULL,
	"unit_price" integer NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_items_unit_price_nonnegative" CHECK ("order_items"."unit_price" >= 0),
	CONSTRAINT "order_items_quantity_positive" CHECK ("order_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"status" "order_status" NOT NULL,
	"changed_by_user_id" uuid,
	"note" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar(24) NOT NULL,
	"user_id" uuid NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"status" "order_status" DEFAULT 'received' NOT NULL,
	"delivery_address" varchar(255) NOT NULL,
	"delivery_address_detail" varchar(120),
	"delivery_request" varchar(255),
	"subtotal" integer NOT NULL,
	"delivery_fee" integer NOT NULL,
	"total_amount" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_subtotal_nonnegative" CHECK ("orders"."subtotal" >= 0),
	CONSTRAINT "orders_delivery_fee_nonnegative" CHECK ("orders"."delivery_fee" >= 0),
	CONSTRAINT "orders_total_matches_components" CHECK ("orders"."total_amount" = "orders"."subtotal" + "orders"."delivery_fee")
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(40) NOT NULL,
	"address" varchar(255) NOT NULL,
	"image_url" text,
	"delivery_fee" integer DEFAULT 0 NOT NULL,
	"minimum_order_amount" integer DEFAULT 0 NOT NULL,
	"delivery_time_min" integer NOT NULL,
	"delivery_time_max" integer NOT NULL,
	"rating_tenths" integer DEFAULT 0 NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "restaurants_delivery_fee_nonnegative" CHECK ("restaurants"."delivery_fee" >= 0),
	CONSTRAINT "restaurants_minimum_order_nonnegative" CHECK ("restaurants"."minimum_order_amount" >= 0),
	CONSTRAINT "restaurants_delivery_time_min_positive" CHECK ("restaurants"."delivery_time_min" > 0),
	CONSTRAINT "restaurants_delivery_time_range_valid" CHECK ("restaurants"."delivery_time_max" >= "restaurants"."delivery_time_min"),
	CONSTRAINT "restaurants_rating_range_valid" CHECK ("restaurants"."rating_tenths" BETWEEN 0 AND 50),
	CONSTRAINT "restaurants_review_count_nonnegative" CHECK ("restaurants"."review_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(80) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changed_by_user_id_users_id_fk" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "menu_items_restaurant_name_unique" ON "menu_items" USING btree ("restaurant_id","name");--> statement-breakpoint
CREATE INDEX "menu_items_restaurant_id_idx" ON "menu_items" USING btree ("restaurant_id");--> statement-breakpoint
CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_menu_item_id_idx" ON "order_items" USING btree ("menu_item_id");--> statement-breakpoint
CREATE INDEX "order_status_history_order_created_at_idx" ON "order_status_history" USING btree ("order_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_order_number_unique" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "orders_user_created_at_idx" ON "orders" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "orders_restaurant_created_at_idx" ON "orders" USING btree ("restaurant_id","created_at");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "restaurants_slug_unique" ON "restaurants" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "restaurants_category_idx" ON "restaurants" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_hash_unique" ON "sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");