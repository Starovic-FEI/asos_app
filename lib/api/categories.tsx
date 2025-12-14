// lib/api/categories.ts
import { Category } from '../models/types'
import { supabase } from '../supabase'

// Získať všetky kategórie
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  return { data: data as Category[], error }
}

// Získať kategóriu podľa ID
export const getCategoryById = async (id: number) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  return { data: data as Category, error }
}
