
interface ImportMetaEnv {
  readonly VITE_API_KEY: string
  // plus d'autres variables d'environnement si nécessaire
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
