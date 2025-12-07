import { supabase } from '../lib/supabase'

// Niekde v komponente
const testConnection = async () => {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
  
  console.log('Recepty:', data)
  console.log('Error:', error)
}