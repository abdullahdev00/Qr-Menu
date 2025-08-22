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
          "fixed left-0 top-0 z-50 w-64 h-screen transition-transform bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700",
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
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
              <QrCode className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">QR Menu</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
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
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary-900 dark:text-primary-100">
                  Storage Used
                </span>
                <span className="text-xs text-primary-600 dark:text-primary-400">78%</span>
              </div>
              <div className="w-full bg-primary-200 dark:bg-primary-800 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full" 
                  style={{ width: "78%" }}
                ></div>
              </div>
            </div>

            {/* Sign out button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="ml-3">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
