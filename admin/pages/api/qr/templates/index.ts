// QR Templates API - Admin aur Restaurant dono use kar sakte hain
import type { NextApiRequest, NextApiResponse } from 'next'
import { storage } from '../../../../lib/storage'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        // Get all QR templates with optional filtering
        const { category, planRestriction } = req.query;
        
        let templates = await storage.getQrTemplates();
        
        // Filter by category if provided
        if (category && typeof category === 'string') {
          templates = templates.filter(t => t.category === category);
        }
        
        // Filter by plan restriction if provided
        if (planRestriction && typeof planRestriction === 'string') {
          templates = templates.filter(t => 
            !t.planRestrictions || 
            (Array.isArray(t.planRestrictions) && t.planRestrictions.includes(planRestriction))
          );
        }
        
        return res.json({
          success: true,
          templates: templates.map(template => ({
            ...template,
            previewUrl: `/api/qr/templates/${template.id}/preview`
          }))
        });

      case 'POST':
        // Create new template (Admin only)
        const { name, description, category: newCategory, designData, planRestrictions } = req.body;
        
        if (!name || !description || !newCategory || !designData) {
          return res.status(400).json({
            success: false,
            message: 'Missing required fields: name, description, category, designData'
          });
        }

        const newTemplate = await storage.createQrTemplate({
          name,
          description,
          category: newCategory,
          designData,
          planRestrictions,
        });

        return res.json({
          success: true,
          message: 'Template created successfully',
          template: newTemplate
        });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ 
          success: false, 
          message: `Method ${req.method} not allowed` 
        });
    }
  } catch (error) {
    console.error('QR Templates API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}