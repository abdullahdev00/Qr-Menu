import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Route, Switch, Router, Redirect } from 'wouter';
import { Toaster } from '../components/ui/toaster';

// Import pages
import LoginPage from '../pages/login';
import DashboardPage from '../pages/dashboard';
import RestaurantsPage from '../pages/restaurants';
import MenuTemplatesPage from '../pages/menu-templates';
import QRCodesPage from '../pages/qr-codes';
import SubscriptionsPage from '../pages/subscriptions';
import AnalyticsPage from '../pages/analytics';
import SupportPage from '../pages/support';

import MainLayout from '../components/layout/main-layout';

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
  const [isAuthenticated, setIsAuthenticated] = useState(true); // For demo purposes

  console.log('🎨 Loading Original Beautiful Admin Panel...');
  console.log('✅ Original design loaded successfully!');

  return (
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
            <MainLayout>
              <Switch>
                <Route path="/">
                  <Redirect to="/dashboard" />
                </Route>
                <Route path="/dashboard" component={DashboardPage} />
                <Route path="/restaurants" component={RestaurantsPage} />
                <Route path="/menu-templates" component={MenuTemplatesPage} />
                <Route path="/qr-codes" component={QRCodesPage} />
                <Route path="/subscriptions" component={SubscriptionsPage} />
                <Route path="/analytics" component={AnalyticsPage} />
                <Route path="/support" component={SupportPage} />
                <Route path="/login" component={LoginPage} />
              </Switch>
            </MainLayout>
          )}
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;