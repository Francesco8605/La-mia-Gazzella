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
- **User Profiles**: Health and dietary data (temporary session-based).
- **Meal Plans**: Nutritional targets and daily meal structures.
- **Recipes**: Detailed recipe information.
- **Weight Entries**: Weight tracking data.

## AI Integration Architecture
- **AI Provider**: OpenAI GPT-4o for meal plan and recipe generation.
- **Content Generation**: Structured prompts for personalized meal plans and recipes.
- **Nutritional Calculation**: AI-powered macronutrient distribution and calorie targeting.
- **Gazzella Protocol**: AI adherence to the "Manuale della Gazzella" rules, ensuring specific food combinations, portion calculations, and exclusion of forbidden foods.

## Authentication and Authorization
- **Authentication System**: Replit Auth (OpenID Connect) for secure user login
- **Session Management**: PostgreSQL-based session storage with automatic cleanup
- **User Experience**: Landing page for visitors, full dashboard for authenticated users
- **Data Persistence**: User profiles and data linked to authenticated accounts
- **Access Control**: Optional authentication - app works for guests with session-based storage

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