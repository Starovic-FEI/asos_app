// lib/api/recipes.ts
import { Recipe } from '../models/types'
import { supabase } from '../supabase'

// Získať všetky recepty
export const getRecipes = async () => {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      categories (*),
      recipe_tags (*, tags (*)),
      recipe_images (*)
    `)
  
  return { data: data as Recipe[], error }
}

// Získať jeden recept podľa ID
export const getRecipeById = async (id: number) => {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      categories (*),
      recipe_tags (*, tags (*)),
      recipe_images (*)
    `)
    .eq('id', id)
    .single()
  
  return { data: data as Recipe, error }
}

// Filtrovať recepty podľa kategórie
export const getRecipesByCategory = async (categoryId: number) => {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      categories (*),
      recipe_tags (*, tags (*)),
      recipe_images (*)
    `)
    .eq('category_id', categoryId)
  
  return { data: data as Recipe[], error }
}

// Filtrovať recepty podľa obtiažnosti
export const getRecipesByDifficulty = async (difficulty: string) => {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      categories (*),
      recipe_tags (*, tags (*)),
      recipe_images (*)
    `)
    .eq('difficulty', difficulty)
  
  return { data: data as Recipe[], error }
}

// Filtrovať recepty podľa času prípravy
export const getRecipesByPrepTime = async (maxMinutes: number) => {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      categories (*),
      recipe_tags (*, tags (*)),
      recipe_images (*)
    `)
    .lte('prep_time_minutes', maxMinutes)
  
  return { data: data as Recipe[], error }
}

// Vytvoriť nový recept
export const createRecipe = async (recipe: Partial<Recipe>) => {
  const { data, error } = await supabase
    .from('recipes')
    .insert(recipe)
    .select()
    .single()
  
  return { data: data as Recipe, error }
}

// Aktualizovať recept
export const updateRecipe = async (id: number, updates: Partial<Recipe>) => {
  const { data, error } = await supabase
    .from('recipes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data: data as Recipe, error }
}

// Zmazať recept
export const deleteRecipe = async (id: number) => {
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id)

  return { error }
}

// Získať náhodné recepty (s limitom)
export const getRandomRecipes = async (limit: number = 10) => {
  // Získame recepty s 2 alebo viac nahláseniami
  const { data: reportsData } = await supabase
    .from('reports')
    .select('recipe_id')

  // Spočítame nahlásenia pre každý recept
  const reportCounts = new Map<number, number>()
  reportsData?.forEach(report => {
    const count = reportCounts.get(report.recipe_id) || 0
    reportCounts.set(report.recipe_id, count + 1)
  })

  // Získame ID receptov s 2+ nahláseniami
  const reportedRecipeIds = Array.from(reportCounts.entries())
    .filter(([_, count]) => count >= 2)
    .map(([recipeId, _]) => recipeId)

  let query = supabase
    .from('recipes')
    .select(`
      *,
      categories (*),
      recipe_tags (*, tags (*)),
      recipe_images (*)
    `)

  // Vylúčime nahlásené recepty
  if (reportedRecipeIds.length > 0) {
    query = query.not('id', 'in', `(${reportedRecipeIds.join(',')})`)
  }

  const { data, error } = await query.limit(limit)

  // Náhodne zamiešať recepty
  if (data) {
    const shuffled = [...data].sort(() => Math.random() - 0.5)
    return { data: shuffled as Recipe[], error }
  }

  return { data: data as Recipe[], error }
}

// Získať recepty ktoré používateľ ešte neuložil/nelajkoval
export const getUnsavedRecipes = async (
  userId: string,
  limit: number = 20,
  filters?: {
    categoryId?: number
    difficulty?: string
    maxPrepTime?: number
    tagIds?: number[]
  }
) => {
  // Najprv získame ID receptov ktoré používateľ už má uložené
  const { data: savedData } = await supabase
    .from('saved_recipes')
    .select('recipe_id')
    .eq('user_id', userId)

  const savedRecipeIds = savedData?.map(item => item.recipe_id) || []

  // Získame recepty s 2 alebo viac nahláseniami
  const { data: reportsData } = await supabase
    .from('reports')
    .select('recipe_id')

  // Spočítame nahlásenia pre každý recept
  const reportCounts = new Map<number, number>()
  reportsData?.forEach(report => {
    const count = reportCounts.get(report.recipe_id) || 0
    reportCounts.set(report.recipe_id, count + 1)
  })

  // Získame ID receptov s 2+ nahláseniami
  const reportedRecipeIds = Array.from(reportCounts.entries())
    .filter(([_, count]) => count >= 2)
    .map(([recipeId, _]) => recipeId)

  // Vytvoríme query pre recepty
  let query = supabase
    .from('recipes')
    .select(`
      *,
      categories (*),
      recipe_tags (*, tags (*)),
      recipe_images (*)
    `)

  // Vylúčime uložené recepty
  if (savedRecipeIds.length > 0) {
    query = query.not('id', 'in', `(${savedRecipeIds.join(',')})`)
  }

  // Vylúčime nahlásené recepty
  if (reportedRecipeIds.length > 0) {
    query = query.not('id', 'in', `(${reportedRecipeIds.join(',')})`)
  }

  // Aplikujeme filtre
  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId)
  }

  if (filters?.difficulty) {
    query = query.eq('difficulty', filters.difficulty)
  }

  if (filters?.maxPrepTime) {
    query = query.lte('prep_time_minutes', filters.maxPrepTime)
  }

  const { data, error } = await query.limit(limit * 3) // Načítame viac aby sme mohli filtrovať

  // Ak sú nastavené tagy, filtrujeme recepty ktoré majú aspoň jeden z týchto tagov
  let filteredData = data
  if (filters?.tagIds && filters.tagIds.length > 0 && data) {
    filteredData = data.filter(recipe => {
      const recipeTags = recipe.recipe_tags?.map(rt => rt.tag_id) || []
      return filters.tagIds!.some(tagId => recipeTags.includes(tagId))
    })
  }

  // Náhodne zamiešať a obmedziť na požadovaný limit
  if (filteredData) {
    const shuffled = [...filteredData]
      .sort(() => Math.random() - 0.5)
      .slice(0, limit)
    return { data: shuffled as Recipe[], error }
  }

  return { data: filteredData as Recipe[], error }
}