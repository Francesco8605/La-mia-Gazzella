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

## Feature Implementation (November 17, 2025)

### Full 7-Day Meal Plan Visualization in Admin Dashboard
- **Feature**: Admin can now view complete 7-day meal plans for any client
- **Implementation**:
  - Added expandable/collapsible view for each meal plan in admin client detail page
  - Created dedicated admin endpoint `GET /api/admin/meal-plan/:id` with no ownership check
  - Lazy loading: Plan details fetched only when expanded
  - Complete daily breakdown: Shows all days (Lunedì-Domenica) with:
    - Daily calorie totals
    - All meals: Colazione (🌅), Pranzo (☀️), Cena (🌙), Spuntini (🍎)
    - Individual meal names and calorie counts
- **UI/UX**:
  - Toggle button: "Visualizza Piano Completo (7 Giorni)" ↔ "Nascondi Dettagli"
  - Dark theme cards (bg-slate-700/50) with responsive grid layout
  - Emoji icons for visual meal identification
- **Technical Details**:
  - Frontend: `client/src/pages/admin-client-detail.tsx`
  - Backend: New endpoint at line 3574-3587 in `server/routes.ts`
  - Authentication: Uses `fetchWithAuth` helper with admin tokens
  - Middleware: Protected by `isAdminAuthenticated`
- **Impact**: Admin can now provide better support by viewing exact meal plans without client screenshots

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

## UX Enhancement (December 5, 2025)

### Cancellation Page - Immediate Access Loss Warning
- **Feature**: Enhanced cancellation confirmation to clearly communicate immediate access loss
- **Implementation**:
  - Added prominent red warning box explaining access ends IMMEDIATELY upon cancellation
  - Shows subscription end date with clear message about losing access even with remaining paid days
  - Added practical advice section (amber box) recommending:
    - Wait until last days before cancelling
    - Save meal plans and recipes before cancellation
  - Mandatory checkbox confirmation: "HO CAPITO CHE PERDERÒ L'ACCESSO IMMEDIATAMENTE APPENA CANCELLO L'ABBONAMENTO"
  - Cancel button disabled until checkbox is checked
- **Technical Details**:
  - File: `client/src/pages/cancel-subscription.tsx`
  - New state: `hasUnderstoodImmediateAccess` for checkbox tracking
  - Test IDs: `checkbox-understand-immediate-access`, `button-confirm-cancel-subscription`, `button-cancel-go-back`
- **Impact**: Reduces user confusion about subscription cancellation behavior and encourages maximum use of paid period

## Weight Goal Logic Update (January 12, 2026)

### Minimum -2kg Weight Goal for Normal BMI Users
- **Feature**: Users with normal BMI (18.5-25) now always have at least -2kg as weight goal instead of 0kg
- **Rationale**: "0kg da perdere" was not motivating for clients; always showing a small achievable goal is more encouraging
- **Implementation**:
  - Modified `calculateNutritionalNeeds()` in `server/services/openai.ts`
  - Calculates minimum healthy weight using BMI 18.5 threshold: `18.5 × height(m)²`
  - For normal BMI: `weightGoal = max(minHealthyWeight, currentWeight - 2)`
  - Edge case: if already near minimum, allows only small reduction (0.5kg) without going below healthy threshold
- **Examples**:
  - 165cm/65kg (BMI 23.9) → Goal: 63kg (-2kg)
  - 160cm/52kg (BMI 20.3) → Goal: 50kg (-2kg)
  - 170cm/54kg (BMI 18.7) → Goal: 53.5kg (-0.5kg, limited by min healthy weight)
- **Impact**: All normal-weight clients now see an achievable weight goal, improving motivation and engagement

## Print and PDF Download (January 12, 2026)

### Meal Plan Print and PDF Export
- **Feature**: Users can now print or download their meal plan as PDF
- **Implementation**:
  - Added "Stampa" button using native window.print()
  - Added "Scarica PDF" button using html2pdf.js library
  - PDF named with date: `Piano-Gazzella-DD-MM-YYYY.pdf`
  - Loading state with spinner during PDF generation
  - Success/error toast notifications
- **Print Styles**:
  - @media print CSS rules in index.css
  - Action buttons hidden during print
  - Cards optimized with page-break rules
  - Text colors adjusted for readability while preserving accent colors
- **Technical Details**:
  - File: `client/src/pages/saved-meal-plan.tsx`
  - Library: html2pdf.js
  - Test IDs: `button-print-plan`, `button-download-pdf`
- **Impact**: Users can save their meal plans offline for easy reference in kitchen or while shopping

## Personalized Calorie and Portion System (February 2, 2026)

### Dynamic Calorie Calculation with Health Conditions
- **Feature**: Complete rewrite of calorie calculation to ensure truly personalized meal plans
- **Implementation**:
  - Dynamic calorie deficit based on weight to lose (350-750 kcal gradient)
  - Thyroid condition integration: -12% BMR reduction for hypothyroid clients
  - Intestinal issues integration: -15% deficit reduction for digestive sensitivities
  - Portion scaling based on calorie target (scale = targetCalories / 1600)
  - Per-meal calorie distribution: Colazione 20%, Spuntino 8%, Pranzo 35%, Merenda 7%, Cena 30%
  - Post-generation validation with 15% tolerance logging
- **Calorie Limits**: Minimum 1100 kcal, Maximum 2200 kcal for safety
- **Technical Details**:
  - File: `server/services/openai.ts` - `calculateNutritionalNeeds()` and `calculatePrecisePortions()`
  - Mifflin-St Jeor BMR formula with activity factor 1.4 (sedentary with exercise)
  - OpenAI prompt includes mandatory calorie distribution table per meal
- **Impact**: Each client now receives portions truly calibrated to their metabolic needs and health conditions