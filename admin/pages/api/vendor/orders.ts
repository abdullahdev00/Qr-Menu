import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/storage';
import { orders, orderItems, menuItems } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  
  if (method === 'GET') {
    try {
      const { restaurantId } = req.query;
      
      if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurant ID is required' });
      }

      // Fetch orders with items and menu item details
      const ordersList = await db
        .select({
          id: orders.id,
          restaurantId: orders.restaurantId,
          tableId: orders.tableId,
          customerName: orders.customerName,
          customerPhone: orders.customerPhone,
          orderNumber: orders.orderNumber,
          status: orders.status,
          totalAmount: orders.totalAmount,
          currency: orders.currency,
          deliveryType: orders.deliveryType,
          deliveryAddress: orders.deliveryAddress,
          paymentMethod: orders.paymentMethod,
          paymentStatus: orders.paymentStatus,
          specialInstructions: orders.specialInstructions,
          estimatedTime: orders.estimatedTime,
          completedAt: orders.completedAt,
          cancelledAt: orders.cancelledAt,
          cancellationReason: orders.cancellationReason,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
        })
        .from(orders)
        .where(eq(orders.restaurantId, restaurantId as string))
        .orderBy(desc(orders.createdAt));

      // For each order, get its items
      const ordersWithItems = await Promise.all(
        ordersList.map(async (order: any) => {
          const items = await db
            .select({
              id: orderItems.id,
              orderId: orderItems.orderId,
              menuItemId: orderItems.menuItemId,
              quantity: orderItems.quantity,
              unitPrice: orderItems.unitPrice,
              totalPrice: orderItems.totalPrice,
              specialRequests: orderItems.specialRequests,
              createdAt: orderItems.createdAt,
              menuItem: {
                name: menuItems.name,
                price: menuItems.price
              }
            })
            .from(orderItems)
            .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
            .where(eq(orderItems.orderId, order.id));

          return {
            ...order,
            items: items
          };
        })
      );

      res.status(200).json(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}