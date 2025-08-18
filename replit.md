# Overview

This is a modern AI-powered nutrition and meal planning web application built with a full-stack TypeScript architecture. The application allows users to create personalized meal plans and recipes based on their dietary preferences, health goals, and nutritional requirements using OpenAI's GPT models for content generation.

The system features a React frontend with shadcn/ui components, an Express.js backend API, and PostgreSQL database integration through Drizzle ORM. The application provides an intuitive user interface for inputting health profiles, generating customized meal plans, and browsing recipe collections with detailed nutritional information.

# User Preferences

Preferred communication style: Simple, everyday language.

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