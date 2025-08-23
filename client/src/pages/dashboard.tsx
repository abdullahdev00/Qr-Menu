import { useLocation } from "wouter";
import KpiCards from "@/components/dashboard/kpi-cards";
import RevenueChart from "@/components/dashboard/revenue-chart";
import RecentActivity from "@/components/dashboard/recent-activity";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Download, 
  BarChart, 
  Settings, 
  Store, 
  QrCode, 
  Users, 
  Headphones, 
  TrendingUp,
  FileText,
  Bell,
  Zap
} from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const quickActions = [
    {
      id: 'add-restaurant',
      title: 'Add Restaurant',
      description: 'Register new restaurant partner',
      icon: Store,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      textColor: 'text-white',
      badge: 'Hot',
      badgeColor: 'bg-red-500',
      onClick: () => setLocation('/restaurants')
    },
    {
      id: 'generate-qr',
      title: 'Generate QR',
      description: 'Create custom QR codes',
      icon: QrCode,
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      hoverColor: 'hover:from-emerald-600 hover:to-emerald-700',
      textColor: 'text-white',
      badge: 'New',
      badgeColor: 'bg-green-500',
      onClick: () => setLocation('/qr-codes')
    },
    {
      id: 'manage-users',
      title: 'Manage Users',
      description: 'User accounts & permissions',
      icon: Users,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      textColor: 'text-white',
      onClick: () => {
        toast({ title: "Feature Coming Soon", description: "User management is being developed" });
      }
    },
    {
      id: 'support-tickets',
      title: 'Support Tickets',
      description: 'Handle customer support',
      icon: Headphones,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      hoverColor: 'hover:from-orange-600 hover:to-orange-700',
      textColor: 'text-white',
      badge: '12',
      badgeColor: 'bg-orange-500',
      onClick: () => setLocation('/support')
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View detailed reports',
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      hoverColor: 'hover:from-indigo-600 hover:to-indigo-700',
      textColor: 'text-white',
      onClick: () => setLocation('/analytics')
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download reports & backups',
      icon: Download,
      color: 'bg-gradient-to-br from-teal-500 to-teal-600',
      hoverColor: 'hover:from-teal-600 hover:to-teal-700',
      textColor: 'text-white',
      onClick: () => {
        toast({ title: "Export Started", description: "Your data export is being prepared" });
      }
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'System alerts & messages',
      icon: Bell,
      color: 'bg-gradient-to-br from-pink-500 to-pink-600',
      hoverColor: 'hover:from-pink-600 hover:to-pink-700',
      textColor: 'text-white',
      badge: '5',
      badgeColor: 'bg-red-500',
      onClick: () => {
        toast({ title: "Notifications", description: "You have 5 new notifications" });
      }
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'System configuration',
      icon: Settings,
      color: 'bg-gradient-to-br from-gray-500 to-gray-600',
      hoverColor: 'hover:from-gray-600 hover:to-gray-700',
      textColor: 'text-white',
      onClick: () => setLocation('/settings')
    },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <KpiCards />

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>

        {/* Recent Activity */}
        <RecentActivity />
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Quick Actions
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Frequently used operations for efficient management</p>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300">
              <Zap className="w-3 h-3 mr-1" />
              Fast Access
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                onClick={action.onClick}
                className={`group relative h-32 p-6 border-0 ${action.color} ${action.hoverColor} ${action.textColor} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden`}
                data-testid={`button-${action.id}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                <div className="relative z-10 flex flex-col items-center space-y-3 text-center">
                  <div className="relative">
                    <action.icon className="w-8 h-8 drop-shadow-sm" />
                    {action.badge && (
                      <Badge 
                        className={`absolute -top-2 -right-2 ${action.badgeColor} text-white text-xs px-1.5 py-0.5 min-w-0 h-5`}
                      >
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1 drop-shadow-sm">
                      {action.title}
                    </h3>
                    <p className="text-xs opacity-90 leading-tight">
                      {action.description}
                    </p>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
