import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"), // super_admin, admin, support
  createdAt: timestamp("created_at").defaultNow(),
});

export const restaurants = pgTable("restaurants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ownerName: text("owner_name").notNull(),
  ownerEmail: text("owner_email").notNull(),
  password: text("password").notNull(), // For restaurant authentication
  ownerPhone: text("owner_phone"),
  address: text("address"),
  city: text("city"),
  planId: varchar("plan_id").references(() => subscriptionPlans.id),
  planExpiryDate: timestamp("plan_expiry_date"), // When current plan expires
  accountBalance: decimal("account_balance", { precision: 10, scale: 2 }).notNull().default("0.00"), // Current balance in PKR
  status: text("status").notNull().default("active"), // active, inactive, suspended
  notes: text("notes"),
  qrScansCount: integer("qr_scans_count").notNull().default(0), // Track QR code scans
  avgRating: decimal("avg_rating", { precision: 3, scale: 2 }).default("0.00"), // Average rating out of 5
  totalReviews: integer("total_reviews").notNull().default(0), // Total number of reviews
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("PKR"),
  features: jsonb("features").notNull(),
  maxMenuItems: integer("max_menu_items"),
  duration: integer("duration").notNull().default(30), // days
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").references(() => restaurants.id).notNull(),
  planId: varchar("plan_id").references(() => subscriptionPlans.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("PKR"),
  paymentMethod: text("payment_method").notNull(), // jazzcash, easypaisa, bank_transfer
  status: text("status").notNull().default("pending"), // pending, paid, failed
  transactionId: text("transaction_id"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").references(() => restaurants.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull().default("medium"), // low, medium, high
  status: text("status").notNull().default("open"), // open, in_progress, resolved
  assignedTo: varchar("assigned_to").references(() => adminUsers.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const menuTemplates = pgTable("menu_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  designData: jsonb("design_data").notNull(),
  previewImage: text("preview_image"),
  usageCount: integer("usage_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// QR Codes Management
export const qrCodes = pgTable("qr_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").references(() => restaurants.id).notNull(),
  tableId: varchar("table_id").references(() => restaurantTables.id),
  qrCodeUrl: text("qr_code_url").notNull(), // URL to the generated QR code image
  menuUrl: text("menu_url").notNull(), // The URL that the QR code points to
  scansCount: integer("scans_count").notNull().default(0),
  customDesign: jsonb("custom_design"), // Custom styling for QR code
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastScanned: timestamp("last_scanned"),
});


// Restaurant Tables Management
export const restaurantTables = pgTable("restaurant_tables", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").references(() => restaurants.id).notNull(),
  tableNumber: text("table_number").notNull(),
  capacity: integer("capacity"),
  location: text("location"), // indoor, outdoor, vip, etc.
  specialNotes: text("special_notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Table parameter encoding utilities
export function encodeTableParam(restaurantId: string, tableNumber: string): string {
  // Create a hash-like encoded parameter that's harder to manipulate
  // Use a separator that won't conflict with UUID hyphens
  const payload = `${restaurantId}|${tableNumber}|${Date.now()}`;
  return Buffer.from(payload).toString('base64').replace(/[+=\/]/g, (c) => ({'+': '-', '=': '_', '/': '.'}[c] || c));
}

export function decodeTableParam(encoded: string): { restaurantId: string; tableNumber: string } | null {
  try {
    const decoded = Buffer.from(encoded.replace(/[-_.]/g, (c) => ({'-': '+', '_': '=', '.': '/'}[c] || c)), 'base64').toString();
    const parts = decoded.split('|'); // Use pipe separator instead of hyphen
    if (parts.length >= 2) {
      return { restaurantId: parts[0], tableNumber: parts[1] };
    }
  } catch {
    return null;
  }
  return null;
}

// Menu Items Table
export const menuItems = pgTable("menu_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").references(() => restaurants.id).notNull(),
  categoryId: varchar("category_id").references(() => menuCategories.id),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("PKR"),
  image: text("image"),
  images: jsonb("images"), // Array of multiple images
  ingredients: jsonb("ingredients"), // Array of ingredients
  allergens: jsonb("allergens"), // Array of allergens
  isVegan: boolean("is_vegan").notNull().default(false),
  isVegetarian: boolean("is_vegetarian").notNull().default(false),
  isSpicy: boolean("is_spicy").notNull().default(false),
  preparationTime: integer("preparation_time"), // in minutes
  calories: integer("calories"),
  isAvailable: boolean("is_available").notNull().default(true),
  isPopular: boolean("is_popular").notNull().default(false), // Track popular items
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Menu Categories Table
export const menuCategories = pgTable("menu_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").references(() => restaurants.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders Tables
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").references(() => restaurants.id).notNull(),
  customerId: text("customer_id"), // For tracking customer orders across sessions
  tableId: varchar("table_id").references(() => restaurantTables.id),
  tableNumber: text("table_number"), // For QR scan table numbers
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  orderNumber: integer("order_number").notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, preparing, ready, delivered, completed, cancelled
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("PKR"),
  deliveryType: text("delivery_type").notNull().default("dine_in"), // dine_in, takeaway, delivery
  deliveryAddress: text("delivery_address"),
  paymentMethod: text("payment_method").notNull().default("cash"), // cash, card, online
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, failed
  specialInstructions: text("special_instructions"),
  estimatedTime: integer("estimated_time"), // in minutes
  completedAt: timestamp("completed_at"),
  cancelledAt: timestamp("cancelled_at"),
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  menuItemId: varchar("menu_item_id").references(() => menuItems.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  specialRequests: text("special_requests"),
  createdAt: timestamp("created_at").defaultNow(),
});


// Insert Schemas
export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({ id: true, createdAt: true });
export const insertRestaurantSchema = createInsertSchema(restaurants).omit({ id: true, createdAt: true });
export const updateRestaurantSchema = createInsertSchema(restaurants, {
  password: z.string().optional(),
}).omit({ id: true, createdAt: true });
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans, {
  price: z.union([z.string(), z.number()]).transform(val => String(val)),
}).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, paidAt: true });
export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMenuTemplateSchema = createInsertSchema(menuTemplates).omit({ id: true, createdAt: true, usageCount: true });
export const insertRestaurantTableSchema = createInsertSchema(restaurantTables).omit({ id: true, createdAt: true });
export const insertMenuCategorySchema = createInsertSchema(menuCategories).omit({ id: true, createdAt: true });
export const insertMenuItemSchema = createInsertSchema(menuItems, {
  price: z.union([z.string(), z.number()]).transform(val => String(val)),
  images: z.array(z.string()).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderSchema = createInsertSchema(orders, {
  totalAmount: z.union([z.string(), z.number()]).transform(val => String(val)),
}).omit({ id: true, createdAt: true, updatedAt: true, completedAt: true, cancelledAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems, {
  unitPrice: z.union([z.string(), z.number()]).transform(val => String(val)),
  totalPrice: z.union([z.string(), z.number()]).transform(val => String(val)),
}).omit({ id: true, createdAt: true });

// Payment Requests Table - for vendor payment submissions
// Updated Payments System with Receipt Management
export const paymentRequests = pgTable('payment_requests', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar('restaurant_id').references(() => restaurants.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text('payment_method').notNull(), // 'jazzcash', 'easypaisa', 'bank_transfer'
  bankName: text('bank_name'),
  accountNumber: text('account_number'),
  accountHolder: text('account_holder'),
  transactionRef: text('transaction_ref').notNull(),
  receiptUrl: text('receipt_url'), // URL to uploaded receipt
  receiptFileName: text('receipt_file_name'), // Original file name
  receiptFileSize: integer('receipt_file_size'), // File size in bytes
  description: text('description'), // Payment description
  status: text('status').notNull().default('pending'), // 'pending', 'approved', 'rejected', 'under_review'
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  processedAt: timestamp('processed_at'),
  processedBy: varchar('processed_by').references(() => adminUsers.id),
  adminNotes: text('admin_notes'),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Payment History for Balance Transactions
export const paymentHistory = pgTable('payment_history', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar('restaurant_id').references(() => restaurants.id).notNull(),
  type: text('type').notNull(), // 'credit', 'debit', 'monthly_deduction', 'plan_upgrade'
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('PKR'),
  description: text('description').notNull(),
  balanceBefore: decimal('balance_before', { precision: 10, scale: 2 }).notNull(),
  balanceAfter: decimal('balance_after', { precision: 10, scale: 2 }).notNull(),
  relatedPaymentRequestId: varchar('related_payment_request_id').references(() => paymentRequests.id),
  relatedPlanId: varchar('related_plan_id').references(() => subscriptionPlans.id),
  processedBy: varchar('processed_by').references(() => adminUsers.id),
  createdAt: timestamp('created_at').defaultNow()
});

// Plan Upgrades History
export const planUpgrades = pgTable('plan_upgrades', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar('restaurant_id').references(() => restaurants.id).notNull(),
  fromPlanId: varchar('from_plan_id').references(() => subscriptionPlans.id),
  toPlanId: varchar('to_plan_id').references(() => subscriptionPlans.id).notNull(),
  priceDifference: decimal('price_difference', { precision: 10, scale: 2 }).notNull(),
  proRatedAmount: decimal('pro_rated_amount', { precision: 10, scale: 2 }).notNull(),
  effectiveDate: timestamp('effective_date').notNull(),
  newExpiryDate: timestamp('new_expiry_date').notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'active', 'cancelled'
  createdAt: timestamp('created_at').defaultNow()
});

// Zod schemas for payment system
export const insertPaymentRequestSchema = createInsertSchema(paymentRequests, {
  amount: z.union([z.string(), z.number()]).transform(val => String(val)),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  submittedAt: true,
  processedAt: true,
  processedBy: true
});

export const updatePaymentRequestSchema = createInsertSchema(paymentRequests).omit({
  id: true,
  restaurantId: true,
  createdAt: true,
  updatedAt: true,
  submittedAt: true
}).partial();

export const insertPaymentHistorySchema = createInsertSchema(paymentHistory, {
  amount: z.union([z.string(), z.number()]).transform(val => String(val)),
  balanceBefore: z.union([z.string(), z.number()]).transform(val => String(val)),
  balanceAfter: z.union([z.string(), z.number()]).transform(val => String(val)),
}).omit({ id: true, createdAt: true });

export const insertPlanUpgradeSchema = createInsertSchema(planUpgrades, {
  priceDifference: z.union([z.string(), z.number()]).transform(val => String(val)),
  proRatedAmount: z.union([z.string(), z.number()]).transform(val => String(val)),
}).omit({ id: true, createdAt: true });

// Types
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type MenuTemplate = typeof menuTemplates.$inferSelect;
export type InsertMenuTemplate = z.infer<typeof insertMenuTemplateSchema>;
export type RestaurantTable = typeof restaurantTables.$inferSelect;
export type InsertRestaurantTable = z.infer<typeof insertRestaurantTableSchema>;
export type MenuCategory = typeof menuCategories.$inferSelect;
export type InsertMenuCategory = z.infer<typeof insertMenuCategorySchema>;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type InsertPaymentRequest = z.infer<typeof insertPaymentRequestSchema>;
export type UpdatePaymentRequest = z.infer<typeof updatePaymentRequestSchema>;
export type PaymentHistory = typeof paymentHistory.$inferSelect;
export type InsertPaymentHistory = z.infer<typeof insertPaymentHistorySchema>;
export type PlanUpgrade = typeof planUpgrades.$inferSelect;
export type InsertPlanUpgrade = z.infer<typeof insertPlanUpgradeSchema>;

// Customer User Management for Mobile Authentication
export const customerUsers = pgTable("customer_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull().unique(),
  name: text("name"),
  email: text("email"),
  password: text("password"), // For password-based authentication
  isPhoneVerified: boolean("is_phone_verified").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customerAddresses = pgTable("customer_addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customerUsers.id).notNull(),
  title: text("title").notNull(), // Home, Office, etc.
  addressLine1: text("address_line_1").notNull(),
  addressLine2: text("address_line_2"),
  city: text("city").notNull(),
  area: text("area"),
  postalCode: text("postal_code"),
  landmark: text("landmark"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const otpVerifications = pgTable("otp_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull(),
  otp: text("otp").notNull(),
  purpose: text("purpose").notNull(), // "registration", "login", "phone_change"
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").notNull().default(false),
  attemptsCount: integer("attempts_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Customer Insert Schemas
export const insertCustomerUserSchema = createInsertSchema(customerUsers, {
  password: z.string().min(6, "Password must be at least 6 characters").optional()
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const updateCustomerUserSchema = createInsertSchema(customerUsers, {
  password: z.string().min(6, "Password must be at least 6 characters").optional()
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
}).partial();

export const insertCustomerAddressSchema = createInsertSchema(customerAddresses).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const updateCustomerAddressSchema = createInsertSchema(customerAddresses).omit({ 
  id: true, 
  customerId: true,
  createdAt: true, 
  updatedAt: true 
}).partial();

export const insertOtpVerificationSchema = createInsertSchema(otpVerifications).omit({ 
  id: true, 
  createdAt: true 
});

// Customer Types
export type CustomerUser = typeof customerUsers.$inferSelect;
export type InsertCustomerUser = z.infer<typeof insertCustomerUserSchema>;
export type UpdateCustomerUser = z.infer<typeof updateCustomerUserSchema>;
export type CustomerAddress = typeof customerAddresses.$inferSelect;
export type InsertCustomerAddress = z.infer<typeof insertCustomerAddressSchema>;
export type UpdateCustomerAddress = z.infer<typeof updateCustomerAddressSchema>;
export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtpVerification = z.infer<typeof insertOtpVerificationSchema>;

// QR Code Schema and Types
export const insertQrCodeSchema = createInsertSchema(qrCodes).omit({ 
  id: true, 
  createdAt: true, 
  lastScanned: true 
});

export const updateQrCodeSchema = createInsertSchema(qrCodes).omit({ 
  id: true, 
  restaurantId: true,
  createdAt: true, 
  lastScanned: true 
}).partial();

export type QrCode = typeof qrCodes.$inferSelect;
export type InsertQrCode = z.infer<typeof insertQrCodeSchema>;
export type UpdateQrCode = z.infer<typeof updateQrCodeSchema>;

// Legacy user schema for compatibility
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
