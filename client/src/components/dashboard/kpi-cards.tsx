import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Store, TrendingUp, UserPlus, Headphones } from "lucide-react";

export default function KpiCards() {
  const { data: metrics, isLoading } = useQuery<{
    totalRestaurants: number;
    monthlyRevenue: number;
    newSignups: number;
    pendingTickets: number;
  }>({
    queryKey: ["/api/dashboard/metrics"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "Active Restaurants",
      value: metrics?.totalRestaurants || 0,
      change: "+12% from last month",
      icon: Store,
      iconColor: "bg-primary-100 dark:bg-primary-900/20 text-primary-600",
    },
    {
      title: "Monthly Revenue",
      value: `PKR ${(metrics?.monthlyRevenue || 0).toLocaleString()}`,
      change: "+8% from last month",
      icon: TrendingUp,
      iconColor: "bg-secondary-100 dark:bg-secondary-900/20 text-secondary-600",
    },
    {
      title: "New Signups",
      value: metrics?.newSignups || 0,
      change: "+5% from last month",
      icon: UserPlus,
      iconColor: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600",
    },
    {
      title: "Pending Tickets",
      value: metrics?.pendingTickets || 0,
      change: "3 urgent",
      icon: Headphones,
      iconColor: "bg-red-100 dark:bg-red-900/20 text-red-600",
      changeColor: "text-error",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <Card key={index} data-testid={`kpi-${kpi.title.toLowerCase().replace(/\s+/g, '-')}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {kpi.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {kpi.value}
                </p>
                <p className={`text-sm ${kpi.changeColor || "text-success"}`}>
                  <TrendingUp className="inline w-4 h-4 mr-1" />
                  {kpi.change}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${kpi.iconColor}`}>
                <kpi.icon className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
