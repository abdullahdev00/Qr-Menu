import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../../lib/storage'
import { restaurants, menuItems, subscriptionPlans } from '../../../../../shared/schema'
import { eq, sql, and } from 'drizzle-orm'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { restaurantId } = req.query

  if (!restaurantId || typeof restaurantId !== 'string') {
    return res.status(400).json({ message: 'Restaurant ID is required' })
  }

  try {
    // Get restaurant data
    const restaurantData = await db.select({
      id: restaurants.id,
      name: restaurants.name,
      slug: restaurants.slug,
      qrScansCount: restaurants.qrScansCount,
      avgRating: restaurants.avgRating,
      totalReviews: restaurants.totalReviews,
      status: restaurants.status,
      planId: restaurants.planId
    }).from(restaurants).where(eq(restaurants.id, restaurantId)).limit(1);

    if (restaurantData.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' })
    }

    const restaurant = restaurantData[0];

    // Get menu items count and popular item
    const menuItemsData = await db.select({
      id: menuItems.id,
      name: menuItems.name,
      isPopular: menuItems.isPopular,
      isAvailable: menuItems.isAvailable
    }).from(menuItems).where(and(
      eq(menuItems.restaurantId, restaurantId),
      eq(menuItems.isAvailable, true)
    ));

    // Get subscription plan details
    let planName = 'Basic Plan';
    if (restaurant.planId) {
      const planData = await db.select({
        name: subscriptionPlans.name
      }).from(subscriptionPlans).where(eq(subscriptionPlans.id, restaurant.planId)).limit(1);
      
      if (planData.length > 0) {
        planName = planData[0].name;
      }
    }

    // Find most popular item
    const popularItem = menuItemsData.find(item => item.isPopular) || menuItemsData[0] || { name: 'No items yet' };

    // Calculate metrics
    const metrics = {
      menuItemsCount: menuItemsData.length,
      qrScansCount: restaurant.qrScansCount || 0,
      avgRating: restaurant.avgRating || '0.0',
      totalReviews: restaurant.totalReviews || 0,
      popularItem: popularItem,
      subscriptionPlan: planName,
      subscriptionStatus: restaurant.status || 'inactive',
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug
      }
    };

    res.json(metrics)
  } catch (error) {
    console.error('Error fetching vendor dashboard metrics:', error)
    res.status(500).json({ message: 'Failed to fetch metrics' })
  }
}