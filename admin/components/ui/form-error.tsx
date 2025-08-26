import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  message?: string | null;
  className?: string;
}

export function FormError({ message, className = '' }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className={`flex items-center gap-1 text-sm text-red-600 dark:text-red-400 mt-1 ${className}`}>
      <AlertCircle className="h-3 w-3 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}