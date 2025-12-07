import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://szucnjidivslauqefgmc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6dWNuamlkaXZzbGF1cWVmZ21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMTU0NjYsImV4cCI6MjA4MDY5MTQ2Nn0.kn9V3QaOANmorglAot7knvS4HU6smUOuf3YmlnMqoI4'

export const supabase = createClient(supabaseUrl, supabaseKey)