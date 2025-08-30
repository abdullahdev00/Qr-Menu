import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Save, 
  RotateCcw, 
  Eye, 
  Smartphone, 
  Tablet, 
  Monitor,
  Upload,
  Download,
  Zap,
  Paintbrush,
  Type,
  Settings,
  History,
  ChevronDown,
  ChevronRight,
  Plus
} from 'lucide-react';

// Color picker component
const ColorPicker = ({ label, value, onChange, description }: {
  label: string;
  value: string;
  onChange: (color: string) => void;
  description?: string;
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [hex, setHex] = useState(value);

  useEffect(() => {
    setHex(value);
  }, [value]);

  const handleHexChange = (newHex: string) => {
    setHex(newHex);
    if (newHex.match(/^#[0-9A-F]{6}$/i)) {
      onChange(newHex);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex-1">
        <div className="font-medium text-gray-900 dark:text-white">{label}</div>
        {description && (
          <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={hex}
          onChange={(e) => handleHexChange(e.target.value)}
          className="w-20 px-2 py-1 text-xs border rounded font-mono bg-white dark:bg-gray-700 dark:border-gray-600"
          placeholder="#FF0000"
        />
        <div 
          className="w-10 h-8 border rounded cursor-pointer shadow-sm"
          style={{ backgroundColor: value }}
          onClick={() => setShowPicker(!showPicker)}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 border-0 rounded cursor-pointer"
          style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }}
        />
      </div>
    </div>
  );
};

// Theme preset card component
const ThemePresetCard = ({ 
  name, 
  colors, 
  isActive, 
  onClick 
}: {
  name: string;
  colors: string[];
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <div 
      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
        isActive 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="text-sm font-medium mb-2 text-gray-900 dark:text-white">{name}</div>
      <div className="flex gap-1 mb-3">
        {colors.map((color, index) => (
          <div
            key={index}
            className="w-4 h-4 rounded-full border border-gray-200"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <button className="w-full text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded transition-colors">
        Apply Theme
      </button>
    </div>
  );
};

// Typography control component
const TypographyControl = ({ 
  label, 
  value, 
  onChange, 
  type = 'range',
  min,
  max,
  step,
  options
}: {
  label: string;
  value: any;
  onChange: (value: any) => void;
  type?: 'range' | 'select' | 'input';
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: string; label: string }>;
}) => {
  if (type === 'select') {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <span className="font-medium text-gray-900 dark:text-white">{label}</span>
        <select 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="px-3 py-1 border rounded bg-white dark:bg-gray-700 dark:border-gray-600"
        >
          {options?.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    );
  }

  if (type === 'range') {
    return (
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-900 dark:text-white">{label}</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <span className="font-medium text-gray-900 dark:text-white">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700 dark:border-gray-600"
      />
    </div>
  );
};

export default function DesignPage() {
  const [activeTab, setActiveTab] = useState('colors');
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [activeTheme, setActiveTheme] = useState('custom');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  // Design state
  const [designState, setDesignState] = useState({
    // Brand Colors
    primaryBg: '#ffffff',
    secondaryBg: '#f8fafc',
    cardBg: '#ffffff',
    primaryAccent: '#3b82f6',
    secondaryAccent: '#10b981',
    
    // Text Colors
    primaryText: '#1f2937',
    secondaryText: '#6b7280',
    linkText: '#3b82f6',
    buttonText: '#ffffff',
    
    // System Colors
    successGreen: '#10b981',
    warningRed: '#ef4444',
    infoBlue: '#3b82f6',
    borderGray: '#e5e7eb',
    
    // Typography
    primaryFont: 'Inter, sans-serif',
    secondaryFont: 'Inter, sans-serif',
    headingScale: 1.25,
    bodySize: 16,
    lineHeight: 1.6,
    letterSpacing: 0
  });

  const themePresets = [
    {
      name: 'Fast Food',
      colors: ['#dc2626', '#fbbf24', '#f59e0b', '#ffffff'],
      theme: {
        primaryAccent: '#dc2626',
        secondaryAccent: '#fbbf24',
        primaryBg: '#ffffff',
        cardBg: '#fef3c7'
      }
    },
    {
      name: 'Fine Dining',
      colors: ['#000000', '#fbbf24', '#374151', '#f3f4f6'],
      theme: {
        primaryAccent: '#000000',
        secondaryAccent: '#fbbf24',
        primaryBg: '#f9fafb',
        cardBg: '#ffffff'
      }
    },
    {
      name: 'Cafe',
      colors: ['#92400e', '#fef3c7', '#d97706', '#ffffff'],
      theme: {
        primaryAccent: '#92400e',
        secondaryAccent: '#d97706',
        primaryBg: '#fefdf8',
        cardBg: '#ffffff'
      }
    },
    {
      name: 'Traditional',
      colors: ['#059669', '#fbbf24', '#dc2626', '#ffffff'],
      theme: {
        primaryAccent: '#059669',
        secondaryAccent: '#fbbf24',
        primaryBg: '#f0fdf4',
        cardBg: '#ffffff'
      }
    },
    {
      name: 'Modern',
      colors: ['#1f2937', '#6b7280', '#3b82f6', '#ffffff'],
      theme: {
        primaryAccent: '#1f2937',
        secondaryAccent: '#3b82f6',
        primaryBg: '#ffffff',
        cardBg: '#f9fafb'
      }
    },
    {
      name: 'Seasonal',
      colors: ['#7c3aed', '#a855f7', '#ec4899', '#ffffff'],
      theme: {
        primaryAccent: '#7c3aed',
        secondaryAccent: '#a855f7',
        primaryBg: '#faf5ff',
        cardBg: '#ffffff'
      }
    }
  ];

  const applyTheme = (theme: any) => {
    setDesignState(prev => ({ ...prev, ...theme }));
  };

  const handleSave = () => {
    // Save design settings logic
    alert('Design settings saved successfully! اپ ڈیزائن سیٹنگز محفوظ ہو گئیں!');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all changes? کیا آپ واقعی تمام تبدیلیاں ری سیٹ کرنا چاہتے ہیں؟')) {
      setDesignState({
        primaryBg: '#ffffff',
        secondaryBg: '#f8fafc',
        cardBg: '#ffffff',
        primaryAccent: '#3b82f6',
        secondaryAccent: '#10b981',
        primaryText: '#1f2937',
        secondaryText: '#6b7280',
        linkText: '#3b82f6',
        buttonText: '#ffffff',
        successGreen: '#10b981',
        warningRed: '#ef4444',
        infoBlue: '#3b82f6',
        borderGray: '#e5e7eb',
        primaryFont: 'Inter, sans-serif',
        secondaryFont: 'Inter, sans-serif',
        headingScale: 1.25,
        bodySize: 16,
        lineHeight: 1.6,
        letterSpacing: 0
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Design</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Customize your restaurant's menu appearance and branding</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { id: 'colors', label: 'Brand Colors', icon: Palette },
          { id: 'typography', label: 'Typography', icon: Type },
          { id: 'layout', label: 'Layout', icon: Settings },
          { id: 'preview', label: 'Preview', icon: Eye }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content - 3 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel - Quick Actions & Presets */}
        <div className="lg:col-span-3 space-y-6">
          {/* Theme Presets */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Start Themes</h3>
            <div className="grid grid-cols-1 gap-3">
              {themePresets.map((preset) => (
                <ThemePresetCard
                  key={preset.name}
                  name={preset.name}
                  colors={preset.colors}
                  isActive={activeTheme === preset.name}
                  onClick={() => {
                    setActiveTheme(preset.name);
                    applyTheme(preset.theme);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Brand Guidelines Helper */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Brand Tools</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-2 p-3 text-left bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Upload Brand Logo</span>
              </button>
              <button className="w-full flex items-center gap-2 p-3 text-left bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Zap className="w-4 h-4" />
                <span className="text-sm">Extract Colors</span>
              </button>
              <button className="w-full flex items-center gap-2 p-3 text-left bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Eye className="w-4 h-4" />
                <span className="text-sm">Accessibility Check</span>
              </button>
            </div>
          </div>

          {/* Recent Changes */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Changes</h3>
            <div className="space-y-2">
              <div className="text-xs text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="font-medium">Primary color updated</div>
                <div>2 minutes ago</div>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="font-medium">Applied Fast Food theme</div>
                <div>5 minutes ago</div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Color Studio & Controls */}
        <div className="lg:col-span-6 space-y-6">
          {activeTab === 'colors' && (
            <>
              {/* Brand Colors Section */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Brand Colors</h3>
                <div className="space-y-3">
                  <ColorPicker 
                    label="Primary Background" 
                    value={designState.primaryBg}
                    onChange={(color) => setDesignState(prev => ({ ...prev, primaryBg: color }))}
                    description="Main background color"
                  />
                  <ColorPicker 
                    label="Secondary Background" 
                    value={designState.secondaryBg}
                    onChange={(color) => setDesignState(prev => ({ ...prev, secondaryBg: color }))}
                    description="Section backgrounds"
                  />
                  <ColorPicker 
                    label="Card Background" 
                    value={designState.cardBg}
                    onChange={(color) => setDesignState(prev => ({ ...prev, cardBg: color }))}
                    description="Card and menu item backgrounds"
                  />
                  <ColorPicker 
                    label="Primary Accent" 
                    value={designState.primaryAccent}
                    onChange={(color) => setDesignState(prev => ({ ...prev, primaryAccent: color }))}
                    description="Buttons and highlights"
                  />
                  <ColorPicker 
                    label="Secondary Accent" 
                    value={designState.secondaryAccent}
                    onChange={(color) => setDesignState(prev => ({ ...prev, secondaryAccent: color }))}
                    description="Secondary buttons"
                  />
                </div>
              </div>

              {/* Text Colors Section */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Text Colors</h3>
                <div className="space-y-3">
                  <ColorPicker 
                    label="Primary Text" 
                    value={designState.primaryText}
                    onChange={(color) => setDesignState(prev => ({ ...prev, primaryText: color }))}
                    description="Headings and main text"
                  />
                  <ColorPicker 
                    label="Secondary Text" 
                    value={designState.secondaryText}
                    onChange={(color) => setDesignState(prev => ({ ...prev, secondaryText: color }))}
                    description="Descriptions and helper text"
                  />
                  <ColorPicker 
                    label="Link Text" 
                    value={designState.linkText}
                    onChange={(color) => setDesignState(prev => ({ ...prev, linkText: color }))}
                    description="Links and navigation"
                  />
                  <ColorPicker 
                    label="Button Text" 
                    value={designState.buttonText}
                    onChange={(color) => setDesignState(prev => ({ ...prev, buttonText: color }))}
                    description="Text on buttons"
                  />
                </div>
              </div>

              {/* System Colors Section */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">System Colors</h3>
                <div className="space-y-3">
                  <ColorPicker 
                    label="Success Green" 
                    value={designState.successGreen}
                    onChange={(color) => setDesignState(prev => ({ ...prev, successGreen: color }))}
                    description="Success messages and indicators"
                  />
                  <ColorPicker 
                    label="Warning Red" 
                    value={designState.warningRed}
                    onChange={(color) => setDesignState(prev => ({ ...prev, warningRed: color }))}
                    description="Error messages and alerts"
                  />
                  <ColorPicker 
                    label="Info Blue" 
                    value={designState.infoBlue}
                    onChange={(color) => setDesignState(prev => ({ ...prev, infoBlue: color }))}
                    description="Information messages"
                  />
                  <ColorPicker 
                    label="Border Gray" 
                    value={designState.borderGray}
                    onChange={(color) => setDesignState(prev => ({ ...prev, borderGray: color }))}
                    description="Borders and dividers"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'typography' && (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Typography Settings</h3>
              <div className="space-y-4">
                <TypographyControl
                  label="Primary Font"
                  value={designState.primaryFont}
                  onChange={(value) => setDesignState(prev => ({ ...prev, primaryFont: value }))}
                  type="select"
                  options={[
                    { value: 'Inter, sans-serif', label: 'Inter (Recommended)' },
                    { value: 'Roboto, sans-serif', label: 'Roboto' },
                    { value: 'Open Sans, sans-serif', label: 'Open Sans' },
                    { value: 'Lato, sans-serif', label: 'Lato' },
                    { value: 'Poppins, sans-serif', label: 'Poppins' },
                    { value: 'Montserrat, sans-serif', label: 'Montserrat' }
                  ]}
                />
                <TypographyControl
                  label="Secondary Font"
                  value={designState.secondaryFont}
                  onChange={(value) => setDesignState(prev => ({ ...prev, secondaryFont: value }))}
                  type="select"
                  options={[
                    { value: 'Inter, sans-serif', label: 'Inter (Recommended)' },
                    { value: 'Roboto, sans-serif', label: 'Roboto' },
                    { value: 'Open Sans, sans-serif', label: 'Open Sans' },
                    { value: 'Lato, sans-serif', label: 'Lato' },
                    { value: 'Poppins, sans-serif', label: 'Poppins' },
                    { value: 'Montserrat, sans-serif', label: 'Montserrat' }
                  ]}
                />
                <TypographyControl
                  label="Heading Size Scale"
                  value={designState.headingScale}
                  onChange={(value) => setDesignState(prev => ({ ...prev, headingScale: value }))}
                  type="range"
                  min={1.1}
                  max={1.5}
                  step={0.05}
                />
                <TypographyControl
                  label="Body Text Size (px)"
                  value={designState.bodySize}
                  onChange={(value) => setDesignState(prev => ({ ...prev, bodySize: value }))}
                  type="range"
                  min={12}
                  max={20}
                  step={1}
                />
                <TypographyControl
                  label="Line Height"
                  value={designState.lineHeight}
                  onChange={(value) => setDesignState(prev => ({ ...prev, lineHeight: value }))}
                  type="range"
                  min={1.2}
                  max={2.0}
                  step={0.1}
                />
                <TypographyControl
                  label="Letter Spacing (px)"
                  value={designState.letterSpacing}
                  onChange={(value) => setDesignState(prev => ({ ...prev, letterSpacing: value }))}
                  type="range"
                  min={-1}
                  max={2}
                  step={0.1}
                />
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Layout Settings</h3>
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Layout customization coming soon...</p>
                <p className="text-sm">لے آؤٹ کسٹمائزیشن جلد آرہی ہے...</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Live Preview */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Live Preview</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                See your design changes in real-time with the actual customer website
              </p>
              <button 
                onClick={() => setShowPreviewModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors"
              >
                <Eye className="w-5 h-5" />
                Open Live Preview
              </button>
            </div>
          </div>

          {/* Advanced Tools */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full mb-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Tools</h3>
              {showAdvanced ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            
            {showAdvanced && (
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="font-medium text-sm">Color Harmony Generator</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Generate complementary colors</div>
                </button>
                <button className="w-full text-left p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="font-medium text-sm">Contrast Checker</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">WCAG compliance validation</div>
                </button>
                <button className="w-full text-left p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="font-medium text-sm">Color Blind Simulator</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Test different vision types</div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-7xl h-5/6 flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Preview</h3>
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-2 rounded flex items-center gap-1 text-sm ${
                      previewDevice === 'desktop' 
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' 
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    Desktop
                  </button>
                  <button
                    onClick={() => setPreviewDevice('tablet')}
                    className={`p-2 rounded flex items-center gap-1 text-sm ${
                      previewDevice === 'tablet' 
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' 
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Tablet className="w-4 h-4" />
                    Tablet
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-2 rounded flex items-center gap-1 text-sm ${
                      previewDevice === 'mobile' 
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' 
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    Mobile
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setShowPreviewModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content - Preview Frame */}
            <div className="flex-1 p-4 bg-gray-100 dark:bg-gray-800">
              <div className={`mx-auto bg-white rounded-lg shadow-lg overflow-hidden h-full ${
                previewDevice === 'mobile' ? 'max-w-sm' :
                previewDevice === 'tablet' ? 'max-w-2xl' : 'max-w-full'
              }`}>
                <iframe
                  src="/customer"
                  className="w-full h-full border-0"
                  style={{
                    transform: previewDevice === 'mobile' ? 'scale(0.8)' : 
                              previewDevice === 'tablet' ? 'scale(0.9)' : 'scale(1)',
                    transformOrigin: 'top left',
                    width: previewDevice === 'mobile' ? '125%' : 
                           previewDevice === 'tablet' ? '111%' : '100%',
                    height: previewDevice === 'mobile' ? '125%' : 
                            previewDevice === 'tablet' ? '111%' : '100%'
                  }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Real-time preview of your customer website with current design settings
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                  Open in New Tab
                </button>
                <button 
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}