import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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
  { name: 'Premium Plans', value: 45, color: '#8B5CF6' },
  { name: 'Basic Plans', value: 35, color: '#06B6D4' },
  { name: 'Pro Plans', value: 20, color: '#10B981' },
];

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981'];

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
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/20" />
            <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
            <YAxis className="text-xs fill-muted-foreground" tickFormatter={(value) => `PKR ${(value / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value: number) => [`PKR ${value.toLocaleString()}`, "Revenue"]} contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
            <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#colorRevenue)" strokeWidth={3} />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/20" />
            <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
            <YAxis className="text-xs fill-muted-foreground" tickFormatter={(value) => `PKR ${(value / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value: number) => [`PKR ${value.toLocaleString()}`, "Revenue"]} contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/20" />
            <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
            <YAxis className="text-xs fill-muted-foreground" tickFormatter={(value) => `PKR ${(value / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value: number) => [`PKR ${value.toLocaleString()}`, "Revenue"]} contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", r: 4 }} activeDot={{ r: 6 }} />
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
            Analytics Dashboard
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
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
