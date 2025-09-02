import { db } from '../../../../server/db';
import { restaurants, restaurantTables, qrCodes, insertQrCodeSchema } from '../../../../shared/schema';
import { eq, desc, and } from 'drizzle-orm';

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
      
      // Return only actual QR codes from database
      const qrCodesList = existingQrCodes.map((qr: any) => {
        const table = tables.find(t => t.id === qr.tableId);
        return {
          id: qr.id,
          name: qr.tableId ? `Table ${table?.tableNumber} QR` : 'Main Menu QR',
          type: qr.tableId ? 'table' : 'menu',
          tableNumber: table?.tableNumber || null,
          url: qr.menuUrl,
          scans: qr.scansCount,
          createdAt: qr.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          isActive: qr.isActive
        };
      });
      
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
      const { restaurantId, tableNumber, customization, name } = req.body;
      
      if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurant ID is required' });
      }
      
      // Get restaurant to generate URL
      const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, restaurantId));
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }
      
      let tableId = null;
      
      // If table number is provided, find or create the table
      if (tableNumber) {
        const [existingTable] = await db.select().from(restaurantTables)
          .where(and(
            eq(restaurantTables.restaurantId, restaurantId),
            eq(restaurantTables.tableNumber, tableNumber.toString())
          ));
        
        if (existingTable) {
          tableId = existingTable.id;
        } else {
          // Create new table if it doesn't exist
          const [newTable] = await db.insert(restaurantTables).values({
            restaurantId: restaurantId,
            tableNumber: tableNumber.toString(),
            capacity: 4, // Default capacity
            isActive: true
          }).returning();
          tableId = newTable.id;
        }
      }
      
      // Generate menu URL
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
        : 'https://menuqr.pk';
      const menuUrl = `${baseUrl}/${restaurant.slug}${tableNumber ? `?table=${tableNumber}` : ''}`;
      
      // Create QR code record
      const [newQrCode] = await db.insert(qrCodes).values({
        restaurantId,
        tableId: tableId,
        qrCodeUrl: '', // Will be updated after generation
        menuUrl,
        customDesign: customization || null,
        isActive: true,
        scansCount: 0
      }).returning();
      
      res.status(201).json({
        success: true,
        qrCode: newQrCode,
        message: 'QR code created successfully'
      });
    } catch (error) {
      console.error('QR Code creation error:', error);
      res.status(500).json({ error: 'Failed to create QR code' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}