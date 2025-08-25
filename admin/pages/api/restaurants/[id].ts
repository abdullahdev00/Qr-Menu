import type { NextApiRequest, NextApiResponse } from 'next'
import { storage } from '../../../lib/storage'
import { insertRestaurantSchema } from '../../../shared/schema'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid restaurant ID' })
  }

  try {
    if (req.method === 'GET') {
      const restaurant = await storage.getRestaurant(id)
      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' })
      }
      res.json(restaurant)
    } else if (req.method === 'PUT') {
      const validatedData = insertRestaurantSchema.partial().parse(req.body)
      const restaurant = await storage.updateRestaurant(id, validatedData)
      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' })
      }
      res.json(restaurant)
    } else if (req.method === 'DELETE') {
      const success = await storage.deleteRestaurant(id)
      if (!success) {
        return res.status(404).json({ message: 'Restaurant not found' })
      }
      res.status(204).end()
    } else {
      res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Restaurant API error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}