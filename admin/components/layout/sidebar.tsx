import { useLocation } from "wouter";
import { cn } from "../../lib/utils";
import { getCurrentUser, logout } from "../../lib/auth";
import { 
  BarChart3, 
  Store, 
  CreditCard, 
  Utensils, 
  Headphones, 
  PieChart, 
  Settings,
  LogOut,
  X,
  ShoppingBag,
  Palette,
  QrCode,
  Wallet
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const adminNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Restaurants", href: "/restaurants", icon: Store, badge: "24" },
  { name: "QR Codes", href: "/qr-codes", icon: QrCode },
  { name: "Payment Requests", href: "/payments", icon: CreditCard, badge: "5", badgeColor: "bg-orange-500" },
  { name: "Subscriptions", href: "/subscriptions", icon: CreditCard },
  { name: "Menu Templates", href: "/menu-templates", icon: Utensils },
  { name: "Support", href: "/support", icon: Headphones, badge: "3", badgeColor: "bg-warning" },
  { name: "Analytics", href: "/analytics", icon: PieChart },
  { name: "Settings", href: "/settings", icon: Settings },
];

// Function to get restaurant navigation with dynamic slug
const getRestaurantNavigation = (slug?: string) => {
  const baseSlug = slug || "vendor"; // Fallback to /vendor if no slug
  return [
    { name: "Dashboard", href: `/${baseSlug}/dashboard`, icon: BarChart3 },
    { name: "Menu Management", href: `/${baseSlug}/menu-management`, icon: Utensils },
    { name: "QR Codes", href: `/${baseSlug}/qr-codes`, icon: QrCode },
    { name: "Design", href: `/${baseSlug}/design`, icon: Palette },
    { name: "Payment Request", href: `/${baseSlug}/payment-request`, icon: Wallet, badge: "PKR", badgeColor: "bg-green-500" },
    { name: "Analytics", href: `/${baseSlug}/analytics`, icon: PieChart },
    { name: "Orders", href: `/${baseSlug}/orders`, icon: Store, badge: "5" },
    { name: "Settings", href: `/${baseSlug}/settings`, icon: Settings },
  ];
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const user = getCurrentUser();
  
  // Extract restaurant slug from current location if it's a restaurant route
  const restaurantSlug = location.match(/^\/([^\/]+)\//)?.[1];
  const isRestaurantRoute = user?.role === 'restaurant' && restaurantSlug && 
    restaurantSlug !== 'dashboard' && 
    restaurantSlug !== 'restaurants' && 
    restaurantSlug !== 'admin' && 
    restaurantSlug !== 'qr-codes' && 
    restaurantSlug !== 'payments' && 
    restaurantSlug !== 'subscriptions' &&
    restaurantSlug !== 'menu-templates' &&
    restaurantSlug !== 'analytics' &&
    restaurantSlug !== 'support';
  
  // For admin routes (/dashboard, /restaurants, etc.) always show admin navigation
  const isAdminRoute = location.startsWith('/dashboard') || 
    location.startsWith('/restaurants') || 
    location.startsWith('/qr-codes') ||
    location.startsWith('/payments') ||
    location.startsWith('/subscriptions') ||
    location.startsWith('/menu-templates') ||
    location.startsWith('/analytics') ||
    location.startsWith('/support') ||
    location === '/';
  
  // Get navigation based on route type and user role
  const navigation = (user?.role === 'restaurant' && !isAdminRoute) ? 
    getRestaurantNavigation(isRestaurantRoute ? restaurantSlug : undefined) : 
    adminNavigation;

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const handleNavigation = (href: string) => {
    setLocation(href);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 w-64 h-screen transition-all duration-300 bg-gradient-to-b from-white via-blue-50/40 to-purple-50/40 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/30 shadow-2xl border-r border-blue-200/50 dark:border-blue-800/30 backdrop-blur-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        data-testid="sidebar"
      >
        {/* Animated background overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-pink-400/10 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        <div className="h-full px-3 py-4 overflow-x-hidden flex flex-col">
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white z-50"
            data-testid="button-close-sidebar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo */}
          <div className="flex items-center mb-8 px-3 group flex-shrink-0">
            <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-3 shadow-xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-pink-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <Utensils className="text-white w-6 h-6 relative z-10 drop-shadow-lg" />
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="transition-all duration-300 group-hover:translate-x-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">QR Menu</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                {user?.role === 'restaurant' ? 'Restaurant Panel' : 'Admin Panel'}
              </p>
            </div>
          </div>

          {/* Navigation Menu - with controlled height and hidden overflow */}
          <nav className="space-y-1 flex-1 overflow-y-hidden pb-32">
            {navigation.map((item, index) => {
              const isActive = location === item.href || 
                (location === "/" && item.href === "/dashboard") ||
                (location === "/" && user?.role === 'restaurant' && item.href.endsWith('/dashboard'));
              const gradients = [
                'from-blue-500 to-blue-600',
                'from-emerald-500 to-emerald-600', 
                'from-purple-500 to-purple-600',
                'from-orange-500 to-orange-600',
                'from-pink-500 to-pink-600',
                'from-teal-500 to-teal-600',
                'from-indigo-500 to-indigo-600',
                'from-gray-500 to-gray-600'
              ];
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "group relative w-full flex items-center px-4 py-3 mx-2 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg",
                    isActive 
                      ? `bg-gradient-to-r ${gradients[index]} text-white shadow-lg scale-105` 
                      : "text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-gray-100/80 hover:to-blue-100/80 dark:hover:from-gray-800/50 dark:hover:to-blue-900/50 hover:text-gray-900 dark:hover:text-white"
                  )}
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg"></div>
                  )}
                  
                  {/* Icon with background */}
                  <div className={cn(
                    "relative w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-300",
                    isActive 
                      ? "bg-white/20 backdrop-blur-sm" 
                      : "bg-gray-100/50 dark:bg-gray-800/50 group-hover:bg-white/20 group-hover:backdrop-blur-sm"
                  )}>
                    <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white drop-shadow-sm" : "")} />
                  </div>
                  
                  <span className={cn("flex-1 text-left transition-all duration-300", isActive && "drop-shadow-sm")}>
                    <span className="sm:hidden">{item.name === "Menu Management" ? "Menu" : item.name}</span>
                    <span className="hidden sm:inline">{item.name}</span>
                  </span>
                  
                  {item.badge && (
                    <span className={cn(
                      "text-xs font-bold px-2.5 py-1 rounded-full transition-all duration-300 transform group-hover:scale-110",
                      isActive 
                        ? "bg-white/20 text-white backdrop-blur-sm" 
                        : "bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-lg animate-pulse"
                    )}>
                      {item.badge}
                    </span>
                  )}
                  
                  {/* Hover glow effect */}
                  <div className={cn(
                    "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-r",
                    gradients[index]
                  )}></div>
                </button>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="absolute bottom-4 left-3 right-3">
            {/* Sign out button */}
            <button
              onClick={handleLogout}
              className="group relative w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/50 hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 border border-gray-200/50 dark:border-gray-600/50 hover:border-red-300/50 dark:hover:border-red-700/50 backdrop-blur-sm"
              data-testid="button-logout"
            >
              {/* Logout icon with animation */}
              <div className="relative w-8 h-8 rounded-lg bg-gray-100/50 dark:bg-gray-700/50 group-hover:bg-red-100 dark:group-hover:bg-red-900/40 flex items-center justify-center mr-3 transition-all duration-300">
                <LogOut className="w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:text-red-600 dark:group-hover:text-red-400" />
                <div className="absolute inset-0 bg-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <span className="flex-1 text-left transition-colors duration-300 group-hover:text-red-600 dark:group-hover:text-red-400 font-medium">
                Sign Out
              </span>
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
