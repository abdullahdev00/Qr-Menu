import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, like, or, desc } from 'drizzle-orm';
import { 
  adminUsers,
  restaurants,
  subscriptionPlans,
  payments,
  supportTickets,
  menuTemplates,
  qrTemplates,
  restaurantTables,
  qrCodes,
  users,
  type AdminUser, type InsertAdminUser,
  type Restaurant, type InsertRestaurant,
  type SubscriptionPlan, type InsertSubscriptionPlan,
  type Payment, type InsertPayment,
  type SupportTicket, type InsertSupportTicket,
  type MenuTemplate, type InsertMenuTemplate,
  type QrTemplate, type InsertQrTemplate,
  type RestaurantTable, type InsertRestaurantTable,
  type QrCode, type InsertQrCode,
  type User, type InsertUser
} from "../../shared/schema";

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

class Storage {
  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    try {
      // Check if admin user exists
      const existingAdmin = await db.select().from(adminUsers).limit(1);
      
      if (existingAdmin.length === 0) {
        // Create default admin user
        await db.insert(adminUsers).values({
          name: "Super Admin",
          email: "admin@demo.com",
          password: "password123", // In real app, this would be hashed
          role: "super_admin",
        });
      }

      // Check if subscription plans exist
      const existingPlans = await db.select().from(subscriptionPlans).limit(1);
      
      if (existingPlans.length === 0) {
        // Create default subscription plans
        await db.insert(subscriptionPlans).values([
          {
            name: "Basic Plan",
            price: "1500.00",
            currency: "PKR",
            features: ["Up to 50 menu items", "QR code generation", "Basic analytics"],
            maxMenuItems: 50,
            duration: 30,
            isActive: true,
          },
          {
            name: "Premium Plan",
            price: "3500.00",
            currency: "PKR",
            features: ["Unlimited menu items", "Custom QR designs", "Advanced analytics", "Custom branding"],
            maxMenuItems: null,
            duration: 30,
            isActive: true,
          },
          {
            name: "Enterprise Plan",
            price: "7500.00",
            currency: "PKR",
            features: ["Everything in Premium", "Multi-location support", "API access", "Priority support"],
            maxMenuItems: null,
            duration: 30,
            isActive: true,
          }
        ]);
      }

      // Check if restaurants exist
      const existingRestaurants = await db.select().from(restaurants).limit(1);
      
      if (existingRestaurants.length === 0) {
        await db.insert(restaurants).values([
          {
            name: "Al-Baik Restaurant",
            slug: "al-baik-restaurant",
            ownerName: "Ahmed Khan",
            ownerEmail: "ahmed@albaik.com",
            password: "restaurant123",
            ownerPhone: "03001234567",
            address: "Main Gulberg, Lahore",
            city: "Lahore",
            status: "active",
          },
          {
            name: "Karachi Biryani House",
            slug: "karachi-biryani-house",
            ownerName: "Zain Ali",
            ownerEmail: "zain@biryanihouse.com", 
            password: "restaurant123",
            ownerPhone: "03219876543",
            address: "Defence Phase 2, Karachi",
            city: "Karachi",
            status: "active",
          }
        ]);
      }

      // Check if menu templates exist
      const existingTemplates = await db.select().from(menuTemplates).limit(1);
      
      if (existingTemplates.length === 0) {
        await db.insert(menuTemplates).values([
          {
            name: "Modern Restaurant",
            description: "Clean design perfect for modern restaurants and cafes",
            category: "modern",
            designData: { theme: "modern", colors: ["#2196f3", "#ffffff"] },
          },
          {
            name: "Traditional Desi",
            description: "Authentic Pakistani design with traditional elements",
            category: "traditional",
            designData: { theme: "traditional", colors: ["#4caf50", "#ffffff"] },
          }
        ]);
      }

      // Check if QR templates exist
      const existingQrTemplates = await db.select().from(qrTemplates).limit(1);
      
      if (existingQrTemplates.length === 0) {
        await db.insert(qrTemplates).values([
          {
            name: "Classic Modern",
            description: "Clean, professional design perfect for all restaurant types",
            category: "modern",
            designData: {
              layout: {
                logoPosition: "top-center",
                qrSize: "300x300",
                tableNumberStyle: "bold-bottom",
                colorScheme: "customizable",
                spacing: "balanced"
              },
              colors: {
                primary: "#2563EB",
                secondary: "#EFF6FF",
                qrForeground: "#000000",
                qrBackground: "#FFFFFF"
              }
            },
            planRestrictions: null, // Available for all plans
          },
          {
            name: "Premium Elegant",
            description: "Luxury dining establishments with sophisticated touch",
            category: "elegant",
            designData: {
              layout: {
                logoPosition: "top-left",
                decorativeFrame: "golden-border",
                qrSize: "280x280",
                tableNumberStyle: "elegant-script",
                backgroundPattern: "subtle-texture"
              },
              colors: {
                primary: "#D97706",
                secondary: "#FFFBEB",
                accent: "#92400E"
              }
            },
            planRestrictions: ["Premium", "Enterprise"], // Pro and Enterprise only
          },
          {
            name: "Fast Food Vibrant",
            description: "Colorful, energetic design for quick service restaurants",
            category: "vibrant",
            designData: {
              layout: {
                backgroundGradient: "dynamic-colors",
                qrSize: "320x320",
                tableNumberStyle: "bold-colorful",
                energyLevel: "high"
              },
              colors: {
                primary: "#DC2626",
                secondary: "#FEF2F2",
                vibrant: ["#F59E0B", "#EF4444", "#10B981"]
              }
            },
            planRestrictions: null,
          },
          {
            name: "Minimalist Clean",
            description: "Simple, modern aesthetic with generous whitespace",
            category: "minimalist",
            designData: {
              layout: {
                whitespace: "generous",
                qrSize: "250x250",
                typography: "minimal-sans-serif",
                simplicity: "maximum"
              },
              colors: {
                primary: "#374151",
                secondary: "#F9FAFB",
                minimal: true
              }
            },
            planRestrictions: null,
          },
          {
            name: "Traditional Warmth",
            description: "Traditional restaurant feel with cultural elements",
            category: "traditional",
            designData: {
              layout: {
                borderPattern: "traditional-motifs",
                colorPalette: "warm-earth-tones",
                qrSize: "290x290",
                culturalElements: "subtle"
              },
              colors: {
                primary: "#92400E",
                secondary: "#FEF3C7",
                earth: ["#A16207", "#D97706", "#F59E0B"]
              }
            },
            planRestrictions: null,
          }
        ]);
      }
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  // Legacy user methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Admin user methods
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    const result = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
    return result[0];
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    const result = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
    return result[0];
  }

  async createAdminUser(user: InsertAdminUser): Promise<AdminUser> {
    const result = await db.insert(adminUsers).values(user).returning();
    return result[0];
  }

  async updateAdminUser(id: string, user: Partial<AdminUser>): Promise<AdminUser | undefined> {
    const result = await db.update(adminUsers).set(user).where(eq(adminUsers.id, id)).returning();
    return result[0];
  }

  // Restaurant methods
  async getRestaurants(): Promise<Restaurant[]> {
    return await db.select().from(restaurants).orderBy(desc(restaurants.createdAt));
  }

  async getRestaurant(id: string): Promise<Restaurant | undefined> {
    const result = await db.select().from(restaurants).where(eq(restaurants.id, id)).limit(1);
    return result[0];
  }

  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const result = await db.insert(restaurants).values(restaurant).returning();
    return result[0];
  }

  async getRestaurantByEmail(email: string): Promise<Restaurant | undefined> {
    const result = await db.select().from(restaurants).where(eq(restaurants.ownerEmail, email)).limit(1);
    return result[0];
  }

  async updateRestaurant(id: string, restaurant: Partial<Restaurant>): Promise<Restaurant | undefined> {
    const result = await db.update(restaurants).set(restaurant).where(eq(restaurants.id, id)).returning();
    return result[0];
  }

  async deleteRestaurant(id: string): Promise<boolean> {
    const result = await db.delete(restaurants).where(eq(restaurants.id, id));
    return result.length > 0;
  }

  async searchRestaurants(query: string): Promise<Restaurant[]> {
    return await db.select().from(restaurants)
      .where(
        or(
          like(restaurants.name, `%${query}%`),
          like(restaurants.ownerName, `%${query}%`),
          like(restaurants.ownerEmail, `%${query}%`),
          like(restaurants.city, `%${query}%`)
        )
      )
      .orderBy(desc(restaurants.createdAt));
  }

  // Subscription plan methods
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).orderBy(desc(subscriptionPlans.createdAt));
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined> {
    const result = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id)).limit(1);
    return result[0];
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const result = await db.insert(subscriptionPlans).values(plan).returning();
    return result[0];
  }

  async updateSubscriptionPlan(id: string, plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const result = await db.update(subscriptionPlans).set(plan).where(eq(subscriptionPlans.id, id)).returning();
    return result[0];
  }

  async deleteSubscriptionPlan(id: string): Promise<boolean> {
    const result = await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return result.length > 0;
  }

  // Payment methods
  async getPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async getPaymentsByRestaurant(restaurantId: string): Promise<Payment[]> {
    return await db.select().from(payments)
      .where(eq(payments.restaurantId, restaurantId))
      .orderBy(desc(payments.createdAt));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const result = await db.insert(payments).values(payment).returning();
    return result[0];
  }

  async updatePayment(id: string, payment: Partial<Payment>): Promise<Payment | undefined> {
    const result = await db.update(payments).set(payment).where(eq(payments.id, id)).returning();
    return result[0];
  }

  // Support ticket methods
  async getSupportTickets(): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
  }

  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    const result = await db.select().from(supportTickets).where(eq(supportTickets.id, id)).limit(1);
    return result[0];
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const result = await db.insert(supportTickets).values(ticket).returning();
    return result[0];
  }

  async updateSupportTicket(id: string, ticket: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const result = await db.update(supportTickets).set(ticket).where(eq(supportTickets.id, id)).returning();
    return result[0];
  }

  // Menu template methods
  async getMenuTemplates(): Promise<MenuTemplate[]> {
    return await db.select().from(menuTemplates).orderBy(desc(menuTemplates.createdAt));
  }

  async getMenuTemplate(id: string): Promise<MenuTemplate | undefined> {
    const result = await db.select().from(menuTemplates).where(eq(menuTemplates.id, id)).limit(1);
    return result[0];
  }

  async createMenuTemplate(template: InsertMenuTemplate): Promise<MenuTemplate> {
    const result = await db.insert(menuTemplates).values(template).returning();
    return result[0];
  }

  async updateMenuTemplate(id: string, template: Partial<MenuTemplate>): Promise<MenuTemplate | undefined> {
    const result = await db.update(menuTemplates).set(template).where(eq(menuTemplates.id, id)).returning();
    return result[0];
  }

  // Enhanced QR code methods (moved to later section)

  // Analytics methods
  async getDashboardMetrics(): Promise<{
    totalRestaurants: number;
    monthlyRevenue: number;
    newSignups: number;
    pendingTickets: number;
  }> {
    const restaurantList = await this.getRestaurants();
    const paymentList = await this.getPayments();
    const ticketList = await this.getSupportTickets();
    
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyRevenue = paymentList
      .filter(p => p.status === "paid" && p.paidAt && new Date(p.paidAt) >= firstDayOfMonth)
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    const newSignups = restaurantList
      .filter(r => r.createdAt && new Date(r.createdAt) >= firstDayOfMonth)
      .length;
    
    const pendingTickets = ticketList
      .filter(t => t.status === "open" || t.status === "in_progress")
      .length;

    return {
      totalRestaurants: restaurantList.length,
      monthlyRevenue,
      newSignups,
      pendingTickets,
    };
  }

  // QR Template Management Methods
  async getQrTemplates(): Promise<QrTemplate[]> {
    return await db.select().from(qrTemplates).orderBy(desc(qrTemplates.createdAt));
  }

  async getQrTemplate(id: string): Promise<QrTemplate | undefined> {
    const result = await db.select().from(qrTemplates).where(eq(qrTemplates.id, id)).limit(1);
    return result[0];
  }

  async createQrTemplate(template: InsertQrTemplate): Promise<QrTemplate> {
    const result = await db.insert(qrTemplates).values(template).returning();
    return result[0];
  }

  async updateQrTemplate(id: string, template: Partial<QrTemplate>): Promise<QrTemplate | undefined> {
    const result = await db.update(qrTemplates).set(template).where(eq(qrTemplates.id, id)).returning();
    return result[0];
  }

  async deleteQrTemplate(id: string): Promise<boolean> {
    const result = await db.delete(qrTemplates).where(eq(qrTemplates.id, id));
    return result.length > 0;
  }

  // Restaurant Table Management Methods
  async getRestaurantTables(restaurantId: string): Promise<RestaurantTable[]> {
    return await db.select().from(restaurantTables)
      .where(eq(restaurantTables.restaurantId, restaurantId))
      .orderBy(restaurantTables.tableNumber);
  }

  async getRestaurantTable(id: string): Promise<RestaurantTable | undefined> {
    const result = await db.select().from(restaurantTables).where(eq(restaurantTables.id, id)).limit(1);
    return result[0];
  }

  async createRestaurantTable(table: InsertRestaurantTable): Promise<RestaurantTable> {
    const result = await db.insert(restaurantTables).values(table).returning();
    return result[0];
  }

  async updateRestaurantTable(id: string, table: Partial<RestaurantTable>): Promise<RestaurantTable | undefined> {
    const result = await db.update(restaurantTables).set(table).where(eq(restaurantTables.id, id)).returning();
    return result[0];
  }

  async deleteRestaurantTable(id: string): Promise<boolean> {
    const result = await db.delete(restaurantTables).where(eq(restaurantTables.id, id));
    return result.length > 0;
  }

  // Enhanced QR Code Management Methods
  async getQrCodes(): Promise<QrCode[]> {
    return await db.select().from(qrCodes).orderBy(desc(qrCodes.createdAt));
  }

  async getQrCodesByRestaurant(restaurantId: string): Promise<QrCode[]> {
    return await db.select().from(qrCodes)
      .where(eq(qrCodes.restaurantId, restaurantId))
      .orderBy(desc(qrCodes.createdAt));
  }

  async getQrCode(id: string): Promise<QrCode | undefined> {
    const result = await db.select().from(qrCodes).where(eq(qrCodes.id, id)).limit(1);
    return result[0];
  }

  async createQrCode(qrCode: InsertQrCode): Promise<QrCode> {
    const result = await db.insert(qrCodes).values(qrCode).returning();
    return result[0];
  }

  async updateQrCode(id: string, qrCode: Partial<QrCode>): Promise<QrCode | undefined> {
    const result = await db.update(qrCodes).set(qrCode).where(eq(qrCodes.id, id)).returning();
    return result[0];
  }

  async deleteQrCode(id: string): Promise<boolean> {
    const result = await db.delete(qrCodes).where(eq(qrCodes.id, id));
    return result.length > 0;
  }

  // QR Generation Engine Methods
  async generateQrCodesForRestaurant(restaurantId: string, tableIds: string[], templateId: string, customization?: any): Promise<QrCode[]> {
    const restaurant = await this.getRestaurant(restaurantId);
    if (!restaurant) throw new Error('Restaurant not found');

    const tables = await Promise.all(
      tableIds.map(id => this.getRestaurantTable(id))
    );

    const results: QrCode[] = [];

    for (const table of tables) {
      if (!table) continue;

      const qrUrl = `https://menuqr.pk/menu/${restaurant.slug}/table/${table.tableNumber}`;
      
      const qrCodeData: InsertQrCode = {
        restaurantId,
        tableId: table.id,
        templateId,
        qrUrl,
        customization: customization || {},
        files: {
          png: `qr_${restaurant.slug}_table_${table.tableNumber}.png`,
          pdf: `qr_${restaurant.slug}_table_${table.tableNumber}.pdf`,
          svg: `qr_${restaurant.slug}_table_${table.tableNumber}.svg`,
          jpg: `qr_${restaurant.slug}_table_${table.tableNumber}.jpg`
        },
        generatedByType: 'restaurant'
      };

      const qrCode = await this.createQrCode(qrCodeData);
      results.push(qrCode);
    }

    return results;
  }

  // QR Analytics Methods  
  async getQrAnalytics(restaurantId?: string): Promise<{
    totalQrCodes: number;
    totalScans: number;
    popularTemplates: any[];
    recentActivity: QrCode[];
  }> {
    const baseQuery = db.select().from(qrCodes);
    const qrCodeList = restaurantId 
      ? await baseQuery.where(eq(qrCodes.restaurantId, restaurantId))
      : await baseQuery;
    const totalScans = qrCodeList.reduce((sum, qr) => sum + qr.scanCount, 0);
    const recentActivity = qrCodeList
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 10);

    // Get popular templates
    const templateUsage = new Map();
    qrCodeList.forEach(qr => {
      if (qr.templateId) {
        templateUsage.set(qr.templateId, (templateUsage.get(qr.templateId) || 0) + 1);
      }
    });

    const popularTemplates = Array.from(templateUsage.entries())
      .map(([templateId, count]) => ({ templateId, usageCount: count }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);

    return {
      totalQrCodes: qrCodeList.length,
      totalScans,
      popularTemplates,
      recentActivity,
    };
  }
}

export const storage = new Storage();