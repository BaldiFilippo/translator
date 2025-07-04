import { supabase } from "../supabaseClient"

function handleServiceError(error, defaultMessage) {
    console.error("Service error:", error)
    return {
        data: null,
        error: error instanceof Error ? error.message : defaultMessage,
    }
}

export class TranslationService {
    /**
     * Save a translation prompt
     */
    static async savePrompt(
        prompt,
        userId
    ) {
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
            return handleServiceError(error, "Failed to save prompt")
        }
    }

    /**
     * Get all saved prompts for the current user
     */
    static async getSavedPrompts(userId) {
        if (!userId) {
            return { data: null, error: "User ID is required to fetch prompts." };
        }
        try {
            const { data, error } = await supabase
                .from("translation")
                .select("id, name, source_text, translated_text, source_language, target_language, created_at")
                .eq("name", userId)
                .order("created_at", { ascending: false });

            if (error) throw error;

            return { data: data || [], error: null };
        } catch (error) {
            return handleServiceError(error, "Failed to fetch prompts");
        }
    }

    /**
     * Delete a saved prompt
     */
    static async deletePrompt(id, userId) {
        if (!userId) {
            return { error: "User ID is required to delete a prompt." };
        }
        try {
            const { error } = await supabase
                .from("translation")
                .delete()
                .match({ id, name: userId });

            if (error) throw error;

            return { error: null };
        } catch (error) {
            return handleServiceError(error, "Failed to delete prompt");
        }
    }
}
