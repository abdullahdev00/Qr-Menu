import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QrGenerator from "@/components/qr/qr-generator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Edit, Trash2 } from "lucide-react";
import { type QrCode } from "@shared/schema";

export default function QrCodes() {
  const { data: qrCodes, isLoading } = useQuery<QrCode[]>({
    queryKey: ["/api/qr-codes"],
  });

  const getStyleBadge = (style: string) => {
    const colors = {
      classic: "bg-blue-100 text-blue-800",
      rounded: "bg-green-100 text-green-800",
      dots: "bg-purple-100 text-purple-800",
    };
    return colors[style as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const QrPreviewPattern = ({ style }: { style: string }) => {
    const baseClasses = "w-12 h-12 bg-black grid grid-cols-4 gap-px p-1";
    
    if (style === "rounded") {
      return (
        <div className={baseClasses}>
          {[...Array(16)].map((_, i) => (
            <div 
              key={i} 
              className={`${i % 2 === 0 ? 'bg-white' : 'bg-black'} rounded-sm`}
            ></div>
          ))}
        </div>
      );
    }
    
    if (style === "dots") {
      return (
        <div className={baseClasses}>
          {[...Array(16)].map((_, i) => (
            <div 
              key={i} 
              className={`${i % 2 === 0 ? 'bg-white' : 'bg-black'} rounded-full`}
            ></div>
          ))}
        </div>
      );
    }
    
    return (
      <div className={baseClasses}>
        {[...Array(16)].map((_, i) => (
          <div 
            key={i} 
            className={i % 2 === 0 ? 'bg-white' : 'bg-black'}
          ></div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* QR Code Generator */}
      <QrGenerator />

      {/* Recently Generated QR Codes */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Generated QR Codes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                    <TableHead>Preview</TableHead>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Style</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qrCodes?.slice(0, 10).map((qr: any) => (
                    <TableRow key={qr.id} data-testid={`qr-row-${qr.id}`}>
                      <TableCell>
                        <QrPreviewPattern style={qr.style} />
                      </TableCell>
                      <TableCell className="font-medium">
                        Restaurant {qr.restaurantId?.slice(-4)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStyleBadge(qr.style)}>
                          {qr.style.charAt(0).toUpperCase() + qr.style.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{qr.size}</TableCell>
                      <TableCell className="uppercase">{qr.format}</TableCell>
                      <TableCell>
                        {new Date(qr.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary-600 hover:text-primary-700"
                            data-testid={`button-download-qr-${qr.id}`}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-secondary-600 hover:text-secondary-700"
                            data-testid={`button-edit-qr-${qr.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-error hover:text-red-700"
                            data-testid={`button-delete-qr-${qr.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
