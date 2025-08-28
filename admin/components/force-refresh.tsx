import React, { useState } from 'react';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';

interface ForceRefreshProps {
  onRefresh: () => void;
  isLoading?: boolean;
}

export function ForceRefreshButton({ onRefresh, isLoading = false }: ForceRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleRefresh}
      disabled={isLoading || isRefreshing}
      className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
    >
      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh'}
    </Button>
  );
}