// lib/api/tags.ts
import { Tag } from '../models/types'
import { supabase } from '../supabase'

// Získať všetky tagy
export const getTags = async () => {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true })

  return { data: data as Tag[], error }
}

// Získať tag podľa ID
export const getTagById = async (id: number) => {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('id', id)
    .single()

  return { data: data as Tag, error }
}

// Pridať tagy k receptu
export const addRecipeTags = async (recipeId: number, tagIds: number[]) => {
  const recipeTags = tagIds.map(tagId => ({
    recipe_id: recipeId,
    tag_id: tagId
  }))

  const { data, error } = await supabase
    .from('recipe_tags')
    .insert(recipeTags)
    .select()

  return { data, error }
}

// Odstrániť tagy z receptu
export const removeRecipeTags = async (recipeId: number) => {
  const { error } = await supabase
    .from('recipe_tags')
    .delete()
    .eq('recipe_id', recipeId)

  return { error }
}
