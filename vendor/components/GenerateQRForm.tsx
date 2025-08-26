import { useState } from "react";
import { Button } from "../../admin/components/ui/button";
import { Input } from "../../admin/components/ui/input";
import { Label } from "../../admin/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../admin/components/ui/select";
import { Card, CardContent } from "../../admin/components/ui/card";
import { Badge } from "../../admin/components/ui/badge";
import { QrCode, Upload, Palette } from "lucide-react";

interface Table {
  id: string;
  tableNumber: string;
  capacity: number;
  location: string;
  qrGenerated: boolean;
}

interface Template {
  id: string;
  name: string;
  category: string;
  previewImage: string;
}

interface GenerateQRFormProps {
  tables: Table[];
  templates: Template[];
  onClose: () => void;
}

export function GenerateQRForm({ tables, templates, onClose }: GenerateQRFormProps) {
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [customLogo, setCustomLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [customization, setCustomization] = useState({
    primaryColor: "#3B82F6",
    backgroundColor: "#FFFFFF", 
    logoSize: "medium",
    cornerRadius: "medium"
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomLogo(file);
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomizationChange = (field: string, value: string) => {
    setCustomization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerate = (format: string) => {
    const formData = {
      tableId: selectedTable,
      templateId: selectedTemplate,
      customLogo,
      customization,
      format
    };
    console.log("Generating QR with:", formData);
    // Implement QR generation logic
    onClose();
  };

  const availableTables = tables.filter(table => !table.qrGenerated);

  return (
    <div className="space-y-6">
      {/* Table Selection */}
      <div className="space-y-2">
        <Label>Select Table *</Label>
        <Select value={selectedTable} onValueChange={setSelectedTable} required>
          <SelectTrigger data-testid="select-table">
            <SelectValue placeholder="Choose a table" />
          </SelectTrigger>
          <SelectContent>
            {availableTables.map((table) => (
              <SelectItem key={table.id} value={table.id}>
                {table.tableNumber} - {table.capacity} seats ({table.location})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {availableTables.length === 0 && (
          <p className="text-sm text-amber-600">
            All tables already have QR codes generated
          </p>
        )}
      </div>

      {/* Template Selection */}
      <div className="space-y-3">
        <Label>Choose QR Template *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer border-2 transition-colors ${
                selectedTemplate === template.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTemplate(template.id)}
              data-testid={`template-${template.id}`}
            >
              <CardContent className="p-3 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg mb-2 flex items-center justify-center mx-auto">
                  <QrCode className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-sm font-medium">{template.name}</p>
                <Badge variant="outline" className="text-xs mt-1">
                  {template.category}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Customization Options */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-4 flex items-center">
            <Palette className="w-4 h-4 mr-2" />
            Customization
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Color */}
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={customization.primaryColor}
                  onChange={(e) => handleCustomizationChange("primaryColor", e.target.value)}
                  className="w-16 h-10"
                  data-testid="primary-color-picker"
                />
                <Input
                  value={customization.primaryColor}
                  onChange={(e) => handleCustomizationChange("primaryColor", e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={customization.backgroundColor}
                  onChange={(e) => handleCustomizationChange("backgroundColor", e.target.value)}
                  className="w-16 h-10"
                  data-testid="background-color-picker"
                />
                <Input
                  value={customization.backgroundColor}
                  onChange={(e) => handleCustomizationChange("backgroundColor", e.target.value)}
                  placeholder="#FFFFFF"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Logo Size */}
            <div className="space-y-2">
              <Label>Logo Size</Label>
              <Select
                value={customization.logoSize}
                onValueChange={(value) => handleCustomizationChange("logoSize", value)}
              >
                <SelectTrigger data-testid="logo-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Corner Radius */}
            <div className="space-y-2">
              <Label>Corner Style</Label>
              <Select
                value={customization.cornerRadius}
                onValueChange={(value) => handleCustomizationChange("cornerRadius", value)}
              >
                <SelectTrigger data-testid="corner-radius">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sharp">Sharp</SelectItem>
                  <SelectItem value="medium">Rounded</SelectItem>
                  <SelectItem value="full">Fully Rounded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Logo Upload */}
          <div className="mt-4 space-y-2">
            <Label>Custom Logo (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              {logoPreview ? (
                <div className="text-center">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-16 h-16 object-contain mx-auto mb-2"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCustomLogo(null);
                      setLogoPreview("");
                    }}
                  >
                    Remove Logo
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Upload your logo
                    </span>
                    <input
                      id="logo-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      data-testid="logo-upload"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {selectedTable && selectedTemplate && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Preview</h4>
            <div className="text-center">
              <div 
                className="w-32 h-32 rounded-lg mx-auto mb-2 flex items-center justify-center border-2"
                style={{
                  backgroundColor: customization.backgroundColor,
                  borderColor: customization.primaryColor
                }}
              >
                <QrCode 
                  className="h-24 w-24" 
                  style={{ color: customization.primaryColor }}
                />
              </div>
              <p className="text-sm text-gray-600">
                QR Code for {tables.find(t => t.id === selectedTable)?.tableNumber}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onClose} data-testid="cancel-qr">
          Cancel
        </Button>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleGenerate('png')}
            disabled={!selectedTable || !selectedTemplate}
            data-testid="generate-png"
          >
            Generate PNG
          </Button>
          <Button
            type="button"
            onClick={() => handleGenerate('pdf')}
            disabled={!selectedTable || !selectedTemplate}
            data-testid="generate-pdf"
          >
            Generate PDF
          </Button>
        </div>
      </div>
    </div>
  );
}