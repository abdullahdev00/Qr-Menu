// Shared QR Code Generation Engine
// Roman Urdu: Shared QR Code generation system - Admin aur Restaurant dono use kar sakte hain

export interface QRCustomization {
  // Branding Options
  logo?: {
    file: string;
    position: 'top-center' | 'top-left' | 'top-right' | 'center';
    size: 'small' | 'medium' | 'large';
  };
  
  // Color Customization
  colors: {
    primary: string;
    secondary: string;
    qrForeground: string;
    qrBackground: string;
  };
  
  // Text Customization
  text: {
    restaurantName: string;
    tableNumber: string;
    instructions: string;
    language: 'english' | 'urdu' | 'both';
  };
  
  // Template Settings
  template: {
    id: string;
    category: string;
    layout: any;
  };
}

export interface QRGenerationOptions {
  restaurantSlug: string;
  tableNumber: string;
  customization: QRCustomization;
  outputFormats: ('png' | 'pdf' | 'svg' | 'jpg')[];
  size: 'small' | 'medium' | 'large';
}

export interface QRGenerationResult {
  qrUrl: string;
  files: {
    png?: string;
    pdf?: string;
    svg?: string;
    jpg?: string;
  };
  metadata: {
    generatedAt: string;
    template: string;
    size: string;
    customizations: QRCustomization;
  };
}

export class QRGenerator {
  private baseUrl = 'https://menuqr.pk';
  
  constructor() {}

  // Generate URL for QR code
  generateMenuUrl(restaurantSlug: string, tableNumber: string): string {
    return `${this.baseUrl}/menu/${restaurantSlug}/table/${tableNumber}`;
  }

  // Main QR generation function
  async generateQRCode(options: QRGenerationOptions): Promise<QRGenerationResult> {
    const qrUrl = this.generateMenuUrl(options.restaurantSlug, options.tableNumber);
    
    // File naming convention
    const baseFileName = `qr_${options.restaurantSlug}_table_${options.tableNumber}`;
    const timestamp = Date.now();
    
    const files: QRGenerationResult['files'] = {};
    
    // Generate files for each requested format
    for (const format of options.outputFormats) {
      files[format] = `generated_qr/${baseFileName}_${timestamp}.${format}`;
    }

    // Return generation result with metadata
    return {
      qrUrl,
      files,
      metadata: {
        generatedAt: new Date().toISOString(),
        template: options.customization.template.id,
        size: options.size,
        customizations: options.customization,
      },
    };
  }

  // Bulk QR generation for multiple tables
  async generateBulkQRCodes(
    restaurantSlug: string,
    tableNumbers: string[],
    customization: QRCustomization,
    outputFormats: ('png' | 'pdf' | 'svg' | 'jpg')[] = ['png', 'pdf']
  ): Promise<QRGenerationResult[]> {
    const results: QRGenerationResult[] = [];

    for (const tableNumber of tableNumbers) {
      const options: QRGenerationOptions = {
        restaurantSlug,
        tableNumber,
        customization,
        outputFormats,
        size: 'medium',
      };

      const result = await this.generateQRCode(options);
      results.push(result);
    }

    return results;
  }

  // Get template design data
  static getTemplateDesigns() {
    return {
      'classic_modern': {
        id: 'classic_modern',
        name: 'Classic Modern',
        description: 'Clean, professional design',
        category: 'modern',
        layout: {
          logoPosition: 'top-center',
          qrSize: '300x300',
          tableNumberStyle: 'bold-bottom',
          colorScheme: 'customizable',
        },
        defaultColors: {
          primary: '#2563EB',
          secondary: '#EFF6FF',
          qrForeground: '#000000',
          qrBackground: '#FFFFFF',
        },
      },
      'premium_elegant': {
        id: 'premium_elegant',
        name: 'Premium Elegant',
        description: 'Luxury dining establishments',
        category: 'elegant',
        layout: {
          logoPosition: 'top-left',
          decorativeFrame: 'golden-border',
          qrSize: '280x280',
          tableNumberStyle: 'elegant-script',
        },
        defaultColors: {
          primary: '#D97706',
          secondary: '#FFFBEB',
          qrForeground: '#000000',
          qrBackground: '#FFFFFF',
        },
        planRestriction: ['Premium', 'Enterprise'],
      },
      'fast_food_vibrant': {
        id: 'fast_food_vibrant',
        name: 'Fast Food Vibrant',
        description: 'Colorful, energetic design',
        category: 'vibrant',
        layout: {
          backgroundGradient: 'dynamic-colors',
          qrSize: '320x320',
          tableNumberStyle: 'bold-colorful',
        },
        defaultColors: {
          primary: '#DC2626',
          secondary: '#FEF2F2',
          qrForeground: '#000000',
          qrBackground: '#FFFFFF',
        },
      },
      'minimalist_clean': {
        id: 'minimalist_clean',
        name: 'Minimalist Clean',
        description: 'Simple, modern aesthetic',
        category: 'minimalist',
        layout: {
          whitespace: 'generous',
          qrSize: '250x250',
          typography: 'minimal-sans-serif',
        },
        defaultColors: {
          primary: '#374151',
          secondary: '#F9FAFB',
          qrForeground: '#000000',
          qrBackground: '#FFFFFF',
        },
      },
      'traditional_warmth': {
        id: 'traditional_warmth',
        name: 'Traditional Warmth',
        description: 'Traditional restaurant feel',
        category: 'traditional',
        layout: {
          borderPattern: 'traditional-motifs',
          colorPalette: 'warm-earth-tones',
          qrSize: '290x290',
        },
        defaultColors: {
          primary: '#92400E',
          secondary: '#FEF3C7',
          qrForeground: '#000000',
          qrBackground: '#FFFFFF',
        },
      },
    };
  }

  // Validate template access based on plan
  static validateTemplateAccess(templateId: string, userPlan: string): boolean {
    const templates = this.getTemplateDesigns();
    const template = templates[templateId as keyof typeof templates];
    
    if (!template) return false;
    
    // If no plan restriction, available for all
    if (!('planRestriction' in template) || !template.planRestriction) return true;
    
    // Check if user plan is in allowed plans
    return template.planRestriction.includes(userPlan);
  }

  // Generate preview URL for template
  static generatePreviewUrl(templateId: string): string {
    return `/api/qr/preview/${templateId}`;
  }
}

// Export singleton instance
export const qrGenerator = new QRGenerator();

// Default QR generation settings
export const QR_DEFAULTS = {
  size: 'medium' as const,
  formats: ['png', 'pdf'] as const,
  colors: {
    primary: '#2563EB',
    secondary: '#EFF6FF', 
    qrForeground: '#000000',
    qrBackground: '#FFFFFF',
  },
  instructions: {
    english: 'Scan this QR code to view our menu',
    urdu: 'Menu dekhne ke liye ye QR code scan karein',
    both: 'Scan this QR code to view our menu\nMenu dekhne ke liye ye QR code scan karein',
  },
};