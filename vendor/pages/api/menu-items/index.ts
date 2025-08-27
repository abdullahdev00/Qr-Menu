import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../../admin/lib/storage';
import { insertMenuItemSchema } from '../../../../shared/schema';
import { z } from 'zod';

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      // Get all menu items (you may want to filter by restaurant)
      const menuItems = await storage.getMenuItems();
      return res.status(200).json(menuItems);
    }

    if (req.method === 'POST') {
      // Validate request body
      const validatedData = insertMenuItemSchema.parse(req.body);
      
      // Create menu item
      const menuItem = await storage.createMenuItem(validatedData);
      return res.status(201).json(menuItem);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Menu items API error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}