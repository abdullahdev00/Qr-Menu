import express from 'express';
import { createServer as createHttpServer } from 'http';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = parseInt(process.env.PORT || '5000', 10);

// Initialize storage to ensure database is set up
import('../lib/storage.js').then(() => {
  console.log('✅ Database initialized');
}).catch((error) => {
  console.error('❌ Database initialization failed:', error);
});

// Middleware
app.use(express.json());

// Create and start server
async function startServer() {
  // Serve static files from public directory
  app.use(express.static(join(__dirname, '../public')));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes - Dynamic import handling
  app.use('/api', async (req, res, next) => {
    const apiPath = req.path.slice(1); // Remove leading slash
    
    try {
      // Try to import the corresponding API handler
      const handlerPath = `../pages/api/${apiPath}.js`;
      const { default: handler } = await import(handlerPath);
      
      // Create Next.js-like req/res objects
      const mockReq = { 
        ...req, 
        query: { ...req.query, ...req.params }, 
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

  // For production, serve index.html for all other routes
  if (process.env.NODE_ENV !== 'development') {
    app.get('*', (req, res) => {
      res.sendFile(join(__dirname, '../dist/index.html'));
    });
  }

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