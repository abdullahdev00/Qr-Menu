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
        {[...Array(4)].map((_, i) => {
          const colors = [
            'bg-gradient-to-br from-blue-400 to-indigo-500',
            'bg-gradient-to-br from-green-400 to-teal-500',
            'bg-gradient-to-br from-purple-400 to-violet-500',
            'bg-gradient-to-br from-orange-400 to-pink-500'
          ];
          return (
            <Card key={i} className={`${colors[i]} shadow-xl animate-pulse border-0 overflow-hidden relative`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-white/30 rounded-full mb-3 w-24"></div>
                    <div className="h-8 bg-white/40 rounded-full mb-4 w-32"></div>
                    <div className="h-3 bg-white/25 rounded-full w-20"></div>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm ml-4"></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  const kpis = [
    {
      title: "Active Restaurants",
      value: metrics?.totalRestaurants || 0,
      change: "+12% from last month",
      icon: Store,
      cardBg: "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600",
      iconColor: "bg-white/20 text-white backdrop-blur-sm",
      textColor: "text-white",
      shadowColor: "shadow-blue-200"
    },
    {
      title: "Monthly Revenue",
      value: `PKR ${(metrics?.monthlyRevenue || 0).toLocaleString()}`,
      change: "+8% from last month",
      icon: TrendingUp,
      cardBg: "bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600",
      iconColor: "bg-white/20 text-white backdrop-blur-sm",
      textColor: "text-white",
      shadowColor: "shadow-green-200"
    },
    {
      title: "New Signups",
      value: metrics?.newSignups || 0,
      change: "+5% from last month",
      icon: UserPlus,
      cardBg: "bg-gradient-to-br from-purple-500 via-violet-500 to-purple-600",
      iconColor: "bg-white/20 text-white backdrop-blur-sm",
      textColor: "text-white",
      shadowColor: "shadow-purple-200"
    },
    {
      title: "Pending Tickets",
      value: metrics?.pendingTickets || 0,
      change: "3 urgent",
      icon: Headphones,
      cardBg: "bg-gradient-to-br from-orange-500 via-red-500 to-pink-500",
      iconColor: "bg-white/20 text-white backdrop-blur-sm",
      textColor: "text-white",
      shadowColor: "shadow-orange-200",
      changeColor: "text-white/90",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <Card key={index} className={`${kpi.cardBg} ${kpi.shadowColor} shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 overflow-hidden relative`} data-testid={`kpi-${kpi.title.toLowerCase().replace(/\s+/g, '-')}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm font-medium ${kpi.textColor} opacity-90`}>
                  {kpi.title}
                </p>
                <p className={`text-3xl font-bold ${kpi.textColor} drop-shadow-sm mt-2`}>
                  {kpi.value}
                </p>
                <p className={`text-sm mt-3 ${kpi.changeColor || `${kpi.textColor} opacity-80`}`}>
                  <TrendingUp className="inline w-4 h-4 mr-1" />
                  {kpi.change}
                </p>
              </div>
              <div className={`p-4 rounded-2xl ${kpi.iconColor} ml-4`}>
                <kpi.icon className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
