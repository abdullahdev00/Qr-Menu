import { useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string; // super_admin, admin, support, chef, delivery_boy, restaurant
  restaurantId?: string;
  restaurantName?: string;
  restaurantSlug?: string;
  isActive?: boolean;
}

export type UserRole = 'super_admin' | 'admin' | 'support' | 'chef' | 'delivery_boy' | 'restaurant';

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  super_admin: ['all'],
  admin: ['restaurants', 'orders', 'analytics', 'subscriptions', 'support'],
  support: ['support', 'orders'],
  chef: ['kitchen'],
  delivery_boy: ['delivery'],
  restaurant: ['vendor_dashboard', 'menu', 'orders', 'analytics']
} as const;

// Route permissions mapping  
export const ROUTE_PERMISSIONS = {
  '/dashboard': ['super_admin', 'admin'],
  '/restaurants': ['super_admin', 'admin'],
  '/subscriptions': ['super_admin', 'admin'],
  '/analytics': ['super_admin', 'admin'],
  '/support': ['super_admin', 'admin', 'support'],
  '/kitchen': ['chef', 'super_admin', 'admin'],
  '/delivery': ['delivery_boy', 'super_admin', 'admin'],
  '/orders': ['super_admin', 'admin', 'support']
} as const;

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for authentication
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.id && userData.role) {
          setUser(userData);
        } else {
          localStorage.removeItem('user');
        }
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: { email?: string; phone?: string; password: string; role?: string }) => {
    try {
      let endpoint = '/api/auth/login';
      
      // Determine which login endpoint to use based on role or credentials
      if (credentials.role === 'chef' || credentials.role === 'delivery_boy') {
        endpoint = '/api/auth/staff-login';
      } else if (credentials.role === 'restaurant' || credentials.phone) {
        endpoint = '/api/auth/restaurant-login';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, user: data.user };
      }

      throw new Error('Invalid response');
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  const hasPermission = (route: string): boolean => {
    if (!user) return false;
    
    // Super admin has access to everything
    if (user.role === 'super_admin') return true;
    
    // Check route permissions
    const allowedRoles = ROUTE_PERMISSIONS[route as keyof typeof ROUTE_PERMISSIONS];
    if (!allowedRoles) return false;
    
    return allowedRoles.includes(user.role as any);
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role as UserRole);
  };

  return {
    user,
    isLoading,
    login,
    logout,
    hasPermission,
    hasRole,
    isAuthenticated: !!user
  };
}