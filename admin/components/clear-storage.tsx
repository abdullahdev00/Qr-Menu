import React from 'react';
import { Button } from './ui/button';

export function ClearStorageButton() {
  const clearLocalStorage = () => {
    // Clear localStorage
    localStorage.clear();
    // Reload page to reset state
    window.location.reload();
  };

  return (
    <Button 
      variant="outline" 
      onClick={clearLocalStorage}
      className="text-red-600 border-red-200 hover:bg-red-50"
    >
      Clear Local Storage & Reload
    </Button>
  );
}