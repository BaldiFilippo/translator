export interface SavedPrompt {
    id: number
  name: string
    source_text: string
    translated_text: string
    source_language: string
    target_language: string
    created_at?: string
}

export interface TranslationResponse {
  translations: {
    text: string
    detected_source_language?: string
  }[]
}
