import express from 'express';
import path from 'path';
import fs from 'fs';

export function setupStaticFix(app: express.Application) {
  // Force serve JavaScript files directly from dist
  app.get('/assets/*.js', (req, res) => {
    const fileName = path.basename(req.path);
    const filePath = path.join(process.cwd(), 'dist', 'public', 'assets', fileName);
    
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(filePath);
    } else {
      res.status(404).send('File not found');
    }
  });

  // Serve index.html with inline script fallback
  app.get('/', (req, res) => {
    const indexPath = path.join(process.cwd(), 'dist', 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
      let html = fs.readFileSync(indexPath, 'utf-8');
      
      // Add fallback loading message
      html = html.replace(
        '<div id="root"></div>',
        `<div id="root">
          <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0a0a0a; color: white; font-family: system-ui;">
            <div style="text-align: center;">
              <h1 style="font-size: 3rem; margin-bottom: 1rem;">Codexel.ai</h1>
              <p style="font-size: 1.5rem; opacity: 0.8;">Build AI Applications Without Code</p>
            </div>
          </div>
        </div>`
      );
      
      res.send(html);
    } else {
      res.status(404).send('Index not found');
    }
  });
}