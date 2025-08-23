import type { NextApiRequest, NextApiResponse } from 'next'
import { storage } from '../../../server/storage'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    const user = await storage.getAdminUserByEmail(email)
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // In a real app, you'd use proper session management
    res.json({ 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    })
  } catch (error) {
    res.status(500).json({ message: 'Login failed' })
  }
}