// QR Analytics API - Get QR code usage and performance data
import type { NextApiRequest, NextApiResponse } from 'next'
import { storage } from '../../../lib/storage'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ 
      success: false, 
      message: `Method ${req.method} not allowed` 
    });
  }

  try {
    const { restaurantId, templateId, period = '30d' } = req.query;

    // Get base analytics
    const analytics = await storage.getQrAnalytics(
      typeof restaurantId === 'string' ? restaurantId : undefined
    );

    // Get template details for popular templates
    const templateDetails = await Promise.all(
      analytics.popularTemplates.map(async (pt) => {
        const template = await storage.getQrTemplate(pt.templateId);
        return {
          ...pt,
          templateName: template?.name || 'Unknown Template',
          templateCategory: template?.category || 'unknown',
        };
      })
    );

    // Calculate additional metrics
    const averageScansPerQR = analytics.totalQrCodes > 0 
      ? Math.round(analytics.totalScans / analytics.totalQrCodes) 
      : 0;

    // Get restaurant-specific data if requested
    let restaurantData = null;
    if (restaurantId && typeof restaurantId === 'string') {
      const restaurant = await storage.getRestaurant(restaurantId);
      const restaurantTables = await storage.getRestaurantTables(restaurantId);
      const restaurantQRs = await storage.getQrCodesByRestaurant(restaurantId);

      restaurantData = {
        restaurant: restaurant ? {
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
        } : null,
        tables: {
          total: restaurantTables.length,
          withQR: restaurantQRs.length,
          withoutQR: restaurantTables.length - restaurantQRs.length,
        },
        performance: {
          totalScans: restaurantQRs.reduce((sum, qr) => sum + qr.scanCount, 0),
          averageScansPerTable: restaurantQRs.length > 0 
            ? Math.round(restaurantQRs.reduce((sum, qr) => sum + qr.scanCount, 0) / restaurantQRs.length)
            : 0,
          mostScannedTable: restaurantQRs.reduce((max, qr) => 
            qr.scanCount > (max?.scanCount || 0) ? qr : max, restaurantQRs[0]
          ),
        }
      };
    }

    // Get template-specific analytics if requested
    let templateData = null;
    if (templateId && typeof templateId === 'string') {
      const template = await storage.getQrTemplate(templateId);
      const allQRs = await storage.getQrCodes();
      const templateQRs = allQRs.filter(qr => qr.templateId === templateId);

      templateData = {
        template: template ? {
          id: template.id,
          name: template.name,
          category: template.category,
          usageCount: template.usageCount || 0,
        } : null,
        performance: {
          totalUsage: templateQRs.length,
          totalScans: templateQRs.reduce((sum, qr) => sum + qr.scanCount, 0),
          averageScansPerQR: templateQRs.length > 0 
            ? Math.round(templateQRs.reduce((sum, qr) => sum + qr.scanCount, 0) / templateQRs.length)
            : 0,
          restaurants: [...new Set(templateQRs.map(qr => qr.restaurantId))].length,
        }
      };
    }

    // Activity timeline (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentQRs = analytics.recentActivity.filter(qr => 
      new Date(qr.createdAt!) >= thirtyDaysAgo
    );

    const activityTimeline = recentQRs.reduce((timeline, qr) => {
      const date = new Date(qr.createdAt!).toISOString().split('T')[0];
      timeline[date] = (timeline[date] || 0) + 1;
      return timeline;
    }, {} as Record<string, number>);

    return res.json({
      success: true,
      analytics: {
        overview: {
          totalQrCodes: analytics.totalQrCodes,
          totalScans: analytics.totalScans,
          averageScansPerQR,
          period: period,
        },
        templates: {
          popular: templateDetails,
          totalActive: templateDetails.length,
        },
        activity: {
          recentQRs: analytics.recentActivity.slice(0, 10).map(qr => ({
            id: qr.id,
            restaurantId: qr.restaurantId,
            tableId: qr.tableId,
            scanCount: qr.scanCount,
            createdAt: qr.createdAt,
            lastScannedAt: qr.lastScannedAt,
          })),
          timeline: activityTimeline,
        },
        restaurant: restaurantData,
        template: templateData,
      },
      generated_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('QR Analytics API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch QR analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}