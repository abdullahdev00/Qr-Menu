import { db } from '../../../admin/lib/storage';
import { restaurants, restaurantTables, qrCodes, insertQrCodeSchema } from '../../../shared/schema';
import { eq, desc } from 'drizzle-orm';

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
          url: `${process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://menuqr.pk'}/${restaurant.slug}`,
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
            url: `${process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://menuqr.pk'}/${restaurant.slug}?table=${table.tableNumber}`,
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
          .where(eq(restaurantTables.restaurantId, restaurantId))
          .where(eq(restaurantTables.tableNumber, tableNumber.toString()));
        
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
      const menuUrl = `${process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://menuqr.pk'}/${restaurant.slug}${tableNumber ? `?table=${tableNumber}` : ''}`;
      
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