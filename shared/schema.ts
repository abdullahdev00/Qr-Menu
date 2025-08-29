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
  status: text("status").notNull().default("active"), // active, inactive, suspended
  notes: text("notes"),
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
  tableId: varchar("table_id").references(() => restaurantTables.id),
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
}).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderSchema = createInsertSchema(orders, {
  totalAmount: z.union([z.string(), z.number()]).transform(val => String(val)),
}).omit({ id: true, createdAt: true, updatedAt: true, completedAt: true, cancelledAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems, {
  unitPrice: z.union([z.string(), z.number()]).transform(val => String(val)),
  totalPrice: z.union([z.string(), z.number()]).transform(val => String(val)),
}).omit({ id: true, createdAt: true });

// Payment Requests Table - for vendor payment submissions
export const paymentRequests = pgTable('payment_requests', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar('vendor_id').references(() => restaurants.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text('payment_method').notNull(), // 'jazzcash', 'easypaisa', 'bank_transfer'
  bankName: text('bank_name').notNull(),
  accountNumber: text('account_number').notNull(),
  accountHolder: text('account_holder').notNull(),
  transactionRef: text('transaction_ref').notNull(),
  receiptUrl: text('receipt_url').notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'approved', 'rejected', 'under_review'
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  processedAt: timestamp('processed_at'),
  processedBy: varchar('processed_by').references(() => adminUsers.id),
  adminNotes: text('admin_notes'),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Zod schemas for payment requests
export const insertPaymentRequestSchema = createInsertSchema(paymentRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  submittedAt: true,
  processedAt: true,
  processedBy: true
});

export const updatePaymentRequestSchema = createInsertSchema(paymentRequests).omit({
  id: true,
  vendorId: true,
  createdAt: true,
  updatedAt: true,
  submittedAt: true
}).partial();

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

// Customer User Management for Mobile Authentication
export const customerUsers = pgTable("customer_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull().unique(),
  name: text("name"),
  email: text("email"),
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
export const insertCustomerUserSchema = createInsertSchema(customerUsers).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const updateCustomerUserSchema = createInsertSchema(customerUsers).omit({ 
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
