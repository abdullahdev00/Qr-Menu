import { useState } from "react";
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

const mockCategories = [
  { id: "1", name: "Appetizers", itemCount: 8 },
  { id: "2", name: "Main Course", itemCount: 15 },
  { id: "3", name: "Desserts", itemCount: 6 },
  { id: "4", name: "Beverages", itemCount: 12 },
  { id: "5", name: "Pakistani Specialties", itemCount: 10 },
];

const mockMenuItems = [
  {
    id: "1",
    name: "Chicken Biryani",
    description: "Aromatic basmati rice with tender chicken pieces and traditional spices",
    price: 450,
    category: "Pakistani Specialties",
    isAvailable: true,
    isVegetarian: false,
    imageUrl: "/api/placeholder/300/200",
    preparationTime: 25
  },
  {
    id: "2", 
    name: "Seekh Kebab",
    description: "Grilled minced meat skewers with traditional spices",
    price: 350,
    category: "Appetizers",
    isAvailable: true,
    isVegetarian: false,
    imageUrl: "/api/placeholder/300/200",
    preparationTime: 15
  },
  {
    id: "3",
    name: "Dal Makhani",
    description: "Creamy black lentils slow-cooked with butter and spices",
    price: 280,
    category: "Main Course", 
    isAvailable: false,
    isVegetarian: true,
    imageUrl: "/api/placeholder/300/200",
    preparationTime: 20
  },
  {
    id: "4",
    name: "Gulab Jamun",
    description: "Traditional sweet milk dumplings in sugar syrup",
    price: 150,
    category: "Desserts",
    isAvailable: true,
    isVegetarian: true,
    imageUrl: "/api/placeholder/300/200",
    preparationTime: 5
  },
  {
    id: "5",
    name: "Mango Lassi",
    description: "Refreshing yogurt drink with fresh mango pulp",
    price: 120,
    category: "Beverages",
    isAvailable: true,
    isVegetarian: true,
    imageUrl: "/api/placeholder/300/200",
    preparationTime: 3
  },
];

export function MenuManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filteredItems = mockMenuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
                  <DialogTitle>Add New Menu Item</DialogTitle>
                  <DialogDescription>
                    Create a new menu item for your restaurant
                  </DialogDescription>
                </DialogHeader>
                <AddMenuItemForm onClose={() => setShowAddDialog(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Categories Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {mockCategories.map((category) => (
            <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {category.itemCount} items
                </p>
              </CardContent>
            </Card>
          ))}
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
              {mockCategories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
                <img
                  src={item.imageUrl}
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
                      {item.category}
                    </p>
                  </div>
                  <p className="font-bold text-lg text-gray-900 dark:text-white">
                    PKR {item.price}
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {item.preparationTime} min
                  </Badge>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`edit-item-${item.id}`}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      data-testid={`delete-item-${item.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
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