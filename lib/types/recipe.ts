// lib/types/recipe.ts

export interface Recipe {
  id: number
  title: string
  description: string
  ingredients: Ingredient[]
  steps: Step[]
  difficulty: 'easy' | 'medium' | 'hard'
  prep_time_minutes: number
  avg_rating: number
  servings: number
  author_id: string
  created_at: string
  category_id: number
  images?: RecipeImage[]
  tags?: Tag[]
  category?: Category
}

export interface Ingredient {
  name: string
  amount: string
  unit: string
}

export interface Step {
  order: number
  instruction: string
}

export interface RecipeImage {
  id: number
  recipe_id: number
  image_url: string
  is_primary: boolean
  created_at: string
}

export interface Tag {
  id: number
  name: string
  slug: string
}

export interface Category {
  id: number
  name: string
  slug: string
  icon?: string
}

// Pre vytvorenie nového receptu
export interface CreateRecipeInput {
  title: string
  description: string
  ingredients: Ingredient[]
  steps: Step[]
  difficulty: 'easy' | 'medium' | 'hard'
  prep_time_minutes: number
  servings: number
  category_id: number
  tag_ids?: number[]
}

// Pre filter/vyhľadávanie
export interface RecipeFilter {
  category_id?: number
  tag_ids?: number[]
  difficulty?: 'easy' | 'medium' | 'hard'
  max_prep_time?: number
  search?: string
}