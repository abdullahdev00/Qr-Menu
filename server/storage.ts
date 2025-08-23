import { 
  type AdminUser, type InsertAdminUser,
  type Restaurant, type InsertRestaurant,
  type SubscriptionPlan, type InsertSubscriptionPlan,
  type Payment, type InsertPayment,
  type SupportTicket, type InsertSupportTicket,
  type MenuTemplate, type InsertMenuTemplate,
  type QrCode, type InsertQrCode,
  type User, type InsertUser
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Legacy user methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Admin user methods
  getAdminUser(id: string): Promise<AdminUser | undefined>;
  getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  updateAdminUser(id: string, user: Partial<AdminUser>): Promise<AdminUser | undefined>;

  // Restaurant methods
  getRestaurants(): Promise<Restaurant[]>;
  getRestaurant(id: string): Promise<Restaurant | undefined>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  updateRestaurant(id: string, restaurant: Partial<Restaurant>): Promise<Restaurant | undefined>;
  deleteRestaurant(id: string): Promise<boolean>;
  searchRestaurants(query: string): Promise<Restaurant[]>;

  // Subscription plan methods
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: string, plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
  deleteSubscriptionPlan(id: string): Promise<boolean>;

  // Payment methods
  getPayments(): Promise<Payment[]>;
  getPaymentsByRestaurant(restaurantId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, payment: Partial<Payment>): Promise<Payment | undefined>;

  // Support ticket methods
  getSupportTickets(): Promise<SupportTicket[]>;
  getSupportTicket(id: string): Promise<SupportTicket | undefined>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: string, ticket: Partial<SupportTicket>): Promise<SupportTicket | undefined>;

  // Menu template methods
  getMenuTemplates(): Promise<MenuTemplate[]>;
  getMenuTemplate(id: string): Promise<MenuTemplate | undefined>;
  createMenuTemplate(template: InsertMenuTemplate): Promise<MenuTemplate>;
  updateMenuTemplate(id: string, template: Partial<MenuTemplate>): Promise<MenuTemplate | undefined>;

  // QR code methods
  getQrCodes(): Promise<QrCode[]>;
  getQrCodesByRestaurant(restaurantId: string): Promise<QrCode[]>;
  createQrCode(qrCode: InsertQrCode): Promise<QrCode>;
  updateQrCode(id: string, qrCode: Partial<QrCode>): Promise<QrCode | undefined>;
  deleteQrCode(id: string): Promise<boolean>;

  // Analytics methods
  getDashboardMetrics(): Promise<{
    totalRestaurants: number;
    monthlyRevenue: number;
    newSignups: number;
    pendingTickets: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private adminUsers: Map<string, AdminUser> = new Map();
  private restaurants: Map<string, Restaurant> = new Map();
  private subscriptionPlans: Map<string, SubscriptionPlan> = new Map();
  private payments: Map<string, Payment> = new Map();
  private supportTickets: Map<string, SupportTicket> = new Map();
  private menuTemplates: Map<string, MenuTemplate> = new Map();
  private qrCodes: Map<string, QrCode> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Create default admin user
    const adminId = randomUUID();
    this.adminUsers.set(adminId, {
      id: adminId,
      name: "Super Admin",
      email: "admin@demo.com",
      password: "password123", // In real app, this would be hashed
      role: "super_admin",
      createdAt: new Date(),
    });

    // Create default subscription plans
    const basicPlanId = randomUUID();
    const premiumPlanId = randomUUID();
    const enterprisePlanId = randomUUID();

    this.subscriptionPlans.set(basicPlanId, {
      id: basicPlanId,
      name: "Basic Plan",
      price: "1500.00",
      currency: "PKR",
      features: ["Up to 50 menu items", "QR code generation", "Basic analytics"],
      maxMenuItems: 50,
      duration: 30,
      isActive: true,
      createdAt: new Date(),
    });

    this.subscriptionPlans.set(premiumPlanId, {
      id: premiumPlanId,
      name: "Premium Plan",
      price: "3500.00",
      currency: "PKR",
      features: ["Unlimited menu items", "Custom QR designs", "Advanced analytics", "Custom branding"],
      maxMenuItems: null,
      duration: 30,
      isActive: true,
      createdAt: new Date(),
    });

    this.subscriptionPlans.set(enterprisePlanId, {
      id: enterprisePlanId,
      name: "Enterprise Plan",
      price: "7500.00",
      currency: "PKR",
      features: ["Everything in Premium", "Multi-location support", "API access", "Priority support"],
      maxMenuItems: null,
      duration: 30,
      isActive: true,
      createdAt: new Date(),
    });

    // Create sample menu templates
    const templates = [
      {
        name: "Modern Restaurant",
        description: "Clean design perfect for modern restaurants and cafes",
        category: "modern",
        designData: { theme: "modern", colors: ["#2196f3", "#ffffff"] },
      },
      {
        name: "Traditional Desi",
        description: "Traditional design for Pakistani restaurants",
        category: "traditional",
        designData: { theme: "traditional", colors: ["#ff9800", "#ffffff"] },
      },
      {
        name: "Minimal Clean",
        description: "Minimalist design focusing on content",
        category: "minimal",
        designData: { theme: "minimal", colors: ["#000000", "#ffffff"] },
      },
      {
        name: "Fast Food",
        description: "Vibrant design perfect for fast food chains",
        category: "fastfood",
        designData: { theme: "colorful", colors: ["#f44336", "#ffeb3b"] },
      },
    ];

    templates.forEach(template => {
      const id = randomUUID();
      this.menuTemplates.set(id, {
        id,
        ...template,
        previewImage: null,
        usageCount: Math.floor(Math.random() * 100),
        isActive: true,
        createdAt: new Date(),
      });
    });
  }

  // Legacy user methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Admin user methods
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    return this.adminUsers.get(id);
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    return Array.from(this.adminUsers.values()).find(user => user.email === email);
  }

  async createAdminUser(insertUser: InsertAdminUser): Promise<AdminUser> {
    const id = randomUUID();
    const user: AdminUser = { 
      ...insertUser, 
      id, 
      role: insertUser.role || "admin",
      createdAt: new Date() 
    };
    this.adminUsers.set(id, user);
    return user;
  }

  async updateAdminUser(id: string, updates: Partial<AdminUser>): Promise<AdminUser | undefined> {
    const user = this.adminUsers.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.adminUsers.set(id, updatedUser);
    return updatedUser;
  }

  // Restaurant methods
  async getRestaurants(): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getRestaurant(id: string): Promise<Restaurant | undefined> {
    return this.restaurants.get(id);
  }

  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const id = randomUUID();
    const restaurant: Restaurant = { 
      ...insertRestaurant, 
      id, 
      status: insertRestaurant.status || "active",
      address: insertRestaurant.address || null,
      city: insertRestaurant.city || null,
      ownerPhone: insertRestaurant.ownerPhone || null,
      planId: insertRestaurant.planId || null,
      notes: insertRestaurant.notes || null,
      createdAt: new Date() 
    };
    this.restaurants.set(id, restaurant);
    return restaurant;
  }

  async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<Restaurant | undefined> {
    const restaurant = this.restaurants.get(id);
    if (!restaurant) return undefined;
    
    const updatedRestaurant = { ...restaurant, ...updates };
    this.restaurants.set(id, updatedRestaurant);
    return updatedRestaurant;
  }

  async deleteRestaurant(id: string): Promise<boolean> {
    return this.restaurants.delete(id);
  }

  async searchRestaurants(query: string): Promise<Restaurant[]> {
    const restaurants = await this.getRestaurants();
    return restaurants.filter(restaurant => 
      restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
      restaurant.ownerName.toLowerCase().includes(query.toLowerCase()) ||
      restaurant.ownerEmail.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Subscription plan methods
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values());
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined> {
    return this.subscriptionPlans.get(id);
  }

  async createSubscriptionPlan(insertPlan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const id = randomUUID();
    const plan: SubscriptionPlan = { 
      ...insertPlan, 
      id, 
      currency: insertPlan.currency || "PKR",
      duration: insertPlan.duration || 30,
      isActive: insertPlan.isActive !== undefined ? insertPlan.isActive : true,
      maxMenuItems: insertPlan.maxMenuItems || null,
      createdAt: new Date() 
    };
    this.subscriptionPlans.set(id, plan);
    return plan;
  }

  async updateSubscriptionPlan(id: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const plan = this.subscriptionPlans.get(id);
    if (!plan) return undefined;
    
    const updatedPlan = { ...plan, ...updates };
    this.subscriptionPlans.set(id, updatedPlan);
    return updatedPlan;
  }

  async deleteSubscriptionPlan(id: string): Promise<boolean> {
    return this.subscriptionPlans.delete(id);
  }

  // Payment methods
  async getPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getPaymentsByRestaurant(restaurantId: string): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(payment => payment.restaurantId === restaurantId);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = { 
      ...insertPayment, 
      id, 
      currency: insertPayment.currency || "PKR",
      status: insertPayment.status || "pending",
      transactionId: insertPayment.transactionId || null,
      paidAt: null,
      createdAt: new Date() 
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment = { ...payment, ...updates };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  // Support ticket methods
  async getSupportTickets(): Promise<SupportTicket[]> {
    return Array.from(this.supportTickets.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    return this.supportTickets.get(id);
  }

  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    const id = randomUUID();
    const ticket: SupportTicket = { 
      ...insertTicket, 
      id, 
      status: insertTicket.status || "open",
      priority: insertTicket.priority || "medium",
      restaurantId: insertTicket.restaurantId || null,
      assignedTo: insertTicket.assignedTo || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.supportTickets.set(id, ticket);
    return ticket;
  }

  async updateSupportTicket(id: string, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const ticket = this.supportTickets.get(id);
    if (!ticket) return undefined;
    
    const updatedTicket = { ...ticket, ...updates, updatedAt: new Date() };
    this.supportTickets.set(id, updatedTicket);
    return updatedTicket;
  }

  // Menu template methods
  async getMenuTemplates(): Promise<MenuTemplate[]> {
    return Array.from(this.menuTemplates.values());
  }

  async getMenuTemplate(id: string): Promise<MenuTemplate | undefined> {
    return this.menuTemplates.get(id);
  }

  async createMenuTemplate(insertTemplate: InsertMenuTemplate): Promise<MenuTemplate> {
    const id = randomUUID();
    const template: MenuTemplate = { 
      ...insertTemplate, 
      id, 
      description: insertTemplate.description || null,
      previewImage: insertTemplate.previewImage || null,
      isActive: insertTemplate.isActive !== undefined ? insertTemplate.isActive : true,
      usageCount: 0,
      createdAt: new Date() 
    };
    this.menuTemplates.set(id, template);
    return template;
  }

  async updateMenuTemplate(id: string, updates: Partial<MenuTemplate>): Promise<MenuTemplate | undefined> {
    const template = this.menuTemplates.get(id);
    if (!template) return undefined;
    
    const updatedTemplate = { ...template, ...updates };
    this.menuTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  // QR code methods
  async getQrCodes(): Promise<QrCode[]> {
    return Array.from(this.qrCodes.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getQrCodesByRestaurant(restaurantId: string): Promise<QrCode[]> {
    return Array.from(this.qrCodes.values())
      .filter(qr => qr.restaurantId === restaurantId);
  }

  async createQrCode(insertQrCode: InsertQrCode): Promise<QrCode> {
    const id = randomUUID();
    const qrCode: QrCode = { 
      ...insertQrCode, 
      id, 
      style: insertQrCode.style || "classic",
      size: insertQrCode.size || "medium",
      foregroundColor: insertQrCode.foregroundColor || "#000000",
      backgroundColor: insertQrCode.backgroundColor || "#ffffff",
      format: insertQrCode.format || "png",
      scanCount: 0,
      createdAt: new Date() 
    };
    this.qrCodes.set(id, qrCode);
    return qrCode;
  }

  async updateQrCode(id: string, updates: Partial<QrCode>): Promise<QrCode | undefined> {
    const qrCode = this.qrCodes.get(id);
    if (!qrCode) return undefined;
    
    const updatedQrCode = { ...qrCode, ...updates };
    this.qrCodes.set(id, updatedQrCode);
    return updatedQrCode;
  }

  async deleteQrCode(id: string): Promise<boolean> {
    return this.qrCodes.delete(id);
  }

  // Analytics methods
  async getDashboardMetrics(): Promise<{
    totalRestaurants: number;
    monthlyRevenue: number;
    newSignups: number;
    pendingTickets: number;
  }> {
    const restaurants = await this.getRestaurants();
    const payments = await this.getPayments();
    const tickets = await this.getSupportTickets();
    
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyRevenue = payments
      .filter(p => p.status === "paid" && p.paidAt && new Date(p.paidAt) >= firstDayOfMonth)
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    const newSignups = restaurants
      .filter(r => r.createdAt && new Date(r.createdAt) >= firstDayOfMonth)
      .length;
    
    const pendingTickets = tickets
      .filter(t => t.status === "open" || t.status === "in_progress")
      .length;

    return {
      totalRestaurants: restaurants.length,
      monthlyRevenue,
      newSignups,
      pendingTickets,
    };
  }
}

import { DbStorage } from './db-storage';

export const storage = new DbStorage();
