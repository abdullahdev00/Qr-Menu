import express from 'express';
import { createServer as createHttpServer } from 'http';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = parseInt(process.env.PORT || '5000', 10);

// Initialize storage to ensure database is set up
import('../admin/lib/storage').then(() => {
  console.log('✅ Database initialized');
}).catch((error) => {
  console.error('❌ Database initialization failed:', error);
});

// Middleware
app.use(express.json());

// Create and start server
async function startServer() {
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes - Dynamic import handling
  app.use('/api', async (req, res, next) => {
    const apiPath = req.path.slice(1); // Remove leading slash
    
    try {
      let handlerPath = `../admin/pages/api/${apiPath}/index.ts`;
      let dynamicId: string | null = null;
      
      // Handle dynamic routes like /restaurants/uuid, /subscription-plans/uuid, /payment-requests/uuid, /menu-items/uuid, /menu-categories/uuid, /orders/uuid
      if (apiPath.match(/^(restaurants|subscription-plans|payment-requests|menu-items|menu-categories|orders)\/[a-f0-9-]+$/)) {
        const parts = apiPath.split('/');
        const resource = parts[0];
        dynamicId = parts[1] || null;
        handlerPath = `../admin/pages/api/${resource}/[id].ts`;
      }
      
      // Try to import the handler
      let handler;
      try {
        const module = await import(handlerPath);
        handler = module.default;
      } catch (indexError) {
        // Try direct .ts file if index.ts doesn't exist
        const directPath = `../admin/pages/api/${apiPath}.ts`;
        const module = await import(directPath);
        handler = module.default;
      }
      
      // Create Next.js-like req/res objects
      const mockReq = { 
        ...req, 
        query: { ...req.query, ...(dynamicId ? { id: dynamicId } : {}) }, 
        body: req.body 
      };
      
      const mockRes = {
        status: (code: number) => {
          res.status(code);
          return mockRes;
        },
        json: (data: any) => res.json(data),
        end: (data?: any) => res.end(data),
        setHeader: (name: string, value: string) => res.setHeader(name, value)
      };
      
      await handler(mockReq, mockRes);
    } catch (error) {
      console.error(`Error in API ${req.path}:`, error);
      next(); // Continue to next middleware if handler not found
    }
  });

  // Serve customer website
  app.use('/customer', express.static(join(__dirname, '../customer')));
  app.get('/customer/*', (req, res) => {
    res.sendFile(join(__dirname, '../customer/index.html'));
  });

  // Serve customer static assets for restaurant slug routes
  app.use('/:slug/styles', async (req, res, next) => {
    const { slug } = req.params;
    
    try {
      const { db } = await import('../admin/lib/storage');
      const { restaurants } = await import('../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      const restaurant = await db.select().from(restaurants).where(eq(restaurants.slug, slug)).limit(1);
      
      if (restaurant.length > 0) {
        express.static(join(__dirname, '../customer/styles'))(req, res, next);
        return;
      }
    } catch (error) {
      console.error('Error checking restaurant slug for styles:', error);
    }
    next();
  });

  app.use('/:slug/js', async (req, res, next) => {
    const { slug } = req.params;
    
    try {
      const { db } = await import('../admin/lib/storage');
      const { restaurants } = await import('../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      const restaurant = await db.select().from(restaurants).where(eq(restaurants.slug, slug)).limit(1);
      
      if (restaurant.length > 0) {
        express.static(join(__dirname, '../customer/js'))(req, res, next);
        return;
      }
    } catch (error) {
      console.error('Error checking restaurant slug for js:', error);
    }
    next();
  });

  // Restaurant slug routes
  app.get('/:slug/:page?', async (req, res, next) => {
    const { slug, page } = req.params;
    
    // Check if this is a restaurant slug by querying database
    try {
      const { db } = await import('../admin/lib/storage');
      const { restaurants } = await import('../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      const restaurant = await db.select().from(restaurants).where(eq(restaurants.slug, slug)).limit(1);
      
      if (restaurant.length > 0) {
        // If no page specified, serve customer website (restaurant menu)
        if (!page) {
          res.sendFile(join(__dirname, '../customer/index.html'));
          return;
        }
        // If page specified, serve admin panel for restaurant management
        else {
          res.sendFile(join(__dirname, '../dist/index.html'));
          return;
        }
      }
    } catch (error) {
      console.error('Error checking restaurant slug:', error);
    }
    
    // Not a restaurant route, continue to next handler
    next();
  });

  // Serve built static files and fallback (for both dev and production since we have the built files)
  app.use(express.static(join(__dirname, '../dist')));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/customer')) {
      return next();
    }
    res.sendFile(join(__dirname, '../dist/index.html'));
  });

  // Error handling
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  const server = createHttpServer(app);

  server.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${port}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });

  return server;
}

startServer().catch(console.error);