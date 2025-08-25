// Individual QR Template API - Get, Update, Delete specific template
import type { NextApiRequest, NextApiResponse } from 'next'
import { storage } from '../../../../lib/storage'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Template ID is required'
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get specific template
        const template = await storage.getQrTemplate(id);
        
        if (!template) {
          return res.status(404).json({
            success: false,
            message: 'Template not found'
          });
        }

        return res.json({
          success: true,
          template: {
            ...template,
            previewUrl: `/api/qr/templates/${template.id}/preview`
          }
        });

      case 'PUT':
        // Update template (Admin only)
        const { name, description, category, designData, planRestrictions, isActive } = req.body;
        
        const existingTemplate = await storage.getQrTemplate(id);
        if (!existingTemplate) {
          return res.status(404).json({
            success: false,
            message: 'Template not found'
          });
        }

        const updatedTemplate = await storage.updateQrTemplate(id, {
          name: name || existingTemplate.name,
          description: description || existingTemplate.description,
          category: category || existingTemplate.category,
          designData: designData || existingTemplate.designData,
          planRestrictions: planRestrictions !== undefined ? planRestrictions : existingTemplate.planRestrictions,
          isActive: isActive !== undefined ? isActive : existingTemplate.isActive,
          updatedAt: new Date(),
        });

        return res.json({
          success: true,
          message: 'Template updated successfully',
          template: updatedTemplate
        });

      case 'DELETE':
        // Delete template (Admin only)
        const templateExists = await storage.getQrTemplate(id);
        if (!templateExists) {
          return res.status(404).json({
            success: false,
            message: 'Template not found'
          });
        }

        await storage.deleteQrTemplate(id);
        
        return res.json({
          success: true,
          message: 'Template deleted successfully'
        });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ 
          success: false, 
          message: `Method ${req.method} not allowed` 
        });
    }
  } catch (error) {
    console.error('QR Template API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}