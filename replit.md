# Overview

"La Mia Gazzella" is an AI-powered web application for nutrition and meal planning, offering personalized meal plans and recipes based on user dietary preferences, health goals, and nutritional requirements. It leverages OpenAI's GPT models for content generation, aiming to provide an affordable and effective alternative to traditional nutrition services. The project's vision is to deliver personalized guidance and comprehensive meal solutions to users.

# User Preferences

Preferred communication style: Simple, everyday language.
App name: "La Mia Gazzella" - nome ufficiale dell'applicazione web per la pianificazione nutrizionale.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite.
- **UI Library**: shadcn/ui components built on Radix UI.
- **Styling**: Tailwind CSS with custom design system, including glassmorphism effects.
- **State Management**: TanStack Query for server state.
- **Routing**: Wouter for client-side routing.
- **Forms**: React Hook Form with Zod validation.

## Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **API Design**: RESTful API.

## Data Storage Solutions
- **Database**: PostgreSQL (Neon Database for serverless).
- **ORM**: Drizzle ORM for type-safe operations.
- **Schema Management**: Drizzle Kit for database migrations.

## Database Schema Design
The system manages Users, User Profiles (health and dietary data), Meal Plans (nutritional targets), and Recipes.

## Authentication and Authorization
- **Session Management**: PostgreSQL-based session storage.
- **User System**: Username/password authentication.

## AI Integration Architecture
- **AI Provider**: OpenAI GPT-4o for meal plan and recipe generation.
- **Content Generation**: Structured prompts for personalized content, adhering to the "Gazzella Protocol" for specific food combinations and nutritional guidelines.
- **Nutritional Calculation**: AI-powered macronutrient distribution and calorie targeting.
- **AI-Powered Personalized Plan Summaries**: Generates 200-300 word summaries explaining meal plan strategy based on user profile and Filosofia Gazzella principles.

## Core Features and System Design
- **Trial Abuse Prevention**: System to track and prevent free trial misuse.
- **Subscription Management**: Handles paid subscriptions and feature access.
- **Shopify Data Synchronization**: Admin dashboard feature to sync user profiles with Shopify customer data for populating user information.
- **Cancellation Page Redesign**: Implements a multi-layered retention strategy using value reframing and loss aversion to reduce subscription cancellations.
- **Formula Gazzella Upselling System**: Intelligent, personalized upselling for a supplement, tailored based on user profile data (e.g., intestinal issues) and designed to maximize conversion by framing the supplement as offsetting subscription costs.
- **Body Recomposition Messaging**: Provides tailored guidance for healthy-weight clients aiming for body recomposition rather than weight loss, adapting UI and messaging on saved meal plan pages.

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React, React DOM.
- **Vite**: Build tool.
- **Express.js**: Backend web framework.
- **TypeScript**: Type safety.

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
- **Shopify**: E-commerce integration for customer data sync.
- **Date-fns**: Date utility library.

# Recent Changes

## Bug Fixes (October 31, 2025)

### Recipe Generation Cache Invalidation Fix
- **Issue**: After generating a new recipe, it didn't appear in the /recipes page without manual refresh
- **Root Cause**: Cache invalidation used wrong query key `["/api/recipes"]` instead of `["/api/recipes/user"]`
- **Fix**: Updated `client/src/pages/recipe-generator.tsx` to invalidate cache with correct query key
- **Impact**: Recipes now appear immediately in the /recipes page after generation

### Admin Client Detail TypeScript Errors
- **Issue**: TypeScript errors in admin client detail page due to missing profile field types
- **Fix**: Added all questionnaire fields to the client profile interface (thyroidIssues, intestinalIssues, weeklyExercise, breakfastTime, lunchTime, dinnerTime, excludedFoods, allergies, dailyWaterIntake, cravingTimeFrame, preferredCheatFood, takingFormulaGazzella)
- **Impact**: Admin dashboard now shows comprehensive client profile data in 7 color-coded categories