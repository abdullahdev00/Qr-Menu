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

// QR Templates Table - Shared designs
export const qrTemplates = pgTable("qr_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // modern, elegant, vibrant, minimalist, traditional
  previewImage: text("preview_image"),
  designData: jsonb("design_data").notNull(), // Template layout configuration
  planRestrictions: jsonb("plan_restrictions"), // Which plans can use this template
  usageCount: integer("usage_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Enhanced QR Codes Table
export const qrCodes = pgTable("qr_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").references(() => restaurants.id).notNull(),
  tableId: varchar("table_id").references(() => restaurantTables.id),
  templateId: varchar("template_id").references(() => qrTemplates.id),
  qrUrl: text("qr_url").notNull(), // https://menuqr.pk/menu/{restaurant_slug}/table/{table_number}
  customization: jsonb("customization"), // Logo, colors, text customizations
  files: jsonb("files"), // Generated file paths {png, pdf, svg, jpg}
  generatedBy: varchar("generated_by"), // Admin or Restaurant user ID
  generatedByType: text("generated_by_type").notNull().default("restaurant"), // admin, restaurant
  scanCount: integer("scan_count").notNull().default(0),
  lastScannedAt: timestamp("last_scanned_at"),
  downloadCount: integer("download_count").notNull().default(0),
  status: text("status").notNull().default("active"), // active, inactive, expired
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert Schemas
export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({ id: true, createdAt: true });
export const insertRestaurantSchema = createInsertSchema(restaurants).omit({ id: true, createdAt: true });
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, paidAt: true });
export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMenuTemplateSchema = createInsertSchema(menuTemplates).omit({ id: true, createdAt: true, usageCount: true });
export const insertQrTemplateSchema = createInsertSchema(qrTemplates).omit({ id: true, createdAt: true, updatedAt: true, usageCount: true });
export const insertRestaurantTableSchema = createInsertSchema(restaurantTables).omit({ id: true, createdAt: true });
export const insertQrCodeSchema = createInsertSchema(qrCodes).omit({ id: true, createdAt: true, updatedAt: true, scanCount: true, downloadCount: true });

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
export type QrTemplate = typeof qrTemplates.$inferSelect;
export type InsertQrTemplate = z.infer<typeof insertQrTemplateSchema>;
export type RestaurantTable = typeof restaurantTables.$inferSelect;
export type InsertRestaurantTable = z.infer<typeof insertRestaurantTableSchema>;
export type QrCode = typeof qrCodes.$inferSelect;
export type InsertQrCode = z.infer<typeof insertQrCodeSchema>;

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
