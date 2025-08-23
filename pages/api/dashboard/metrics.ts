import type { NextApiRequest, NextApiResponse } from 'next'
import { storage } from '../../../server/storage'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const metrics = await storage.getDashboardMetrics()
    res.json(metrics)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch metrics' })
  }
}