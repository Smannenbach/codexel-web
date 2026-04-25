import { db } from '../db';
import { sites } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { generateFullPageContent } from './mortgage-content-engine';

export class ContentWorker {
  private isProcessing = false;
  private queue: Array<{ siteId: number; pageIndex: number }> = [];

  /**
   * Queues all pages of a site for full content generation.
   */
  async queueSiteForGeneration(siteId: number) {
    const [site] = await db.select().from(sites).where(eq(sites.id, siteId));
    if (!site) return;

    const pages = (site.config as any)?.customContent?.pages || [];
    pages.forEach((_: any, index: number) => {
      this.queue.push({ siteId, pageIndex: index });
    });

    console.log(`[ContentWorker] Queued ${pages.length} pages for Site #${siteId}`);
    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const { siteId, pageIndex } = this.queue.shift()!;
      
      try {
        const [site] = await db.select().from(sites).where(eq(sites.id, siteId));
        if (!site) continue;

        const config = site.config as any;
        const pages = config?.customContent?.pages || [];
        const page = pages[pageIndex];

        if (page && !page.fullContentGenerated) {
          console.log(`[ContentWorker] Generating content for ${site.domain}/${page.slug}...`);
          
          const fullContent = await generateFullPageContent(
            { 
              name: site.name, 
              domain: site.domain, 
              niche: (site.metaData as any)?.niche || 'mortgage',
              state: (site.metaData as any)?.state || 'Nationwide'
            },
            page
          );

          // Update page in memory
          pages[pageIndex] = {
            ...page,
            content: fullContent,
            fullContentGenerated: true,
            generatedAt: new Date().toISOString()
          };

          // Save back to DB
          await db.update(sites)
            .set({ 
                config: { 
                    ...config, 
                    customContent: { ...config.customContent, pages } 
                } as any 
            })
            .where(eq(sites.id, siteId));
        }
      } catch (err) {
        console.error(`[ContentWorker] Error generating page for site ${siteId}:`, err);
      }

      // Small delay to respect rate limits
      await new Promise(r => setTimeout(r, 1000));
    }

    this.isProcessing = false;
  }

  getQueueLength() {
    return this.queue.length;
  }
}

export const contentWorker = new ContentWorker();
