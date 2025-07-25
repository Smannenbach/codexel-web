import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";
import { ErrorBoundary } from "@/components/workspace/ErrorBoundary";
import Workspace from "@/pages/workspace";
import Templates from "@/pages/templates";
import Demo from "@/pages/demo";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Disclosures from "@/pages/disclosures";
import LayoutMarketplace from "@/pages/layout-marketplace";
import Pricing from "@/pages/Pricing";
import Checkout from "@/pages/Checkout";
import PaymentSuccess from "@/pages/PaymentSuccess";
import TestWorkspace from "@/pages/TestWorkspace";
import SharedWorkspaceView from "@/components/workspace/SharedWorkspaceView";
import ProductionDashboard from "@/pages/ProductionDashboard";
import MarketingLanding from "@/pages/marketing-landing";
import TestPage from "@/pages/TestPage";

function Router() {
  try {
    return (
      <Switch>
        <Route path="/" component={MarketingLanding} />
        <Route path="/test-simple" component={TestPage} />
        <Route path="/home" component={Home} />
        <Route path="/workspace" component={Workspace} />
        <Route path="/templates" component={Templates} />
        <Route path="/demo" component={Demo} />
        <Route path="/marketplace" component={LayoutMarketplace} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/payment-success" component={PaymentSuccess} />
        <Route path="/test" component={TestWorkspace} />
        <Route path="/shared-workspace/:id" component={SharedWorkspaceView} />
        <Route path="/production" component={ProductionDashboard} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/disclosures" component={Disclosures} />
        <Route component={NotFound} />
      </Switch>
    );
  } catch (error) {
    console.error('Router error:', error);
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl mb-4">Loading Error</h1>
        <p className="mb-4">There was an error loading the application.</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 rounded">
          Reload Page
        </button>
      </div>
    </div>;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="codexel-ui-theme">
          <TooltipProvider>
            <div className="min-h-screen bg-black">
              <Toaster />
              <Router />
              {/* Temporarily disabled due to hooks error
              <ErrorBoundary fallback={<div />}>
                <FeedbackWidget />
              </ErrorBoundary>
              */}
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
