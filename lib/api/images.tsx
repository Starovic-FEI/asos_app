// lib/api/images.ts
import { RecipeImage } from '../models/types'
import { supabase } from '../supabase'

// Nahrať obrázok do Supabase Storage
export const uploadRecipeImage = async (file: File | Blob, recipeId: number, isPrimary: boolean = false) => {
  const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg'
  const fileName = `${recipeId}-${Date.now()}.${fileExt}`
  const filePath = `recipes/${fileName}`

  // Upload do storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('recipe-photos')
    .upload(filePath, file)

  if (uploadError) {
    return { data: null, error: uploadError }
  }

  // Získať public URL
  const { data: { publicUrl } } = supabase.storage
    .from('recipe-photos')
    .getPublicUrl(filePath)

  // Uložiť do recipe_images tabuľky
  const { data, error } = await supabase
    .from('recipe_images')
    .insert({
      recipe_id: recipeId,
      image_url: publicUrl,
      is_primary: isPrimary
    })
    .select()
    .single()

  return { data: data as RecipeImage, error }
}

// Pridať viacero obrázkov
export const uploadMultipleRecipeImages = async (
  files: (File | Blob)[],
  recipeId: number,
  primaryIndex: number = 0
) => {
  const results = []

  for (let i = 0; i < files.length; i++) {
    const result = await uploadRecipeImage(files[i], recipeId, i === primaryIndex)
    results.push(result)
  }

  return results
}

// Zmazať obrázok
export const deleteRecipeImage = async (imageId: number, imageUrl: string) => {
  // Extrahovať path z URL
  const path = imageUrl.split('/').slice(-2).join('/')

  // Zmazať zo storage
  await supabase.storage
    .from('recipe-photos')
    .remove([path])

  // Zmazať z tabuľky
  const { error } = await supabase
    .from('recipe-photos')
    .delete()
    .eq('id', imageId)

  return { error }
}

// Nastaviť primary obrázok
export const setPrimaryImage = async (recipeId: number, imageId: number) => {
  // Najprv zruš primary všetkým obrázkom receptu
  await supabase
    .from('recipe_images')
    .update({ is_primary: false })
    .eq('recipe_id', recipeId)

  // Nastav nový primary
  const { data, error } = await supabase
    .from('recipe_images')
    .update({ is_primary: true })
    .eq('id', imageId)
    .select()
    .single()

  return { data: data as RecipeImage, error }
}
