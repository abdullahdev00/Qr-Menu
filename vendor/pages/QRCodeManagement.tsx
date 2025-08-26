import { useState } from "react";
import { VendorLayout } from "../components/VendorLayout";
import { Button } from "../../admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { Badge } from "../../admin/components/ui/badge";
import { Input } from "../../admin/components/ui/input";
import { Label } from "../../admin/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../admin/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../admin/components/ui/dropdown-menu";
import { 
  Plus, 
  QrCode, 
  Download, 
  MoreVertical,
  Trash2, 
  Edit,
  Eye,
  Printer,
  Copy,
  Table,
  BarChart
} from "lucide-react";
import { GenerateQRForm } from "../components/GenerateQRForm";

const mockTables = [
  {
    id: "1",
    tableNumber: "Table 1",
    capacity: 4,
    location: "Indoor",
    qrGenerated: true,
    qrUrl: "https://menuqr.pk/karachi-kitchen/table/1",
    scanCount: 45,
    lastScanned: "2 hours ago"
  },
  {
    id: "2", 
    tableNumber: "Table 2",
    capacity: 2,
    location: "Indoor",
    qrGenerated: true,
    qrUrl: "https://menuqr.pk/karachi-kitchen/table/2",
    scanCount: 28,
    lastScanned: "4 hours ago"
  },
  {
    id: "3",
    tableNumber: "Table 3",
    capacity: 6,
    location: "Outdoor",
    qrGenerated: false,
    qrUrl: "",
    scanCount: 0,
    lastScanned: "Never"
  },
  {
    id: "4",
    tableNumber: "VIP 1",
    capacity: 8,
    location: "VIP",
    qrGenerated: true,
    qrUrl: "https://menuqr.pk/karachi-kitchen/table/vip1",
    scanCount: 12,
    lastScanned: "1 day ago"
  },
];

const qrTemplates = [
  {
    id: "1",
    name: "Classic Blue",
    category: "modern",
    previewImage: "/api/placeholder/150/150"
  },
  {
    id: "2",
    name: "Elegant Gold",
    category: "elegant", 
    previewImage: "/api/placeholder/150/150"
  },
  {
    id: "3",
    name: "Vibrant Green",
    category: "vibrant",
    previewImage: "/api/placeholder/150/150"
  },
];

export function QRCodeManagement() {
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You would typically show a toast notification here
  };

  const downloadQR = (tableId: string, format: string) => {
    console.log(`Downloading QR for table ${tableId} in ${format} format`);
    // Implement QR download logic
  };

  const generateBulkQR = () => {
    console.log("Generating QR codes for all tables");
    // Implement bulk QR generation
  };

  return (
    <VendorLayout restaurantName="Karachi Kitchen" ownerName="Ahmed Ali">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              QR Code Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Generate and manage QR codes for your restaurant tables
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={generateBulkQR} data-testid="bulk-generate-button">
              <QrCode className="w-4 h-4 mr-2" />
              Bulk Generate
            </Button>
            <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
              <DialogTrigger asChild>
                <Button data-testid="generate-qr-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Generate QR Code
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Generate QR Code</DialogTitle>
                  <DialogDescription>
                    Create a QR code for your restaurant table
                  </DialogDescription>
                </DialogHeader>
                <GenerateQRForm 
                  tables={mockTables}
                  templates={qrTemplates}
                  onClose={() => setShowGenerateDialog(false)} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Tables
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockTables.length}
                  </p>
                </div>
                <Table className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    QR Generated
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockTables.filter(t => t.qrGenerated).length}
                  </p>
                </div>
                <QrCode className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Scans
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockTables.reduce((sum, table) => sum + table.scanCount, 0)}
                  </p>
                </div>
                <BarChart className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Avg Scans/Table
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(mockTables.reduce((sum, table) => sum + table.scanCount, 0) / mockTables.length)}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTables.map((table) => (
            <Card key={table.id} className="relative">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{table.tableNumber}</CardTitle>
                    <CardDescription>
                      {table.capacity} seats • {table.location}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" data-testid={`table-menu-${table.id}`}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {}}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Table
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {}}>
                        <BarChart className="h-4 w-4 mr-2" />
                        View Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {}} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Table
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-2">
                  {table.qrGenerated ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      QR Generated
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      No QR Code
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {table.qrGenerated ? (
                  <>
                    {/* QR Code Preview */}
                    <div className="flex justify-center">
                      <div className="w-32 h-32 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                        <QrCode className="h-24 w-24 text-gray-400" />
                      </div>
                    </div>

                    {/* QR Stats */}
                    <div className="text-center space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {table.scanCount} scans
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Last scanned: {table.lastScanned}
                      </p>
                    </div>

                    {/* QR URL */}
                    <div className="space-y-2">
                      <Label className="text-xs">QR URL</Label>
                      <div className="flex space-x-2">
                        <Input
                          value={table.qrUrl}
                          readOnly
                          className="text-xs"
                          data-testid={`qr-url-${table.id}`}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(table.qrUrl)}
                          data-testid={`copy-url-${table.id}`}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadQR(table.id, 'png')}
                        data-testid={`download-${table.id}`}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadQR(table.id, 'pdf')}
                        data-testid={`print-${table.id}`}
                      >
                        <Printer className="h-3 w-3 mr-1" />
                        Print
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <QrCode className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      No QR code generated for this table
                    </p>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedTable(table.id);
                        setShowGenerateDialog(true);
                      }}
                      data-testid={`generate-${table.id}`}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Generate QR
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* QR Templates Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Available QR Templates</CardTitle>
            <CardDescription>
              Choose from our professional QR code designs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {qrTemplates.map((template) => (
                <div key={template.id} className="text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg mb-2 flex items-center justify-center mx-auto">
                    <QrCode className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-xs font-medium">{template.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{template.category}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
}