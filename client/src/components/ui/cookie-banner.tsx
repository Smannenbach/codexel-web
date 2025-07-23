import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie, X } from 'lucide-react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('codexel-cookie-consent');
    if (!cookieConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('codexel-cookie-consent', 'accepted');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('codexel-cookie-consent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 backdrop-blur-xl bg-gray-900/90 border-t border-gray-800">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Cookie className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <p className="text-sm text-gray-300">
              We use cookies to enhance your experience and analyze site usage. By continuing, you agree to our use of cookies.
              <a href="/privacy" className="text-purple-400 hover:text-purple-300 ml-1 underline">
                Learn more
              </a>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDecline}
              className="text-gray-400 hover:text-gray-300"
            >
              Decline
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Accept Cookies
            </Button>
            <button
              onClick={() => setShowBanner(false)}
              className="text-gray-400 hover:text-gray-300 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}