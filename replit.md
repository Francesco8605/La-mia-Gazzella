# Overview

"La Mia Gazzella" è una moderna applicazione web per la nutrizione e la pianificazione alimentare alimentata dall'IA, costruita con un'architettura TypeScript full-stack. The application allows users to create personalized meal plans and recipes based on their dietary preferences, health goals, and nutritional requirements using OpenAI's GPT models for content generation.

## Recent Major Updates (August 20, 2025)
- **Database Storage Fixed**: Successfully migrated from MemStorage to PostgreSQL DatabaseStorage using Drizzle ORM
- **AI Meal Plan Generation**: Fully functional OpenAI integration generating personalized 7-day meal plans following Gazzella protocol
- **Authentication System**: Complete user registration and login with session management working with PostgreSQL
- **Meal Plan API**: Endpoint `/api/meal-plans/generate` successfully creating and storing AI-generated meal plans in database
- **Gazzella Protocol Integration**: Updated OpenAI service with authentic Manuale della Gazzella rules from provided text files
- **Complete Italian Localization**: All UI elements, days of week, meals, and macronutrients fully translated to Italian
- **Improved Responsive Layout**: Enhanced mobile/tablet viewing with better grid layout for 7-day meal plans
- **CRITICAL RULE IMPLEMENTED**: Every meal (breakfast, snacks, lunch, dinner) now ALWAYS contains both protein + complex carbohydrates as required by Gazzella protocol
- **Perfect Compliance**: Eliminated all forbidden foods (legumes, dairy, quinoa, oats, yogurt, smoothies) and ensured authentic Gazzella meal combinations
- **Balanced Meal Structure**: Snacks now properly combine ingredients like "Mela con mandorle e gallette di riso" instead of separate items
- **USER DATA ISOLATION FIXED**: Implemented proper authentication middleware ensuring each user sees only their own data
- **Security Enhancement**: All meal plan and profile endpoints now require authentication and validate user ownership
- **DASHBOARD INTEGRATION**: Added saved meal plans section to home dashboard with direct access to user's personalized plans
- **COMPLETE PROFILE UPDATE FLOW**: Implemented /aggiorna-profilo page with weight and data update capabilities
- **SAVED PLAN VISUALIZATION**: Created /piano-salvato/:id page showing full 7-day meal plan with all nutritional details
- **SEAMLESS USER FLOW**: Plans now saved in "I Miei Piani Personalizzati" page with automatic redirect after generation
- **NAVIGATION SIMPLIFIED**: Removed Personalizzazione page as requested - users manage profiles via "Il Mio Profilo" only
- **PWA ICON CONFIGURATION**: Added Logo-gazzella.jpg as app icon for mobile home screen installation with complete PWA meta tags and manifest.json
- **NAVIGATION STYLING**: Enhanced navigation bar with professional background and glassmorphism effects
- **OFFICIAL GAZZELLA TABLE 2025**: Implemented exact weekly structure from official PDF including savory breakfasts
- **AUTHENTIC MEAL COMBINATIONS**: System now follows precisely the 7-day table structure from Manuale della Gazzella
- **SAVORY BREAKFASTS INCLUDED**: Added "Pane integrale + uova + olio EVO" (Wednesday) and "Pane integrale + prosciutto crudo + olio EVO" (Saturday)
- **PERMITTED FOODS ONLY**: Yogurt greco, yogurt bianco, fiocchi di avena, and biscotti now allowed ONLY as specified in official table
- **PERSONALIZED PORTIONS**: System calculates precise weights (grams) based on individual client data (weight, height, BMI, goals)
- **BMI INTEGRATION**: Meal plans now display current BMI, target weight, and weight loss goals in personalized profile section
- **DIET EXPLANATION SYSTEM**: Each plan includes comprehensive Gazzella method explanation with principles and expected results
- **TIME ESTIMATION**: Realistic time predictions for reaching weight goals based on healthy 0.5-1kg/week loss rate
- **ENHANCED VISUALIZATION**: Saved meal plan pages show complete client profile with BMI category and personalized targets
- **AI PERSONALIZATION TESTED**: Confirmed system generates customized portion sizes for different weight categories (60kg, 60-70kg, >70kg)

The system features a React frontend with shadcn/ui components, an Express.js backend API, and PostgreSQL database integration through Drizzle ORM. The application provides an intuitive user interface for inputting health profiles, generating customized meal plans, and browsing recipe collections with detailed nutritional information.

# User Preferences

Preferred communication style: Simple, everyday language.
App name: "La Mia Gazzella" - nome ufficiale dell'applicazione web per la pianificazione nutrizionale.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development and building
- **UI Library**: shadcn/ui components built on Radix UI primitives for accessible, customizable interfaces
- **Styling**: Tailwind CSS with custom design system including glass morphism effects and modern gradients
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Runtime**: Node.js with Express.js web framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful API structure with proper HTTP status codes and error handling
- **Middleware**: Express middleware for JSON parsing, URL encoding, and request logging
- **Development**: Hot module replacement with Vite integration for seamless development experience

## Data Storage Solutions
- **Database**: PostgreSQL as the primary relational database
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for database migrations and schema updates
- **Development Storage**: In-memory storage implementation for development/testing purposes

## Database Schema Design
The system uses four main entities:
- **Users**: Basic authentication and user identification
- **User Profiles**: Comprehensive health and dietary preference data (age, weight, dietary restrictions, health goals, activity levels)
- **Meal Plans**: Complete meal plans with nutritional targets and daily meal structures
- **Recipes**: Detailed recipe information including ingredients, instructions, and nutritional content

## Authentication and Authorization
- **Session Management**: PostgreSQL-based session storage using connect-pg-simple
- **User System**: Simple username/password authentication structure
- **Profile Association**: User profiles linked to authenticated users for personalized experiences

## AI Integration Architecture
- **AI Provider**: OpenAI GPT-4o integration for meal plan and recipe generation
- **Content Generation**: Structured prompts for creating personalized meal plans based on user profiles
- **Nutritional Calculation**: AI-powered macronutrient distribution and calorie targeting
- **Recipe Creation**: Dynamic recipe generation with dietary restriction compliance

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18 with React DOM for modern component architecture
- **Vite**: Build tool and development server with hot module replacement
- **Express.js**: Web application framework for the Node.js backend
- **TypeScript**: Type safety across the entire application stack

## Database and ORM
- **Drizzle ORM**: Modern TypeScript ORM with excellent developer experience
- **Drizzle Kit**: Database migration and introspection tooling
- **Neon Database**: Serverless PostgreSQL database provider
- **PostgreSQL**: Relational database management system

## UI and Design System
- **shadcn/ui**: Complete component library built on Radix UI
- **Radix UI**: Unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library with consistent design
- **Class Variance Authority**: Utility for creating component variants

## State Management and Data Fetching
- **TanStack Query**: Powerful data synchronization for server state
- **React Hook Form**: Performant forms with easy validation
- **Zod**: TypeScript-first schema validation library

## AI and External Services
- **OpenAI**: GPT-4o integration for intelligent meal planning and recipe generation
- **Date-fns**: Modern date utility library for meal plan scheduling

## Development and Build Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind integration
- **Autoprefixer**: Automatic CSS vendor prefixing