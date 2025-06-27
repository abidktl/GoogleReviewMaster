# ReviewResponder - Google My Business Review Management Platform

## Overview

ReviewResponder is a full-stack web application designed to help businesses efficiently manage and respond to their Google My Business reviews. The platform leverages AI-powered suggestions to generate professional responses, provides template management, and offers comprehensive analytics to track review performance.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS with custom theming support
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds
- **Progressive Web App**: PWA capabilities with service worker support

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon serverless PostgreSQL
- **AI Integration**: OpenAI API for intelligent response generation
- **Session Management**: Express sessions with PostgreSQL store

### Deployment Strategy
- **Platform**: Replit with autoscale deployment
- **Environment**: Node.js 20 runtime
- **Build Process**: Vite for frontend, esbuild for backend bundling
- **Port Configuration**: Internal port 5000 mapped to external port 80

## Key Components

### Database Schema (PostgreSQL with Drizzle)
- **Users**: Authentication and user management
- **Reviews**: Core review data with customer information, ratings, and content
- **Templates**: Reusable response templates with categorization
- **Responses**: Response tracking with AI generation flags and timestamps

### API Endpoints
- **Dashboard Stats**: `/api/dashboard/stats` - Analytics and metrics
- **Reviews Management**: `/api/reviews` - CRUD operations with filtering
- **Templates**: `/api/templates` - Response template management
- **AI Services**: Integrated OpenAI for response suggestions and improvements

### Frontend Components
- **Dashboard**: Overview with statistics cards and recent reviews
- **Reviews Page**: Comprehensive review management with filtering
- **Templates Page**: Template creation and management interface
- **Response Modal**: AI-powered response composition interface

## Data Flow

1. **Review Data**: Reviews are stored with comprehensive metadata including customer details, ratings, content, and response status
2. **AI Integration**: OpenAI API generates contextual response suggestions based on review content and rating
3. **Template System**: Predefined templates provide quick response options with categorization
4. **Response Tracking**: All responses are tracked with timestamps and AI generation flags
5. **Draft Management**: Local storage preserves draft responses across sessions

## External Dependencies

- **Database**: Neon PostgreSQL for serverless database hosting
- **AI Services**: OpenAI API for intelligent response generation
- **UI Framework**: Radix UI primitives for accessible component foundation
- **Icons**: Lucide React for consistent iconography
- **Styling**: TailwindCSS for utility-first styling approach

## Deployment Strategy

The application uses a monorepo structure with:
- **Development**: Hot-reload development server on port 5000
- **Production Build**: 
  - Frontend built with Vite to `dist/public`
  - Backend bundled with esbuild to `dist/index.js`
- **Runtime**: Production server serves static assets and API endpoints
- **Database Migrations**: Drizzle Kit handles schema migrations

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 27, 2025. Initial setup