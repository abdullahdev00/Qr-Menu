import { db } from "../../admin/lib/storage";
import { restaurants, subscriptionPlans, paymentHistory } from "@shared/schema";
import { eq, lt } from "drizzle-orm";

export interface BillingResult {
  restaurantId: string;
  restaurantName: string;
  success: boolean;
  previousBalance: number;
  newBalance: number;
  planCost: number;
  message: string;
}

/**
 * Process monthly billing for all active restaurants
 */
export async function processMonthlyBilling(): Promise<BillingResult[]> {
  console.log("🏦 Starting monthly billing process...");
  
  const results: BillingResult[] = [];
  
  try {
    // Get all restaurants with active plans
    const activeRestaurants = await db
      .select({
        restaurant: restaurants,
        plan: subscriptionPlans
      })
      .from(restaurants)
      .innerJoin(subscriptionPlans, eq(restaurants.planId, subscriptionPlans.id))
      .where(eq(restaurants.status, "active"));

    console.log(`📊 Found ${activeRestaurants.length} active restaurants to bill`);

    for (const { restaurant, plan } of activeRestaurants) {
      const result = await processSingleRestaurantBilling(restaurant, plan);
      results.push(result);
      
      // Log progress
      console.log(`${result.success ? '✅' : '❌'} ${restaurant.name}: ${result.message}`);
    }

    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`🎯 Billing completed: ${successful} successful, ${failed} failed`);
    
    return results;
    
  } catch (error) {
    console.error("❌ Monthly billing process failed:", error);
    throw error;
  }
}

/**
 * Process billing for a single restaurant
 */
async function processSingleRestaurantBilling(restaurant: any, plan: any): Promise<BillingResult> {
  const planCost = parseFloat(plan.price);
  const currentBalance = parseFloat(restaurant.accountBalance);
  const restaurantId = restaurant.id;
  const restaurantName = restaurant.name;
  
  try {
    if (currentBalance < planCost) {
      // Insufficient balance - suspend restaurant
      await db
        .update(restaurants)
        .set({
          status: "suspended",
          suspensionReason: `Insufficient balance for monthly billing. Required: PKR ${planCost}, Available: PKR ${currentBalance.toFixed(2)}`
        })
        .where(eq(restaurants.id, restaurantId));

      // Create payment history entry
      await db
        .insert(paymentHistory)
        .values({
          restaurantId,
          type: "billing_failed",
          amount: planCost.toString(),
          description: `Monthly billing failed - insufficient balance. Restaurant suspended.`,
          balanceBefore: currentBalance.toString(),
          balanceAfter: currentBalance.toString(),
          relatedPlanId: plan.id,
          status: "failed"
        });

      return {
        restaurantId,
        restaurantName,
        success: false,
        previousBalance: currentBalance,
        newBalance: currentBalance,
        planCost,
        message: `Insufficient balance (PKR ${currentBalance.toFixed(2)} < PKR ${planCost}). Restaurant suspended.`
      };
    }

    // Deduct plan cost from balance
    const newBalance = currentBalance - planCost;
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    // Update restaurant balance and next billing date
    await db
      .update(restaurants)
      .set({
        accountBalance: newBalance.toString(),
        lastBillingDate: new Date(),
        nextBillingDate,
      })
      .where(eq(restaurants.id, restaurantId));

    // Create payment history entry
    await db
      .insert(paymentHistory)
      .values({
        restaurantId,
        type: "monthly_billing",
        amount: planCost.toString(),
        description: `Monthly plan fee deducted for ${plan.name}`,
        balanceBefore: currentBalance.toString(),
        balanceAfter: newBalance.toString(),
        relatedPlanId: plan.id,
        status: "completed"
      });

    return {
      restaurantId,
      restaurantName,
      success: true,
      previousBalance: currentBalance,
      newBalance,
      planCost,
      message: `Successfully billed PKR ${planCost}. New balance: PKR ${newBalance.toFixed(2)}`
    };

  } catch (error) {
    console.error(`❌ Error billing restaurant ${restaurantName}:`, error);
    
    return {
      restaurantId,
      restaurantName,
      success: false,
      previousBalance: currentBalance,
      newBalance: currentBalance,
      planCost,
      message: `Billing failed due to system error: ${error}`
    };
  }
}

/**
 * Check for restaurants with expired plans
 */
export async function checkExpiredPlans(): Promise<void> {
  console.log("📅 Checking for expired plans...");
  
  try {
    const now = new Date();
    
    // Find restaurants with expired plans
    const expiredRestaurants = await db
      .select()
      .from(restaurants)
      .where(
        eq(restaurants.status, "active")
      );

    const expired = expiredRestaurants.filter(restaurant => {
      if (!restaurant.planExpiryDate) return false;
      return new Date(restaurant.planExpiryDate) <= now;
    });

    console.log(`⏰ Found ${expired.length} restaurants with expired plans`);

    for (const restaurant of expired) {
      // Suspend restaurant due to expired plan
      await db
        .update(restaurants)
        .set({
          status: "suspended",
          suspensionReason: `Plan expired on ${new Date(restaurant.planExpiryDate!).toLocaleDateString()}`
        })
        .where(eq(restaurants.id, restaurant.id));

      console.log(`🔒 Suspended ${restaurant.name} - Plan expired`);
    }
    
  } catch (error) {
    console.error("❌ Error checking expired plans:", error);
    throw error;
  }
}

/**
 * Send low balance warnings to restaurants
 */
export async function sendLowBalanceWarnings(): Promise<void> {
  console.log("⚠️ Checking for low balance warnings...");
  
  try {
    // Get restaurants with plans
    const restaurantsWithPlans = await db
      .select({
        restaurant: restaurants,
        plan: subscriptionPlans
      })
      .from(restaurants)
      .innerJoin(subscriptionPlans, eq(restaurants.planId, subscriptionPlans.id))
      .where(eq(restaurants.status, "active"));

    const lowBalanceRestaurants = restaurantsWithPlans.filter(({ restaurant, plan }) => {
      const balance = parseFloat(restaurant.accountBalance);
      const planCost = parseFloat(plan.price);
      return balance < planCost * 2; // Warn when balance is less than 2x plan cost
    });

    console.log(`💰 Found ${lowBalanceRestaurants.length} restaurants with low balance`);

    for (const { restaurant, plan } of lowBalanceRestaurants) {
      const balance = parseFloat(restaurant.accountBalance);
      const planCost = parseFloat(plan.price);
      const daysLeft = Math.floor(balance / (planCost / 30));
      
      // In a real system, you would send email/SMS notifications here
      console.log(`⚠️ ${restaurant.name}: PKR ${balance.toFixed(2)} balance, ~${daysLeft} days remaining`);
    }
    
  } catch (error) {
    console.error("❌ Error sending low balance warnings:", error);
    throw error;
  }
}

// Schedule monthly billing (this would typically be done with a cron job)
export function scheduleMonthlyBilling(): void {
  // Run on the 1st of every month at 2 AM
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 2, 0, 0);
  const timeUntilNextRun = nextMonth.getTime() - now.getTime();
  
  console.log(`📅 Next monthly billing scheduled for: ${nextMonth.toLocaleString()}`);
  
  setTimeout(async () => {
    await processMonthlyBilling();
    await checkExpiredPlans();
    await sendLowBalanceWarnings();
    
    // Schedule the next run
    scheduleMonthlyBilling();
  }, timeUntilNextRun);
}

// For testing purposes - run billing for a specific restaurant
export async function testBillingForRestaurant(restaurantId: string): Promise<BillingResult> {
  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1);
    
  if (!restaurant) {
    throw new Error("Restaurant not found");
  }
  
  if (!restaurant.planId) {
    throw new Error("Restaurant has no active plan");
  }
  
  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, restaurant.planId))
    .limit(1);
    
  if (!plan) {
    throw new Error("Plan not found");
  }
  
  return processSingleRestaurantBilling(restaurant, plan);
}