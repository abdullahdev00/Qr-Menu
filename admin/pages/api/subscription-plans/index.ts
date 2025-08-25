import type { NextApiRequest, NextApiResponse } from 'next'
import { storage } from '../../../lib/storage'
import { insertSubscriptionPlanSchema } from '../../../shared/schema'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const plans = await storage.getSubscriptionPlans()
      res.json(plans)
    } else if (req.method === 'POST') {
      const validatedData = insertSubscriptionPlanSchema.parse(req.body)
      const plan = await storage.createSubscriptionPlan(validatedData)
      res.status(201).json(plan)
    } else {
      res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    if (req.method === 'GET') {
      res.status(500).json({ message: 'Failed to fetch subscription plans' })
    } else {
      res.status(500).json({ message: 'Failed to create subscription plan' })
    }
  }
}