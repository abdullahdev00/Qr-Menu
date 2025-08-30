import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Route, Switch, Router, Redirect } from 'wouter';
import { Toaster } from '../../admin/components/ui/toaster';
import { ThemeProvider } from '../../admin/src/lib/theme-provider';

// Import vendor pages
import Dashboard from '../pages/dashboard';
import MenuManagement from '../pages/menu-management';
import Orders from '../pages/orders';
import Analytics from '../pages/analytics';
import Design from '../pages/design';

// Query client setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,
    },
  },
});

function VendorApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for authentication
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.role === 'restaurant') {
        setIsAuthenticated(true);
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl">Loading Vendor Panel...</h1>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="vendor-theme">
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-background">
            {!isAuthenticated ? (
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-xl">Please login as restaurant user</h1>
                </div>
              </div>
            ) : (
              <Switch>
                <Route path="/">
                  <Redirect to="/dashboard" />
                </Route>
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/menu-management" component={MenuManagement} />
                <Route path="/orders" component={Orders} />
                <Route path="/analytics" component={Analytics} />
                <Route path="/design" component={Design} />
              </Switch>
            )}
            <Toaster />
          </div>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default VendorApp;