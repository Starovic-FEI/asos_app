# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native recipe management application built with Expo and Supabase. The app allows users to browse recipes, save favorites, rate and review recipes, and manage their authentication.

## Development Commands

### Essential Commands
```bash
# Install dependencies
npm install

# Start development server
npm start
# or
expo start

# Platform-specific development
npm run android    # Run on Android emulator
npm run ios       # Run on iOS simulator
npm run web       # Run in web browser

# Code quality
npm run lint      # Run ESLint

# Reset project (moves starter code to app-example)
npm run reset-project
```

### Testing Commands
Currently no test framework is configured in the project.

## Architecture

### MVVM Pattern
The codebase follows a clean MVVM (Model-View-ViewModel) architecture:

- **Models** (`lib/models/types.tsx`): TypeScript interfaces defining the data structures (Recipe, Profile, Review, Rating, SavedRecipe, etc.)
- **API Layer** (`lib/api/`): Supabase data access functions organized by domain (auth, recipes, ratings, reviews, saved)
- **ViewModels** (`lib/viewmodels/`): Custom React hooks that manage state and orchestrate API calls (useAuth, useRecipes, useRatings, useReviews, useSaved)
- **Views** (`app/`, `components/`): React Native components

### Key Architecture Patterns

1. **Supabase Integration**: Single client instance exported from `lib/supabase.js`. All API functions use this client to interact with the backend.

2. **File-based Routing**: Uses Expo Router with file-based routing in the `app/` directory. The `(auth)` group contains authentication-related screens (login, register).

3. **ViewModels as Hooks**: Each ViewModel exports a custom hook (e.g., `useAuth()`) that encapsulates:
   - State management (loading, error, data)
   - API orchestration
   - Business logic
   - Return object with data and action methods

4. **Type Safety**: All data structures are strictly typed in `lib/models/types.tsx`. API functions cast Supabase responses to these types.

5. **Path Aliases**: TypeScript configured with `@/*` path alias pointing to the root directory for cleaner imports.

### Data Model Structure

The app manages several interconnected entities:
- **Users/Profiles**: User authentication and profile information
- **Recipes**: Core recipe data with ingredients, steps, difficulty, prep time, and category
- **Categories & Tags**: Recipe classification through categories and recipe_tags junction table
- **RecipeImages**: Multiple images per recipe with primary image flag
- **Ratings**: User star ratings for recipes (affects avg_rating on Recipe)
- **Reviews**: User text reviews for recipes
- **SavedRecipes**: User's saved/favorited recipes

### Component Organization

- **Theme Components** (`components/themed-*.tsx`): Wrappers that respond to light/dark mode
- **UI Components** (`components/ui/`): Reusable UI primitives like IconSymbol, Collapsible
- **Hooks** (`hooks/`): Theme and color scheme utilities

## Important Conventions

### API Functions
All API functions follow this pattern:
```typescript
export const functionName = async (params) => {
  const { data, error } = await supabase.from('table').operation()
  return { data: data as Type, error }
}
```
Always return both `data` and `error` for consistent error handling.

### ViewModel Hooks
ViewModels should:
- Initialize with `loading: true` state
- Set `loading: false` after initial data fetch
- Store error messages as strings in `error` state
- Return boolean success/failure from mutation methods
- Include convenience properties like `isLoggedIn: !!user`

### TypeScript Files
Component files use `.tsx` extension, but some lib files use `.tsx` even though they don't contain JSX (e.g., `lib/api/auth.tsx`, `lib/models/types.tsx`). This is inconsistent but existing convention.

### Comments
Some comments are in Slovak (e.g., "Získať všetky recepty" = "Get all recipes"). This is an existing pattern in the codebase.

## Supabase Configuration

The Supabase client is configured in `lib/supabase.js` with hardcoded credentials. In production, these should be moved to environment variables using `expo-constants` or similar.

Current tables:
- profiles
- recipes
- categories
- tags
- recipe_tags (junction)
- recipe_images
- saved_recipes
- ratings
- reviews
- reports

## React Native & Expo Specifics

- Uses React 19.1.0 and React Native 0.81.5
- Expo SDK ~54
- New Architecture enabled (`newArchEnabled: true`)
- Supports iOS, Android, and Web platforms
- Uses `expo-router` for navigation (file-based routing)
- Theme system supports light/dark modes via `useColorScheme` hook
