# QR Menu Generator Admin Panel

## Overview

This is a comprehensive Multi-Vendor QR Menu Generator Admin Panel designed for restaurant management in the Pakistan market. The application enables administrators to manage restaurant subscriptions, generate QR codes for digital menus, handle customer support, and track analytics across multiple restaurant clients.

The platform provides a complete administrative interface for managing restaurant partners, their subscription plans (priced in PKR), payment processing through local payment methods (JazzCash, EasyPaisa, bank transfers), and comprehensive analytics dashboard.

## User Preferences

Preferred communication style: Simple, everyday language.
Development workflow: All work to be done in main branch, admin panel structure to remain unchanged (no vendor panel changes).

## Recent Changes (August 29, 2025)

✅ **Customer Menu Website Created**:
- Built comprehensive customer-facing menu website following ultra-detailed specifications
- Implemented mobile-first responsive design with dark theme and gold accents
- Created complete HTML structure with semantic markup and accessibility features
- Developed advanced CSS with custom properties, animations, and responsive breakpoints
- Built interactive JavaScript functionality with MenuApp, ShoppingCart, and FilterManager classes
- Added progressive loading, search, filtering, favorites, and cart management
- Included detailed documentation and README for future development
- Website ready for integration with restaurant data via admin panel

✅ **Migration from Replit Agent to Replit Environment Completed** (September 1, 2025):
- Fixed cross-env dependency issue by installing missing packages
- Created PostgreSQL database and deployed schema using Drizzle
- Configured server to serve built static files instead of Vite middleware
- Fixed customer cart checkout authentication errors and duplicate popup issues
- All systems operational with complete restaurants management functionality

✅ **Restaurants Management System Verified**:
- Complete CRUD operations (Create, Read, Update, Delete)
- Edit functionality working in table with dedicated edit buttons
- Backend API endpoints fully functional (/api/restaurants and /api/restaurants/[id])
- Form validation and error handling implemented
- Status management (active, inactive, suspended)
- Subscription plan integration
- Search and filtering capabilities

✅ **Subscription Plans Database Integration Completed**:
- Fixed API routing issues with dynamic IDs for restaurants and subscription plans
- Created complete subscription plans CRUD endpoints (/api/subscription-plans and /api/subscription-plans/[id])
- Added comprehensive subscription plan management with Create Plan button and forms
- Edit functionality working for both restaurants and subscription plans
- Fixed TypeScript errors and API request methods
- Both systems fully integrated with database and working correctly

✅ **Restaurant Management Issues Fixed**:
- Fixed restaurant creation failure by adding missing password field
- Added password validation and form handling for restaurant authentication
- Created separate dialogs for add and edit operations to prevent blank screen issue
- Updated API schemas to handle optional password field during updates
- Restaurant edit dialog now opens properly with all form data pre-populated

## System Architecture

### Full-Stack Architecture
The application follows a monorepo structure with clear separation between client, server, and shared components:

- **Frontend**: React with TypeScript using Vite for fast development and building
- **Backend**: Express.js server with TypeScript for API endpoints
- **Shared**: Common schema definitions and types shared between client and server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations

### Frontend Architecture
- **UI Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI components with shadcn/ui for consistent design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite with proper development and production configurations

### Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API with proper error handling and logging middleware
- **Session Management**: Express sessions with PostgreSQL storage

### Database Design
The schema includes comprehensive entities for restaurant management:

- **Admin Users**: Role-based access control (super_admin, admin, support)
- **Restaurants**: Complete restaurant profiles with owner information and subscription linking
- **Subscription Plans**: Flexible pricing plans with feature limitations and Pakistani Rupee pricing
- **Payments**: Transaction tracking with local payment methods support
- **Support Tickets**: Customer support system with priority and status tracking
- **Menu Templates**: Pre-designed menu templates for restaurants
- **QR Codes**: Generated QR codes with customization options

### Authentication & Authorization
- Simple email/password authentication system
- Role-based access control with three levels: super_admin, admin, support
- Session-based authentication using localStorage for client-side user state
- Protected routes ensuring proper access control

### UI/UX Design System
- Professional color scheme with primary blue and secondary green
- Responsive design with mobile-first approach
- Dark mode support with theme switching capability
- Consistent component library based on Radix UI primitives
- Professional dashboard layout with sidebar navigation

### Development & Build Configuration
- TypeScript configuration with strict mode enabled
- Path aliases for clean imports (@/, @shared/, @assets/)
- ESM modules throughout the application
- Separate development and production build processes
- Hot module replacement in development with Vite

## External Dependencies

### Database & Storage
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle Kit**: Database migrations and schema management

### UI & Frontend Libraries
- **Radix UI**: Accessible component primitives for forms, dialogs, menus
- **Tailwind CSS**: Utility-first CSS framework
- **TanStack Query**: Server state management and data fetching
- **Recharts**: Chart library for analytics dashboard
- **React Hook Form**: Form handling with validation
- **next-themes**: Theme switching functionality

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type checking and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with autoprefixer

### Pakistani Market Integration
- **Currency**: Pakistani Rupee (PKR) pricing throughout the application
- **Payment Methods**: Integration ready for JazzCash, EasyPaisa, and bank transfers
- **Local Market Focus**: City-based restaurant categorization (Karachi, Lahore, Islamabad)

### Session & State Management
- **connect-pg-simple**: PostgreSQL session storage
- **Wouter**: Lightweight routing library
- **React Context**: Theme and authentication state management