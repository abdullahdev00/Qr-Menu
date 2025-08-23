import type { NextApiRequest, NextApiResponse } from 'next'
import { storage } from '../../../lib/storage'
import { insertRestaurantSchema } from '../../../shared/schema'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const { search } = req.query
      let restaurants

      if (search) {
        restaurants = await storage.searchRestaurants(search as string)
      } else {
        restaurants = await storage.getRestaurants()
      }

      res.json(restaurants)
    } else if (req.method === 'POST') {
      const validatedData = insertRestaurantSchema.parse(req.body)
      const restaurant = await storage.createRestaurant(validatedData)
      res.status(201).json(restaurant)
    } else {
      res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    if (req.method === 'GET') {
      res.status(500).json({ message: 'Failed to fetch restaurants' })
    } else {
      res.status(500).json({ message: 'Failed to create restaurant' })
    }
  }
}