import { db } from '../../lib/storage';
import { restaurants, restaurantTables, qrCodes } from '../../../shared/schema';
import { eq, desc } from 'drizzle-orm';
import { qrGenerator } from '../../shared/qr-generator';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { restaurantId } = req.query;
      
      if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurant ID is required' });
      }
      
      // Get restaurant data
      const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, restaurantId));
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }
      
      // Get existing QR codes from database
      const existingQrCodes = await db.select().from(qrCodes)
        .where(eq(qrCodes.restaurantId, restaurantId))
        .orderBy(desc(qrCodes.createdAt));
      
      // Get restaurant tables
      const tables = await db.select().from(restaurantTables)
        .where(eq(restaurantTables.restaurantId, restaurantId));
      
      // Generate QR code data
      const qrCodesList = [
        // Main menu QR
        {
          id: existingQrCodes.find((qr: any) => !qr.tableId)?.id || 'main-menu',
          name: 'Main Menu QR',
          type: 'menu',
          tableNumber: null,
          url: qrGenerator.generateMenuUrl(restaurant.slug, ''),
          scans: existingQrCodes.find((qr: any) => !qr.tableId)?.scansCount || 0,
          createdAt: existingQrCodes.find((qr: any) => !qr.tableId)?.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          isActive: existingQrCodes.find((qr: any) => !qr.tableId)?.isActive || true
        },
        // Table QR codes
        ...tables.map((table: any) => {
          const existingQr = existingQrCodes.find((qr: any) => qr.tableId === table.id);
          return {
            id: existingQr?.id || `table-${table.id}`,
            name: `Table ${table.tableNumber} QR`,
            type: 'table',
            tableNumber: table.tableNumber,
            url: qrGenerator.generateMenuUrl(restaurant.slug, table.tableNumber),
            scans: existingQr?.scansCount || 0,
            createdAt: existingQr?.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
            isActive: existingQr?.isActive !== undefined ? existingQr.isActive : table.isActive
          };
        })
      ];
      
      res.status(200).json({
        success: true,
        qrCodes: qrCodesList
      });
    } catch (error) {
      console.error('QR Codes list error:', error);
      res.status(500).json({ error: 'Failed to fetch QR codes' });
    }
  } else if (req.method === 'POST') {
    // Create new QR code
    try {
      const { restaurantId, tableId, customDesign } = req.body;
      
      if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurant ID is required' });
      }
      
      // Get restaurant to generate URL
      const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, restaurantId));
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }
      
      // Get table data if tableId provided
      let tableNumber = '';
      if (tableId) {
        const [table] = await db.select().from(restaurantTables).where(eq(restaurantTables.id, tableId));
        if (table) {
          tableNumber = table.tableNumber;
        }
      }
      
      // Generate menu URL
      const menuUrl = qrGenerator.generateMenuUrl(restaurant.slug, tableNumber);
      
      // Create QR code record
      const [newQrCode] = await db.insert(qrCodes).values({
        restaurantId,
        tableId: tableId || null,
        qrCodeUrl: '', // Will be updated after generation
        menuUrl,
        customDesign: customDesign || null,
        isActive: true
      }).returning();
      
      res.status(201).json({
        success: true,
        qrCode: newQrCode
      });
    } catch (error) {
      console.error('QR Code creation error:', error);
      res.status(500).json({ error: 'Failed to create QR code' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}