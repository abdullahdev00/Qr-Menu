import { useState } from "react";
import { useTheme } from "../../src/lib/theme-provider";
import { useLocation } from "wouter";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { getCurrentUser, logout } from "../../lib/auth";
import { Menu, Moon, Sun, Bell, Search, X, User, Settings, LogOut, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const user = getCurrentUser();
  const [notifications] = useState(2);
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Get page title based on current route
  const getPageTitle = () => {
    // Handle dynamic slug routes
    if (location.match(/^\/[^\/]+\/dashboard$/)) return 'Restaurant Dashboard';
    if (location.match(/^\/[^\/]+\/menu-management$/)) return 'Menu Management';
    if (location.match(/^\/[^\/]+\/analytics$/)) return 'Analytics';
    if (location.match(/^\/[^\/]+\/orders$/)) return 'Orders';
    if (location.match(/^\/[^\/]+\/settings$/)) return 'Settings';
    if (location.match(/^\/[^\/]+\/qr-codes$/)) return 'QR Codes';
    if (location.match(/^\/[^\/]+\/design$/)) return 'Design';
    if (location.match(/^\/[^\/]+\/payment-request$/)) return 'Payment Request';
    
    switch (location) {
      case '/dashboard':
      case '/':
        return 'Dashboard';
      case '/restaurants':
        return 'Restaurants';
      case '/subscriptions':
        return 'Subscription Plans';
      case '/menu-templates':
        return 'Menu Templates';
      case '/qr-codes':
        return 'QR Code Generator';
      case '/support':
        return 'Support Tickets';
      case '/analytics':
        return 'Analytics';
      case '/vendor/dashboard':
        return 'Restaurant Dashboard';
      case '/vendor/menu-management':
        return 'Menu Management';
      case '/vendor/analytics':
        return 'Analytics';
      case '/vendor/orders':
        return 'Orders';
      case '/vendor/settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="lg:ml-64 bg-gradient-to-r from-white via-blue-50/60 to-purple-50/60 dark:from-gray-900 dark:via-blue-950/40 dark:to-purple-950/40 border-b border-blue-200/50 dark:border-blue-800/30 shadow-lg backdrop-blur-2xl relative overflow-hidden fixed top-0 left-0 right-0 z-30">
      {/* Animated background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-pink-400/10"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
      
      <div className="relative px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              data-testid="button-menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="ml-4 lg:ml-0 group">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-700 to-purple-700 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent drop-shadow-sm transition-all duration-300 group-hover:scale-105">
                <span className="sm:hidden">{getPageTitle() === "Menu Management" ? "Menu" : getPageTitle()}</span>
                <span className="hidden sm:inline">{getPageTitle()}</span>
              </h1>
              <p className="hidden md:flex text-sm text-gray-600 dark:text-gray-300 font-medium items-center transition-all duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                👋 Welcome back, <span className="ml-1 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{user?.role === "super_admin" ? "Super Admin" : user?.name}</span>
              </p>
            </div>
          </div>

          {/* Desktop Search Bar - visible on large screens */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search restaurants, plans, tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm shadow-sm"
                data-testid="input-search-desktop"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  data-testid="button-clear-search"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="lg:hidden group relative p-3 rounded-2xl bg-gradient-to-br from-green-100/80 via-emerald-100/80 to-green-50/80 dark:from-green-900/40 dark:via-emerald-900/40 dark:to-teal-900/40 text-green-600 dark:text-green-400 hover:from-green-200 hover:via-emerald-200 hover:to-green-100 dark:hover:from-green-800/50 dark:hover:via-emerald-800/50 dark:hover:to-teal-800/50 transition-all duration-300 hover:scale-110 shadow-xl hover:shadow-2xl border border-green-200/50 dark:border-green-500/20 backdrop-blur-sm"
              data-testid="button-search-toggle"
            >
              <div className="relative z-10">
                <Search className="w-5 h-5 transition-all duration-300 group-hover:scale-110 drop-shadow-sm" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-green-300/20 to-emerald-300/20 dark:from-green-400/20 dark:to-teal-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="group relative p-3 rounded-2xl bg-gradient-to-br from-yellow-100/80 via-orange-100/80 to-yellow-50/80 dark:from-purple-900/40 dark:via-blue-900/40 dark:to-indigo-900/40 text-orange-600 dark:text-yellow-400 hover:from-yellow-200 hover:via-orange-200 hover:to-yellow-100 dark:hover:from-purple-800/50 dark:hover:via-blue-800/50 dark:hover:to-indigo-800/50 transition-all duration-300 hover:scale-110 hover:rotate-12 shadow-xl hover:shadow-2xl border border-orange-200/50 dark:border-yellow-500/20 backdrop-blur-sm"
              data-testid="button-theme-toggle"
            >
              <div className="relative z-10">
                {theme === "light" ? 
                  <Moon className="w-5 h-5 transition-all duration-300 group-hover:-rotate-12 drop-shadow-sm" /> :
                  <Sun className="w-5 h-5 transition-all duration-300 group-hover:rotate-180 drop-shadow-sm" />
                }
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/20 to-orange-300/20 dark:from-yellow-400/20 dark:to-blue-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="group relative p-3 rounded-2xl bg-gradient-to-br from-blue-100/80 via-purple-100/80 to-indigo-100/80 dark:from-blue-900/40 dark:via-purple-900/40 dark:to-indigo-900/40 text-blue-600 dark:text-blue-400 hover:from-blue-200 hover:via-purple-200 hover:to-indigo-200 dark:hover:from-blue-800/50 dark:hover:via-purple-800/50 dark:hover:to-indigo-800/50 transition-all duration-300 hover:scale-110 shadow-xl hover:shadow-2xl border border-blue-200/50 dark:border-blue-500/20 backdrop-blur-sm"
              data-testid="button-notifications"
            >
              <div className="relative z-10">
                <Bell className="w-5 h-5 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 drop-shadow-sm" />
              </div>
              {notifications > 0 && (
                <div className="absolute -top-2 -right-2 flex items-center justify-center">
                  <span className="h-6 w-6 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-xl animate-bounce border-2 border-white dark:border-gray-800">
                    {notifications}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 rounded-full animate-ping opacity-30"></div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-300/20 to-purple-300/20 dark:from-blue-400/20 dark:to-purple-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>

            {/* User Menu */}
            <div className="group flex items-center space-x-3 cursor-pointer">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 hover:rotate-6 border-2 border-white/20 backdrop-blur-sm">
                  <span className="text-white text-sm font-bold drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
                    {user?.name?.charAt(0)?.toUpperCase() || "A"}
                  </span>
                  <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                {/* Online status indicator */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white dark:border-gray-800 shadow-lg">
                  <div className="w-full h-full bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <div className="hidden md:block transition-all duration-300 group-hover:translate-x-1">
                <div className="text-sm font-bold bg-gradient-to-r from-gray-700 via-blue-600 to-purple-600 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent drop-shadow-sm">
                  {user?.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  {user?.role === "super_admin" ? "Super Admin" : "Admin"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - expandable */}
        {isSearchOpen && (
          <div className="lg:hidden border-t border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
            <div className="px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search restaurants, plans, tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 py-2 w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 shadow-sm"
                  data-testid="input-search-mobile"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  data-testid="button-close-mobile-search"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
