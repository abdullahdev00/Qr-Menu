import type { Request, Response } from "express";
import { db } from "../../../lib/storage";
import { paymentRequests, paymentHistory, restaurants } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

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
        .where(eq(paymentRequests.restaurantId, restaurantId as string))
        .orderBy(desc(paymentRequests.createdAt));

      res.json(requests);
    } catch (error) {
      console.error("Error fetching payment requests:", error);
      res.status(500).json({ error: "Failed to fetch payment requests" });
    }
  } else if (req.method === 'POST') {
    try {
      console.log('Payment request data received:', req.body);
      console.log('File data received:', req.file);
      
      // Extract data from request body
      const { 
        amount, 
        paymentMethod, 
        description, 
        restaurantId,
        bankName,
        accountNumber,
        accountHolder
      } = req.body;
      
      // Handle file upload
      let receiptImage = null;
      if (req.file) {
        // Convert file buffer to base64 for storage
        receiptImage = req.file.buffer.toString('base64');
      }
      
      // Generate transaction reference
      const transactionRef = req.body.transactionRef || `TXN-${Date.now()}`;
      
      console.log('Extracted data:', { amount, paymentMethod, restaurantId, transactionRef, hasFile: !!req.file });
      
      if (!amount || !paymentMethod || !restaurantId) {
        console.log('Missing required fields:', { amount: !!amount, paymentMethod: !!paymentMethod, restaurantId: !!restaurantId });
        return res.status(400).json({ 
          error: "Amount, payment method, and restaurant ID are required" 
        });
      }
      
      const newRequest = await db
        .insert(paymentRequests)
        .values({
          restaurantId,
          amount: amount.toString(),
          paymentMethod,
          description: description || "",
          transactionRef,
          bankName: bankName || "",
          accountNumber: accountNumber || "",
          accountHolder: accountHolder || "",
          receiptUrl: receiptImage || null, // Store base64 image data temporarily
          receiptFileName: receiptImage ? "receipt.png" : null,
          receiptFileSize: receiptImage ? receiptImage.length : null,
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