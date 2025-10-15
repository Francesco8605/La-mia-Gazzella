# Overview

"La Mia Gazzella" is an AI-powered web application for nutrition and meal planning, built with a full-stack TypeScript architecture. It enables users to create personalized meal plans and recipes based on their dietary preferences, health goals, and nutritional requirements, leveraging OpenAI's GPT models for content generation. The project aims to provide an affordable and effective alternative to traditional nutrition services, offering personalized guidance and comprehensive meal solutions.

# User Preferences

Preferred communication style: Simple, everyday language.
App name: "La Mia Gazzella" - nome ufficiale dell'applicazione web per la pianificazione nutrizionale.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite.
- **UI Library**: shadcn/ui components built on Radix UI.
- **Styling**: Tailwind CSS with custom design system, including glassmorphism effects.
- **State Management**: TanStack Query for server state management.
- **Routing**: Wouter for client-side routing.
- **Forms**: React Hook Form with Zod validation.

## Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **API Design**: RESTful API with proper HTTP status codes.
- **Middleware**: Express middleware for JSON parsing and URL encoding.

## Data Storage Solutions
- **Database**: PostgreSQL.
- **ORM**: Drizzle ORM for type-safe operations.
- **Database Provider**: Neon Database (serverless PostgreSQL).
- **Schema Management**: Drizzle Kit for database migrations.

## Database Schema Design
The system manages:
- **Users**: Authentication and identification.
- **User Profiles**: Health and dietary data.
- **Meal Plans**: Nutritional targets and daily meal structures.
- **Recipes**: Detailed recipe information.

## Authentication and Authorization
- **Session Management**: PostgreSQL-based session storage.
- **User System**: Username/password authentication.
- **Profile Association**: User profiles linked to authenticated users.

## AI Integration Architecture
- **AI Provider**: OpenAI GPT-4o for meal plan and recipe generation.
- **Content Generation**: Structured prompts for personalized meal plans and recipes.
- **Nutritional Calculation**: AI-powered macronutrient distribution and calorie targeting.
- **Gazzella Protocol**: AI adherence to the "Manuale della Gazzella" rules, ensuring specific food combinations, portion calculations, and exclusion of forbidden foods.
- **Trial Abuse Prevention**: System to track and prevent free trial misuse for premium features.
- **Subscription Management**: Integration for handling paid subscriptions and feature access.

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM.
- **Vite**: Build tool and development server.
- **Express.js**: Backend web framework.
- **TypeScript**: Type safety across the stack.

## Database and ORM
- **Drizzle ORM**: TypeScript ORM.
- **Drizzle Kit**: Database migration tooling.
- **Neon Database**: Serverless PostgreSQL provider.
- **PostgreSQL**: Relational database.

## UI and Design System
- **shadcn/ui**: Component library.
- **Radix UI**: Unstyled UI primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.

## State Management and Data Fetching
- **TanStack Query**: Data synchronization.
- **React Hook Form**: Form management.
- **Zod**: Schema validation.

## AI and External Services
- **OpenAI**: GPT-4o for AI functionalities.
- **Stripe**: Payment processing for subscriptions.
- **Shopify**: E-commerce integration for customer data sync and purchase verification.
- **Date-fns**: Date utility library.

# Recent Changes (October 2025)

## Shopify Data Synchronization Feature
- **Admin Dashboard Integration**: Added one-click Shopify data synchronization in admin dashboard
- **Endpoint**: POST /api/admin/sync-shopify-data (admin-protected)
- **Functionality**: 
  - Batch synchronizes all user profiles with Shopify customer data
  - Auto-populates firstName, lastName, and phone fields
  - Preserves existing data (won't overwrite)
  - Provides detailed summary: total/updated/skipped/errors
  - Individual user sync status tracking
- **UI Components**:
  - Dedicated sync card with gradient blue/indigo styling
  - Loading states with spinning RefreshCw icon
  - Results panel with statistics grid and details list
  - Toast notifications for user feedback
- **Safety Features**:
  - Idempotent operation (safe to run multiple times)
  - Per-user error isolation (single failure doesn't abort batch)
  - Admin-only access with JWT authentication

## User Retention Optimization - Cancellation Page Redesign
- **Route**: /cancella-abbonamento
- **Objective**: Reduce subscription cancellation rate through persuasive UI design and psychological principles
- **Strategy**: Multi-layered retention approach combining value reframing, loss aversion, and hierarchical CTAs
- **Key Features**:
  - **Value Proposition Hero**: Reframes €29/month as "meno di 1€ al giorno" (cost of daily coffee) with emotional icons
  - **Loss Aversion Section**: "Cosa Perderai" card highlighting 4 key benefits user will lose (meal plans, recipes, tracking, support)
  - **Benefits Cards**: 3 visually distinct cards emphasizing unique value (weekly plans, infinite recipes, sustainable lifestyle)
  - **Personalized Stats**: Dynamic display of user's progress (meal plans count, recipes count) to emphasize sunk investment
  - **Hierarchical CTA Design**:
    - Primary: Large green "Mantieni il Mio Abbonamento" button (prominent, shadow, leads to homepage)
    - Secondary: Small ghost "Procedi comunque" link (minimal, less visible, requires confirmation)
- **Data Sources**:
  - GET /api/user/subscription - subscription status
  - GET /api/meal-plans - personalization data
  - GET /api/recipes - personalization data
- **Design Principles Applied**:
  - Loss Aversion: Emphasize what user loses vs what they pay
  - Value Framing: Daily cost vs monthly price
  - Social Proof: Personalized stats show user's commitment
  - Choice Architecture: Make retention the path of least resistance
- **Analytics Recommendation**: Monitor click-through rates on "Mantieni" vs "Cancella" buttons to measure retention impact