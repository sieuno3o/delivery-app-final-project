import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["customer", "admin"]);

export const orderStatus = pgEnum("order_status", [
  "received",
  "preparing",
  "delivering",
  "completed",
  "cancelled",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 80 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRole("role").default("customer").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("sessions_token_hash_unique").on(table.tokenHash),
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ],
);

export const restaurants = pgTable(
  "restaurants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description").notNull(),
    category: varchar("category", { length: 40 }).notNull(),
    address: varchar("address", { length: 255 }).notNull(),
    imageUrl: text("image_url"),
    deliveryFee: integer("delivery_fee").default(0).notNull(),
    minimumOrderAmount: integer("minimum_order_amount")
      .default(0)
      .notNull(),
    deliveryTimeMin: integer("delivery_time_min").notNull(),
    deliveryTimeMax: integer("delivery_time_max").notNull(),
    ratingTenths: integer("rating_tenths").default(0).notNull(),
    reviewCount: integer("review_count").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("restaurants_slug_unique").on(table.slug),
    index("restaurants_category_idx").on(table.category),
    check("restaurants_delivery_fee_nonnegative", sql`${table.deliveryFee} >= 0`),
    check(
      "restaurants_minimum_order_nonnegative",
      sql`${table.minimumOrderAmount} >= 0`,
    ),
    check("restaurants_delivery_time_min_positive", sql`${table.deliveryTimeMin} > 0`),
    check(
      "restaurants_delivery_time_range_valid",
      sql`${table.deliveryTimeMax} >= ${table.deliveryTimeMin}`,
    ),
    check(
      "restaurants_rating_range_valid",
      sql`${table.ratingTenths} BETWEEN 0 AND 50`,
    ),
    check("restaurants_review_count_nonnegative", sql`${table.reviewCount} >= 0`),
  ],
);

export const menuItems = pgTable(
  "menu_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description").notNull(),
    category: varchar("category", { length: 40 }).notNull(),
    imageUrl: text("image_url"),
    price: integer("price").notNull(),
    position: integer("position").default(0).notNull(),
    isPopular: boolean("is_popular").default(false).notNull(),
    isSoldOut: boolean("is_sold_out").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("menu_items_restaurant_name_unique").on(
      table.restaurantId,
      table.name,
    ),
    index("menu_items_restaurant_id_idx").on(table.restaurantId),
    check("menu_items_price_nonnegative", sql`${table.price} >= 0`),
    check("menu_items_position_nonnegative", sql`${table.position} >= 0`),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderNumber: varchar("order_number", { length: 24 }).notNull(),
    idempotencyKey: uuid("idempotency_key").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "restrict" }),
    status: orderStatus("status").default("received").notNull(),
    deliveryAddress: varchar("delivery_address", { length: 255 }).notNull(),
    deliveryAddressDetail: varchar("delivery_address_detail", { length: 120 }),
    deliveryRequest: varchar("delivery_request", { length: 255 }),
    subtotal: integer("subtotal").notNull(),
    deliveryFee: integer("delivery_fee").notNull(),
    totalAmount: integer("total_amount").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("orders_order_number_unique").on(table.orderNumber),
    uniqueIndex("orders_idempotency_key_unique").on(table.idempotencyKey),
    index("orders_user_created_at_idx").on(table.userId, table.createdAt),
    index("orders_restaurant_created_at_idx").on(
      table.restaurantId,
      table.createdAt,
    ),
    index("orders_status_idx").on(table.status),
    check("orders_subtotal_nonnegative", sql`${table.subtotal} >= 0`),
    check("orders_delivery_fee_nonnegative", sql`${table.deliveryFee} >= 0`),
    check(
      "orders_total_matches_components",
      sql`${table.totalAmount} = ${table.subtotal} + ${table.deliveryFee}`,
    ),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    menuItemId: uuid("menu_item_id").references(() => menuItems.id, {
      onDelete: "set null",
    }),
    menuName: varchar("menu_name", { length: 120 }).notNull(),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.orderId),
    index("order_items_menu_item_id_idx").on(table.menuItemId),
    check("order_items_unit_price_nonnegative", sql`${table.unitPrice} >= 0`),
    check("order_items_quantity_positive", sql`${table.quantity} > 0`),
  ],
);

export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    status: orderStatus("status").notNull(),
    changedByUserId: uuid("changed_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    note: varchar("note", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("order_status_history_order_created_at_idx").on(
      table.orderId,
      table.createdAt,
    ),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  orders: many(orders),
  statusChanges: many(orderStatusHistory),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  menuItems: many(menuItems),
  orders: many(orders),
}));

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [menuItems.restaurantId],
    references: [restaurants.id],
  }),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  restaurant: one(restaurants, {
    fields: [orders.restaurantId],
    references: [restaurants.id],
  }),
  items: many(orderItems),
  statusHistory: many(orderStatusHistory),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));

export const orderStatusHistoryRelations = relations(
  orderStatusHistory,
  ({ one }) => ({
    order: one(orders, {
      fields: [orderStatusHistory.orderId],
      references: [orders.id],
    }),
    changedBy: one(users, {
      fields: [orderStatusHistory.changedByUserId],
      references: [users.id],
    }),
  }),
);

export type User = typeof users.$inferSelect;
export type Restaurant = typeof restaurants.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
