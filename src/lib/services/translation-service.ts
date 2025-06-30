import { supabase } from "../supabaseClient"
import { SavedPrompt, TranslationResult } from "../types"

export class TranslationService {
    /**
     * Translate text using the DeepL API
     */
    static async translateText(
        text: string,
        sourceLanguage: string,
        targetLanguage: string
    ): Promise<TranslationResult> {
        try {
            const response = await fetch("/api/translate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text,
                    sourceLanguage,
                    targetLanguage,
                }),
            })

            if (!response.ok) {
                throw new Error("Translation failed")
            }

            const data = await response.json()
            return { translatedText: data.translatedText }
        } catch (error) {
            console.error("Translation error:", error)
            return {
                translatedText: "",
                error: {
                    message:
                        error instanceof Error
                            ? error.message
                            : "Translation failed",
                    code: "translation/api-error",
                },
            }
        }
    }

    /**
     * Save a translation prompt
     */
    static async savePrompt(
        prompt: Omit<SavedPrompt, "id" | "created_at">
    ): Promise<{ data: SavedPrompt | null; error: string | null }> {
        try {
            const { data, error } = await supabase
                .from("translation")
                .insert([prompt])
                .select()
                .single()

            if (error) throw error

            return { data, error: null }
        } catch (error) {
            console.error("Save prompt error:", error)
            return {
                data: null,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to save prompt",
            }
        }
    }

    /**
     * Get all saved prompts for the current user
     */
    static async getSavedPrompts(): Promise<{
        data: SavedPrompt[]
        error: string | null
    }> {
        try {
            const { data, error } = await supabase
                .from("translation")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) throw error

            return { data: data || [], error: null }
        } catch (error) {
            console.error("Get prompts error:", error)
            return {
                data: [],
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch prompts",
            }
        }
    }

    /**
     * Delete a saved prompt
     */
    static async deletePrompt(id: number): Promise<{ error: string | null }> {
        try {
            const { error } = await supabase
                .from("translation")
                .delete()
                .match({ id })

            if (error) throw error

            return { error: null }
        } catch (error) {
            console.error("Delete prompt error:", error)
            return {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete prompt",
            }
        }
    }
}
