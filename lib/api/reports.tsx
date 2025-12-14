// lib/api/reports.tsx
import { supabase } from '../supabase'

// Nahlásit recept
export const reportRecipe = async (userId: string, recipeId: number, reason?: string) => {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      user_id: userId,
      recipe_id: recipeId,
      reason: reason || 'Nevhodný obsah'
    })
    .select()
    .single()

  return { data, error }
}

// Skontrolovať, či používateľ už nahlásil recept
export const hasUserReported = async (userId: string, recipeId: number) => {
  const { data, error } = await supabase
    .from('reports')
    .select('id')
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
    .single()

  return { hasReported: !!data, error }
}

// Získať počet nahlásení pre recept
export const getReportCount = async (recipeId: number) => {
  const { data, error } = await supabase
    .from('reports')
    .select('id', { count: 'exact' })
    .eq('recipe_id', recipeId)

  return { count: data?.length || 0, error }
}
