import type { Request, Response } from "express";
import { db } from "../../../lib/storage";
import { paymentRequests } from "@shared/schema";
import { eq } from "drizzle-orm";

export default async function handler(req: Request, res: Response) {
  if (req.method === 'GET') {
    try {
      const { restaurantId } = req.query;
      
      if (!restaurantId) {
        return res.status(400).json({ error: "Restaurant ID required" });
      }

      const requests = await db
        .select()
        .from(paymentRequests)
        .where(eq(paymentRequests.vendorId, restaurantId as string))
        .orderBy(paymentRequests.createdAt);

      res.json(requests);
    } catch (error) {
      console.error("Error fetching payment requests:", error);
      res.status(500).json({ error: "Failed to fetch payment requests" });
    }
  } else if (req.method === 'POST') {
    try {
      const { amount, paymentMethod, description, restaurantId } = req.body;
      
      if (!amount || !paymentMethod || !restaurantId) {
        return res.status(400).json({ 
          error: "Amount, payment method, and restaurant ID are required" 
        });
      }

      // Handle file upload (receipt image) here in real implementation
      // For now, we'll use a placeholder
      const receiptImageUrl = req.file ? `/uploads/${req.file.filename}` : null;

      const newRequest = await db
        .insert(paymentRequests)
        .values({
          vendorId: restaurantId,
          amount: amount.toString(),
          paymentMethod,
          description: description || "",
          receiptImage: receiptImageUrl,
          status: "pending",
        })
        .returning();

      res.status(201).json(newRequest[0]);
    } catch (error) {
      console.error("Error creating payment request:", error);
      res.status(500).json({ error: "Failed to create payment request" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}