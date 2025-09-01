import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { db } from '../../../lib/storage';
import { restaurants, orders, orderItems, menuItems } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { customerId, restaurantSlug } = req.query;
      
      if (!customerId) {
        return res.status(400).json({ error: 'Customer ID is required' });
      }
      
      // Get restaurant ID from slug if provided
      let restaurantId = null;
      if (restaurantSlug) {
        const restaurantsList = await db.select({ id: restaurants.id }).from(restaurants).where(eq(restaurants.slug, restaurantSlug as string)).limit(1);
        if (restaurantsList.length > 0) {
          restaurantId = restaurantsList[0].id;
        }
      }
      
      // Fetch orders for customer using Drizzle ORM
      let ordersList;
      
      if (restaurantId) {
        ordersList = await db.select()
          .from(orders)
          .where(and(
            eq(orders.customerId, customerId as string),
            eq(orders.restaurantId, restaurantId)
          ))
          .orderBy(desc(orders.createdAt))
          .limit(50);
      } else {
        ordersList = await db.select()
          .from(orders)
          .where(eq(orders.customerId, customerId as string))
          .orderBy(desc(orders.createdAt))
          .limit(50);
      }
      
      // Get restaurant details and order items for each order
      const ordersWithDetails = await Promise.all(ordersList.map(async (order: any) => {
        // Get restaurant details
        const restaurantDetails = await db.select({ name: restaurants.name, slug: restaurants.slug })
          .from(restaurants)
          .where(eq(restaurants.id, order.restaurantId))
          .limit(1);
        
        // Get order items with menu item details
        const items = await db.select({
          menuItemId: orderItems.menuItemId,
          name: menuItems.name,
          quantity: orderItems.quantity,
          price: orderItems.unitPrice,
          total: orderItems.totalPrice
        })
        .from(orderItems)
        .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
        .where(eq(orderItems.orderId, order.id));

        return {
          id: order.id,
          orderNumber: `ORD${order.orderNumber}`,
          status: order.status,
          total: parseFloat(order.totalAmount),
          estimatedTime: order.estimatedTime,
          tableNumber: order.tableNumber,
          restaurantName: restaurantDetails[0]?.name || 'Unknown Restaurant',
          restaurantSlug: restaurantDetails[0]?.slug || '',
          items: items,
          createdAt: order.createdAt
        };
      }));
      
      res.status(200).json({
        success: true,
        orders: ordersWithDetails
      });
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  } else if (req.method === 'POST') {
    try {
      // Validate request body
      const orderData = z.object({
        items: z.array(z.object({
          menuItemId: z.string(),
          name: z.string(),
          price: z.number(),
          quantity: z.number(),
          size: z.string(),
          customizations: z.any().optional()
        })),
        subtotal: z.number(),
        total: z.number(),
        tableNumber: z.string().nullable(),
        restaurantId: z.string().nullable(),
        customerId: z.string().optional(),
        estimatedTime: z.number(),
        orderNumber: z.string(),
        status: z.string().optional(),
        createdAt: z.string().optional()
      }).parse(req.body);
      
      // Get restaurant ID from URL slug or order data
      let restaurantId = orderData.restaurantId;
      
      // If restaurantId looks like a slug, convert it to actual ID
      if (restaurantId && !restaurantId.match(/^[0-9a-f-]{36}$/)) {
        const restaurantsList = await db.select({ id: restaurants.id }).from(restaurants).where(eq(restaurants.slug, restaurantId)).limit(1);
        if (restaurantsList.length > 0) {
          restaurantId = restaurantsList[0].id;
        } else {
          restaurantId = null;
        }
      }
      
      if (!restaurantId) {
        // If no restaurant ID provided, get from URL path
        const referer = (req.headers && req.headers.referer) || '';
        const slugMatch = referer.match(/\/([^\/\?]+)/);
        if (slugMatch) {
          const restaurantsList = await db.select({ id: restaurants.id }).from(restaurants).where(eq(restaurants.slug, slugMatch[1])).limit(1);
          if (restaurantsList.length > 0) {
            restaurantId = restaurantsList[0].id;
          }
        }
      }
      
      if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurant not found' });
      }
      
      // Get customer ID from request body or generate one
      const customerId = orderData.customerId || 
        req.headers['customer-id'] ||
        'customer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      // Create order record using Drizzle ORM
      const newOrder = await db.insert(orders).values({
        restaurantId: restaurantId,
        customerId: customerId,
        tableNumber: orderData.tableNumber || 'Online',
        orderNumber: parseInt(orderData.orderNumber.replace('ORD', '')),
        status: 'pending',
        totalAmount: orderData.total.toFixed(2),
        currency: 'PKR',
        deliveryType: orderData.tableNumber ? 'dine_in' : 'takeaway',
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        estimatedTime: orderData.estimatedTime,
      }).returning();
      
      if (newOrder.length === 0) {
        return res.status(500).json({ error: 'Failed to create order' });
      }
      
      const orderId = newOrder[0].id;
      
      // Create order items using Drizzle ORM
      for (const item of orderData.items) {
        await db.insert(orderItems).values({
          orderId: orderId,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: item.price.toFixed(2),
          totalPrice: (item.price * item.quantity).toFixed(2),
          specialRequests: item.customizations ? JSON.stringify(item.customizations) : null,
        });
      }
      
      res.status(201).json({
        success: true,
        order: newOrder[0],
        message: orderData.tableNumber ? 
          `Order placed for Table ${orderData.tableNumber}` : 
          'Order placed successfully'
      });
      
    } catch (error) {
      console.error('Error creating order:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid order data',
          details: error.errors 
        });
      }
      res.status(500).json({ error: 'Failed to place order' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}