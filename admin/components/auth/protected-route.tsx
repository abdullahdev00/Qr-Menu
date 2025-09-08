import { ReactNode } from 'react';
import { useAuth, UserRole } from '../../lib/role-auth';
import { Alert, AlertDescription } from '../ui/alert';
import { Shield, Lock } from 'lucide-react';
import { Button } from '../ui/button';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole | UserRole[];
  fallback?: ReactNode;
  requireRestaurant?: boolean;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  fallback,
  requireRestaurant = false 
}: ProtectedRouteProps) {
  const { user, isLoading, hasRole, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
          <h2 className="text-xl font-semibold">Checking access...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Lock className="w-16 h-16 mx-auto text-red-500" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-300">Please log in to access this page</p>
          <Button onClick={() => window.location.href = '/staff-login'}>
            Staff Login
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/login'}>
            Admin Login
          </Button>
        </div>
      </div>
    );
  }

  if (!hasRole(allowedRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <div className="space-y-3">
                <div>
                  <strong>Access Restricted</strong>
                </div>
                <div>
                  Your role ({user.role}) does not have permission to access this area.
                </div>
                <div className="text-sm">
                  <strong>Required roles:</strong> {Array.isArray(allowedRoles) ? allowedRoles.join(', ') : allowedRoles}
                </div>
                <div className="pt-2">
                  <Button variant="outline" onClick={logout} size="sm">
                    Switch Account
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Check restaurant requirement for certain roles
  if (requireRestaurant && (user.role === 'chef' || user.role === 'delivery_boy') && !user.restaurantId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <strong>Restaurant Assignment Required</strong>
                </div>
                <div>
                  Your account needs to be assigned to a restaurant to access this area.
                </div>
                <div className="text-sm text-gray-600">
                  Please contact your administrator.
                </div>
                <div className="pt-2">
                  <Button variant="outline" onClick={logout} size="sm">
                    Switch Account
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
