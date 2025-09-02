import type { Request, Response } from "express";
import { db } from "../../../lib/storage";
import { planUpgrades, restaurants, subscriptionPlans, paymentHistory } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export default async function handler(req: Request, res: Response) {
  if (req.method === 'GET') {
    try {
      const { restaurantId } = req.query;
      
      if (!restaurantId) {
        return res.status(400).json({ error: "Restaurant ID required" });
      }

      const upgrades = await db
        .select()
        .from(planUpgrades)
        .where(eq(planUpgrades.restaurantId, restaurantId as string))
        .orderBy(desc(planUpgrades.createdAt));

      res.json(upgrades);
    } catch (error) {
      console.error("Error fetching plan upgrades:", error);
      res.status(500).json({ error: "Failed to fetch plan upgrades" });
    }
  } else if (req.method === 'POST') {
    try {
      const { restaurantId, newPlanId } = req.body;
      
      if (!restaurantId || !newPlanId) {
        return res.status(400).json({ 
          error: "Restaurant ID and new plan ID are required" 
        });
      }

      // Get restaurant and plan details
      const [restaurant] = await db
        .select()
        .from(restaurants)
        .where(eq(restaurants.id, restaurantId))
        .limit(1);

      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }

      const [newPlan] = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, newPlanId))
        .limit(1);

      if (!newPlan) {
        return res.status(404).json({ error: "Plan not found" });
      }

      // Calculate price difference and pro-rated amount
      const currentPlanId = restaurant.planId;
      let currentPlan = null;
      let priceDifference = parseFloat(newPlan.price);
      
      if (currentPlanId) {
        [currentPlan] = await db
          .select()
          .from(subscriptionPlans)
          .where(eq(subscriptionPlans.id, currentPlanId))
          .limit(1);
        
        if (currentPlan) {
          priceDifference = parseFloat(newPlan.price) - parseFloat(currentPlan.price);
        }
      }

      // Calculate pro-rated amount based on remaining days
      const now = new Date();
      const expiryDate = restaurant.planExpiryDate ? new Date(restaurant.planExpiryDate) : new Date();
      const daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      const proRatedAmount = (priceDifference / 30) * Math.max(1, daysRemaining);

      // Check if restaurant has sufficient balance
      const currentBalance = parseFloat(restaurant.accountBalance);
      if (currentBalance < proRatedAmount) {
        return res.status(400).json({ 
          error: `Insufficient balance. Required: PKR ${proRatedAmount.toFixed(2)}, Available: PKR ${currentBalance.toFixed(2)}` 
        });
      }

      // Create plan upgrade record
      const newExpiryDate = new Date(now);
      newExpiryDate.setDate(newExpiryDate.getDate() + newPlan.duration);

      const planUpgrade = await db
        .insert(planUpgrades)
        .values({
          restaurantId,
          fromPlanId: currentPlanId,
          toPlanId: newPlanId,
          priceDifference: priceDifference.toString(),
          proRatedAmount: proRatedAmount.toString(),
          effectiveDate: now,
          newExpiryDate,
          status: "active"
        })
        .returning();

      // Update restaurant with new plan and deduct balance
      const newBalance = currentBalance - proRatedAmount;
      await db
        .update(restaurants)
        .set({
          planId: newPlanId,
          planExpiryDate: newExpiryDate,
          accountBalance: newBalance.toString()
        })
        .where(eq(restaurants.id, restaurantId));

      // Create payment history entry
      await db
        .insert(paymentHistory)
        .values({
          restaurantId,
          type: "plan_upgrade",
          amount: proRatedAmount.toString(),
          description: `Upgraded from ${currentPlan?.name || 'No Plan'} to ${newPlan.name}`,
          balanceBefore: currentBalance.toString(),
          balanceAfter: newBalance.toString(),
          relatedPlanId: newPlanId
        });

      res.status(201).json({
        upgrade: planUpgrade[0],
        newBalance: newBalance,
        message: "Plan upgraded successfully"
      });
    } catch (error) {
      console.error("Error creating plan upgrade:", error);
      res.status(500).json({ error: "Failed to upgrade plan" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}