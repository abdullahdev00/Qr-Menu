import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TemplateCard from "@/components/templates/template-card";
import { Plus } from "lucide-react";
import { type MenuTemplate } from "@shared/schema";

export default function MenuTemplates() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: templates, isLoading } = useQuery<MenuTemplate[]>({
    queryKey: ["/api/menu-templates"],
  });

  const categories = [
    { id: "all", name: "All Templates" },
    { id: "modern", name: "Modern" },
    { id: "traditional", name: "Traditional" },
    { id: "minimal", name: "Minimal" },
    { id: "fastfood", name: "Fast Food" },
  ];

  const filteredTemplates = templates?.filter((template: any) => 
    selectedCategory === "all" || template.category === selectedCategory
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Menu Templates</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Pre-designed templates for restaurant menus
          </p>
        </div>
        <Button data-testid="button-add-template">
          <Plus className="w-4 h-4 mr-2" />
          Add Template
        </Button>
      </div>

      {/* Category Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                data-testid={`button-category-${category.id}`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template: any) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}
