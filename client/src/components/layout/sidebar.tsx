import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { getCurrentUser, logout } from "@/lib/auth";
import { 
  BarChart3, 
  Store, 
  CreditCard, 
  Utensils, 
  QrCode, 
  Headphones, 
  PieChart, 
  Settings,
  LogOut,
  X
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Restaurants", href: "/restaurants", icon: Store, badge: "24" },
  { name: "Subscriptions", href: "/subscriptions", icon: CreditCard },
  { name: "Menu Templates", href: "/menu-templates", icon: Utensils },
  { name: "QR Codes", href: "/qr-codes", icon: QrCode },
  { name: "Support", href: "/support", icon: Headphones, badge: "3", badgeColor: "bg-warning" },
  { name: "Analytics", href: "/analytics", icon: PieChart },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    setLocation("/login");
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
          "fixed left-0 top-0 z-50 w-64 h-screen transition-transform bg-gradient-to-b from-white via-blue-50/30 to-purple-50/30 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 shadow-2xl border-r-2 border-gradient-to-b from-blue-200 to-purple-200 dark:border-gray-700 backdrop-blur-xl",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        data-testid="sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            data-testid="button-close-sidebar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo */}
          <div className="flex items-center mb-8 px-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-3 shadow-xl">
              <QrCode className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">QR Menu</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Admin Panel</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2 mb-8">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={cn("nav-item w-full text-left", isActive && "active")}
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="ml-3">{item.name}</span>
                  {item.badge && (
                    <span 
                      className={cn(
                        "ml-auto text-xs font-medium px-2.5 py-0.5 rounded-full",
                        item.badgeColor || "bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="absolute bottom-4 left-3 right-3">
            {/* Storage indicator */}
            <div className="bg-gradient-to-r from-blue-100 via-purple-50 to-pink-100 dark:bg-gradient-to-r dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-2xl p-4 mb-4 shadow-lg border border-blue-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Storage Used
                </span>
                <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">78%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-inner" 
                  style={{ width: "78%" }}
                ></div>
              </div>
            </div>

            {/* Sign out button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 dark:hover:bg-gradient-to-r dark:hover:from-red-900/30 dark:hover:to-pink-900/30 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 border border-transparent hover:border-red-200"
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5" />
              <span className="ml-3">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
