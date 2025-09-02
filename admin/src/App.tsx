import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Route, Switch, Router, Redirect } from 'wouter';
import { Toaster } from '../components/ui/toaster';
import { ThemeProvider } from './lib/theme-provider';

// Import pages
import WelcomePage from '../pages/welcome';
import LoginPage from '../pages/login';
import DashboardPage from '../pages/dashboard';
import CustomerAuthTestPage from '../pages/customer-auth-test';

// Debug dashboard import
console.log('📦 DashboardPage imported:', typeof DashboardPage);
import RestaurantDashboardPage from '../pages/restaurant-dashboard';
import RestaurantsPage from '../pages/restaurants';
import QrCodesPage from '../pages/qr-codes';
import PaymentsPage from '../pages/payments';
import PaymentVerificationPage from '../pages/payment-verification';
import MenuTemplatesPage from '../pages/menu-templates';
import SubscriptionsPage from '../pages/subscriptions';
import AnalyticsPage from '../pages/analytics';
import SupportPage from '../pages/support';
import TestButtonPage from '../pages/test-button';
import MenuManagementPage from '../../vendor/pages/menu-management';
import OrdersPage from '../../vendor/pages/orders';
import VendorAnalyticsPage from '../../vendor/pages/analytics';
import VendorDashboardPage from '../../vendor/pages/dashboard';
import VendorDesignPage from '../../vendor/pages/design';
import VendorQRCodesPage from '../../vendor/pages/qr-codes';
import VendorPaymentRequestPage from '../../vendor/pages/payment-request';
import VendorSettingsPage from '../../vendor/pages/settings';

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
              <Route path="/" component={WelcomePage} />
              <Route path="/welcome" component={WelcomePage} />
              <Route path="/login" component={LoginPage} />
              <Route path="/customer-auth-test" component={CustomerAuthTestPage} />
              <Route>
                <Redirect to="/" />
              </Route>
            </Switch>
          ) : (
            <Switch>
              <Route path="/login" component={LoginPage} />
              <Route>
                <MainLayout>
                  <Switch>
                    <Route path="/">
                      <Redirect to="/dashboard" />
                    </Route>
                    <Route path="/dashboard" component={DashboardPage} />
                    <Route path="/restaurant-dashboard" component={RestaurantDashboardPage} />
                    <Route path="/restaurants" component={RestaurantsPage} />
                    <Route path="/qr-codes" component={QrCodesPage} />
                    <Route path="/payments" component={PaymentsPage} />
                    <Route path="/payment-verification" component={PaymentVerificationPage} />
                    <Route path="/menu-templates" component={MenuTemplatesPage} />
                    <Route path="/subscriptions" component={SubscriptionsPage} />
                    <Route path="/analytics" component={AnalyticsPage} />
                    <Route path="/support" component={SupportPage} />
                    <Route path="/test-button" component={TestButtonPage} />
                    <Route path="/:slug/dashboard" component={VendorDashboardPage} />
                    <Route path="/:slug/menu-management" component={MenuManagementPage} />
                    <Route path="/:slug/qr-codes" component={VendorQRCodesPage} />
                    <Route path="/:slug/design" component={VendorDesignPage} />
                    <Route path="/:slug/analytics" component={VendorAnalyticsPage} />
                    <Route path="/:slug/orders" component={OrdersPage} />
                    <Route path="/:slug/payment-request" component={VendorPaymentRequestPage} />
                    <Route path="/:slug/settings" component={VendorSettingsPage} />
                    <Route path="/vendor/dashboard" component={VendorDashboardPage} />
                    <Route path="/vendor/menu-management" component={MenuManagementPage} />
                    <Route path="/vendor/qr-codes" component={VendorQRCodesPage} />
                    <Route path="/vendor/payment-request" component={VendorPaymentRequestPage} />
                    <Route path="/vendor/settings" component={VendorSettingsPage} />
                    <Route path="/vendor/design" component={VendorDesignPage} />
                    <Route path="/vendor/analytics" component={VendorAnalyticsPage} />
                    <Route path="/vendor/orders" component={OrdersPage} />
                    <Route path="/customer-auth-test" component={CustomerAuthTestPage} />
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