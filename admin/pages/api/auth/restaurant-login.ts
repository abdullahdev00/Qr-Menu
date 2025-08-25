import type { NextApiRequest, NextApiResponse } from 'next'
import { storage } from '../../../lib/storage'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    // Find restaurant by owner email
    const restaurants = await storage.getRestaurants()
    const restaurant = restaurants.find(r => r.ownerEmail === email)
    
    if (!restaurant || restaurant.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Return restaurant data for authentication
    res.json({ 
      user: { 
        id: restaurant.id, 
        name: restaurant.ownerName, 
        email: restaurant.ownerEmail, 
        role: 'restaurant',
        restaurantId: restaurant.id,
        restaurantName: restaurant.name
      } 
    })
  } catch (error) {
    res.status(500).json({ message: 'Login failed' })
  }
}