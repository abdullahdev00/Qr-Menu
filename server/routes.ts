import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertAdminUserSchema, 
  insertRestaurantSchema, 
  insertSubscriptionPlanSchema,
  insertPaymentSchema,
  insertSupportTicketSchema,
  insertMenuTemplateSchema,
  insertQrCodeSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getAdminUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In a real app, you'd use proper session management
      res.json({ 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
        } 
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // Restaurant routes
  app.get("/api/restaurants", async (req, res) => {
    try {
      const { search } = req.query;
      let restaurants;
      
      if (search) {
        restaurants = await storage.searchRestaurants(search as string);
      } else {
        restaurants = await storage.getRestaurants();
      }
      
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  });

  app.get("/api/restaurants/:id", async (req, res) => {
    try {
      const restaurant = await storage.getRestaurant(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurant" });
    }
  });

  app.post("/api/restaurants", async (req, res) => {
    try {
      const validatedData = insertRestaurantSchema.parse(req.body);
      const restaurant = await storage.createRestaurant(validatedData);
      res.status(201).json(restaurant);
    } catch (error) {
      res.status(400).json({ message: "Invalid restaurant data" });
    }
  });

  app.put("/api/restaurants/:id", async (req, res) => {
    try {
      const restaurant = await storage.updateRestaurant(req.params.id, req.body);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ message: "Failed to update restaurant" });
    }
  });

  app.delete("/api/restaurants/:id", async (req, res) => {
    try {
      const success = await storage.deleteRestaurant(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      res.json({ message: "Restaurant deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete restaurant" });
    }
  });

  // Subscription plan routes
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  app.post("/api/subscription-plans", async (req, res) => {
    try {
      const validatedData = insertSubscriptionPlanSchema.parse(req.body);
      const plan = await storage.createSubscriptionPlan(validatedData);
      res.status(201).json(plan);
    } catch (error) {
      res.status(400).json({ message: "Invalid plan data" });
    }
  });

  app.put("/api/subscription-plans/:id", async (req, res) => {
    try {
      const plan = await storage.updateSubscriptionPlan(req.params.id, req.body);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to update plan" });
    }
  });

  // Payment routes
  app.get("/api/payments", async (req, res) => {
    try {
      const { restaurantId } = req.query;
      let payments;
      
      if (restaurantId) {
        payments = await storage.getPaymentsByRestaurant(restaurantId as string);
      } else {
        payments = await storage.getPayments();
      }
      
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data" });
    }
  });

  // Support ticket routes
  app.get("/api/support-tickets", async (req, res) => {
    try {
      const tickets = await storage.getSupportTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  app.post("/api/support-tickets", async (req, res) => {
    try {
      const validatedData = insertSupportTicketSchema.parse(req.body);
      const ticket = await storage.createSupportTicket(validatedData);
      res.status(201).json(ticket);
    } catch (error) {
      res.status(400).json({ message: "Invalid ticket data" });
    }
  });

  app.put("/api/support-tickets/:id", async (req, res) => {
    try {
      const ticket = await storage.updateSupportTicket(req.params.id, req.body);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Failed to update ticket" });
    }
  });

  // Menu template routes
  app.get("/api/menu-templates", async (req, res) => {
    try {
      const templates = await storage.getMenuTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu templates" });
    }
  });

  app.post("/api/menu-templates", async (req, res) => {
    try {
      const validatedData = insertMenuTemplateSchema.parse(req.body);
      const template = await storage.createMenuTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      res.status(400).json({ message: "Invalid template data" });
    }
  });

  // QR code routes
  app.get("/api/qr-codes", async (req, res) => {
    try {
      const { restaurantId } = req.query;
      let qrCodes;
      
      if (restaurantId) {
        qrCodes = await storage.getQrCodesByRestaurant(restaurantId as string);
      } else {
        qrCodes = await storage.getQrCodes();
      }
      
      res.json(qrCodes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QR codes" });
    }
  });

  app.post("/api/qr-codes", async (req, res) => {
    try {
      const validatedData = insertQrCodeSchema.parse(req.body);
      const qrCode = await storage.createQrCode(validatedData);
      res.status(201).json(qrCode);
    } catch (error) {
      res.status(400).json({ message: "Invalid QR code data" });
    }
  });

  app.delete("/api/qr-codes/:id", async (req, res) => {
    try {
      const success = await storage.deleteQrCode(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "QR code not found" });
      }
      res.json({ message: "QR code deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete QR code" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
