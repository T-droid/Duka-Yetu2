import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  boolean,
  json,
} from "drizzle-orm/pg-core"
import type { AdapterAccount } from "next-auth/adapters"

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: text("role").notNull().default("user"),
  hashedPassword: text("hashedPassword"),
})

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
)

// Categories table
export const categories = pgTable("category", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
})

// Products table
export const products = pgTable("product", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  price: text("price").notNull(), // Using text to avoid floating point issues
  categoryId: text("categoryId")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  image: json("image").$type<string[]>(), // Array of image URLs
  specifications: json("specifications").$type<Record<string, string>>(), // JSON object for specifications
  inStock: boolean("inStock").notNull().default(true),
  stock: integer("stock").notNull().default(0),
  badge: text("badge"),
  rating: integer("rating"),
  reviews: integer("reviews"),
  originalPrice: integer("originalPrice"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
})

// Orders table
export const orders = pgTable("order", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  orderNumber: text("orderNumber").notNull().unique(),
  
  // Customer Information
  customerName: text("customerName").notNull(),
  customerEmail: text("customerEmail").notNull(),
  customerPhone: text("customerPhone"),
  
  // Delivery Address
  addressType: text("addressType").notNull(), // "hostel" or "apartment"
  hostelName: text("hostelName"),
  blockName: text("blockName"),
  roomNumber: text("roomNumber"),
  apartmentName: text("apartmentName"),
  houseNumber: text("houseNumber"),
  deliveryInstructions: text("deliveryInstructions"),
  
  // Order Details
  subtotal: integer("subtotal").notNull(), // in cents
  shippingCost: integer("shippingCost").notNull(), // in cents
  totalAmount: integer("totalAmount").notNull(), // in cents
  
  // Payment Information
  paymentMethod: text("paymentMethod").notNull().default("mpesa"),
  mpesaNumber: text("mpesaNumber"),
  paymentStatus: text("paymentStatus").notNull().default("pending"), // pending, completed, failed
  transactionId: text("transactionId"),
  checkoutRequestId: text("checkoutRequestId"),
  
  // Order Status
  status: text("status").notNull().default("pending"), // pending, confirmed, processing, shipped, delivered, cancelled
  
  // Timestamps
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  deliveredAt: timestamp("deliveredAt", { mode: "date" }),
})

// Order Items table
export const orderItems = pgTable("order_item", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orderId: text("orderId")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  
  // Product details at time of order (snapshot)
  productName: text("productName").notNull(),
  productPrice: text("productPrice").notNull(), // in cents as string
  productImage: text("productImage"), // main image URL
  quantity: integer("quantity").notNull(),
  
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});


export const cart = pgTable("cart", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: text("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  
  // Product details at time of adding to cart (snapshot)
  productName: text("productName").notNull(),
  productPrice: text("productPrice").notNull(), // in cents as string
  productImage: text("productImage"),
  quantity: integer("quantity").notNull().default(1),
  
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
})

// Reviews table
export const reviews = pgTable("review", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: text("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  
  rating: integer("rating").notNull(), // 1 to 5
  title: text("title"),
  comment: text("comment").notNull(),
  
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
})
