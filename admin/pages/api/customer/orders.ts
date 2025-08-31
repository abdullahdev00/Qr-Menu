import { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';
import { z } from 'zod';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
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
        estimatedTime: z.number(),
        orderNumber: z.string(),
        status: z.string().optional(),
        createdAt: z.string().optional()
      }).parse(req.body);
      
      // Get restaurant ID from URL slug or order data
      let restaurantId = orderData.restaurantId;
      
      // If restaurantId looks like a slug, convert it to actual ID
      if (restaurantId && !restaurantId.match(/^[0-9a-f-]{36}$/)) {
        const restaurants = await sql`SELECT id FROM restaurants WHERE slug = ${restaurantId} LIMIT 1`;
        if (restaurants.length > 0) {
          restaurantId = restaurants[0].id;
        } else {
          restaurantId = null;
        }
      }
      
      if (!restaurantId) {
        // If no restaurant ID provided, get from URL path
        const referer = req.headers.referer || '';
        const slugMatch = referer.match(/\/([^\/\?]+)/);
        if (slugMatch) {
          const restaurants = await sql`SELECT id FROM restaurants WHERE slug = ${slugMatch[1]} LIMIT 1`;
          if (restaurants.length > 0) {
            restaurantId = restaurants[0].id;
          }
        }
      }
      
      if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurant not found' });
      }
      
      // Create order record
      const newOrder = await sql`
        INSERT INTO orders (
          restaurant_id, table_number, order_number, status, total_amount,
          currency, delivery_type, payment_method, payment_status, estimated_time
        ) VALUES (
          ${restaurantId}, ${orderData.tableNumber || 'Online'}, 
          ${parseInt(orderData.orderNumber.replace('ORD', ''))},
          'pending', ${orderData.total}, 'PKR', 
          ${orderData.tableNumber ? 'dine_in' : 'takeaway'},
          'cash', 'pending', ${orderData.estimatedTime}
        ) RETURNING *
      `;
      
      if (newOrder.length === 0) {
        return res.status(500).json({ error: 'Failed to create order' });
      }
      
      const orderId = newOrder[0].id;
      
      // Create order items
      for (const item of orderData.items) {
        await sql`
          INSERT INTO order_items (
            order_id, menu_item_id, quantity, unit_price, total_price, special_requests
          ) VALUES (
            ${orderId}, ${item.menuItemId}, ${item.quantity},
            ${item.price}, ${item.price * item.quantity},
            ${item.customizations ? JSON.stringify(item.customizations) : null}
          )
        `;
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
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}