import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/storage';
import { orders } from '@shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { id } = req.query;

  if (method === 'PATCH') {
    try {
      const { status, updatedAt } = req.body;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Order ID is required' });
      }

      // Update order status
      const updateData: any = { updatedAt: new Date() };
      
      if (status) {
        updateData.status = status;
        
        // Set completion/cancellation timestamps
        if (status === 'completed') {
          updateData.completedAt = new Date();
        } else if (status === 'cancelled') {
          updateData.cancelledAt = new Date();
        }
      }

      const updatedOrder = await db
        .update(orders)
        .set(updateData)
        .where(eq(orders.id, id))
        .returning();

      if (updatedOrder.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.status(200).json(updatedOrder[0]);
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ error: 'Failed to update order' });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}