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
  Plus
} from 'lucide-react'
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
  const { toast } = useToast()
  
  const user = getCurrentUser()
  const restaurantId = user?.restaurantId || ''

  // Mock QR codes data - replace with actual API call
  const qrCodes = [
    {
      id: '1',
      name: 'Main Menu QR',
      type: 'menu',
      url: `${window.location.origin}/customer?restaurant=${restaurantId}`,
      scans: 245,
      createdAt: '2024-08-29',
      isActive: true
    },
    {
      id: '2', 
      name: 'Table 1 QR',
      type: 'table',
      url: `${window.location.origin}/customer?restaurant=${restaurantId}&table=1`,
      scans: 67,
      createdAt: '2024-08-29',
      isActive: true
    },
    {
      id: '3',
      name: 'Table 2 QR', 
      type: 'table',
      url: `${window.location.origin}/customer?restaurant=${restaurantId}&table=2`,
      scans: 43,
      createdAt: '2024-08-29',
      isActive: true
    }
  ]

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: "URL Copied!",
      description: "Menu URL has been copied to clipboard",
    })
  }

  const handleDownloadQR = (qrCode: any) => {
    setIsGenerating(true)
    // Simulate QR generation
    setTimeout(() => {
      setIsGenerating(false)
      toast({
        title: "QR Code Downloaded!",
        description: `${qrCode.name} QR code has been downloaded`,
      })
    }, 1500)
  }

  const generateQRCodeSVG = (url: string, size: number = 200) => {
    // Simple QR code placeholder - in real app, use QR code library
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100"><rect width="100" height="100" fill="white"/><rect x="10" y="10" width="80" height="80" fill="black"/><rect x="20" y="20" width="60" height="60" fill="white"/><rect x="30" y="30" width="40" height="40" fill="black"/><text x="50" y="55" text-anchor="middle" fill="white" font-size="8">QR</text></svg>`
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">QR Codes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Generate and manage QR codes for your restaurant menu and tables
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Generate New QR
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
              
              <Button className="w-full" disabled={isGenerating}>
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
            <div className="text-2xl font-bold">{qrCodes.reduce((acc, qr) => acc + qr.scans, 0)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {qrCodes.reduce((max, qr) => qr.scans > max.scans ? qr : max, qrCodes[0])?.name}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.max(...qrCodes.map(qr => qr.scans))}</div>
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
        {qrCodes.map((qrCode) => (
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
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* QR Code Preview */}
              <div className="flex justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <img 
                  src={generateQRCodeSVG(qrCode.url)} 
                  alt={`QR Code for ${qrCode.name}`}
                  className="w-32 h-32 border-2 border-gray-200 dark:border-gray-700 rounded"
                />
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
                  onClick={() => handleDownloadQR(qrCode)}
                  disabled={isGenerating}
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
    </div>
  )
}