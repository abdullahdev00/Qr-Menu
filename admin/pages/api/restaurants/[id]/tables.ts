// Restaurant Tables API - Manage tables for a specific restaurant
import type { NextApiRequest, NextApiResponse } from 'next'
import { storage } from '../../../../lib/storage'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id: restaurantId } = req.query;

  if (!restaurantId || typeof restaurantId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Restaurant ID is required'
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

    switch (req.method) {
      case 'GET':
        // Get all tables for restaurant
        const tables = await storage.getRestaurantTables(restaurantId);
        
        return res.json({
          success: true,
          restaurant: {
            id: restaurant.id,
            name: restaurant.name,
            slug: restaurant.slug,
          },
          tables: tables.map(table => ({
            ...table,
            hasQrCode: !!table.qrCodeId,
          }))
        });

      case 'POST':
        // Create new table
        const { tableNumber, capacity, location, specialNotes } = req.body;
        
        if (!tableNumber) {
          return res.status(400).json({
            success: false,
            message: 'Table number is required'
          });
        }

        // Check if table number already exists for this restaurant
        const existingTables = await storage.getRestaurantTables(restaurantId);
        const duplicateTable = existingTables.find(t => 
          t.tableNumber === tableNumber && t.isActive
        );

        if (duplicateTable) {
          return res.status(400).json({
            success: false,
            message: `Table number ${tableNumber} already exists`
          });
        }

        const newTable = await storage.createRestaurantTable({
          restaurantId,
          tableNumber,
          capacity: capacity || null,
          location: location || null,
          specialNotes: specialNotes || null,
        });

        return res.json({
          success: true,
          message: 'Table created successfully',
          table: newTable
        });

      case 'PUT':
        // Bulk update tables (for bulk operations)
        const { updates } = req.body;
        
        if (!Array.isArray(updates)) {
          return res.status(400).json({
            success: false,
            message: 'Updates array is required'
          });
        }

        const updatedTables = [];
        for (const update of updates) {
          if (update.id) {
            const updated = await storage.updateRestaurantTable(update.id, {
              tableNumber: update.tableNumber,
              capacity: update.capacity,
              location: update.location,
              specialNotes: update.specialNotes,
              isActive: update.isActive,
            });
            if (updated) updatedTables.push(updated);
          }
        }

        return res.json({
          success: true,
          message: `Updated ${updatedTables.length} tables`,
          tables: updatedTables
        });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ 
          success: false, 
          message: `Method ${req.method} not allowed` 
        });
    }
  } catch (error) {
    console.error('Restaurant Tables API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}