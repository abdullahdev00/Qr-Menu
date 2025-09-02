import type { Request, Response } from "express";
import { db } from "../../../lib/storage";
import { paymentRequests } from "@shared/schema";
import { eq } from "drizzle-orm";

export default async function handler(req: Request, res: Response) {
  const { id } = req.params;
  
  try {
    if (req.method === 'PATCH') {
      const { status, adminNotes, rejectionReason, processedBy } = req.body;
      
      const updatedRequest = await db
        .update(paymentRequests)
        .set({
          status,
          adminNotes,
          rejectionReason,
          processedBy,
          processedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(paymentRequests.id, id as string))
        .returning();
      
      if (updatedRequest.length === 0) {
        return res.status(404).json({ error: "Payment request not found" });
      }
      
      res.json(updatedRequest[0]);
    } else {
      res.setHeader('Allow', ['PATCH']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Payment request update API error:', error);
    res.status(500).json({ error: "Failed to update payment request" });
  }
}