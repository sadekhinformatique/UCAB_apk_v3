
interface ImportMetaEnv {
  readonly VITE_API_KEY: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  // plus d'autres variables d'environnement si nécessaire
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}