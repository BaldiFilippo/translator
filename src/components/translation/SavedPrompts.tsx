import { SavedPrompt, SUPPORTED_LANGUAGES } from "@/lib/types"
import { motion } from "framer-motion"
import { BookmarkIcon, Trash2 } from "lucide-react"
import { Button } from "../ui/button"

interface SavedPromptsProps {
    prompts: SavedPrompt[]
    onLoadPrompt: (prompt: SavedPrompt) => void
    onDeletePrompt: (id: number) => void
}

export function SavedPrompts({
    prompts,
    onLoadPrompt,
    onDeletePrompt,
}: SavedPromptsProps) {
    const getLanguageName = (code: string): string => {
        return (
            SUPPORTED_LANGUAGES.find((lang) => lang.code === code)?.name || code
        )
    }

    if (prompts.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <BookmarkIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>No saved prompts yet. Translate something and save it!</p>
            </div>
        )
    }

    return (
        <div className="grid gap-4">
            {prompts.map((prompt) => (
                <motion.div
                    key={prompt.id}
                    className="border rounded-lg p-4 hover:bg-orange-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
                    onClick={() => onLoadPrompt(prompt)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Load saved prompt: ${prompt.name}`}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-lg truncate max-w-[70%]">
                            {prompt.source_text}
                        </h3>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDeletePrompt(prompt.id)
                                }}
                                aria-label={`Delete saved prompt: ${prompt.name}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                            <p className="text-muted-foreground mb-1">
                                {getLanguageName(prompt.source_language)}
                            </p>
                            <p className="line-clamp-2">{prompt.source_text}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground mb-1">
                                {getLanguageName(prompt.target_language)}
                            </p>
                            <p className="line-clamp-2">
                                {prompt.translated_text}
                            </p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
