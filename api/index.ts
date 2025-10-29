import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import Express app from backend
const loadApp = async () => {
  const { default: app } = await import('../backend/dist/server.js');
  return app;
};

let appPromise: Promise<any> | null = null;

// Export the Express app as a Vercel serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    // Lazy load the app once
    if (!appPromise) {
      appPromise = loadApp();
    }
    
    const app = await appPromise;
    
    // Let Express handle the request
    return app(req, res);
  } catch (error) {
    console.error('Error loading Express app:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

