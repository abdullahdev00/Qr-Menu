import React from 'react';
import { Palette } from 'lucide-react';

export default function DesignPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Design</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Customize your restaurant's menu appearance and branding</p>
        </div>
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Palette className="w-6 h-6" />
          <span className="text-sm font-medium">Design Studio</span>
        </div>
      </div>

      {/* Empty state for now */}
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Palette className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Design Coming Soon</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            Menu design customization tools will be available here to help you create beautiful menus for your restaurant.
          </p>
        </div>
      </div>
    </div>
  );
}