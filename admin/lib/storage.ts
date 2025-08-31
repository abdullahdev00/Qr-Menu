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
  restaurantTables,
  users,
  menuCategories,
  menuItems,
  orders,
  orderItems,
  type AdminUser, type InsertAdminUser,
  type Restaurant, type InsertRestaurant,
  type SubscriptionPlan, type InsertSubscriptionPlan,
  type Payment, type InsertPayment,
  type SupportTicket, type InsertSupportTicket,
  type MenuTemplate, type InsertMenuTemplate,
  type RestaurantTable, type InsertRestaurantTable,
  type User, type InsertUser,
  type MenuCategory, type InsertMenuCategory,
  type MenuItem, type InsertMenuItem,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem
} from "../../shared/schema";

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Export db for direct database queries
export { db };

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
            features: ["Up to 50 menu items", "Basic analytics"],
            maxMenuItems: 50,
            duration: 30,
            isActive: true,
          },
          {
            name: "Premium Plan",
            price: "3500.00",
            currency: "PKR",
            features: ["Unlimited menu items", "Advanced analytics", "Custom branding"],
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
            qrScansCount: 2847,
            avgRating: "4.7",
            totalReviews: 156,
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
            qrScansCount: 1534,
            avgRating: "4.3",
            totalReviews: 89,
          }
        ]);
      }

      // Check if menu categories exist and add sample ones
      const existingCategories = await db.select().from(menuCategories).limit(1);
      
      if (existingCategories.length === 0) {
        const restaurantsList = await db.select().from(restaurants);
        
        if (restaurantsList.length > 0) {
          const firstRestaurant = restaurantsList[0];
          
          await db.insert(menuCategories).values([
            {
              restaurantId: firstRestaurant.id,
              name: "Main Courses",
              description: "Traditional Pakistani main dishes",
              displayOrder: 1,
              isActive: true,
            },
            {
              restaurantId: firstRestaurant.id,
              name: "Appetizers",
              description: "Starters and small plates",
              displayOrder: 2,
              isActive: true,
            },
            {
              restaurantId: firstRestaurant.id,
              name: "Beverages",
              description: "Drinks and refreshments",
              displayOrder: 3,
              isActive: true,
            },
            {
              restaurantId: firstRestaurant.id,
              name: "Desserts",
              description: "Sweet treats and desserts",
              displayOrder: 4,
              isActive: true,
            }
          ]);
        }
      }

      // Check if menu templates exist
      const existingTemplates = await db.select().from(menuTemplates).limit(1);
      
      if (existingTemplates.length === 0) {
        await db.insert(menuTemplates).values([
          {
            name: "Modern Minimalist",
            description: "Clean, simple design perfect for upscale restaurants",
            category: "modern",
            designData: {
              theme: "minimal",
              colors: {
                primary: "#2563eb",
                secondary: "#f8fafc",
                accent: "#0f172a"
              },
              fonts: {
                heading: "Inter",
                body: "Inter"
              }
            },
            previewImage: "/templates/modern-minimalist.jpg",
            isActive: true,
          },
          {
            name: "Traditional Pakistani",
            description: "Rich, culturally inspired design for traditional cuisine",
            category: "traditional",
            designData: {
              theme: "traditional",
              colors: {
                primary: "#059669",
                secondary: "#fef3c7",
                accent: "#92400e"
              },
              fonts: {
                heading: "Playfair Display",
                body: "Source Sans Pro"
              }
            },
            previewImage: "/templates/traditional-pakistani.jpg",
            isActive: true,
          }
        ]);
      }

      // Check if menu items exist and create sample items with multiple images
      const existingMenuItems = await db.select().from(menuItems).limit(1);
      
      if (existingMenuItems.length === 0) {
        const restaurantsList = await db.select().from(restaurants);
        const categoriesList = await db.select().from(menuCategories);
        
        if (restaurantsList.length > 0 && categoriesList.length > 0) {
          const restaurant = restaurantsList[0]; // Al-Baik Restaurant
          const mainCourseCategory = categoriesList.find(c => c.name === "Main Courses");
          const appetizersCategory = categoriesList.find(c => c.name === "Appetizers");
          const beveragesCategory = categoriesList.find(c => c.name === "Beverages");
          const dessertsCategory = categoriesList.find(c => c.name === "Desserts");
          
          await db.insert(menuItems).values([
            {
              restaurantId: restaurant.id,
              categoryId: mainCourseCategory?.id,
              name: "Chicken Karahi",
              description: "Traditional Pakistani chicken curry cooked with tomatoes, ginger, and aromatic spices",
              price: "850.00",
              currency: "PKR",
              image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop",
              images: [
                "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop"
              ],
              ingredients: ["chicken", "tomatoes", "ginger", "garlic", "onions", "spices"],
              allergens: ["none"],
              isVegan: false,
              isVegetarian: false,
              isSpicy: true,
              preparationTime: 25,
              calories: 420,
              isAvailable: true,
              isPopular: true, // Mark Chicken Karahi as popular
              displayOrder: 1,
            },
            {
              restaurantId: restaurant.id,
              categoryId: mainCourseCategory?.id,
              name: "Beef Biryani",
              description: "Aromatic basmati rice layered with tender beef and traditional spices",
              price: "950.00",
              currency: "PKR",
              image: "https://images.unsplash.com/photo-1563379091339-03246963d529?w=400&h=300&fit=crop",
              images: [
                "https://images.unsplash.com/photo-1563379091339-03246963d529?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop"
              ],
              ingredients: ["beef", "basmati rice", "saffron", "yogurt", "spices", "onions"],
              allergens: ["dairy"],
              isVegan: false,
              isVegetarian: false,
              isSpicy: true,
              preparationTime: 45,
              calories: 620,
              isAvailable: true,
              isPopular: false, // Not as popular as Chicken Karahi
              displayOrder: 2,
            },
            {
              restaurantId: restaurant.id,
              categoryId: appetizersCategory?.id,
              name: "Chicken Samosa",
              description: "Crispy pastry filled with spiced chicken and vegetables",
              price: "250.00",
              currency: "PKR",
              image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop",
              images: [
                "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop"
              ],
              ingredients: ["chicken", "pastry", "onions", "peas", "spices"],
              allergens: ["gluten"],
              isVegan: false,
              isVegetarian: false,
              isSpicy: false,
              preparationTime: 15,
              calories: 180,
              isAvailable: true,
              displayOrder: 1,
            },
            {
              restaurantId: restaurant.id,
              categoryId: beveragesCategory?.id,
              name: "Fresh Mango Lassi",
              description: "Creamy yogurt drink blended with fresh mangoes and cardamom",
              price: "350.00",
              currency: "PKR",
              image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop",
              images: [
                "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop"
              ],
              ingredients: ["mango", "yogurt", "sugar", "cardamom", "ice"],
              allergens: ["dairy"],
              isVegan: false,
              isVegetarian: true,
              isSpicy: false,
              preparationTime: 5,
              calories: 120,
              isAvailable: true,
              displayOrder: 1,
            },
            {
              restaurantId: restaurant.id,
              categoryId: dessertsCategory?.id,
              name: "Gulab Jamun",
              description: "Soft milk dumplings in rose-scented sugar syrup",
              price: "300.00",
              currency: "PKR",
              image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
              images: [
                "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop"
              ],
              ingredients: ["milk", "flour", "sugar", "rose water", "cardamom"],
              allergens: ["dairy", "gluten"],
              isVegan: false,
              isVegetarian: true,
              isSpicy: false,
              preparationTime: 10,
              calories: 250,
              isAvailable: true,
              displayOrder: 1,
            }
          ]);
        }
      }

      // Check if orders exist and add demo orders with available menu items
      const existingOrders = await db.select().from(orders).limit(1);
      
      if (existingOrders.length === 0) {
        const restaurantsList = await db.select().from(restaurants);
        const availableMenuItems = await db.select().from(menuItems).where(eq(menuItems.isAvailable, true));
        
        if (restaurantsList.length > 0 && availableMenuItems.length > 0) {
          const restaurant = restaurantsList[0]; // Al-Baik Restaurant
          
          // Create demo orders with available menu items
          const order1 = await db.insert(orders).values({
            restaurantId: restaurant.id,
            customerName: "Ali Ahmed",
            customerPhone: "03001234567",
            orderNumber: 1001,
            status: "completed",
            totalAmount: "1650.00",
            currency: "PKR",
            deliveryType: "dine_in",
            paymentMethod: "cash",
            paymentStatus: "paid",
            specialInstructions: "Extra spicy please",
            estimatedTime: 25,
          }).returning();

          const order2 = await db.insert(orders).values({
            restaurantId: restaurant.id,
            customerName: "Fatima Khan",
            customerPhone: "03009876543",
            orderNumber: 1002,
            status: "preparing",
            totalAmount: "2100.00",
            currency: "PKR",
            deliveryType: "takeaway",
            paymentMethod: "card",
            paymentStatus: "paid",
            specialInstructions: "No onions",
            estimatedTime: 30,
          }).returning();

          const order3 = await db.insert(orders).values({
            restaurantId: restaurant.id,
            customerName: "Ahmed Hassan",
            customerPhone: "03007654321",
            orderNumber: 1003,
            status: "pending",
            totalAmount: "1200.00",
            currency: "PKR",
            deliveryType: "delivery",
            deliveryAddress: "Model Town, Lahore",
            paymentMethod: "online",
            paymentStatus: "pending",
            specialInstructions: "Call before delivery",
            estimatedTime: 45,
          }).returning();

          // Add order items using available menu items
          if (order1.length > 0 && availableMenuItems.length >= 2) {
            // Order 1 items
            await db.insert(orderItems).values([
              {
                orderId: order1[0].id,
                menuItemId: availableMenuItems[0].id, // Pizza
                quantity: 2,
                unitPrice: availableMenuItems[0].price,
                totalPrice: (parseFloat(availableMenuItems[0].price) * 2).toFixed(2),
                specialRequests: "Extra cheese"
              },
              {
                orderId: order1[0].id,
                menuItemId: availableMenuItems[1].id, // Chicken
                quantity: 1,
                unitPrice: availableMenuItems[1].price,
                totalPrice: availableMenuItems[1].price,
                specialRequests: "Well done"
              }
            ]);
          }

          if (order2.length > 0 && availableMenuItems.length >= 3) {
            // Order 2 items
            await db.insert(orderItems).values([
              {
                orderId: order2[0].id,
                menuItemId: availableMenuItems[2].id, // Special Pizza
                quantity: 2,
                unitPrice: availableMenuItems[2].price,
                totalPrice: (parseFloat(availableMenuItems[2].price) * 2).toFixed(2),
              },
              {
                orderId: order2[0].id,
                menuItemId: availableMenuItems[1].id, // Chicken
                quantity: 1,
                unitPrice: availableMenuItems[1].price,
                totalPrice: availableMenuItems[1].price,
              }
            ]);
          }

          if (order3.length > 0 && availableMenuItems.length >= 2) {
            // Order 3 items
            await db.insert(orderItems).values([
              {
                orderId: order3[0].id,
                menuItemId: availableMenuItems[0].id, // Pizza
                quantity: 1,
                unitPrice: availableMenuItems[0].price,
                totalPrice: availableMenuItems[0].price,
              },
              {
                orderId: order3[0].id,
                menuItemId: availableMenuItems[1].id, // Chicken
                quantity: 1,
                unitPrice: availableMenuItems[1].price,
                totalPrice: availableMenuItems[1].price,
              }
            ]);
          }
        }
      }

      console.log('✅ Database initialized');
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  // Admin Users Methods
  async getAdminUsers(): Promise<AdminUser[]> {
    return await db.select().from(adminUsers).orderBy(desc(adminUsers.createdAt));
  }

  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    const result = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
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

  async deleteAdminUser(id: string): Promise<boolean> {
    const result = await db.delete(adminUsers).where(eq(adminUsers.id, id));
    return result.length > 0;
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    const result = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
    return result[0];
  }

  // Restaurants Methods
  async getRestaurants(searchTerm?: string): Promise<Restaurant[]> {
    const query = db.select().from(restaurants).orderBy(desc(restaurants.createdAt));
    
    if (searchTerm) {
      return await query.where(
        or(
          like(restaurants.name, `%${searchTerm}%`),
          like(restaurants.ownerName, `%${searchTerm}%`),
          like(restaurants.ownerEmail, `%${searchTerm}%`),
          like(restaurants.city, `%${searchTerm}%`)
        )
      );
    }
    
    return await query;
  }

  async getRestaurant(id: string): Promise<Restaurant | undefined> {
    const result = await db.select().from(restaurants).where(eq(restaurants.id, id)).limit(1);
    return result[0];
  }

  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const result = await db.insert(restaurants).values(restaurant).returning();
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

  // Subscription Plans Methods
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).orderBy(subscriptionPlans.price);
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

  // Payments Methods
  async getPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    return result[0];
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const result = await db.insert(payments).values(payment).returning();
    return result[0];
  }

  async updatePayment(id: string, payment: Partial<Payment>): Promise<Payment | undefined> {
    const result = await db.update(payments).set(payment).where(eq(payments.id, id)).returning();
    return result[0];
  }

  async deletePayment(id: string): Promise<boolean> {
    const result = await db.delete(payments).where(eq(payments.id, id));
    return result.length > 0;
  }

  // Support Tickets Methods
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

  async deleteSupportTicket(id: string): Promise<boolean> {
    const result = await db.delete(supportTickets).where(eq(supportTickets.id, id));
    return result.length > 0;
  }

  // Menu Templates Methods
  async getMenuTemplates(): Promise<MenuTemplate[]> {
    return await db.select().from(menuTemplates).where(eq(menuTemplates.isActive, true)).orderBy(desc(menuTemplates.createdAt));
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

  async deleteMenuTemplate(id: string): Promise<boolean> {
    const result = await db.delete(menuTemplates).where(eq(menuTemplates.id, id));
    return result.length > 0;
  }

  // Restaurant Tables Methods
  async getRestaurantTables(restaurantId?: string): Promise<RestaurantTable[]> {
    const query = db.select().from(restaurantTables);
    if (restaurantId) {
      return await query.where(eq(restaurantTables.restaurantId, restaurantId)).orderBy(restaurantTables.tableNumber);
    }
    return await query.orderBy(restaurantTables.tableNumber);
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

  // Menu Category Methods
  async getMenuCategories(restaurantId?: string): Promise<MenuCategory[]> {
    const query = db.select().from(menuCategories);
    if (restaurantId) {
      return await query.where(eq(menuCategories.restaurantId, restaurantId)).orderBy(menuCategories.displayOrder);
    }
    return await query.orderBy(menuCategories.displayOrder);
  }

  async getMenuCategory(id: string): Promise<MenuCategory | undefined> {
    const result = await db.select().from(menuCategories).where(eq(menuCategories.id, id)).limit(1);
    return result[0];
  }

  async createMenuCategory(category: InsertMenuCategory): Promise<MenuCategory> {
    const result = await db.insert(menuCategories).values(category).returning();
    return result[0];
  }

  async updateMenuCategory(id: string, category: Partial<MenuCategory>): Promise<MenuCategory | undefined> {
    const result = await db.update(menuCategories).set(category).where(eq(menuCategories.id, id)).returning();
    return result[0];
  }

  async deleteMenuCategory(id: string): Promise<boolean> {
    const result = await db.delete(menuCategories).where(eq(menuCategories.id, id));
    return result.length > 0;
  }

  // Menu Item Methods
  async getMenuItems(restaurantId?: string): Promise<MenuItem[]> {
    const query = db.select().from(menuItems);
    if (restaurantId) {
      return await query.where(eq(menuItems.restaurantId, restaurantId)).orderBy(menuItems.displayOrder, desc(menuItems.createdAt));
    }
    return await query.orderBy(menuItems.displayOrder, desc(menuItems.createdAt));
  }

  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    const result = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
    return result[0];
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    // Validate restaurant exists before creating menu item
    const restaurant = await db.select().from(restaurants).where(eq(restaurants.id, item.restaurantId)).limit(1);
    
    if (restaurant.length === 0) {
      // Get first available restaurant as fallback
      const firstRestaurant = await db.select().from(restaurants).limit(1);
      if (firstRestaurant.length > 0) {
        item.restaurantId = firstRestaurant[0].id;
        console.log(`⚠️ Restaurant ID ${item.restaurantId} not found, using fallback: ${firstRestaurant[0].id}`);
      } else {
        throw new Error('No restaurants available. Please create a restaurant first.');
      }
    }
    
    const result = await db.insert(menuItems).values(item).returning();
    return result[0];
  }

  async updateMenuItem(id: string, item: Partial<MenuItem>): Promise<MenuItem | undefined> {
    const result = await db.update(menuItems).set(item).where(eq(menuItems.id, id)).returning();
    return result[0];
  }

  async deleteMenuItem(id: string): Promise<boolean> {
    const result = await db.delete(menuItems).where(eq(menuItems.id, id));
    return result.length > 0;
  }

  // User authentication Methods
  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  // Orders Methods
  async getOrders(restaurantId?: string): Promise<Order[]> {
    const query = db.select().from(orders);
    if (restaurantId) {
      return await query.where(eq(orders.restaurantId, restaurantId)).orderBy(desc(orders.createdAt));
    }
    return await query.orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }

  async updateOrder(id: string, order: Partial<Order>): Promise<Order | undefined> {
    const result = await db.update(orders).set(order).where(eq(orders.id, id)).returning();
    return result[0];
  }

  async deleteOrder(id: string): Promise<boolean> {
    const result = await db.delete(orders).where(eq(orders.id, id));
    return result.length > 0;
  }

  // Order Items Methods
  async getOrderItems(orderId?: string): Promise<OrderItem[]> {
    const query = db.select().from(orderItems);
    if (orderId) {
      return await query.where(eq(orderItems.orderId, orderId));
    }
    return await query;
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const result = await db.insert(orderItems).values(orderItem).returning();
    return result[0];
  }

  async updateOrderItem(id: string, orderItem: Partial<OrderItem>): Promise<OrderItem | undefined> {
    const result = await db.update(orderItems).set(orderItem).where(eq(orderItems.id, id)).returning();
    return result[0];
  }

  async deleteOrderItem(id: string): Promise<boolean> {
    const result = await db.delete(orderItems).where(eq(orderItems.id, id));
    return result.length > 0;
  }
}

export const storage = new Storage();