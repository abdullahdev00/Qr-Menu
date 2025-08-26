import type { NextApiRequest, NextApiResponse } from 'next'
import { storage } from '../../../lib/storage'
import { insertSubscriptionPlanSchema } from '../../../../shared/schema'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid plan ID' })
  }

  try {
    if (req.method === 'GET') {
      const plan = await storage.getSubscriptionPlan(id)
      if (!plan) {
        return res.status(404).json({ message: 'Subscription plan not found' })
      }
      res.json(plan)
    } else if (req.method === 'PUT') {
      const validatedData = insertSubscriptionPlanSchema.partial().parse(req.body)
      const plan = await storage.updateSubscriptionPlan(id, validatedData)
      if (!plan) {
        return res.status(404).json({ message: 'Subscription plan not found' })
      }
      res.json(plan)
    } else if (req.method === 'DELETE') {
      const success = await storage.deleteSubscriptionPlan(id)
      if (!success) {
        return res.status(404).json({ message: 'Subscription plan not found' })
      }
      res.status(204).end()
    } else {
      res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Subscription plan API error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}