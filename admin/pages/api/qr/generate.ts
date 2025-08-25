// QR Code Generation API - Generate QR codes for restaurants
import type { NextApiRequest, NextApiResponse } from 'next'
import { storage } from '../../../lib/storage'
import { qrGenerator } from '../../../../shared/qr-generator'
import type { QRCustomization } from '../../../../shared/qr-generator'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      success: false, 
      message: `Method ${req.method} not allowed` 
    });
  }

  try {
    const { 
      restaurantId, 
      tableIds, 
      templateId, 
      customization,
      outputFormats = ['png', 'pdf'],
      generatedByType = 'restaurant'
    } = req.body;

    // Validation
    if (!restaurantId || !tableIds || !Array.isArray(tableIds) || !templateId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: restaurantId, tableIds (array), templateId'
      });
    }

    // Verify restaurant exists
    const restaurant = await storage.getRestaurant(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Verify template exists
    const template = await storage.getQrTemplate(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'QR template not found'
      });
    }

    // Get tables
    const tables = await Promise.all(
      tableIds.map((id: string) => storage.getRestaurantTable(id))
    );

    const validTables = tables.filter(Boolean);
    if (validTables.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid tables found'
      });
    }

    // Generate QR codes
    const generatedQRs = [];

    for (const table of validTables) {
      if (!table) continue;

      const qrUrl = qrGenerator.generateMenuUrl(restaurant.slug, table.tableNumber);
      
      // Create the QR customization object
      const qrCustomization: QRCustomization = {
        colors: customization?.colors || {
          primary: '#2563EB',
          secondary: '#EFF6FF',
          qrForeground: '#000000',
          qrBackground: '#FFFFFF',
        },
        text: {
          restaurantName: restaurant.name,
          tableNumber: table.tableNumber,
          instructions: customization?.text?.instructions || 'Scan this QR code to view our menu',
          language: customization?.text?.language || 'english',
        },
        template: {
          id: template.id,
          category: template.category,
          layout: template.designData,
        },
        logo: customization?.logo
      };

      // Generate QR code files
      const generationResult = await qrGenerator.generateQRCode({
        restaurantSlug: restaurant.slug,
        tableNumber: table.tableNumber,
        customization: qrCustomization,
        outputFormats,
        size: customization?.size || 'medium',
      });

      // Save to database
      const qrCodeData = {
        restaurantId,
        tableId: table.id,
        templateId,
        qrUrl: generationResult.qrUrl,
        customization: qrCustomization,
        files: generationResult.files,
        generatedByType,
        status: 'active' as const,
      };

      const savedQR = await storage.createQrCode(qrCodeData);
      generatedQRs.push({
        ...savedQR,
        metadata: generationResult.metadata,
        table: {
          id: table.id,
          tableNumber: table.tableNumber,
          location: table.location,
        }
      });
    }

    // Update template usage count
    await storage.updateQrTemplate(templateId, {
      usageCount: (template.usageCount || 0) + generatedQRs.length,
      updatedAt: new Date(),
    });

    return res.json({
      success: true,
      message: `Successfully generated ${generatedQRs.length} QR codes`,
      qrCodes: generatedQRs,
      summary: {
        totalGenerated: generatedQRs.length,
        restaurant: restaurant.name,
        template: template.name,
        outputFormats,
      }
    });

  } catch (error) {
    console.error('QR Generation API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate QR codes',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}