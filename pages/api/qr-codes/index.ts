import type { NextApiRequest, NextApiResponse } from 'next'
import { storage } from '../../../server/storage'
import { insertQrCodeSchema } from '../../../shared/schema'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const qrCodes = await storage.getQrCodes()
      res.json(qrCodes)
    } else if (req.method === 'POST') {
      const validatedData = insertQrCodeSchema.parse(req.body)
      const qrCode = await storage.createQrCode(validatedData)
      res.status(201).json(qrCode)
    } else {
      res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    if (req.method === 'GET') {
      res.status(500).json({ message: 'Failed to fetch QR codes' })
    } else {
      res.status(500).json({ message: 'Failed to create QR code' })
    }
  }
}