import type { NextApiRequest, NextApiResponse } from 'next'
import { storage } from '../../../lib/storage'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query
  
  try {
    if (req.method === 'PATCH') {
      const { status, adminNotes, rejectionReason, processedBy } = req.body
      
      // For now, return a mock updated response until backend is fully implemented
      const updatedPaymentRequest = await storage.updatePaymentRequest?.(
        id as string, 
        { status, adminNotes, rejectionReason, processedBy }
      ) || { id, status, adminNotes, rejectionReason, processedBy };
      
      res.json(updatedPaymentRequest)
    } else {
      res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Payment request update API error:', error)
    res.status(500).json({ message: 'Failed to update payment request', error: String(error) })
  }
}