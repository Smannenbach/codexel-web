import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Confetti from 'react-confetti';

export default function PaymentSuccess() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // Auto-redirect to workspace after 5 seconds
    const timer = setTimeout(() => {
      navigate('/workspace');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={200}
        gravity={0.1}
        colors={['#a855f7', '#ec4899', '#6366f1', '#10b981']}
      />
      
      <Card className="max-w-md w-full mx-4 text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription className="text-lg">
            Welcome to Codexel Pro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your subscription is now active. You have full access to all premium features.
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold">What's next?</h4>
            <ul className="text-sm text-left space-y-1 text-muted-foreground">
              <li>• Start building with unlimited AI agents</li>
              <li>• Access all premium templates</li>
              <li>• Deploy your applications with custom domains</li>
              <li>• Get priority support from our team</li>
            </ul>
          </div>

          <Button 
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            onClick={() => navigate('/workspace')}
          >
            Go to Workspace
          </Button>
          
          <p className="text-xs text-muted-foreground">
            Redirecting to workspace in 5 seconds...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}