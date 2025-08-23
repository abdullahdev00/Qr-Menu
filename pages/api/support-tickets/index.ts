import type { NextApiRequest, NextApiResponse } from 'next'
import { storage } from '../../../server/storage'
import { insertSupportTicketSchema } from '../../../shared/schema'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const tickets = await storage.getSupportTickets()
      res.json(tickets)
    } else if (req.method === 'POST') {
      const validatedData = insertSupportTicketSchema.parse(req.body)
      const ticket = await storage.createSupportTicket(validatedData)
      res.status(201).json(ticket)
    } else {
      res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    if (req.method === 'GET') {
      res.status(500).json({ message: 'Failed to fetch support tickets' })
    } else {
      res.status(500).json({ message: 'Failed to create support ticket' })
    }
  }
}