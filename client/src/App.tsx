import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Restaurants from "@/pages/restaurants";
import Subscriptions from "@/pages/subscriptions";
import MenuTemplates from "@/pages/menu-templates";
import QrCodes from "@/pages/qr-codes";
import Support from "@/pages/support";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import MainLayout from "@/components/layout/main-layout";
import ProtectedRoute from "@/components/auth/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <ProtectedRoute>
          <MainLayout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/restaurants" component={Restaurants} />
              <Route path="/subscriptions" component={Subscriptions} />
              <Route path="/menu-templates" component={MenuTemplates} />
              <Route path="/qr-codes" component={QrCodes} />
              <Route path="/support" component={Support} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/settings" component={Settings} />
              <Route component={NotFound} />
            </Switch>
          </MainLayout>
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
