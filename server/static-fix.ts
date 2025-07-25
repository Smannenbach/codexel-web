import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function setupStaticFix(app: Express) {
  // In production, serve static files from dist/public
  if (process.env.NODE_ENV === "production") {
    const publicPath = path.resolve(process.cwd(), "dist", "public");
    
    if (fs.existsSync(publicPath)) {
      // Serve static assets with proper headers
      app.use('/assets', express.static(path.join(publicPath, 'assets'), {
        maxAge: '1y',
        immutable: true
      }));
      
      // Serve other static files
      app.use(express.static(publicPath, {
        maxAge: '1h'
      }));
      
      // Handle SPA routing - serve index.html for all non-API routes
      app.get('*', (req, res, next) => {
        // Skip API routes
        if (req.path.startsWith('/api')) {
          return next();
        }
        
        const indexPath = path.join(publicPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          next();
        }
      });
    }
  }
}