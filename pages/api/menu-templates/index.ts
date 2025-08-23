import type { NextApiRequest, NextApiResponse } from 'next'
import { storage } from '../../../server/storage'
import { insertMenuTemplateSchema } from '../../../shared/schema'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const templates = await storage.getMenuTemplates()
      res.json(templates)
    } else if (req.method === 'POST') {
      const validatedData = insertMenuTemplateSchema.parse(req.body)
      const template = await storage.createMenuTemplate(validatedData)
      res.status(201).json(template)
    } else {
      res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    if (req.method === 'GET') {
      res.status(500).json({ message: 'Failed to fetch menu templates' })
    } else {
      res.status(500).json({ message: 'Failed to create menu template' })
    }
  }
}