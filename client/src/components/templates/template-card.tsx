import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Download } from "lucide-react";
import { type MenuTemplate } from "@shared/schema";

interface TemplateCardProps {
  template: MenuTemplate;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  const getCategoryBadge = (category: string) => {
    const colors = {
      modern: "bg-blue-100 text-blue-800",
      traditional: "bg-amber-100 text-amber-800",
      minimal: "bg-gray-100 text-gray-800",
      fastfood: "bg-red-100 text-red-800",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getPreviewPattern = (category: string) => {
    switch (category) {
      case "modern":
        return (
          <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-inner p-3 text-xs">
            <div className="text-center mb-2">
              <div className="h-2 bg-primary rounded mb-1"></div>
              <div className="h-1 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mx-auto"></div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <div className="h-1 bg-gray-400 dark:bg-gray-500 rounded w-1/2"></div>
                <div className="h-1 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
              </div>
              <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        );
      case "traditional":
        return (
          <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-inner p-3 text-xs border-2 border-amber-200 dark:border-amber-700">
            <div className="text-center mb-2">
              <div className="h-2 bg-amber-600 rounded mb-1"></div>
              <div className="h-1 bg-amber-300 rounded w-2/3 mx-auto"></div>
            </div>
            <div className="space-y-1 border-t border-amber-200 dark:border-amber-700 pt-2">
              <div className="flex justify-between">
                <div className="h-1 bg-gray-600 dark:bg-gray-400 rounded w-1/2"></div>
                <div className="h-1 bg-amber-400 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        );
      case "minimal":
        return (
          <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-inner p-3 text-xs border border-gray-100 dark:border-gray-700">
            <div className="text-center mb-3">
              <div className="h-1 bg-gray-800 dark:bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="space-y-2">
              <div className="h-1 bg-gray-800 dark:bg-gray-200 rounded w-1/3"></div>
              <div className="h-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex justify-between">
                <div className="h-1 bg-gray-600 dark:bg-gray-400 rounded w-2/5"></div>
                <div className="h-1 bg-gray-400 dark:bg-gray-500 rounded w-1/5"></div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-inner p-3 text-xs">
            <div className="text-center mb-2">
              <div className="h-2 bg-red-500 rounded mb-1"></div>
              <div className="h-1 bg-yellow-400 rounded w-3/4 mx-auto"></div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="bg-red-100 dark:bg-red-900/30 rounded p-1">
                <div className="h-3 bg-red-200 dark:bg-red-800 rounded mb-1"></div>
                <div className="h-1 bg-red-400 rounded"></div>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded p-1">
                <div className="h-3 bg-yellow-200 dark:bg-yellow-800 rounded mb-1"></div>
                <div className="h-1 bg-yellow-400 rounded"></div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="overflow-hidden" data-testid={`template-card-${template.id}`}>
      <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 p-4">
        {getPreviewPattern(template.category)}
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900 dark:text-white">{template.name}</h3>
          <Badge className={getCategoryBadge(template.category)}>
            {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {template.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Used by <span className="font-medium">{template.usageCount}</span> restaurants
          </span>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-600 hover:text-primary-700"
              data-testid={`button-preview-${template.id}`}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-secondary-600 hover:text-secondary-700"
              data-testid={`button-edit-${template.id}`}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-700"
              data-testid={`button-download-${template.id}`}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
