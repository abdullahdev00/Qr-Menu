import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Route, Switch, Router, Redirect } from 'wouter';
import { Toaster } from '../components/ui/toaster';
import { ThemeProvider } from './lib/theme-provider';

// Import pages
import LoginPage from '../pages/login';
import DashboardPage from '../pages/dashboard';
import RestaurantDashboardPage from '../pages/restaurant-dashboard';
import MenuManagementPage from '../pages/menu-management';
import RestaurantsPage from '../pages/restaurants';
import MenuTemplatesPage from '../pages/menu-templates';
import QRCodesPage from '../pages/qr-codes';
import QRTemplatesPage from '../pages/qr-templates';
import SubscriptionsPage from '../pages/subscriptions';
import AnalyticsPage from '../pages/analytics';
import SupportPage from '../pages/support';

import MainLayout from '../components/layout/main-layout';
import { VendorApp } from '../../vendor/VendorApp';
import { VendorDashboard } from '../../vendor/pages/VendorDashboard';

// Query client setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for authentication
    const user = localStorage.getItem('user');
    if (user) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  console.log('🎨 Loading Original Beautiful Admin Panel...');
  console.log('✅ Original design loaded successfully!');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="qr-menu-theme">
      <QueryClientProvider client={queryClient}>
        <Router>
        <div className="min-h-screen bg-background">
          {!isAuthenticated ? (
            <Switch>
              <Route path="/login" component={LoginPage} />
              <Route>
                <Redirect to="/login" />
              </Route>
            </Switch>
          ) : (
            <Switch>
              <Route path="/login" component={LoginPage} />
              <Route path="/vendor" exact>
                {() => {
                  console.log("🏪 Vendor dashboard route matched!");
                  return <VendorDashboard />;
                }}
              </Route>
              <Route>
                <MainLayout>
                  <Switch>
                    <Route path="/">
                      <Redirect to="/dashboard" />
                    </Route>
                    <Route path="/dashboard" component={DashboardPage} />
                    <Route path="/restaurant-dashboard" component={RestaurantDashboardPage} />
                    <Route path="/menu-management" component={MenuManagementPage} />
                    <Route path="/restaurants" component={RestaurantsPage} />
                    <Route path="/menu-templates" component={MenuTemplatesPage} />
                    <Route path="/qr-codes" component={QRCodesPage} />
                    <Route path="/qr-templates" component={QRTemplatesPage} />
                    <Route path="/subscriptions" component={SubscriptionsPage} />
                    <Route path="/analytics" component={AnalyticsPage} />
                    <Route path="/support" component={SupportPage} />
                  </Switch>
                </MainLayout>
              </Route>
            </Switch>
          )}
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;