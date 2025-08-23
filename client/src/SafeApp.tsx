import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import SimpleRestaurantsPage from "./SimpleRestaurantsPage";
import MainLayout from "@/components/layout/main-layout";
import ProtectedRoute from "@/components/auth/protected-route";

function SafeRouter() {
  return (
    <Switch>
      <Route path="/">
        <ProtectedRoute>
          <MainLayout>
            <Switch>
              <Route path="/" component={() => (
                <div style={{ padding: '40px' }}>
                  <h1>🏠 Dashboard</h1>
                  <p>Welcome to QR Menu Admin Panel</p>
                  <p>Click "Restaurants" in sidebar to see restaurant list</p>
                </div>
              )} />
              <Route path="/restaurants" component={SimpleRestaurantsPage} />
              <Route component={() => <div style={{ padding: '40px' }}>Page not found</div>} />
            </Switch>
          </MainLayout>
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function SafeApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Toaster />
        <SafeRouter />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default SafeApp;