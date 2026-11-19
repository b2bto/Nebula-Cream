// Importamos la herramienta para conectar con Supabase.
import { createClient } from "@supabase/supabase-js";

// Datos de conexión del proyecto.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Creamos la conexión con nuestra base de datos.
export const supabase = createClient(supabaseUrl, supabaseKey);
