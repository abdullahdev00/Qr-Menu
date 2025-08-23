import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ComposedChart
} from "recharts";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity,
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon
} from "lucide-react";

const analyticsData = [
  { month: "Jan", revenue: 85000, signups: 15, scans: 3200, activeUsers: 180 },
  { month: "Feb", revenue: 92000, signups: 18, scans: 3800, activeUsers: 220 },
  { month: "Mar", revenue: 108000, signups: 22, scans: 4500, activeUsers: 280 },
  { month: "Apr", revenue: 95000, signups: 16, scans: 4100, activeUsers: 250 },
  { month: "May", revenue: 125000, signups: 25, scans: 5200, activeUsers: 340 },
  { month: "Jun", revenue: 142000, signups: 28, scans: 5800, activeUsers: 380 },
  { month: "Jul", revenue: 138000, signups: 24, scans: 5600, activeUsers: 360 },
  { month: "Aug", revenue: 155000, signups: 31, scans: 6400, activeUsers: 420 },
  { month: "Sep", revenue: 168000, signups: 35, scans: 7200, activeUsers: 480 },
  { month: "Oct", revenue: 142000, signups: 27, scans: 6100, activeUsers: 390 },
  { month: "Nov", revenue: 165000, signups: 33, scans: 6800, activeUsers: 450 },
  { month: "Dec", revenue: 178000, signups: 38, scans: 7500, activeUsers: 520 },
];

const performanceData = [
  { day: "Mon", orders: 42, revenue: 8400 },
  { day: "Tue", orders: 38, revenue: 7200 },
  { day: "Wed", orders: 51, revenue: 9800 },
  { day: "Thu", orders: 47, revenue: 8900 },
  { day: "Fri", orders: 65, revenue: 12500 },
  { day: "Sat", orders: 72, revenue: 14200 },
  { day: "Sun", orders: 59, revenue: 11800 },
];

export function AnalyticsCharts() {
  const [activeChart, setActiveChart] = useState<'revenue' | 'signups' | 'scans' | 'performance'>('revenue');

  const chartButtons = [
    { id: 'revenue', label: 'Revenue Trend', icon: DollarSign, color: 'bg-blue-500' },
    { id: 'signups', label: 'Restaurant Growth', icon: Users, color: 'bg-emerald-500' },
    { id: 'scans', label: 'QR Scans', icon: BarChart3, color: 'bg-purple-500' },
    { id: 'performance', label: 'Weekly Performance', icon: Activity, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Chart Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Performance Analytics</h2>
          <p className="text-sm text-muted-foreground">Track your business metrics with interactive charts</p>
        </div>
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {chartButtons.map((button) => (
            <Button
              key={button.id}
              variant={activeChart === button.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveChart(button.id as any)}
              className={`flex items-center space-x-2 h-9 ${
                activeChart === button.id 
                  ? `${button.color} hover:${button.color} text-white` 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              data-testid={`button-chart-${button.id}`}
            >
              <button.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{button.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {chartButtons.find(b => b.id === activeChart)?.label}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Interactive data visualization
                  </p>
                </div>
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Live Data
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {activeChart === 'revenue' && (
                    <AreaChart data={analyticsData}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.3} />
                      <XAxis dataKey="month" className="text-xs fill-muted-foreground" stroke="#9CA3AF" />
                      <YAxis className="text-xs fill-muted-foreground" tickFormatter={(value) => `PKR ${(value / 1000)}K`} stroke="#9CA3AF" />
                      <Tooltip 
                        formatter={(value: number) => [`PKR ${value.toLocaleString()}`, "Revenue"]}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                        }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="url(#revenueGradient)" strokeWidth={3} />
                    </AreaChart>
                  )}
                  {activeChart === 'signups' && (
                    <LineChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.3} />
                      <XAxis dataKey="month" className="text-xs fill-muted-foreground" stroke="#9CA3AF" />
                      <YAxis className="text-xs fill-muted-foreground" stroke="#9CA3AF" />
                      <Tooltip 
                        formatter={(value: number) => [value, "New Restaurants"]}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="signups" 
                        stroke="#10B981" 
                        strokeWidth={3} 
                        dot={{ fill: "#10B981", strokeWidth: 2, r: 6 }} 
                        activeDot={{ r: 8, stroke: "#10B981", strokeWidth: 2 }}
                      />
                    </LineChart>
                  )}
                  {activeChart === 'scans' && (
                    <BarChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.3} />
                      <XAxis dataKey="month" className="text-xs fill-muted-foreground" stroke="#9CA3AF" />
                      <YAxis className="text-xs fill-muted-foreground" stroke="#9CA3AF" />
                      <Tooltip 
                        formatter={(value: number) => [value.toLocaleString(), "QR Scans"]}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                        }}
                      />
                      <Bar dataKey="scans" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                  {activeChart === 'performance' && (
                    <ComposedChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.3} />
                      <XAxis dataKey="day" className="text-xs fill-muted-foreground" stroke="#9CA3AF" />
                      <YAxis yAxisId="left" className="text-xs fill-muted-foreground" stroke="#9CA3AF" />
                      <YAxis yAxisId="right" orientation="right" className="text-xs fill-muted-foreground" stroke="#9CA3AF" />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          name === 'revenue' ? `PKR ${value.toLocaleString()}` : value,
                          name === 'revenue' ? 'Revenue' : 'Orders'
                        ]}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                        }}
                      />
                      <Bar yAxisId="left" dataKey="orders" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#EF4444" strokeWidth={3} dot={{ fill: "#EF4444", r: 4 }} />
                    </ComposedChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Stats */}
        <div className="space-y-4">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">This Month</p>
                  <h3 className="text-2xl font-bold">PKR 1.78M</h3>
                  <p className="text-blue-100 text-xs mt-1">Revenue Generated</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-400">
                <div className="flex items-center text-blue-100">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="text-sm">+22% from last month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Active Now</p>
                  <h3 className="text-2xl font-bold">520</h3>
                  <p className="text-emerald-100 text-xs mt-1">Restaurant Partners</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-emerald-400">
                <div className="flex items-center text-emerald-100">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="text-sm">+38 new this month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Scans</p>
                  <h3 className="text-2xl font-bold">7.5K</h3>
                  <p className="text-purple-100 text-xs mt-1">QR Code Scans</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-purple-400">
                <div className="flex items-center text-purple-100">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="text-sm">Peak: Friday evenings</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface LocationData {
  name: string;
  restaurants: number;
  percentage: number;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--warning))",
  "hsl(var(--chart-4))",
];

export function LocationChart({ data }: { data: LocationData[] }) {
  return (
    <div className="w-48 h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="restaurants"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [value, "Restaurants"]}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
