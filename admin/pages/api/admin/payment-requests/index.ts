import type { Request, Response } from "express";
import { db } from "../../../../lib/storage";
import { paymentRequests, restaurants } from "@shared/schema";
import { desc, eq } from "drizzle-orm";

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    console.log('🔍 Admin fetching all payment requests...');
    // Fetch all payment requests with restaurant information
    const requests = await db
      .select({
        id: paymentRequests.id,
        restaurantId: paymentRequests.restaurantId,
        amount: paymentRequests.amount,
        paymentMethod: paymentRequests.paymentMethod,
        description: paymentRequests.description,
        transactionRef: paymentRequests.transactionRef,
        bankName: paymentRequests.bankName,
        accountNumber: paymentRequests.accountNumber,
        accountHolder: paymentRequests.accountHolder,
        status: paymentRequests.status,
        createdAt: paymentRequests.createdAt,
        receiptUrl: paymentRequests.receiptUrl,
        receiptFileName: paymentRequests.receiptFileName,
        receiptFileSize: paymentRequests.receiptFileSize,
        adminNotes: paymentRequests.adminNotes,
        processedAt: paymentRequests.processedAt,
        restaurantName: restaurants.name,
        restaurantEmail: restaurants.ownerEmail
      })
      .from(paymentRequests)
      .innerJoin(restaurants, eq(paymentRequests.restaurantId, restaurants.id))
      .orderBy(desc(paymentRequests.createdAt));

    console.log(`✅ Found ${requests.length} payment requests for admin panel`);
    res.json(requests);
  } catch (error) {
    console.error("Error fetching payment requests for admin:", error);
    res.status(500).json({ error: "Failed to fetch payment requests" });
  }
}

