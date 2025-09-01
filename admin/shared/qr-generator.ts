export const qrGenerator = {
  generateMenuUrl(restaurantSlug: string, tableNumber?: string): string {
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : 'https://menuqr.pk';
    
    return `${baseUrl}/${restaurantSlug}${tableNumber ? `?table=${tableNumber}` : ''}`;
  },
  
  generateQrCodeImage(url: string, customization?: any): Promise<string> {
    // This will be implemented with actual QR generation
    return Promise.resolve('');
  }
};