import { db } from '../../lib/storage';
import { qrCodes } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: any, res: any) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'QR Code ID is required' });
  }
  
  if (req.method === 'GET') {
    try {
      const [qrCode] = await db.select().from(qrCodes).where(eq(qrCodes.id, id));
      
      if (!qrCode) {
        return res.status(404).json({ error: 'QR Code not found' });
      }
      
      res.status(200).json({
        success: true,
        qrCode
      });
    } catch (error) {
      console.error('QR Code fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch QR code' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { isActive, customDesign } = req.body;
      
      const updateData: any = {};
      if (isActive !== undefined) updateData.isActive = isActive;
      if (customDesign !== undefined) updateData.customDesign = customDesign;
      
      const [updatedQrCode] = await db.update(qrCodes)
        .set(updateData)
        .where(eq(qrCodes.id, id))
        .returning();
      
      if (!updatedQrCode) {
        return res.status(404).json({ error: 'QR Code not found' });
      }
      
      res.status(200).json({
        success: true,
        qrCode: updatedQrCode
      });
    } catch (error) {
      console.error('QR Code update error:', error);
      res.status(500).json({ error: 'Failed to update QR code' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const [deletedQrCode] = await db.delete(qrCodes)
        .where(eq(qrCodes.id, id))
        .returning();
      
      if (!deletedQrCode) {
        return res.status(404).json({ error: 'QR Code not found' });
      }
      
      res.status(200).json({
        success: true,
        message: 'QR Code deleted successfully'
      });
    } catch (error) {
      console.error('QR Code deletion error:', error);
      res.status(500).json({ error: 'Failed to delete QR code' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}