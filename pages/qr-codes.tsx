import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../lib/use-toast';
import {
  QrCode, CheckCircle, TrendingUp, Award, Search, Filter, Download,
  Settings, Layers, ShieldCheck, Palette, FileText, Zap, Eye,
  MoreHorizontal, Edit, Trash2, Plus, BarChart3, Users, MapPin,
  Calendar, Clock, Smartphone, Monitor, Home
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface QrCode {
  id: string;
  restaurantId: string;
  restaurantName?: string;
  url: string;
  qrType: 'menu' | 'table' | 'poster' | 'business_card';
  tableNumber?: number;
  style: string;
  size: string;
  foregroundColor: string;
  backgroundColor: string;
  format: string;
  scanCount: number;
  monthlyScans: number;
  dailyAverage: number;
  conversionRate: string;
  status: 'active' | 'inactive' | 'expired';
  lastScannedAt?: string;
  createdAt: string;
}

interface Restaurant {
  id: string;
  name: string;
  city: string;
  ownerName: string;
}

export default function QrCodesPage() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState('all');
  const [qrTypeFilter, setQrTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [selectedQRs, setSelectedQRs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setLocation('/login');
    }
  }, [setLocation]);

  // Fetch QR codes
  const { data: qrCodes = [], isLoading: qrLoading } = useQuery<QrCode[]>({
    queryKey: ['/api/qr-codes'],
    enabled: !!user,
  });

  // Fetch restaurants for filters
  const { data: restaurants = [] } = useQuery<Restaurant[]>({
    queryKey: ['/api/restaurants'],
    enabled: !!user,
  });

  // Mock data for charts and KPIs
  const qrMetrics = {
    totalGenerated: Array.isArray(qrCodes) ? qrCodes.length : 1847,
    activeQRs: Array.isArray(qrCodes) ? qrCodes.filter((qr: QrCode) => qr.status === 'active').length : 1623,
    monthlyScans: 45678,
    topPerformer: "McDonald's DHA"
  };

  const chartData = [
    { date: '2024-01-01', scans: 1200 },
    { date: '2024-01-02', scans: 1350 },
    { date: '2024-01-03', scans: 1100 },
    { date: '2024-01-04', scans: 1500 },
    { date: '2024-01-05', scans: 1800 },
    { date: '2024-01-06', scans: 1600 },
    { date: '2024-01-07', scans: 2100 },
  ];

  const topPerformingQRs = [
    { restaurant: "McDonald's DHA", scans: 2345 },
    { restaurant: "KFC Gulberg", scans: 1987 },
    { restaurant: "Pizza Hut Clifton", scans: 1756 },
    { restaurant: "Subway Johar", scans: 1543 },
    { restaurant: "Burger King", scans: 1432 },
  ];

  const qrTypeData = [
    { name: 'Table QR', value: 45, color: '#FF8042' },
    { name: 'Menu QR', value: 35, color: '#8884D8' },
    { name: 'Poster QR', value: 20, color: '#00C49F' },
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="qr-codes-page">
      {/* Header with Breadcrumb */}
      <div className="flex items-center justify-between" data-testid="page-header">
        <div>
          <nav className="flex mb-2" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li><a href="/dashboard" className="hover:text-foreground flex items-center"><Home className="w-4 h-4 mr-1" />Dashboard</a></li>
              <li className="flex items-center">
                <span className="mx-2">/</span>
                <span className="text-foreground font-medium">QR Code Management</span>
              </li>
            </ol>
          </nav>
          <h1 className="text-3xl font-bold tracking-tight">QR Code Management</h1>
          <p className="text-muted-foreground">Manage QR codes across all restaurants including table QR systems</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg" data-testid="button-generate-qr">
          <Plus className="w-4 h-4 mr-2" />
          Generate QR Batch
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" data-testid="kpi-cards">
        <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-xl border-0 overflow-hidden relative" data-testid="card-total-qr">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-blue-100 text-sm font-medium mb-1">Total QR Codes Generated</p>
                <p className="text-white text-3xl font-bold mb-1">{qrMetrics.totalGenerated.toLocaleString()}</p>
                <p className="text-blue-200 text-xs">+124 this month</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center ml-4">
                <QrCode className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 shadow-xl border-0 overflow-hidden relative" data-testid="card-active-qr">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-green-100 text-sm font-medium mb-1">Active QR Codes</p>
                <p className="text-white text-3xl font-bold mb-1">{qrMetrics.activeQRs.toLocaleString()}</p>
                <p className="text-green-200 text-xs">87.9% active rate</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center ml-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 via-violet-500 to-purple-600 shadow-xl border-0 overflow-hidden relative" data-testid="card-monthly-scans">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-purple-100 text-sm font-medium mb-1">Monthly Scans</p>
                <p className="text-white text-3xl font-bold mb-1">{qrMetrics.monthlyScans.toLocaleString()}</p>
                <p className="text-purple-200 text-xs">+23% from last month</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center ml-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 via-orange-500 to-pink-500 shadow-xl border-0 overflow-hidden relative" data-testid="card-top-performer">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-orange-100 text-sm font-medium mb-1">Top Performer</p>
                <p className="text-white text-lg font-bold mb-1">{qrMetrics.topPerformer}</p>
                <p className="text-orange-200 text-xs">2,345 scans</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center ml-4">
                <Award className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Panel */}
      <Card className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 shadow-lg border-0" data-testid="quick-actions-panel">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200" data-testid="action-generate-batch">
              <Layers className="w-6 h-6 mb-2 text-blue-600" />
              <span className="text-xs text-center text-blue-700">Generate QR Batch</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200" data-testid="action-health-check">
              <ShieldCheck className="w-6 h-6 mb-2 text-green-600" />
              <span className="text-xs text-center text-green-700">QR Health Check</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200" data-testid="action-template-designer">
              <Palette className="w-6 h-6 mb-2 text-purple-600" />
              <span className="text-xs text-center text-purple-700">Template Designer</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-orange-200" data-testid="action-performance-report">
              <FileText className="w-6 h-6 mb-2 text-orange-600" />
              <span className="text-xs text-center text-orange-700">Performance Report</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 border-indigo-200" data-testid="action-bulk-operations">
              <Zap className="w-6 h-6 mb-2 text-indigo-600" />
              <span className="text-xs text-center text-indigo-700">Bulk Operations</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-200" data-testid="action-system-settings">
              <Settings className="w-6 h-6 mb-2 text-gray-600" />
              <span className="text-xs text-center text-gray-700">System Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" data-testid="main-tabs">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="table-qr" data-testid="tab-table-qr">Table QR</TabsTrigger>
          <TabsTrigger value="templates" data-testid="tab-templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6" data-testid="content-overview">
          {/* Search and Filters */}
          <Card data-testid="search-filters-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Search & Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by restaurant, type, location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                      data-testid="input-search"
                    />
                  </div>
                </div>
                <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                  <SelectTrigger data-testid="select-restaurant">
                    <SelectValue placeholder="All Restaurants" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Restaurants</SelectItem>
                    {Array.isArray(restaurants) && restaurants.map((restaurant: Restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={qrTypeFilter} onValueChange={setQrTypeFilter}>
                  <SelectTrigger data-testid="select-qr-type">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="menu">Menu QR</SelectItem>
                    <SelectItem value="table">Table QR</SelectItem>
                    <SelectItem value="poster">Poster QR</SelectItem>
                    <SelectItem value="business_card">Business Card</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger data-testid="select-city">
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    <SelectItem value="Karachi">Karachi</SelectItem>
                    <SelectItem value="Lahore">Lahore</SelectItem>
                    <SelectItem value="Islamabad">Islamabad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2" data-testid="qr-performance-chart">
              <CardHeader>
                <CardTitle>QR Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="scans" stroke="#3B82F6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card data-testid="qr-type-breakdown">
              <CardHeader>
                <CardTitle>QR Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={qrTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, value}) => `${name}: ${value}%`}
                    >
                      {qrTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing QRs */}
          <Card data-testid="top-performing-qrs">
            <CardHeader>
              <CardTitle>Top Performing QR Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topPerformingQRs}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="restaurant" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="scans" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* QR Codes Table */}
          <Card data-testid="qr-codes-table">
            <CardHeader>
              <CardTitle>QR Codes Management</CardTitle>
            </CardHeader>
            <CardContent>
              {qrLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Restaurant Info</TableHead>
                        <TableHead>QR Details</TableHead>
                        <TableHead>Table System</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(qrCodes) && qrCodes.slice(0, 10).map((qr: QrCode) => (
                        <TableRow key={qr.id} data-testid={`row-qr-${qr.id}`}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                                <QrCode className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{qr.restaurantName || 'Unknown Restaurant'}</p>
                                <p className="text-xs text-muted-foreground flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  Karachi, DHA
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <Badge variant={qr.qrType === 'menu' ? 'default' : 'secondary'} className="mb-1">
                                {qr.qrType === 'menu' ? 'Menu QR' : 
                                 qr.qrType === 'table' ? 'Table QR' : 
                                 qr.qrType === 'poster' ? 'Poster QR' : 'Business Card'}
                              </Badge>
                              <p className="text-xs text-muted-foreground">
                                Generated: {new Date(qr.createdAt).toLocaleDateString()}
                              </p>
                              {qr.tableNumber && (
                                <p className="text-xs text-muted-foreground">Table #{qr.tableNumber}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {qr.qrType === 'table' ? (
                              <div className="text-sm">
                                <p>Table #{qr.tableNumber || 'N/A'}</p>
                                <p className="text-xs text-muted-foreground">Active QR</p>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-medium">{qr.scanCount.toLocaleString()} scans</p>
                              <p className="text-xs text-muted-foreground">{qr.monthlyScans} this month</p>
                              <p className="text-xs text-muted-foreground">{qr.conversionRate}% conversion</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline" data-testid={`button-view-${qr.id}`}>
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" data-testid={`button-analytics-${qr.id}`}>
                                <BarChart3 className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" data-testid={`button-more-${qr.id}`}>
                                <MoreHorizontal className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Table QR Tab */}
        <TabsContent value="table-qr" className="space-y-6" data-testid="content-table-qr">
          <Card>
            <CardHeader>
              <CardTitle>Table QR Management</CardTitle>
              <p className="text-sm text-muted-foreground">Manage table-specific QR codes for restaurants</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <QrCode className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Table QR Management</h3>
                <p className="text-muted-foreground mb-4">Coming soon - Comprehensive table QR management system</p>
                <Button data-testid="button-setup-table-qr">Setup Table QR System</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6" data-testid="content-templates">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Templates</CardTitle>
              <p className="text-sm text-muted-foreground">Design and manage QR code templates</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Palette className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Template Gallery</h3>
                <p className="text-muted-foreground mb-4">Coming soon - Visual template designer and management</p>
                <Button data-testid="button-create-template">Create New Template</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6" data-testid="content-analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card data-testid="device-breakdown">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Device Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Mobile
                    </span>
                    <span className="font-semibold">78%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      Desktop
                    </span>
                    <span className="font-semibold">22%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="geographic-analysis">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Geographic Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Karachi</span>
                    <span className="font-semibold">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Lahore</span>
                    <span className="font-semibold">32%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Islamabad</span>
                    <span className="font-semibold">23%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="time-analysis">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Peak Usage Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>12:00 PM - 2:00 PM</span>
                    <span className="font-semibold">Peak</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>7:00 PM - 9:00 PM</span>
                    <span className="font-semibold">High</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>10:00 AM - 12:00 PM</span>
                    <span className="font-semibold">Medium</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="export-options">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-export-pdf">
                    <FileText className="w-4 h-4 mr-2" />
                    PDF Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="button-export-excel">
                    <FileText className="w-4 h-4 mr-2" />
                    Excel Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="button-export-csv">
                    <FileText className="w-4 h-4 mr-2" />
                    CSV Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}