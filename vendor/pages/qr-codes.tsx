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
  Edit3,
  Trash2,
  AlertTriangle,
  Check
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
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [selectedQrCode, setSelectedQrCode] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
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

  const handleCopyUrl = (url: string, qrCodeId: string) => {
    navigator.clipboard.writeText(url)
    
    // Set button as copied
    setCopiedButtons(prev => ({
      ...prev,
      [qrCodeId]: true
    }))
    
    // Reset back to original after 2 seconds
    setTimeout(() => {
      setCopiedButtons(prev => ({
        ...prev,
        [qrCodeId]: false
      }))
    }, 2000)
    
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
  const [copiedButtons, setCopiedButtons] = useState<{[key: string]: boolean}>({})

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



  const handleDeleteQR = async (qrId: string) => {
    try {
      const response = await fetch(`/api/qr-codes/${qrId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        refetch(); // Refresh the QR codes list
        setShowDeleteDialog(false);
        setSelectedQrCode(null);
        toast({
          title: "QR Code Deleted!",
          description: "QR code has been permanently deleted.",
        });
      } else {
        throw new Error(data.error || 'Failed to delete QR code');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete QR code. Please try again.",
        variant: "destructive"
      });
    }
  }

  const handleToggleActive = async (qrId: string, isActive: boolean) => {
    try {
      console.log(`🔄 Toggling QR code ${qrId} from ${isActive} to ${!isActive}`);
      
      const response = await fetch(`/api/qr-codes/${qrId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !isActive,
        }),
      });

      console.log(`📡 Toggle response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`📡 Toggle response data:`, data);
      
      if (data.success) {
        refetch(); // Refresh the QR codes list
        toast({
          title: !isActive ? "QR Code Activated!" : "QR Code Deactivated!",
          description: `QR code is now ${!isActive ? 'active' : 'inactive'}.`,
        });
      } else {
        throw new Error(data.error || 'Failed to update QR code status');
      }
    } catch (error) {
      console.error('Toggle active error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update QR code status. Please try again.",
        variant: "destructive"
      });
    }
  }

  const openSettingsDialog = (qrCode: any) => {
    setSelectedQrCode(qrCode);
    setShowSettingsDialog(true);
  }

  const openDeleteDialog = (qrCode: any) => {
    setSelectedQrCode(qrCode);
    setShowDeleteDialog(true);
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
                    <Badge variant="outline">Table {qrCode.tableNumber}</Badge>
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
                  onClick={() => handleCopyUrl(qrCode.url, qrCode.id)}
                  className={copiedButtons[qrCode.id] ? "bg-green-50 text-green-600 border-green-200" : ""}
                >
                  {copiedButtons[qrCode.id] ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy URL
                    </>
                  )}
                </Button>
                
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => openSettingsDialog(qrCode)}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Settings
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => openDeleteDialog(qrCode)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
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


      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              QR Code Settings
            </DialogTitle>
          </DialogHeader>
          {selectedQrCode && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-2">{selectedQrCode.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedQrCode.type === 'table' ? `Table ${selectedQrCode.tableNumber}` : 'Full Menu'} QR Code
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Scans: {selectedQrCode.scans} • Created: {selectedQrCode.createdAt}
                </p>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h5 className="font-medium">QR Code Status</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedQrCode.isActive ? 'Active - customers can scan and access' : 'Inactive - customers cannot access'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={selectedQrCode.isActive ? "default" : "secondary"}>
                    {selectedQrCode.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowSettingsDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  className={`flex-1 ${selectedQrCode.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                  onClick={() => {
                    handleToggleActive(selectedQrCode.id, selectedQrCode.isActive);
                    setShowSettingsDialog(false);
                  }}
                >
                  {selectedQrCode.isActive ? 'Deactivate' : 'Activate'} QR
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Delete QR Code
            </DialogTitle>
          </DialogHeader>
          {selectedQrCode && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="font-medium text-red-900 dark:text-red-100">
                  Are you sure you want to delete this QR code?
                </h4>
                <p className="text-sm text-red-700 dark:text-red-200 mt-1">
                  <strong>{selectedQrCode.name}</strong> - This action cannot be undone.
                </p>
                <p className="text-xs text-red-600 dark:text-red-300 mt-2">
                  Current scans: {selectedQrCode.scans} • Created: {selectedQrCode.createdAt}
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={() => handleDeleteQR(selectedQrCode.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Permanently
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}