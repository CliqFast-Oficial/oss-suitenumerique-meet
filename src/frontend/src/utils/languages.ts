// Map frontend language codes to backend language codes

export type BackendLanguage =
  | 'pt-br'
  | 'en-us'
  | 'fr-fr'
  | 'nl-nl'
  | 'de-de'
  | 'es-es'
export type FrontendLanguage = 'pt-BR' | 'en' | 'fr' | 'nl' | 'de' | 'es'

const frontendToBackendMap: Record<FrontendLanguage, BackendLanguage> = {
  'pt-BR': 'pt-br',
  en: 'en-us',
  fr: 'fr-fr',
  nl: 'nl-nl',
  de: 'de-de',
  es: 'es-es',
}

export const convertToBackendLanguage = (
  frontendLang: string = 'fr'
): BackendLanguage => {
  return frontendToBackendMap[frontendLang as FrontendLanguage]
}
