import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  QrCode, 
  Download, 
  Eye, 
  Copy, 
  Share2, 
  Settings,
  Palette,
  RefreshCw,
  Plus,
  Edit3
} from 'lucide-react'
// Import custom QR image
const customQrImageUrl = '/attached_assets/custom-qr-template.jpeg'
import { Button } from '../../admin/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../admin/components/ui/card'
import { Badge } from '../../admin/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../admin/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../admin/components/ui/dialog'
import { Input } from '../../admin/components/ui/input'
import { Label } from '../../admin/components/ui/label'
import { Separator } from '../../admin/components/ui/separator'
import { useToast } from '../../admin/hooks/use-toast'
import { getCurrentUser } from '../../admin/lib/auth'

export default function QRCodesPage() {
  const [selectedSize, setSelectedSize] = useState('medium')
  const [selectedStyle, setSelectedStyle] = useState('square')
  const [isGenerating, setIsGenerating] = useState(false)
  const [editingTable, setEditingTable] = useState<string | null>(null)
  const [editTableNumber, setEditTableNumber] = useState('')
  const { toast } = useToast()
  
  const user = getCurrentUser()
  // Get restaurant slug from URL path
  const getRestaurantSlug = () => {
    const path = window.location.pathname;
    const pathParts = path.split('/');
    return pathParts[1] || 'al-baik-restaurant'; // Default to first restaurant
  };
  
  const restaurantSlug = getRestaurantSlug();

  // Fetch QR codes from API
  const { data: qrCodesData, isLoading, refetch } = useQuery({
    queryKey: ['qr-codes', restaurantSlug],
    queryFn: async () => {
      // First get restaurant ID by slug
      const restaurantsResponse = await fetch('/api/restaurants');
      const restaurantsData = await restaurantsResponse.json();
      
      // Handle direct array response from API
      const restaurantsList = Array.isArray(restaurantsData) ? restaurantsData : restaurantsData.restaurants;
      
      if (!restaurantsList || !Array.isArray(restaurantsList)) {
        throw new Error('Failed to fetch restaurants - invalid response format');
      }
      
      const restaurant = restaurantsList.find((r: any) => r.slug === restaurantSlug);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      
      // Then fetch QR codes for this restaurant
      const qrResponse = await fetch(`/api/qr-codes?restaurantId=${restaurant.id}`);
      const qrData = await qrResponse.json();
      
      // Handle QR codes response - might be direct array or wrapped object
      const qrCodesList = Array.isArray(qrData) ? qrData : (qrData.success ? qrData.qrCodes : qrData.data);
      
      return qrCodesList || [];
    },
    enabled: !!restaurantSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const qrCodes = qrCodesData || [];

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: "URL Copied!",
      description: "Menu URL has been copied to clipboard",
    })
  }

  // Generate QR code for preview (without downloading)
  const handleGenerateQR = async (qrCode: any) => {
    setIsGenerating(true)
    
    try {
      // Generate QR code using API
      const response = await fetch('/api/qr-codes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantSlug: restaurantSlug,
          tableNumber: qrCode.tableNumber,
          useCustomDesign: true, // Use your beautiful design
          customization: {
            colors: {
              primary: '#b08968',
              secondary: '#2a2a2a',
              qrForeground: '#000000',
              qrBackground: '#ffffff'
            },
            text: {
              restaurantName: 'Restaurant Menu',
              tableNumber: qrCode.tableNumber ? `Table ${qrCode.tableNumber}` : '',
              instructions: 'Scan for Digital Menu',
              language: 'english'
            },
            template: {
              id: 'custom_beautiful_design',
              category: 'premium',
              layout: {}
            }
          },
          size: selectedSize,
          format: 'png'
        }),
      })
      
      if (response.ok) {
        // Show QR code in preview instead of downloading
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setShowGeneratedQR(url)
        setGeneratedQRData({ blob, name: qrCode.name })
        
        toast({
          title: "QR Code Generated!",
          description: `${qrCode.name} has been generated successfully`,
        })
      } else {
        throw new Error('Failed to generate QR code')
      }
    } catch (error) {
      console.error('QR generation error:', error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive"
      })
    }
    
    setIsGenerating(false)
  }

  // Download the generated QR code
  const handleDownloadQR = () => {
    if (generatedQRData) {
      const url = URL.createObjectURL(generatedQRData.blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${generatedQRData.name.replace(/\s+/g, '_')}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: "QR Code Downloaded!",
        description: `${generatedQRData.name} has been downloaded`,
      })
    }
  }

  const [qrPreviewData, setQrPreviewData] = useState<{[key: string]: string}>({})
  const [showGeneratedQR, setShowGeneratedQR] = useState<string | null>(null)
  const [generatedQRData, setGeneratedQRData] = useState<{blob: Blob, name: string} | null>(null)

  // Generate QR code preview image
  const getQRCodeImage = (qrCode: any) => {
    const cacheKey = `${qrCode.type}-${qrCode.tableNumber || 'menu'}`;
    
    if (qrPreviewData[cacheKey]) {
      return qrPreviewData[cacheKey];
    }
    
    // Fetch preview data
    fetch(`/api/qr-codes/generate?preview=true&restaurantSlug=${restaurantSlug}&tableNumber=${qrCode.tableNumber || ''}&size=small`)
      .then(response => response.json())
      .then(data => {
        if (data.success && data.dataUrl) {
          setQrPreviewData(prev => ({
            ...prev,
            [cacheKey]: data.dataUrl
          }));
        }
      })
      .catch(console.error);
    
    // Return placeholder while loading
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDEwIDEwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUiIHk9IjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxLjIiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjQiPkxvYWRpbmc8L3RleHQ+PC9zdmc+';
  }

  const handleUpdateTableNumber = async (qrId: string, newTableNumber: number) => {
    try {
      const response = await fetch(`/api/qr-codes/${qrId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableNumber: newTableNumber,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        refetch(); // Refresh the QR codes list
        setEditingTable(null);
        toast({
          title: "Table Number Updated!",
          description: `QR code updated for Table ${newTableNumber}`,
        });
      } else {
        throw new Error(data.error || 'Failed to update table number');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update table number. Please try again.",
        variant: "destructive"
      });
    }
  }

  const startEditingTable = (qrCode: any) => {
    setEditingTable(qrCode.id)
    setEditTableNumber(qrCode.tableNumber?.toString() || '')
  }

  // Comprehensive Skeleton Loading Component
  const QRCodesSkeleton = () => (
    <div className="p-3 sm:p-6 space-y-6 overflow-hidden">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 overflow-hidden">
        <div className="flex-1 min-w-0">
          <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-48"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-80 mt-2 hidden sm:block"></div>
        </div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-32 sm:w-40 shrink-0"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* QR Codes Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="overflow-hidden animate-pulse">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
              </div>
              <div className="space-y-2 mt-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </CardHeader>
            <CardContent>
              {/* QR Code Image Skeleton */}
              <div className="flex justify-center mb-4">
                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              </div>
              
              {/* Action Buttons Skeleton */}
              <div className="grid grid-cols-2 gap-2">
                <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loading Text with Icon */}
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm animate-pulse">Loading QR codes...</p>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <QRCodesSkeleton />;
  }

  return (
    <div className="p-3 sm:p-6 space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 overflow-hidden">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
            <span className="hidden sm:inline">QR Codes</span>
            <span className="sm:hidden">QR Codes</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm truncate hidden sm:block">
            Generate and manage QR codes for your restaurant menu and tables
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 px-2 sm:px-4 py-2 shrink-0">
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Generate New QR</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Generate New QR Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="qr-type">QR Code Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="menu">Full Menu</SelectItem>
                    <SelectItem value="table">Table Specific</SelectItem>
                    <SelectItem value="category">Menu Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="qr-name">QR Code Name</Label>
                <Input placeholder="e.g., Table 5 QR" />
              </div>
              
              <div>
                <Label htmlFor="table-number">Table Number (for Table QR)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 5" 
                  min="1"
                />
              </div>
              
              {/* Custom QR Preview */}
              <div className="flex justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="relative">
                  <img 
                    src={customQrImageUrl} 
                    alt="QR Code Preview"
                    className="w-32 h-32 border-2 border-gray-200 dark:border-gray-700 rounded object-cover"
                  />
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-white/90 px-2 py-1 rounded text-xs font-bold">
                    Preview
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="qr-size">Size</Label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (150x150)</SelectItem>
                    <SelectItem value="medium">Medium (300x300)</SelectItem>
                    <SelectItem value="large">Large (500x500)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="w-full" 
                disabled={isGenerating}
                onClick={async () => {
                  setIsGenerating(true);
                  try {
                    // Get form values
                    const qrType = (document.querySelector('[placeholder="Select type"]') as HTMLInputElement)?.value || 'menu';
                    const qrName = (document.querySelector('[placeholder="e.g., Table 5 QR"]') as HTMLInputElement)?.value || 'New QR Code';
                    const tableNumber = (document.querySelector('[placeholder="e.g., 5"]') as HTMLInputElement)?.value;
                    
                    // Get restaurant data
                    const restaurantsResponse = await fetch('/api/restaurants');
                    const restaurantsData = await restaurantsResponse.json();
                    
                    // Handle direct array response from API
                    const restaurantsList = Array.isArray(restaurantsData) ? restaurantsData : restaurantsData.restaurants;
                    
                    if (!restaurantsList || !Array.isArray(restaurantsList)) {
                      throw new Error('Failed to fetch restaurants - invalid response format');
                    }
                    
                    const restaurant = restaurantsList.find((r: any) => r.slug === restaurantSlug);
                    
                    if (!restaurant) {
                      throw new Error('Restaurant not found');
                    }
                    
                    // Create QR code
                    const response = await fetch('/api/qr-codes', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        restaurantId: restaurant.id,
                        tableNumber: tableNumber || null,
                        name: qrName,
                        customization: {
                          colors: {
                            primary: '#b08968',
                            secondary: '#2a2a2a'
                          }
                        }
                      }),
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                      toast({
                        title: "QR Code Created!",
                        description: `${qrName} has been created successfully`,
                      });
                      refetch(); // Refresh the QR codes list
                    } else {
                      throw new Error(data.error || 'Failed to create QR code');
                    }
                  } catch (error) {
                    console.error('QR creation error:', error);
                    toast({
                      title: "Creation Failed",
                      description: "Failed to create QR code. Please try again.",
                      variant: "destructive"
                    });
                  }
                  setIsGenerating(false);
                }}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" />
                    Generate QR Code
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total QR Codes</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qrCodes.length}</div>
            <p className="text-xs text-muted-foreground">Active codes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qrCodes.reduce((acc: number, qr: any) => acc + qr.scans, 0)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {qrCodes.reduce((max: any, qr: any) => qr.scans > max.scans ? qr : max, qrCodes[0])?.name}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.max(...qrCodes.map((qr: any) => qr.scans))}</div>
            <p className="text-xs text-muted-foreground">scans</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <div className="text-green-600 font-semibold">98.5%</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Excellent</div>
            <p className="text-xs text-muted-foreground">QR performance</p>
          </CardContent>
        </Card>
      </div>

      {/* QR Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {qrCodes.map((qrCode: any) => (
          <Card key={qrCode.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{qrCode.name}</CardTitle>
                <Badge variant={qrCode.isActive ? "default" : "secondary"}>
                  {qrCode.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription>
                Type: {qrCode.type} • Scans: {qrCode.scans} • Created: {qrCode.createdAt}
                {qrCode.type === 'table' && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm">Table Number:</span>
                    {editingTable === qrCode.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editTableNumber}
                          onChange={(e) => setEditTableNumber(e.target.value)}
                          className="w-20 h-6 text-xs"
                          min="1"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handleUpdateTableNumber(qrCode.id, parseInt(editTableNumber))}
                          className="h-6 px-2 text-xs"
                        >
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingTable(null)}
                          className="h-6 px-2 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Table {qrCode.tableNumber}</Badge>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => startEditingTable(qrCode)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* QR Code Preview */}
              <div className="flex justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg relative">
                <div className="relative">
                  <img 
                    src={getQRCodeImage(qrCode)} 
                    alt={`QR Code for ${qrCode.name}`}
                    className="w-32 h-32 border-2 border-gray-200 dark:border-gray-700 rounded object-cover"
                  />
                  {qrCode.type === 'table' && qrCode.tableNumber && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-white/90 px-2 py-1 rounded text-xs font-bold">
                      Table {qrCode.tableNumber}
                    </div>
                  )}
                </div>
              </div>
              
              {/* URL */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 break-all font-mono">
                  {qrCode.url}
                </p>
              </div>
              
              <Separator />
              
              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleGenerateQR(qrCode)}
                  disabled={isGenerating}
                  data-testid={`generate-qr-${qrCode.id}`}
                >
                  <QrCode className="w-4 h-4 mr-1" />
                  {isGenerating ? 'Generating...' : 'Generate'}
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={async () => {
                    await handleGenerateQR(qrCode);
                    // Auto download after generation
                    setTimeout(() => {
                      handleDownloadQR();
                    }, 500);
                  }}
                  disabled={isGenerating}
                  data-testid={`download-qr-${qrCode.id}`}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleCopyUrl(qrCode.url)}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy URL
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(qrCode.url, '_blank')}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                
                <Button size="sm" variant="outline">
                  <Settings className="w-4 h-4 mr-1" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Best Practices:</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Place QR codes at eye level on tables</li>
                <li>• Use high contrast colors for better scanning</li>
                <li>• Test QR codes regularly to ensure they work</li>
                <li>• Include brief instructions near QR codes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Size Guidelines:</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Minimum size: 2cm x 2cm for table displays</li>
                <li>• Recommended: 5cm x 5cm for better visibility</li>
                <li>• Large prints: 10cm x 10cm for wall mounting</li>
                <li>• Always maintain white border around QR code</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Preview Modal */}
      {showGeneratedQR && (
        <Dialog open={!!showGeneratedQR} onOpenChange={() => {
          setShowGeneratedQR(null);
          if (showGeneratedQR) {
            URL.revokeObjectURL(showGeneratedQR);
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generated QR Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <img 
                  src={showGeneratedQR} 
                  alt="Generated QR Code"
                  className="w-64 h-auto border-2 border-gray-200 dark:border-gray-700 rounded"
                />
              </div>
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline"
                  onClick={handleDownloadQR}
                  disabled={!generatedQRData}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowGeneratedQR(null);
                    if (showGeneratedQR) {
                      URL.revokeObjectURL(showGeneratedQR);
                    }
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}