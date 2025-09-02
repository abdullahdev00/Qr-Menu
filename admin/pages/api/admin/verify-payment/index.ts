import type { Request, Response } from "express";
import { db } from "../../../../lib/storage";
import { paymentRequests, paymentHistory, restaurants } from "@shared/schema";
import { eq } from "drizzle-orm";

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { paymentRequestId, action, adminNotes } = req.body;
    
    if (!paymentRequestId || !action) {
      return res.status(400).json({ 
        error: "Payment request ID and action are required" 
      });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ 
        error: "Action must be 'approve' or 'reject'" 
      });
    }

    // Get payment request details
    const [paymentRequest] = await db
      .select()
      .from(paymentRequests)
      .where(eq(paymentRequests.id, paymentRequestId))
      .limit(1);

    if (!paymentRequest) {
      return res.status(404).json({ error: "Payment request not found" });
    }

    if (paymentRequest.status !== 'pending') {
      return res.status(400).json({ 
        error: `Payment request is already ${paymentRequest.status}` 
      });
    }

    // Get restaurant details
    const [restaurant] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.id, paymentRequest.restaurantId))
      .limit(1);

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const now = new Date();
    let updatedBalance = parseFloat(restaurant.accountBalance);

    if (action === 'approve') {
      // Add payment amount to restaurant balance
      const paymentAmount = parseFloat(paymentRequest.amount);
      updatedBalance += paymentAmount;

      // Update restaurant balance
      await db
        .update(restaurants)
        .set({
          accountBalance: updatedBalance.toString()
        })
        .where(eq(restaurants.id, paymentRequest.restaurantId));

      // Create payment history entry
      await db
        .insert(paymentHistory)
        .values({
          restaurantId: paymentRequest.restaurantId,
          type: "balance_add",
          amount: paymentRequest.amount,
          description: `Balance added via ${paymentRequest.paymentMethod} - ${paymentRequest.description || 'Payment verified'}`,
          balanceBefore: restaurant.accountBalance,
          balanceAfter: updatedBalance.toString(),
          paymentRequestId: paymentRequestId,
          transactionRef: paymentRequest.transactionRef
        });
    }

    // Update payment request status
    const updatedRequest = await db
      .update(paymentRequests)
      .set({
        status: action === 'approve' ? 'approved' : 'rejected',
        adminNotes: adminNotes || null,
        processedAt: now
      })
      .where(eq(paymentRequests.id, paymentRequestId))
      .returning();

    res.json({
      paymentRequest: updatedRequest[0],
      newBalance: action === 'approve' ? updatedBalance : parseFloat(restaurant.accountBalance),
      message: `Payment request ${action}d successfully`
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
}