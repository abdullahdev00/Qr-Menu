import { eq } from 'drizzle-orm';
import { db } from '../../../../lib/storage';
import { restaurants } from '../../../../../shared/schema';

export default async function handler(req: any, res: any) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Restaurant ID is required' });
  }

  try {
    if (req.method === 'GET') {
      // Get restaurant branding settings
      const [restaurant] = await db.select({
        id: restaurants.id,
        name: restaurants.name,
        brandColors: restaurants.brandColors
      }).from(restaurants).where(eq(restaurants.id, id));
      
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }
      
      return res.status(200).json({
        success: true,
        branding: restaurant.brandColors || {
          // Default branding colors
          primaryBg: '#ffffff',
          secondaryBg: '#f8fafc',
          cardBg: '#ffffff',
          primaryAccent: '#3b82f6',
          secondaryAccent: '#10b981',
          primaryText: '#1f2937',
          secondaryText: '#6b7280',
          linkText: '#3b82f6',
          buttonText: '#ffffff',
          successGreen: '#10b981',
          warningRed: '#ef4444',
          infoBlue: '#3b82f6',
          borderGray: '#e5e7eb',
          primaryFont: 'Inter, sans-serif',
          secondaryFont: 'Inter, sans-serif',
          headingScale: 1.25,
          bodySize: 16,
          lineHeight: 1.6,
          letterSpacing: 0
        }
      });
    } 
    else if (req.method === 'PUT' || req.method === 'PATCH') {
      // Update restaurant branding settings
      const brandColors = req.body;
      
      const [updatedRestaurant] = await db.update(restaurants)
        .set({ brandColors })
        .where(eq(restaurants.id, id))
        .returning({
          id: restaurants.id,
          name: restaurants.name,
          brandColors: restaurants.brandColors
        });
      
      if (!updatedRestaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Restaurant branding updated successfully',
        branding: updatedRestaurant.brandColors
      });
    } 
    else {
      res.setHeader('Allow', ['GET', 'PUT', 'PATCH']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Restaurant branding API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process restaurant branding request'
    });
  }
}