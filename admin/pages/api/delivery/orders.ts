import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/storage';
import { orders, orderItems, menuItems } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { restaurantId, deliveryType = 'delivery', status = 'ready' } = req.query;

    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    // Fetch delivery orders with status 'ready' or 'out_for_delivery'
    const validStatuses = ['ready', 'out_for_delivery'];
    const orderList = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.restaurantId, restaurantId as string),
          eq(orders.deliveryType, deliveryType as string),
          status === 'ready' 
            ? eq(orders.status, 'ready')
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
    console.error('Error fetching delivery orders:', error);
    res.status(500).json({ error: 'Failed to fetch delivery orders' });
  }
}