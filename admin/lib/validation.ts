// Form validation utilities with regex patterns

export interface ValidationError {
  field: string;
  message: string;
}

// Regex patterns
export const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+92|92|0)?[0-9]{10}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  name: /^[a-zA-Z\s]{2,50}$/,
  restaurantName: /^[a-zA-Z0-9\s&'-]{2,100}$/,
  password: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
  price: /^\d+(\.\d{1,2})?$/,
  planName: /^[a-zA-Z0-9\s]{2,50}$/,
  address: /^[a-zA-Z0-9\s,.-]{5,200}$/
};

// Validation messages
export const MESSAGES = {
  required: (field: string) => `${field} is required`,
  invalid: (field: string) => `Please enter a valid ${field.toLowerCase()}`,
  email: 'Please enter a valid email address (e.g., user@example.com)',
  phone: 'Please enter a valid Pakistani phone number (e.g., 03001234567)',
  slug: 'Slug must contain only lowercase letters, numbers, and hyphens',
  name: 'Name must be 2-50 characters and contain only letters and spaces',
  restaurantName: 'Restaurant name must be 2-100 characters',
  password: 'Password must be at least 6 characters with letters and numbers',
  price: 'Please enter a valid price (e.g., 2500 or 2500.50)',
  planName: 'Plan name must be 2-50 characters',
  address: 'Address must be 5-200 characters',
  minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) => `${field} must be no more than ${max} characters`,
  minValue: (field: string, min: number) => `${field} must be at least ${min}`,
  maxValue: (field: string, max: number) => `${field} must be no more than ${max}`
};

// Validation functions
export const validateField = (
  field: string,
  value: string | number,
  rules: {
    required?: boolean;
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    customMessage?: string;
  }
): string | null => {
  const stringValue = String(value).trim();

  // Required validation
  if (rules.required && (!stringValue || stringValue === '0')) {
    return rules.customMessage || MESSAGES.required(field);
  }

  // Skip other validations if field is empty and not required
  if (!stringValue && !rules.required) {
    return null;
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return rules.customMessage || MESSAGES.invalid(field);
  }

  // Length validations
  if (rules.minLength && stringValue.length < rules.minLength) {
    return rules.customMessage || MESSAGES.minLength(field, rules.minLength);
  }

  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return rules.customMessage || MESSAGES.maxLength(field, rules.maxLength);
  }

  // Value validations for numbers
  const numValue = Number(value);
  if (rules.minValue !== undefined && numValue < rules.minValue) {
    return rules.customMessage || MESSAGES.minValue(field, rules.minValue);
  }

  if (rules.maxValue !== undefined && numValue > rules.maxValue) {
    return rules.customMessage || MESSAGES.maxValue(field, rules.maxValue);
  }

  return null;
};

// Specific field validators
export const validators = {
  email: (value: string) => validateField('Email', value, {
    required: true,
    pattern: PATTERNS.email,
    customMessage: MESSAGES.email
  }),
  
  phone: (value: string) => validateField('Phone', value, {
    pattern: PATTERNS.phone,
    customMessage: MESSAGES.phone
  }),
  
  slug: (value: string) => validateField('Slug', value, {
    required: true,
    pattern: PATTERNS.slug,
    customMessage: MESSAGES.slug
  }),
  
  name: (value: string) => validateField('Name', value, {
    required: true,
    pattern: PATTERNS.name,
    customMessage: MESSAGES.name
  }),
  
  restaurantName: (value: string) => validateField('Restaurant name', value, {
    required: true,
    pattern: PATTERNS.restaurantName,
    customMessage: MESSAGES.restaurantName
  }),
  
  password: (value: string) => validateField('Password', value, {
    required: true,
    pattern: PATTERNS.password,
    customMessage: MESSAGES.password
  }),
  
  price: (value: string | number) => validateField('Price', value, {
    required: true,
    pattern: PATTERNS.price,
    minValue: 0.01,
    customMessage: MESSAGES.price
  }),
  
  planName: (value: string) => validateField('Plan name', value, {
    required: true,
    pattern: PATTERNS.planName,
    customMessage: MESSAGES.planName
  }),
  
  address: (value: string) => validateField('Address', value, {
    pattern: PATTERNS.address,
    customMessage: MESSAGES.address
  }),
  
  required: (field: string, value: string) => validateField(field, value, {
    required: true
  }),
  
  features: (value: string) => {
    if (!value.trim()) {
      return 'At least one feature is required';
    }
    const features = value.split('\n').filter(f => f.trim());
    if (features.length === 0) {
      return 'At least one feature is required';
    }
    return null;
  }
};

// Generate slug from name
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};