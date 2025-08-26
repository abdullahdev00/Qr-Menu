import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Menu, 
  QrCode, 
  BarChart3, 
  Settings, 
  MessageSquare, 
  HelpCircle,
  ShoppingCart,
  User,
  LogOut,
  Bell,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "../../admin/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../admin/components/ui/avatar";
import { Badge } from "../../admin/components/ui/badge";

interface VendorLayoutProps {
  children: React.ReactNode;
  restaurantName?: string;
  ownerName?: string;
}

const navigation = [
  { name: 'Dashboard', href: '/vendor', icon: Home },
  { name: 'Menu Management', href: '/vendor/menu', icon: Menu },
  { name: 'Orders', href: '/vendor/orders', icon: ShoppingCart },
  { name: 'QR Codes', href: '/vendor/qr-codes', icon: QrCode },
  { name: 'Analytics', href: '/vendor/analytics', icon: BarChart3 },
  { name: 'Feedback', href: '/vendor/feedback', icon: MessageSquare },
  { name: 'Settings', href: '/vendor/settings', icon: Settings },
  { name: 'Support', href: '/vendor/support', icon: HelpCircle },
];

export function VendorLayout({ children, restaurantName = "My Restaurant", ownerName = "Restaurant Owner" }: VendorLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 shadow-lg transition-all duration-300`}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <QrCode className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">QR Menu</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              data-testid="toggle-sidebar"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Restaurant Info */}
          {!sidebarCollapsed && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {restaurantName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {restaurantName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {ownerName}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href || (item.href !== '/vendor' && location.startsWith(item.href));
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                    data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                  >
                    <item.icon
                      className={`${sidebarCollapsed ? 'mr-0' : 'mr-3'} h-5 w-5 transition-colors ${
                        isActive ? 'text-blue-700 dark:text-blue-200' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {!sidebarCollapsed && item.name}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 dark:text-gray-300"
              data-testid="logout-button"
            >
              <LogOut className={`${sidebarCollapsed ? 'mr-0' : 'mr-3'} h-5 w-5`} />
              {!sidebarCollapsed && 'Sign Out'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`${sidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
        {/* Top navigation */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Vendor Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" data-testid="notifications-button">
                  <Bell className="h-5 w-5" />
                  <Badge variant="destructive" className="ml-1 h-2 w-2 p-0"></Badge>
                </Button>
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}