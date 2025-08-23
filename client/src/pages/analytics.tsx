import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnalyticsCharts, LocationChart } from "@/components/analytics/charts";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Smartphone, 
  Calendar, 
  Filter, 
  Download, 
  RefreshCw,
  BarChart3,
  PieChart,
  Globe,
  Clock,
  Target,
  Zap
} from "lucide-react";

const analyticsData = {
  totalScans: { value: 45267, change: 12, trend: 'up' },
  avgSession: { value: 3.2, change: 5, trend: 'up' },
  repeatVisits: { value: 68, change: 8, trend: 'up' },
  mobileScans: { value: 92, change: 3, trend: 'up' },
  qrGenerated: { value: 1245, change: 15, trend: 'up' },
  activeRestaurants: { value: 247, change: 7, trend: 'up' },
  totalRevenue: { value: 2567890, change: 22, trend: 'up' },
  avgRating: { value: 4.8, change: -2, trend: 'down' },
};

const timeRanges = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 3 Months' },
  { value: '1y', label: 'Last Year' },
];

const cityData = [
  { name: "Karachi", restaurants: 89, percentage: 36 },
  { name: "Lahore", restaurants: 76, percentage: 31 },
  { name: "Islamabad", restaurants: 45, percentage: 18 },
  { name: "Others", restaurants: 37, percentage: 15 },
];

export default function Analytics() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const kpiCards = [
    {
      id: 'total-scans',
      title: 'Total QR Scans',
      value: analyticsData.totalScans.value.toLocaleString(),
      change: analyticsData.totalScans.change,
      trend: analyticsData.totalScans.trend,
      icon: Eye,
      gradient: 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      description: 'QR codes scanned by customers'
    },
    {
      id: 'avg-session',
      title: 'Avg. Session Time',
      value: `${analyticsData.avgSession.value} min`,
      change: analyticsData.avgSession.change,
      trend: analyticsData.avgSession.trend,
      icon: Clock,
      gradient: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      description: 'Average time spent on menu'
    },
    {
      id: 'repeat-visits',
      title: 'Repeat Visits',
      value: `${analyticsData.repeatVisits.value}%`,
      change: analyticsData.repeatVisits.change,
      trend: analyticsData.repeatVisits.trend,
      icon: RefreshCw,
      gradient: 'bg-gradient-to-br from-purple-500 via-purple-600 to-violet-600',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      description: 'Customers returning to menu'
    },
    {
      id: 'mobile-scans',
      title: 'Mobile Scans',
      value: `${analyticsData.mobileScans.value}%`,
      change: analyticsData.mobileScans.change,
      trend: analyticsData.mobileScans.trend,
      icon: Smartphone,
      gradient: 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-500',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      description: 'Scans from mobile devices'
    },
    {
      id: 'qr-generated',
      title: 'QR Codes Generated',
      value: analyticsData.qrGenerated.value.toLocaleString(),
      change: analyticsData.qrGenerated.change,
      trend: analyticsData.qrGenerated.trend,
      icon: BarChart3,
      gradient: 'bg-gradient-to-br from-pink-500 via-pink-600 to-rose-600',
      iconBg: 'bg-pink-100 dark:bg-pink-900/30',
      iconColor: 'text-pink-600 dark:text-pink-400',
      description: 'QR codes created this month'
    },
    {
      id: 'active-restaurants',
      title: 'Active Restaurants',
      value: analyticsData.activeRestaurants.value.toLocaleString(),
      change: analyticsData.activeRestaurants.change,
      trend: analyticsData.activeRestaurants.trend,
      icon: Users,
      gradient: 'bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-600',
      iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      description: 'Currently subscribed restaurants'
    },
    {
      id: 'total-revenue',
      title: 'Total Revenue',
      value: `PKR ${(analyticsData.totalRevenue.value / 1000).toFixed(0)}K`,
      change: analyticsData.totalRevenue.change,
      trend: analyticsData.totalRevenue.trend,
      icon: Target,
      gradient: 'bg-gradient-to-br from-green-500 via-green-600 to-emerald-600',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      description: 'Revenue generated this period'
    },
    {
      id: 'avg-rating',
      title: 'Avg. Rating',
      value: `${analyticsData.avgRating.value}/5.0`,
      change: analyticsData.avgRating.change,
      trend: analyticsData.avgRating.trend,
      icon: Zap,
      gradient: 'bg-gradient-to-br from-yellow-500 via-yellow-600 to-orange-500',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      description: 'Customer satisfaction rating'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into your restaurant network performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button size="sm" className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card) => (
          <Card 
            key={card.id} 
            className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group"
            data-testid={`analytics-${card.id}`}
          >
            <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity ${card.gradient}`}></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <Badge 
                  variant={card.trend === 'up' ? 'default' : 'destructive'} 
                  className={`${card.trend === 'up' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-red-100 text-red-700 hover:bg-red-100'} border-0`}
                >
                  {card.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {card.trend === 'up' ? '+' : ''}{card.change}%
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </h3>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {card.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Charts */}
      <AnalyticsCharts />

      {/* Geographic Distribution */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Geographic Distribution
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Restaurant distribution across major Pakistani cities
              </p>
            </div>
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
              <Globe className="w-3 h-3 mr-1" />
              Pakistan Focus
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {cityData.map((city, index) => {
                const gradients = [
                  "bg-gradient-to-r from-blue-500 to-blue-600",
                  "bg-gradient-to-r from-emerald-500 to-emerald-600",
                  "bg-gradient-to-r from-orange-500 to-orange-600",
                  "bg-gradient-to-r from-purple-500 to-purple-600",
                ];
                const lightColors = [
                  "bg-blue-50 dark:bg-blue-900/20",
                  "bg-emerald-50 dark:bg-emerald-900/20",
                  "bg-orange-50 dark:bg-orange-900/20",
                  "bg-purple-50 dark:bg-purple-900/20",
                ];
                
                return (
                  <div 
                    key={city.name} 
                    className={`flex items-center justify-between p-4 rounded-xl ${lightColors[index]} hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer`}
                    data-testid={`city-stats-${city.name.toLowerCase()}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl ${gradients[index]} flex items-center justify-center text-white shadow-lg`}>
                        <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-white"></div>
                        </div>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white text-lg">
                          {city.name}
                        </span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Major business hub
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl text-gray-900 dark:text-white">
                        {city.restaurants}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {city.percentage}% share
                      </div>
                      <Badge variant="outline" className="mt-1 text-xs">
                        +{Math.floor(Math.random() * 5) + 1} this week
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center justify-center">
              <div className="relative">
                <LocationChart data={cityData} />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/5 rounded-full"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
