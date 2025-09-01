import QRCode from 'qrcode';

export default async function handler(req: any, res: any) {
  if (req.method === 'POST' || req.method === 'GET') {
    try {
      // Get data from body (POST) or query (GET)
      const data = req.method === 'POST' ? req.body : req.query;
      const { restaurantSlug, tableNumber, customization, size = 'medium', format = 'png', preview } = data;
      
      if (!restaurantSlug) {
        return res.status(400).json({ error: 'Restaurant slug is required' });
      }
      
      // Generate the menu URL
      const menuUrl = `${process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://menuqr.pk'}/${restaurantSlug}${tableNumber ? `?table=${tableNumber}` : ''}`;
      
      // Set QR code size based on parameter
      const sizeMap = {
        small: preview ? 150 : 300,
        medium: preview ? 200 : 500,
        large: preview ? 250 : 700
      };
      const qrSize = sizeMap[size as keyof typeof sizeMap] || 500;
      
      // Generate QR code options
      const qrOptions = {
        width: qrSize,
        margin: 2,
        color: {
          dark: customization?.colors?.qrForeground || '#000000',
          light: customization?.colors?.qrBackground || '#ffffff'
        }
      };
      
      // Generate QR code as data URL or buffer
      if (preview) {
        // For preview, return as data URL (base64)
        const dataUrl = await QRCode.toDataURL(menuUrl, qrOptions);
        res.setHeader('Content-Type', 'application/json');
        res.json({
          success: true,
          dataUrl,
          tableNumber,
          menuUrl
        });
      } else {
        // For download, return as buffer
        const qrBuffer = await QRCode.toBuffer(menuUrl, qrOptions);
        
        // Set response headers for download
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="qr_${restaurantSlug}_table_${tableNumber || 'menu'}.png"`);
        
        // Send the image
        res.send(qrBuffer);
      }
      
    } catch (error) {
      console.error('QR Generation error:', error);
      res.status(500).json({ error: 'Failed to generate QR code' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}