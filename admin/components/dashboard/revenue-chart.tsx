import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, AreaChart as AreaChartIcon } from "lucide-react";

const revenueData = [
  { month: "Jan", revenue: 85000, restaurants: 12, orders: 340 },
  { month: "Feb", revenue: 92000, restaurants: 15, orders: 380 },
  { month: "Mar", revenue: 108000, restaurants: 18, orders: 450 },
  { month: "Apr", revenue: 95000, restaurants: 16, orders: 420 },
  { month: "May", revenue: 125000, restaurants: 22, orders: 520 },
  { month: "Jun", revenue: 142000, restaurants: 25, orders: 580 },
  { month: "Jul", revenue: 138000, restaurants: 24, orders: 560 },
  { month: "Aug", revenue: 155000, restaurants: 28, orders: 640 },
  { month: "Sep", revenue: 168000, restaurants: 32, orders: 720 },
  { month: "Oct", revenue: 142000, restaurants: 29, orders: 600 },
  { month: "Nov", revenue: 165000, restaurants: 35, orders: 680 },
  { month: "Dec", revenue: 178000, restaurants: 38, orders: 750 },
];

const pieData = [
  { name: 'Premium Plans', value: 45, color: '#F59E0B' },
  { name: 'Basic Plans', value: 35, color: '#EF4444' },
  { name: 'Pro Plans', value: 20, color: '#8B5CF6' },
];

const COLORS = ['#F59E0B', '#EF4444', '#8B5CF6'];

export default function RevenueChart() {
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line' | 'pie'>('area');
  const [period, setPeriod] = useState('12months');

  const renderChart = () => {
    switch (chartType) {
      case 'area':
        return (
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                <stop offset="50%" stopColor="#60A5FA" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#93C5FD" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="strokeRevenue" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
            <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} stroke="#9CA3AF" />
            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => `PKR ${(value / 1000).toFixed(0)}k`} stroke="#9CA3AF" />
            <Tooltip formatter={(value: number) => [`PKR ${value.toLocaleString()}`, "Revenue"]} contentStyle={{ backgroundColor: "white", border: "none", borderRadius: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", color: "#374151" }} />
            <Area type="monotone" dataKey="revenue" stroke="url(#strokeRevenue)" fill="url(#colorRevenue)" strokeWidth={4} />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart data={revenueData}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
            <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} stroke="#9CA3AF" />
            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => `PKR ${(value / 1000).toFixed(0)}k`} stroke="#9CA3AF" />
            <Tooltip formatter={(value: number) => [`PKR ${value.toLocaleString()}`, "Revenue"]} contentStyle={{ backgroundColor: "white", border: "none", borderRadius: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", color: "#374151" }} />
            <Bar dataKey="revenue" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={revenueData}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
            <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} stroke="#9CA3AF" />
            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => `PKR ${(value / 1000).toFixed(0)}k`} stroke="#9CA3AF" />
            <Tooltip formatter={(value: number) => [`PKR ${value.toLocaleString()}`, "Revenue"]} contentStyle={{ backgroundColor: "white", border: "none", borderRadius: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", color: "#374151" }} />
            <Line type="monotone" dataKey="revenue" stroke="url(#lineGradient)" strokeWidth={4} dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 6 }} activeDot={{ r: 8, fill: "#A855F7", strokeWidth: 2, stroke: "white" }} />
          </LineChart>
        );
      case 'pie':
        return (
          <div className="flex items-center justify-center h-full">
            <PieChart width={300} height={300}>
              <Pie data={pieData} cx={150} cy={150} innerRadius={60} outerRadius={120} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value}%`, "Share"]} contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
            </PieChart>
            <div className="ml-8">
              <h4 className="font-semibold mb-4">Plan Distribution</h4>
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center mb-2">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-sm text-muted-foreground">{entry.name}: {entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return <div className="flex items-center justify-center h-full text-muted-foreground">Invalid chart type</div>;
    }
  };

  return (
    <Card data-testid="revenue-chart" className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
      <CardHeader className="pb-4">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Revenue Chart
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
              <Button
                variant={chartType === 'area' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('area')}
                className="h-8 px-2"
                data-testid="button-chart-area"
              >
                <AreaChartIcon className="w-4 h-4" />
              </Button>
              <Button
                variant={chartType === 'bar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('bar')}
                className="h-8 px-2"
                data-testid="button-chart-bar"
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('line')}
                className="h-8 px-2"
                data-testid="button-chart-line"
              >
                <LineChartIcon className="w-4 h-4" />
              </Button>
              <Button
                variant={chartType === 'pie' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('pie')}
                className="h-8 px-2"
                data-testid="button-chart-pie"
              >
                <PieChartIcon className="w-4 h-4" />
              </Button>
            </div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12months">Last 12 months</SelectItem>
                <SelectItem value="6months">Last 6 months</SelectItem>
                <SelectItem value="3months">Last 3 months</SelectItem>
                <SelectItem value="1month">This month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[480px]">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
