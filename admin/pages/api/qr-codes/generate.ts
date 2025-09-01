import QRCode from 'qrcode';
import puppeteer from 'puppeteer';
import { db } from '../../lib/storage';
import { restaurants } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: any, res: any) {
  if (req.method === 'POST' || req.method === 'GET') {
    try {
      // Get data from body (POST) or query (GET)
      const data = req.method === 'POST' ? req.body : req.query;
      const { restaurantSlug, tableNumber, customization, size = 'medium', format = 'png', preview, useCustomDesign = true } = data;
      
      if (!restaurantSlug) {
        return res.status(400).json({ error: 'Restaurant slug is required' });
      }

      // Get restaurant data from database
      const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.slug, restaurantSlug));
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }
      
      // Generate the menu URL
      const menuUrl = `${process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://menuqr.pk'}/${restaurantSlug}${tableNumber ? `?table=${tableNumber}` : ''}`;
      
      if (useCustomDesign && !preview) {
        // Generate custom designed QR code with your beautiful template
        const qrDataUrl = await QRCode.toDataURL(menuUrl, {
          width: 200,
          margin: 0,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });

        // Create HTML with the custom design
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #f0f0f0; }
                .qr-container {
                  width: 400px;
                  height: 550px;
                  background-color: #2a2a2a;
                  border: 3px solid #b08968;
                  border-radius: 8px;
                  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                  position: relative;
                  margin: 0 auto;
                }
                .inner-border {
                  position: absolute;
                  top: 8px;
                  left: 8px;
                  right: 8px;
                  bottom: 8px;
                  border: 1px solid #b08968;
                  border-radius: 4px;
                  pointer-events: none;
                }
                .menu-title {
                  text-align: center;
                  padding-top: 32px;
                  padding-bottom: 24px;
                }
                .menu-title h1 {
                  color: #b08968;
                  font-size: 48px;
                  font-weight: bold;
                  letter-spacing: 8px;
                  margin: 0;
                }
                .qr-code-container {
                  display: flex;
                  justify-content: center;
                  padding: 0 32px;
                }
                .qr-code-box {
                  background: white;
                  padding: 12px;
                  width: 240px;
                  height: 240px;
                  position: relative;
                }
                .qr-code-box img {
                  width: 100%;
                  height: 100%;
                  object-fit: contain;
                  image-rendering: crisp-edges;
                }
                .logo-overlay {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  background: white;
                  width: 36px;
                  height: 36px;
                  border: 2px solid white;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                .logo-overlay span {
                  color: #b08968;
                  font-size: 24px;
                  font-weight: bold;
                }
                .scan-text {
                  text-align: center;
                  margin-top: 24px;
                }
                .scan-text p {
                  color: #b08968;
                  font-size: 18px;
                  letter-spacing: 2px;
                  margin: 0;
                }
                .icon-container {
                  display: flex;
                  justify-content: center;
                  margin-top: 32px;
                }
                .icon-circle {
                  width: 60px;
                  height: 60px;
                  background-color: #b08968;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                .table-section {
                  text-align: center;
                  margin-top: 24px;
                }
                .table-label {
                  color: #b08968;
                  font-size: 16px;
                  letter-spacing: 2px;
                  margin-bottom: 12px;
                }
                .table-number {
                  display: flex;
                  justify-content: center;
                }
                .table-number-box {
                  background: white;
                  width: 80px;
                  height: 55px;
                  border: 2px solid #b08968;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  font-size: 48px;
                  color: #2a2a2a;
                }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <div class="inner-border"></div>
                
                <div class="menu-title">
                  <h1>${restaurant.name.toUpperCase()}</h1>
                </div>

                <div class="qr-code-container">
                  <div class="qr-code-box">
                    <img src="${qrDataUrl}" alt="QR Code" />
                    <div class="logo-overlay">
                      <span>IX</span>
                    </div>
                  </div>
                </div>

                <div class="scan-text">
                  <p>SCAN FOR DIGITAL MENU</p>
                </div>

                <div class="icon-container">
                  <div class="icon-circle">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path d="M11 2v7l-2 2v11h4V11l-2-2V2zM6 2v5c0 1.1.9 2 2 2v13h2V9c1.1 0 2-.9 2-2V2H6z" fill="#2a2a2a"/>
                      <path d="M16 2v20h2V12h2V2h-4z" fill="#2a2a2a"/>
                    </svg>
                  </div>
                </div>

                <div class="table-section">
                  <div class="table-label">TABLE NO.</div>
                  <div class="table-number">
                    <div class="table-number-box">${tableNumber || '-'}</div>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;

        // Use puppeteer to render HTML to PNG
        const browser = await puppeteer.launch({
          headless: true,
          executablePath: '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium', // Use system chromium
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920x1080',
            '--disable-features=VizDisplayCompositor',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
          ]
        });
        
        const page = await browser.newPage();
        await page.setContent(htmlContent);
        await page.setViewport({ width: 500, height: 650 });
        
        const screenshot = await page.screenshot({
          type: 'png',
          clip: { x: 50, y: 50, width: 400, height: 550 }
        });
        
        await browser.close();

        // Set response headers for download
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="qr_${restaurantSlug}_table_${tableNumber || 'menu'}.png"`);
        
        // Send the image
        res.send(screenshot);
      } else {
        // Fallback to original QR code generation for preview or when custom design is disabled
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
      }
      
    } catch (error) {
      console.error('QR Generation error:', error);
      res.status(500).json({ error: 'Failed to generate QR code' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}