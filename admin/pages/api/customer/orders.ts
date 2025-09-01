import { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';
import { z } from 'zod';

const sql = neon(process.env.DATABASE_URL!);

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
        const restaurants = await sql`SELECT id FROM restaurants WHERE slug = ${restaurantSlug} LIMIT 1`;
        if (restaurants.length > 0) {
          restaurantId = restaurants[0].id;
        }
      }
      
      // Fetch orders for customer
      let orders;
      
      if (restaurantId) {
        orders = await sql`
          SELECT 
            o.*, 
            r.name as restaurant_name,
            r.slug as restaurant_slug,
            COALESCE(
              json_agg(
                json_build_object(
                  'menuItemId', oi.menu_item_id,
                  'name', mi.name,
                  'quantity', oi.quantity,
                  'price', oi.unit_price,
                  'total', oi.total_price
                )
              ) FILTER (WHERE oi.id IS NOT NULL), 
              '[]'::json
            ) as items
          FROM orders o
          LEFT JOIN restaurants r ON o.restaurant_id = r.id
          LEFT JOIN order_items oi ON o.id = oi.order_id
          LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
          WHERE o.customer_id = ${customerId as string} AND o.restaurant_id = ${restaurantId}
          GROUP BY o.id, r.name, r.slug
          ORDER BY o.created_at DESC
          LIMIT 50
        `;
      } else {
        orders = await sql`
          SELECT 
            o.*, 
            r.name as restaurant_name,
            r.slug as restaurant_slug,
            COALESCE(
              json_agg(
                json_build_object(
                  'menuItemId', oi.menu_item_id,
                  'name', mi.name,
                  'quantity', oi.quantity,
                  'price', oi.unit_price,
                  'total', oi.total_price
                )
              ) FILTER (WHERE oi.id IS NOT NULL), 
              '[]'::json
            ) as items
          FROM orders o
          LEFT JOIN restaurants r ON o.restaurant_id = r.id
          LEFT JOIN order_items oi ON o.id = oi.order_id
          LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
          WHERE o.customer_id = ${customerId as string}
          GROUP BY o.id, r.name, r.slug
          ORDER BY o.created_at DESC
          LIMIT 50
        `;
      }
      
      // Format orders for frontend
      const formattedOrders = orders.map(order => ({
        id: order.id,
        orderNumber: `ORD${order.order_number}`,
        status: order.status,
        total: parseFloat(order.total_amount),
        estimatedTime: order.estimated_time,
        tableNumber: order.table_number,
        restaurantName: order.restaurant_name,
        restaurantSlug: order.restaurant_slug,
        items: order.items || [],
        createdAt: order.created_at
      }));
      
      res.status(200).json({
        success: true,
        orders: formattedOrders
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
        const restaurants = await sql`SELECT id FROM restaurants WHERE slug = ${restaurantId} LIMIT 1`;
        if (restaurants.length > 0) {
          restaurantId = restaurants[0].id;
        } else {
          restaurantId = null;
        }
      }
      
      if (!restaurantId) {
        // If no restaurant ID provided, get from URL path
        const referer = (req.headers && req.headers.referer) || '';
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
      
      // Get customer ID from request body or generate one
      const customerId = orderData.customerId || 
        req.headers['customer-id'] ||
        'customer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      // Create order record
      const newOrder = await sql`
        INSERT INTO orders (
          restaurant_id, customer_id, table_number, order_number, status, total_amount,
          currency, delivery_type, payment_method, payment_status, estimated_time
        ) VALUES (
          ${restaurantId}, ${customerId}, ${orderData.tableNumber || 'Online'}, 
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