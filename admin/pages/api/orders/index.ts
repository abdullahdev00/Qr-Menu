import { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Get restaurant ID from query parameters
      const { restaurantId } = req.query;
      
      let orders;
      if (restaurantId) {
        // Fetch orders filtered by restaurant ID
        orders = await sql`
          SELECT 
            o.*,
            r.name as restaurant_name,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', oi.id,
                  'quantity', oi.quantity,
                  'unitPrice', oi.unit_price,
                  'totalPrice', oi.total_price,
                  'specialRequests', oi.special_requests,
                  'menuItem', json_build_object(
                    'name', mi.name,
                    'price', mi.price
                  )
                )
              ) FILTER (WHERE oi.id IS NOT NULL),
              '[]'::json
            ) as items
          FROM orders o
          LEFT JOIN restaurants r ON o.restaurant_id = r.id
          LEFT JOIN order_items oi ON o.id = oi.order_id
          LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
          WHERE o.restaurant_id = ${restaurantId}
          GROUP BY o.id, r.name
          ORDER BY o.created_at DESC
        `;
      } else {
        // Fetch all orders (for admin panel)
        orders = await sql`
          SELECT 
            o.*,
            r.name as restaurant_name,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', oi.id,
                  'quantity', oi.quantity,
                  'unitPrice', oi.unit_price,
                  'totalPrice', oi.total_price,
                  'specialRequests', oi.special_requests,
                  'menuItem', json_build_object(
                    'name', mi.name,
                    'price', mi.price
                  )
                )
              ) FILTER (WHERE oi.id IS NOT NULL),
              '[]'::json
            ) as items
          FROM orders o
          LEFT JOIN restaurants r ON o.restaurant_id = r.id
          LEFT JOIN order_items oi ON o.id = oi.order_id
          LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
          GROUP BY o.id, r.name
          ORDER BY o.created_at DESC
        `;
      }

      // Transform the data to match our expected format
      const formattedOrders = orders.map(order => ({
        ...order,
        restaurant: order.restaurant_name ? { name: order.restaurant_name } : null,
        items: order.items || []
      }));

      res.status(200).json(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}