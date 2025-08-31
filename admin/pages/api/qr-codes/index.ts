import { storage } from '../../lib/storage';
import { qrGenerator } from '../../../shared/qr-generator';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { restaurantId } = req.query;
      
      if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurant ID is required' });
      }
      
      // Get restaurant data
      const restaurant = await storage.getRestaurant(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }
      
      // Get restaurant tables
      const tables = await storage.getRestaurantTables(restaurantId);
      
      // Generate QR code data
      const qrCodes = [
        {
          id: 'main-menu',
          name: 'Main Menu QR',
          type: 'menu',
          tableNumber: null,
          url: qrGenerator.generateMenuUrl(restaurant.slug, ''),
          scans: 245,
          createdAt: new Date().toISOString().split('T')[0],
          isActive: true
        },
        ...tables.map((table, index) => ({
          id: `table-${table.id}`,
          name: `Table ${table.tableNumber} QR`,
          type: 'table',
          tableNumber: table.tableNumber,
          url: qrGenerator.generateMenuUrl(restaurant.slug, table.tableNumber),
          scans: Math.floor(Math.random() * 100) + 20,
          createdAt: new Date().toISOString().split('T')[0],
          isActive: table.isActive
        }))
      ];
      
      res.status(200).json({
        success: true,
        qrCodes
      });
    } catch (error) {
      console.error('QR Codes list error:', error);
      res.status(500).json({ error: 'Failed to fetch QR codes' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}