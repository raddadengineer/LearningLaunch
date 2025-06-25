# KidLearn - Educational App for Children

## Overview

KidLearn is a fun, interactive educational application designed for children ages 4-5. The app provides engaging learning experiences through reading and math activities, featuring a colorful, child-friendly interface with voice feedback and progress tracking.

## System Architecture

### Technology Stack

- **Frontend**: React 18 with TypeScript, Vite for build tooling
- **Backend**: Express.js with TypeScript 
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Tailwind CSS with Radix UI components (shadcn/ui)
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Speech**: Web Speech API for text-to-speech functionality

### Architectural Pattern

The application follows a full-stack monorepo structure with clear separation between client and server code:

```
├── client/          # React frontend application
├── server/          # Express.js backend API
├── shared/          # Shared types and database schema
└── docker/          # Docker configuration files
```

## Key Components

### Frontend Architecture

- **Component-based React architecture** using functional components with hooks
- **Responsive design** optimized for touch devices and various screen sizes
- **Child-friendly UI** with large buttons, bright colors, and intuitive navigation
- **Voice feedback system** using Web Speech API for pronunciation help
- **Progress tracking** with visual indicators and star rewards

### Backend Architecture

- **RESTful API** with Express.js handling user management, progress tracking, and content delivery
- **Session-based architecture** with PostgreSQL session storage
- **Modular route handling** separated by feature domains
- **Database abstraction layer** using Drizzle ORM for type-safe database operations

### Database Design

The PostgreSQL database includes:
- **Users table** for child profiles with age and total stars
- **User progress table** tracking completion status across different activities
- **Reading words table** with vocabulary organized by difficulty levels
- **Math activities table** containing problems and visual objects for counting
- **Sessions table** for user authentication state

## Data Flow

1. **User Selection**: Children select their profile from a visual user picker
2. **Activity Selection**: Choose between reading or math activities at appropriate difficulty levels
3. **Interactive Learning**: Complete activities with immediate audio and visual feedback
4. **Progress Tracking**: Automatically save completion status and award stars
5. **Parent Dashboard**: View detailed progress reports and achievements

## External Dependencies

### Database
- **Neon Serverless PostgreSQL**: Cloud-hosted database with connection pooling
- **Drizzle ORM**: Type-safe database operations and migrations

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Google Fonts**: Child-friendly typography (Fredoka One, Open Sans)

### Development Tools
- **Vite**: Fast development server and build tooling
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast bundling for production builds

## Deployment Strategy

### Development Environment
- **Replit integration** with automatic deployment and hot reloading
- **Local Docker development** using docker-compose for full-stack testing
- **Environment-based configuration** supporting both development and production modes

### Production Deployment
- **Docker containerization** with multi-stage builds for optimization
- **Database migrations** automatically applied on container startup
- **Health checks** for both application and database services
- **Static asset serving** with optimized caching strategies

### Infrastructure
- **Autoscaling deployment target** on Replit platform
- **PostgreSQL database** with persistent volume storage
- **Session persistence** using connect-pg-simple for PostgreSQL session store

## Changelog

```
Changelog:
- June 25, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```