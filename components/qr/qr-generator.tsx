import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/lib/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type InsertQrCode, type Restaurant } from "@shared/schema";
import { QrCode, Download } from "lucide-react";

export default function QrGenerator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<InsertQrCode>({
    restaurantId: "",
    url: "",
    style: "classic",
    size: "medium",
    foregroundColor: "#000000",
    backgroundColor: "#ffffff",
    format: "png",
  });

  const { data: restaurants } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
  });

  const generateQrMutation = useMutation({
    mutationFn: (data: InsertQrCode) => apiRequest("POST", "/api/qr-codes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/qr-codes"] });
      toast({
        title: "QR Code generated",
        description: "QR code has been successfully generated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate QR code.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.restaurantId) {
      toast({
        title: "Restaurant required",
        description: "Please select a restaurant.",
        variant: "destructive",
      });
      return;
    }
    generateQrMutation.mutate(formData);
  };

  const QrPreview = () => {
    const getPatternByStyle = () => {
      const basePattern = [...Array(64)].map((_, i) => i % 2 === 0);
      
      if (formData.style === "rounded") {
        return basePattern.map((isWhite, i) => (
          <div
            key={i}
            className={`${isWhite ? 'bg-white' : 'bg-black'} rounded`}
            style={{
              backgroundColor: isWhite ? formData.backgroundColor : formData.foregroundColor
            }}
          />
        ));
      }
      
      if (formData.style === "dots") {
        return basePattern.map((isWhite, i) => (
          <div
            key={i}
            className={`${isWhite ? 'bg-white' : 'bg-black'} rounded-full`}
            style={{
              backgroundColor: isWhite ? formData.backgroundColor : formData.foregroundColor
            }}
          />
        ));
      }
      
      return basePattern.map((isWhite, i) => (
        <div
          key={i}
          style={{
            backgroundColor: isWhite ? formData.backgroundColor : formData.foregroundColor
          }}
        />
      ));
    };

    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 text-center">
        <div 
          className="w-64 h-64 rounded-lg shadow-lg mb-6 flex items-center justify-center mx-auto"
          style={{ backgroundColor: formData.backgroundColor }}
        >
          <div className="w-48 h-48 grid grid-cols-8 gap-1 p-2">
            {getPatternByStyle()}
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">QR Code Preview</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {formData.size} • {formData.format?.toUpperCase()} • {formData.style} Style
        </p>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="flex items-center space-x-2">
          <QrCode className="w-6 h-6" />
          <span>QR Code Generator</span>
        </CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Generate and customize QR codes for restaurant menus
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generator Form */}
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="qr-generator-form">
            <div>
              <Label htmlFor="restaurant">Restaurant *</Label>
              <Select 
                value={formData.restaurantId} 
                onValueChange={(value) => setFormData({ ...formData, restaurantId: value })}
              >
                <SelectTrigger data-testid="select-restaurant">
                  <SelectValue placeholder="Select Restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants?.map((restaurant: any) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="url">Menu URL *</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://menu.example.com/restaurant-123"
                required
                data-testid="input-url"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="size">Size</Label>
                <Select 
                  value={formData.size} 
                  onValueChange={(value) => setFormData({ ...formData, size: value as any })}
                >
                  <SelectTrigger data-testid="select-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (200x200)</SelectItem>
                    <SelectItem value="medium">Medium (400x400)</SelectItem>
                    <SelectItem value="large">Large (600x600)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="format">Format</Label>
                <Select 
                  value={formData.format} 
                  onValueChange={(value) => setFormData({ ...formData, format: value as any })}
                >
                  <SelectTrigger data-testid="select-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpg">JPG</SelectItem>
                    <SelectItem value="svg">SVG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Style</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {[
                  { value: "classic", label: "Classic" },
                  { value: "rounded", label: "Rounded" },
                  { value: "dots", label: "Dots" }
                ].map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, style: style.value as any })}
                    className={`border-2 rounded-lg p-3 text-center transition-colors ${
                      formData.style === style.value
                        ? "border-primary bg-primary-50 dark:bg-primary-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:border-primary"
                    }`}
                    data-testid={`button-style-${style.value}`}
                  >
                    <div className="w-8 h-8 bg-black mx-auto mb-2 grid grid-cols-3 gap-px">
                      {[...Array(9)].map((_, i) => (
                        <div
                          key={i}
                          className={`${i % 2 === 0 ? 'bg-white' : 'bg-black'} ${
                            style.value === "rounded" ? "rounded" : 
                            style.value === "dots" ? "rounded-full" : ""
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="foreground">Foreground Color</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="color"
                    value={formData.foregroundColor}
                    onChange={(e) => setFormData({ ...formData, foregroundColor: e.target.value })}
                    className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded"
                    data-testid="input-foreground-color"
                  />
                  <Input
                    value={formData.foregroundColor}
                    onChange={(e) => setFormData({ ...formData, foregroundColor: e.target.value })}
                    className="text-sm"
                    data-testid="input-foreground-hex"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="background">Background Color</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded"
                    data-testid="input-background-color"
                  />
                  <Input
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    className="text-sm"
                    data-testid="input-background-hex"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                type="submit"
                className="flex-1"
                disabled={generateQrMutation.isPending}
                data-testid="button-generate-qr"
              >
                <QrCode className="w-4 h-4 mr-2" />
                {generateQrMutation.isPending ? "Generating..." : "Generate QR Code"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="px-6"
                data-testid="button-download-qr"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* QR Code Preview */}
          <div className="flex items-center justify-center">
            <QrPreview />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
