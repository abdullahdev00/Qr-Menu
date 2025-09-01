import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { 
  QrCode, Download, Eye, Edit, Trash2, Plus, 
  Search, Filter, MoreHorizontal, Settings,
  Scan, Link, Table as TableIcon, Menu, Store
} from 'lucide-react';

interface QrCodeData {
  id: string;
  name: string;
  type: 'menu' | 'table';
  tableNumber: string | null;
  url: string;
  scans: number;
  createdAt: string;
  isActive: boolean;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

export default function QrCodesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedQrCodes, setSelectedQrCodes] = useState<string[]>([]);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [previewQrCode, setPreviewQrCode] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get restaurant ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>(urlParams.get('restaurant') || '');

  // Fetch restaurants for selection
  const { data: restaurants, isLoading: restaurantsLoading } = useQuery({
    queryKey: ['/api/restaurants'],
    enabled: true
  });

  // Fetch QR codes for selected restaurant
  const { data: qrCodesData, isLoading: qrCodesLoading } = useQuery({
    queryKey: ['/api/qr-codes', selectedRestaurant],
    enabled: !!selectedRestaurant
  });

  // Create QR code mutation
  const createQrMutation = useMutation({
    mutationFn: async (data: { restaurantId: string; tableNumber?: string; customization?: any; name?: string }) => {
      const response = await fetch('/api/qr-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to create QR code');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qr-codes', selectedRestaurant] });
      toast({ title: 'QR Code created successfully!' });
      setIsGenerateDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Failed to create QR code', description: error.message, variant: 'destructive' });
    }
  });

  // Toggle QR code active status
  const toggleQrCodeMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetch(`/api/qr-codes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      if (!response.ok) {
        throw new Error('Failed to update QR code status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qr-codes', selectedRestaurant] });
      toast({ title: 'QR Code status updated!' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update status', description: error.message, variant: 'destructive' });
    }
  });

  // Delete QR code mutation
  const deleteQrCodeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/qr-codes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete QR code');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qr-codes', selectedRestaurant] });
      toast({ title: 'QR Code deleted successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete QR code', description: error.message, variant: 'destructive' });
    }
  });

  const qrCodes = (qrCodesData as any)?.qrCodes || [];
  const filteredQrCodes = qrCodes.filter((qr: QrCodeData) => {
    const matchesSearch = qr.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || qr.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const selectedRestaurantData = (restaurants as any)?.find((r: Restaurant) => r.id === selectedRestaurant);

  const handleGenerateQrCode = async (formData: FormData) => {
    if (!selectedRestaurant) {
      toast({ title: 'Please select a restaurant first', variant: 'destructive' });
      return;
    }
    
    const tableNumber = formData.get('tableNumber') as string;
    const qrForeground = formData.get('qrForeground') as string;
    const qrBackground = formData.get('qrBackground') as string;
    const size = formData.get('size') as string;
    
    await createQrMutation.mutateAsync({
      restaurantId: selectedRestaurant,
      tableNumber: tableNumber || undefined,
      customization: {
        colors: {
          qrForeground: qrForeground || '#000000',
          qrBackground: qrBackground || '#ffffff'
        },
        size: size || 'medium'
      }
    });
  };

  const handlePreviewQrCode = async (qrCode: QrCodeData) => {
    if (!selectedRestaurantData) return;
    
    try {
      const response = await fetch('/api/qr-codes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantSlug: selectedRestaurantData.slug,
          tableNumber: qrCode.tableNumber,
          preview: true
        })
      });
      const data = await response.json();
      setPreviewQrCode(data.dataUrl);
    } catch (error) {
      toast({ title: 'Failed to preview QR code', variant: 'destructive' });
    }
  };

  const handleDownloadQrCode = async (qrCode: QrCodeData) => {
    if (!selectedRestaurantData) return;
    
    try {
      // Use your beautiful custom design for download
      const response = await fetch('/api/qr-codes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantSlug: selectedRestaurantData.slug,
          tableNumber: qrCode.tableNumber,
          useCustomDesign: true, // Use your beautiful design
          size: 'large',
          format: 'png'
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qr_${selectedRestaurantData.slug}_table_${qrCode.tableNumber || 'menu'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({ title: 'QR Code downloaded successfully!' });
      } else {
        throw new Error('Failed to generate QR code');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({ 
        title: 'Download failed', 
        description: 'Failed to download QR code. Please try again.',
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className="space-y-6" data-testid="qr-codes-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">QR Code Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate and manage QR codes for restaurant menus
          </p>
        </div>
      </div>

      {/* Restaurant Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Select Restaurant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
            <SelectTrigger data-testid="select-restaurant">
              <SelectValue placeholder="Choose a restaurant..." />
            </SelectTrigger>
            <SelectContent>
              {restaurantsLoading ? (
                <SelectItem value="loading" disabled>Loading restaurants...</SelectItem>
              ) : (
                (restaurants as any)?.map((restaurant: Restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id}>
                    {restaurant.name} ({restaurant.slug})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedRestaurant && (
        <>
          {/* Controls */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search QR codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search-qr"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40" data-testid="select-type-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="menu">Menu QR</SelectItem>
                  <SelectItem value="table">Table QR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-generate-qr">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate QR Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate QR Code</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  handleGenerateQrCode(formData);
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Table Number (Optional)</label>
                      <Input name="tableNumber" placeholder="Leave empty for main menu QR" />
                      <p className="text-xs text-gray-500 mt-1">
                        Main menu QR shows all items, table QR shows table-specific ordering
                      </p>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-3">QR Code Customization</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-600">Foreground Color</label>
                          <Input 
                            type="color" 
                            name="qrForeground" 
                            defaultValue="#000000"
                            className="h-10 w-full"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Background Color</label>
                          <Input 
                            type="color" 
                            name="qrBackground" 
                            defaultValue="#ffffff"
                            className="h-10 w-full"
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="text-xs text-gray-600">Size</label>
                        <Select name="size">
                          <SelectTrigger>
                            <SelectValue placeholder="Medium" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small (300px)</SelectItem>
                            <SelectItem value="medium">Medium (500px)</SelectItem>
                            <SelectItem value="large">Large (700px)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="mt-4">
                    <Button type="button" variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createQrMutation.isPending}>
                      {createQrMutation.isPending ? 'Generating...' : 'Generate QR'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* QR Codes Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Codes ({filteredQrCodes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {qrCodesLoading ? (
                <div className="text-center py-8">Loading QR codes...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>QR Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Scans</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQrCodes.map((qrCode: QrCodeData) => (
                      <TableRow key={qrCode.id} data-testid={`qr-row-${qrCode.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {qrCode.type === 'menu' ? <Menu className="h-4 w-4" /> : <TableIcon className="h-4 w-4" />}
                            {qrCode.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={qrCode.type === 'menu' ? 'default' : 'secondary'}>
                            {qrCode.type === 'menu' ? 'Menu' : 'Table'}
                          </Badge>
                        </TableCell>
                        <TableCell>{qrCode.tableNumber || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Scan className="h-3 w-3" />
                            {qrCode.scans}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={qrCode.isActive ? 'default' : 'secondary'}
                            className={qrCode.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                          >
                            {qrCode.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{qrCode.createdAt}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePreviewQrCode(qrCode)}
                              data-testid={`button-preview-${qrCode.id}`}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadQrCode(qrCode)}
                              data-testid={`button-download-${qrCode.id}`}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleQrCodeMutation.mutate({ 
                                id: qrCode.id, 
                                isActive: !qrCode.isActive 
                              })}
                              data-testid={`button-toggle-${qrCode.id}`}
                              title={qrCode.isActive ? 'Deactivate' : 'Activate'}
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this QR code?')) {
                                  deleteQrCodeMutation.mutate(qrCode.id);
                                }
                              }}
                              data-testid={`button-delete-${qrCode.id}`}
                              title="Delete QR Code"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              
              {!qrCodesLoading && filteredQrCodes.length === 0 && (
                <div className="text-center py-8">
                  <QrCode className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No QR codes found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedRestaurant ? 'Generate your first QR code for this restaurant' : 'Select a restaurant to view QR codes'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Code Preview Dialog */}
          {previewQrCode && (
            <Dialog open={!!previewQrCode} onOpenChange={() => setPreviewQrCode(null)}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>QR Code Preview</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center py-4">
                  <img src={previewQrCode} alt="QR Code Preview" className="max-w-full h-auto" />
                </div>
                <DialogFooter>
                  <Button onClick={() => setPreviewQrCode(null)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </div>
  );
}