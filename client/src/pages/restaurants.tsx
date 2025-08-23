import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RestaurantTable from "@/components/restaurants/restaurant-table";
import RestaurantForm from "@/components/restaurants/restaurant-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, Search, Filter, MoreHorizontal, Eye, Edit, Pause, MessageSquare,
  RefreshCw, BarChart3, Headphones, Trash2, Mail, MessageCircle,
  Download, Users, DollarSign, Clock, AlertCircle
} from "lucide-react";
import { type Restaurant } from "@shared/schema";

export default function Restaurants() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [showForm, setShowForm] = useState(false);
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const { data: restaurants, isLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants", searchQuery],
  });

  const { data: metrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  // Mock stats data with Pakistani market context
  const restaurantStats = {
    totalRestaurants: restaurants?.length || 0,
    activeSubscriptions: restaurants?.filter(r => r.status === 'active').length || 0,
    trialUsers: restaurants?.filter(r => r.status === 'trial').length || 0,
    monthlyRevenue: (metrics as any)?.monthlyRevenue || 0
  };

  const handleSelectAll = () => {
    if (selectedRestaurants.length === restaurants?.length) {
      setSelectedRestaurants([]);
    } else {
      setSelectedRestaurants(restaurants?.map(r => r.id) || []);
    }
  };

  const openRestaurantDetail = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowDetail(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Restaurants</p>
                <h3 className="text-2xl font-bold">{restaurantStats.totalRestaurants}</h3>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Subscriptions</p>
                <h3 className="text-2xl font-bold">{restaurantStats.activeSubscriptions}</h3>
              </div>
              <BarChart3 className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Trial Users</p>
                <h3 className="text-2xl font-bold">{restaurantStats.trialUsers}</h3>
              </div>
              <Clock className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Monthly Revenue</p>
                <h3 className="text-2xl font-bold">₨{restaurantStats.monthlyRevenue.toLocaleString()}</h3>
              </div>
              <DollarSign className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm ? (
        <RestaurantForm onClose={() => setShowForm(false)} />
      ) : (
        <Card>
          {/* Header with Actions */}
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Restaurant Management
                  {selectedRestaurants.length > 0 && (
                    <Badge variant="secondary">
                      {selectedRestaurants.length} selected
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Super admin's restaurant control center - manage, monitor and control all restaurants
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedRestaurants.length > 0 && (
                  <Button variant="outline" onClick={() => setShowBulkActions(!showBulkActions)}>
                    <MoreHorizontal className="w-4 h-4 mr-2" />
                    Bulk Actions
                  </Button>
                )}
                <Button variant="outline" onClick={() => {}}>
                  <Download className="w-4 h-4 mr-2" />
                  Export All
                </Button>
                <Button onClick={() => setShowForm(true)} data-testid="button-add-restaurant">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Restaurant
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Enhanced Filters & Search */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search restaurants, owners, phone, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-restaurants"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-40" data-testid="select-status-filter">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-full lg:w-40" data-testid="select-plan-filter">
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Plans</SelectItem>
                  <SelectItem value="basic">Basic ₨1,500</SelectItem>
                  <SelectItem value="pro">Pro ₨3,000</SelectItem>
                  <SelectItem value="enterprise">Enterprise ₨5,000</SelectItem>
                </SelectContent>
              </Select>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Cities</SelectItem>
                  <SelectItem value="karachi">Karachi</SelectItem>
                  <SelectItem value="lahore">Lahore</SelectItem>
                  <SelectItem value="islamabad">Islamabad</SelectItem>
                  <SelectItem value="faisalabad">Faisalabad</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="name-az">Name A-Z</SelectItem>
                  <SelectItem value="revenue-high">Revenue High-Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions Toolbar */}
          {selectedRestaurants.length > 0 && showBulkActions && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-1" />
                  Bulk Email
                </Button>
                <Button variant="outline" size="sm">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Bulk SMS
                </Button>
                <Button variant="outline" size="sm">
                  <Pause className="w-4 h-4 mr-1" />
                  Bulk Suspend
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Bulk Activate
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Export Selected
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Bulk Delete
                </Button>
              </div>
            </div>
          )}

          {/* Restaurant Table */}
          <CardContent className="p-0">
            <RestaurantTable 
              restaurants={restaurants || []} 
              isLoading={isLoading}
              statusFilter={statusFilter}
              planFilter={planFilter}
              selectedRestaurants={selectedRestaurants}
              onSelectRestaurant={setSelectedRestaurants}
              onSelectAll={handleSelectAll}
              onOpenDetail={openRestaurantDetail}
            />
          </CardContent>
        </Card>
      )}

      {/* Restaurant Detail Modal */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                {selectedRestaurant?.name?.[0]?.toUpperCase()}
              </div>
              {selectedRestaurant?.name} - Detail View
            </DialogTitle>
          </DialogHeader>
          
          {selectedRestaurant && (
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="subscription">Subscription</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="support">Support</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Restaurant Name</label>
                        <p className="font-medium">{selectedRestaurant.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Owner Name</label>
                        <p className="font-medium">{selectedRestaurant.ownerName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Contact Email</label>
                        <p className="font-medium">{selectedRestaurant.ownerEmail}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone Number</label>
                        <p className="font-medium">{selectedRestaurant.ownerPhone || 'Not provided'}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Location Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-gray-500">City</label>
                        <p className="font-medium">{selectedRestaurant.city || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        <p className="font-medium">{selectedRestaurant.address || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <Badge variant={selectedRestaurant.status === 'active' ? 'default' : 'secondary'}>
                          {selectedRestaurant.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="subscription" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Current Subscription</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Subscription details will be displayed here</p>
                      <p className="text-sm text-gray-400 mt-2">Plan information, billing history, and payment details</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="performance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Menu Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Performance metrics will be displayed here</p>
                      <p className="text-sm text-gray-400 mt-2">QR scans, popular items, and usage analytics</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="support" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Support History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Headphones className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Support tickets and communications will be displayed here</p>
                      <p className="text-sm text-gray-400 mt-2">Ticket history, messages, and quick actions</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Analytics Dashboard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Detailed analytics will be displayed here</p>
                      <p className="text-sm text-gray-400 mt-2">Revenue trends, customer insights, and performance KPIs</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Action Floating Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
          onClick={() => setShowForm(true)}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Restaurant
        </Button>
        
        <Button 
          size="lg" 
          variant="secondary"
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
          onClick={() => {}}
        >
          <Download className="w-5 h-5 mr-2" />
          Export All
        </Button>
        
        <Button 
          size="lg" 
          variant="secondary"
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
          onClick={() => {}}
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Broadcast
        </Button>
      </div>
    </div>
  );
}
