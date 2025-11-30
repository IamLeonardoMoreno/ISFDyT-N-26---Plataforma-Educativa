
import { createClient } from '@supabase/supabase-js';

// NOTA: En un entorno Vite estricto, las variables de entorno deben comenzar con VITE_.
// Como Vercel a veces tiene problemas pasando variables si no están configuradas perfectamente,
// usamos las claves que proporcionaste directamente aquí para asegurar que la app no se rompa (pantalla blanca).

const supabaseUrl = "https://hakabezoifzbsokpqzpw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhha2FiZXpvaWZ6YnNva3BxenB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNDczNzgsImV4cCI6MjA3OTgyMzM3OH0.-lv2sezp1VM2P1u78ujWpHpU2mBmCNfQ1GaPG7O8xxI";

// Verificación de seguridad para evitar que la app explote si las variables fallan
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Faltan las credenciales de Supabase. La aplicación podría fallar.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
