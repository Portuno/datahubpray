import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../backend/dist/server.js';

// Export the Express app as a Vercel serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
  // Let Express handle the request
  return app(req, res);
};

