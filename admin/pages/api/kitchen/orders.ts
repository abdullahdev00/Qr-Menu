import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/storage';
import { orders, orderItems, menuItems } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { restaurantId, status = 'confirmed' } = req.query;

    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    // Fetch orders with status 'confirmed' or 'preparing' for kitchen
    const validStatuses = ['confirmed', 'preparing'];
    const orderList = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.restaurantId, restaurantId as string),
          status === 'confirmed' 
            ? eq(orders.status, 'confirmed')
            : eq(orders.status, status as string)
        )
      )
      .orderBy(orders.createdAt);

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orderList.map(async (order) => {
        const items = await db
          .select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            menuItemId: orderItems.menuItemId,
            quantity: orderItems.quantity,
            unitPrice: orderItems.unitPrice,
            totalPrice: orderItems.totalPrice,
            specialRequests: orderItems.specialRequests,
            menuItem: {
              name: menuItems.name,
              price: menuItems.price,
            }
          })
          .from(orderItems)
          .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
          .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          items
        };
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching kitchen orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}