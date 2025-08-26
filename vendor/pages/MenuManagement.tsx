import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../../admin/lib/queryClient"; 
import { useToast } from "../../admin/hooks/use-toast";
import { MenuItem, MenuCategory } from "../../shared/schema";
import { VendorLayout } from "../components/VendorLayout";
import { Button } from "../../admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { Badge } from "../../admin/components/ui/badge";
import { Input } from "../../admin/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../admin/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../admin/components/ui/select";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload,
  Eye,
  EyeOff,
  Filter
} from "lucide-react";
import { AddMenuItemForm } from "../components/AddMenuItemForm";

// Hardcoded restaurant ID for demo - in real app this would come from auth context
const RESTAURANT_ID = "81c66b53-dce6-40c8-9ff2-56cbff175d39";

export function MenuManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const { toast } = useToast();

  // Fetch menu categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<MenuCategory[]>({
    queryKey: ["/api/vendor/menu-categories", { restaurantId: RESTAURANT_ID }],
  });

  // Fetch menu items
  const { data: menuItems = [], isLoading: itemsLoading, refetch: refetchItems } = useQuery<MenuItem[]>({
    queryKey: ["/api/vendor/menu-items", { restaurantId: RESTAURANT_ID }],
  });

  // Delete menu item mutation
  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await apiRequest("DELETE", `/api/vendor/menu-items/${itemId}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Menu item deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/menu-items"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete menu item", variant: "destructive" });
    },
  });

  // Create categories with item counts
  const categoriesWithCounts = useMemo(() => {
    return categories.map(category => ({
      ...category,
      itemCount: menuItems.filter(item => item.categoryId === category.id).length
    }));
  }, [categories, menuItems]);

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = searchTerm === "" || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || 
        categories.find(cat => cat.id === item.categoryId)?.name === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchTerm, selectedCategory, categories]);

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (window.confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      deleteMutation.mutate(itemId);
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setShowAddDialog(true);
  };

  const closeDialog = () => {
    setShowAddDialog(false);
    setEditingItem(null);
  };

  return (
    <VendorLayout restaurantName="Karachi Kitchen" ownerName="Ahmed Ali">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Menu Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your restaurant menu items and categories
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" data-testid="bulk-import-button">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button data-testid="add-menu-item-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Menu Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
                  <DialogDescription>
                    {editingItem ? "Update the menu item details" : "Create a new menu item for your restaurant"}
                  </DialogDescription>
                </DialogHeader>
                <AddMenuItemForm 
                  onClose={closeDialog} 
                  existingItem={editingItem} 
                  restaurantId={RESTAURANT_ID}
                  categories={categories}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Categories Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categoriesLoading ? (
            [...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 text-center">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            categoriesWithCounts.map((category) => (
              <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedCategory(category.name)}
                    data-testid={`category-${category.name.toLowerCase().replace(" ", "-")}`}>
                <CardContent className="p-4 text-center">
                  <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {category.itemCount} items
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-menu-items"
              />
            </div>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48" data-testid="category-filter">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itemsLoading ? (
            [...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-20"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-full"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                    <div className="flex space-x-2">
                      <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredItems.map((item) => {
              const categoryName = categories.find(cat => cat.id === item.categoryId)?.name || "Unknown";
              return (
                <Card key={item.id} className="overflow-hidden" data-testid={`menu-item-${item.id}`}>
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
                    <img
                      src={item.imageUrl || "/api/placeholder/300/200"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      {item.isAvailable ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <Eye className="w-3 h-3 mr-1" />
                          Available
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Unavailable
                        </Badge>
                      )}
                    </div>
                    {item.isVegetarian && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Veg
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {categoryName}
                        </p>
                      </div>
                      <p className="font-bold text-lg text-gray-900 dark:text-white">
                        PKR {item.price}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {item.description || "No description available"}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {item.preparationTime || 0} min
                      </Badge>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                          data-testid={`edit-item-${item.id}`}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          disabled={deleteMutation.isPending}
                          data-testid={`delete-item-${item.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {!itemsLoading && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No menu items found matching your criteria
            </p>
          </div>
        )}
      </div>
    </VendorLayout>
  );
}