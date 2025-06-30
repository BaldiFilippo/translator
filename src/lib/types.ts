import { User } from "@supabase/supabase-js"

export interface SavedPrompt {
    id: number
    user_id: string
    source_text: string
    translated_text: string
    source_lang: string
    target_lang: string
    created_at: string
}

export interface TranslationRequest {
    sourceText: string
    sourceLang: string
    targetLang: string
}

export interface TranslationResponse {
    translatedText: string
    detectedLanguage?: {
        language: string
        confidence: number
    }
}

export interface ApiError {
    message: string
    code?: string
    status?: number
}

export interface ServiceResponse<T> {
    data: T | null
    error: ApiError | null
}

export interface AuthState {
    user: User | null
    loading: boolean
    error: ApiError | null
}

export type LanguageCode = string

export interface Language {
    code: LanguageCode
    name: string
    nativeName?: string
}

export interface TranslationFormState {
    sourceText: string
    sourceLang: LanguageCode
    targetLang: LanguageCode
    isTranslating: boolean
    error: ApiError | null
}

export interface TranslationResult {
    originalText: string
    translatedText: string
    sourceLang: LanguageCode
    targetLang: LanguageCode
    timestamp: string
}

// Constants
export const SUPPORTED_LANGUAGES: Language[] = [
    { code: "EN", name: "English" },
    { code: "DE", name: "German" },
    { code: "FR", name: "French" },
    { code: "ES", name: "Spanish" },
    { code: "IT", name: "Italian" },
    { code: "JA", name: "Japanese" },
    { code: "ZH", name: "Chinese" },
]
