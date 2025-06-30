import { supabase } from "../supabaseClient"
import { SavedPrompt } from "../types"

export class TranslationService {
    

    /**
     * Save a translation prompt
     */
    static async savePrompt(
        prompt: Omit<SavedPrompt, "id" | "created_at">,
        userId: string
    ): Promise<{ data: SavedPrompt | null; error: string | null }> {
        if (!userId) {
            return { data: null, error: "User ID is required to save a prompt." }
        }
        try {
            const { data, error } = await supabase
                .from("translation")
                .insert([{ ...prompt, name: userId }])
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
                .select("id, name, source_text, translated_text, source_language, target_language, created_at")
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
