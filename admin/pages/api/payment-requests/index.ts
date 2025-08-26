import type { NextApiRequest, NextApiResponse } from 'next'
import { storage } from '../../../lib/storage'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      // For now, return empty array until backend is fully implemented
      const paymentRequests = await storage.getPaymentRequests?.() || [];
      res.json(paymentRequests)
    } else {
      res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Payment requests API error:', error)
    res.status(500).json({ message: 'Failed to fetch payment requests', error: String(error) })
  }
}