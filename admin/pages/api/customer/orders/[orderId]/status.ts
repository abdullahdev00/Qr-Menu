import { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { orderId } = req.query;
      
      if (!orderId) {
        return res.status(400).json({ error: 'Order ID is required' });
      }
      
      // Fetch order status
      const orders = await sql`
        SELECT status, estimated_time
        FROM orders 
        WHERE id = ${orderId as string}
        LIMIT 1
      `;
      
      if (orders.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.status(200).json({
        success: true,
        status: orders[0].status,
        estimatedTime: orders[0].estimated_time
      });
      
    } catch (error) {
      console.error('Error fetching order status:', error);
      res.status(500).json({ error: 'Failed to fetch order status' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}