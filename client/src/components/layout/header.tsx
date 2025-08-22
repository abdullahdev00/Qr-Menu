import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { Menu, Moon, Sun, Bell } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const user = getCurrentUser();
  const [notifications] = useState(2);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="lg:ml-64 bg-gradient-to-r from-white via-blue-50/50 to-purple-50/50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 border-b-2 border-gradient-to-r from-blue-200 to-purple-200 dark:border-gray-700 shadow-lg backdrop-blur-xl">
      <div className="px-6 py-4">
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
            <div className="ml-4 lg:ml-0">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Welcome back, {user?.role === "super_admin" ? "Super Admin" : user?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-purple-900/30 dark:to-blue-900/30 text-orange-600 dark:text-yellow-400 hover:from-yellow-200 hover:to-orange-200 dark:hover:from-purple-800/40 dark:hover:to-blue-800/40 transition-all duration-300 hover:scale-110 shadow-lg"
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-3 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 hover:from-blue-200 hover:to-purple-200 dark:hover:from-blue-800/40 dark:hover:to-purple-800/40 transition-all duration-300 hover:scale-110 shadow-lg"
              data-testid="button-notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  {notifications}
                </span>
              )}
            </Button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                <span className="text-white text-sm font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || "A"}
                </span>
              </div>
              <span className="hidden md:block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {user?.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
