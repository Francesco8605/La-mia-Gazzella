# Overview

"La Mia Gazzella" is an AI-powered web application for nutrition and meal planning, built with a full-stack TypeScript architecture. It enables users to create personalized meal plans and recipes based on their dietary preferences, health goals, and nutritional requirements, leveraging OpenAI's GPT models for content generation. The project aims to provide an affordable and effective alternative to traditional nutrition services, offering personalized guidance and comprehensive meal solutions.

# User Preferences

Preferred communication style: Simple, everyday language.
App name: "La Mia Gazzella" - nome ufficiale dell'applicazione web per la pianificazione nutrizionale.

# Recent Changes

## September 18, 2025 - Formula Gazzella Premium Feature Implementation
- **Feature Complete**: Formula Gazzella subscription integration for premium users
- **Access Control**: Implemented server-side validation ensuring only paid premium subscribers (not trial users) can access Formula Gazzella
- **Shopify Integration**: Added automatic order creation for product ID 9890948055381 on subscription and renewal webhook events  
- **Navigation**: Added dynamic Formula Gazzella link visible only to premium non-trial subscribers
- **Security**: Enhanced authentication validation and removed sensitive logging
- **API Updates**: Fixed Shopify GraphQL API compatibility for 2024 (totalPrice → totalPriceSet)
- **Known Limitation**: Manual order creation requires `write_draft_orders` Shopify app permission (external configuration)

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
- **Date-fns**: Date utility library.