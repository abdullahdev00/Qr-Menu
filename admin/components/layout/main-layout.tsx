import { useState } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import AIChatWidget from "../ui/ai-chat-widget";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <main className="lg:ml-64 pt-16 overflow-x-hidden">
        <div className="p-2 sm:p-4 overflow-x-hidden">
          {children}
        </div>
      </main>
      
      {/* AI Chat Widget - Available throughout the app */}
      <AIChatWidget />
    </div>
  );
}
