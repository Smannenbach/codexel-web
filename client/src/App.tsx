import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Workspace from "@/pages/workspace";
import Templates from "@/pages/templates";
import Demo from "@/pages/demo";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Disclosures from "@/pages/disclosures";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/workspace" component={Workspace} />
      <Route path="/templates" component={Templates} />
      <Route path="/demo" component={Demo} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/disclosures" component={Disclosures} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="codexel-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
