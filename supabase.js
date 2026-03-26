import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = "https://qexgbswdbwlpydolpcll.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFleGdic3dkYndscHlkb2xwY2xsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMjM4OTIsImV4cCI6MjA4ODY5OTg5Mn0.9VuIgA28S47iBKacaKMA8plq82uoP_1XcCAUI1znhBQ"

export const supabase = createClient(supabaseUrl, supabaseKey)