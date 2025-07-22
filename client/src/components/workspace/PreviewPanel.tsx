import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink } from 'lucide-react';

export function PreviewPanel() {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Preview</h2>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <Card className="h-full flex items-center justify-center bg-muted/30 border-2 border-dashed">
          <div className="text-center text-muted-foreground">
            <div className="text-4xl mb-4">🚀</div>
            <p className="text-lg font-medium">Ready to Preview</p>
            <p className="text-sm">Your application will appear here</p>
          </div>
        </Card>
      </div>
    </div>
  );
}