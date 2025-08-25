// Individual Restaurant Table API - Get, Update, Delete specific table
import type { NextApiRequest, NextApiResponse } from 'next'
import { storage } from '../../../../../lib/storage'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id: restaurantId, tableId } = req.query;

  if (!restaurantId || typeof restaurantId !== 'string' || !tableId || typeof tableId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Restaurant ID and Table ID are required'
    });
  }

  try {
    // Verify restaurant exists
    const restaurant = await storage.getRestaurant(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Verify table exists and belongs to restaurant
    const table = await storage.getRestaurantTable(tableId);
    if (!table || table.restaurantId !== restaurantId) {
      return res.status(404).json({
        success: false,
        message: 'Table not found or does not belong to this restaurant'
      });
    }

    switch (req.method) {
      case 'GET':
        // Get specific table with QR code info
        const qrCodes = await storage.getQrCodesByRestaurant(restaurantId);
        const tableQR = qrCodes.find(qr => qr.tableId === tableId);
        
        return res.json({
          success: true,
          table: {
            ...table,
            qrCode: tableQR ? {
              id: tableQR.id,
              qrUrl: tableQR.qrUrl,
              scanCount: tableQR.scanCount,
              status: tableQR.status,
              createdAt: tableQR.createdAt,
              lastScannedAt: tableQR.lastScannedAt,
              files: tableQR.files,
            } : null,
          },
          restaurant: {
            id: restaurant.id,
            name: restaurant.name,
            slug: restaurant.slug,
          }
        });

      case 'PUT':
        // Update table
        const { tableNumber, capacity, location, specialNotes, isActive } = req.body;
        
        // Check for duplicate table number if changing
        if (tableNumber && tableNumber !== table.tableNumber) {
          const existingTables = await storage.getRestaurantTables(restaurantId);
          const duplicateTable = existingTables.find(t => 
            t.tableNumber === tableNumber && t.isActive && t.id !== tableId
          );

          if (duplicateTable) {
            return res.status(400).json({
              success: false,
              message: `Table number ${tableNumber} already exists`
            });
          }
        }

        const updatedTable = await storage.updateRestaurantTable(tableId, {
          tableNumber: tableNumber || table.tableNumber,
          capacity: capacity !== undefined ? capacity : table.capacity,
          location: location !== undefined ? location : table.location,
          specialNotes: specialNotes !== undefined ? specialNotes : table.specialNotes,
          isActive: isActive !== undefined ? isActive : table.isActive,
        });

        return res.json({
          success: true,
          message: 'Table updated successfully',
          table: updatedTable
        });

      case 'DELETE':
        // Delete table (also deletes associated QR codes)
        const tableQRs = await storage.getQrCodesByRestaurant(restaurantId);
        const associatedQRs = tableQRs.filter(qr => qr.tableId === tableId);
        
        // Delete associated QR codes first
        for (const qr of associatedQRs) {
          await storage.deleteQrCode(qr.id);
        }
        
        // Delete the table
        await storage.deleteRestaurantTable(tableId);
        
        return res.json({
          success: true,
          message: 'Table and associated QR codes deleted successfully',
          deletedQRCodes: associatedQRs.length
        });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ 
          success: false, 
          message: `Method ${req.method} not allowed` 
        });
    }
  } catch (error) {
    console.error('Restaurant Table API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}