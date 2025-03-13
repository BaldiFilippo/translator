export interface SavedPrompt {
  id: string
  name: string
  sourceText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
}

export interface TranslationResponse {
  translations: {
    text: string
    detected_source_language?: string
  }[]
}
