export const qrGenerator = {
  generateMenuUrl(restaurantSlug: string, tableNumber?: string): string {
    const baseUrl = 'https://workspace--vejip54714.replit.app';
    
    return `${baseUrl}/${restaurantSlug}${tableNumber ? `?table=${tableNumber}` : ''}`;
  },
  
  generateQrCodeImage(url: string, customization?: any): Promise<string> {
    // This will be implemented with actual QR generation
    return Promise.resolve('');
  }
};