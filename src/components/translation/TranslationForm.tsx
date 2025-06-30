"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TranslationInput } from "./TranslationInput"
import { TranslationService } from "@/lib/services/translation-service"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type {
    SavedPrompt,
    TranslationFormState,
    LanguageCode,
    ApiError,
} from "@/lib/types"

interface TranslationFormProps {
    onSavePrompt: (prompt: SavedPrompt) => void
    initialPrompt?: SavedPrompt
}

export function TranslationForm({
    onSavePrompt,
    initialPrompt,
}: TranslationFormProps) {
    const [state, setState] = useState<TranslationFormState>({
        sourceText: initialPrompt?.source_text || "",
        sourceLang: initialPrompt?.source_lang || "EN",
        targetLang: initialPrompt?.target_lang || "ES",
        isTranslating: false,
        error: null,
    })

    useEffect(() => {
        if (initialPrompt) {
            setState({
                sourceText: initialPrompt.source_text,
                sourceLang: initialPrompt.source_lang,
                targetLang: initialPrompt.target_lang,
                isTranslating: false,
                error: null,
            })
        }
    }, [initialPrompt])

    const handleSourceLangChange = (lang: LanguageCode) => {
        setState((prev) => ({ ...prev, sourceLang: lang }))
    }

    const handleTargetLangChange = (lang: LanguageCode) => {
        setState((prev) => ({ ...prev, targetLang: lang }))
    }

    const handleSourceTextChange = (text: string) => {
        setState((prev) => ({ ...prev, sourceText: text, error: null }))
    }

    const handleTranslate = async () => {
        if (!state.sourceText.trim()) {
            setState((prev) => ({
                ...prev,
                error: { message: "Please enter text to translate" },
            }))
            return
        }

        setState((prev) => ({ ...prev, isTranslating: true, error: null }))

        try {
            const { data, error } = await TranslationService.translate({
                sourceText: state.sourceText,
                sourceLang: state.sourceLang,
                targetLang: state.targetLang,
            })

            if (error) throw error

            if (data) {
                const savedPrompt = await TranslationService.savePrompt({
                    source_text: state.sourceText,
                    translated_text: data.translatedText,
                    source_lang: state.sourceLang,
                    target_lang: state.targetLang,
                })

                if (savedPrompt.data) {
                    onSavePrompt(savedPrompt.data)
                }
            }
        } catch (error) {
            setState((prev) => ({
                ...prev,
                error: error as ApiError,
            }))
        } finally {
            setState((prev) => ({ ...prev, isTranslating: false }))
        }
    }

    return (
        <ErrorBoundary>
            <Card className="p-6">
                <div className="space-y-6">
                    <TranslationInput
                        type="source"
                        text={state.sourceText}
                        selectedLang={state.sourceLang}
                        onTextChange={handleSourceTextChange}
                        onLangChange={handleSourceLangChange}
                        disabled={state.isTranslating}
                    />

                    <TranslationInput
                        type="target"
                        text={initialPrompt?.translated_text || ""}
                        selectedLang={state.targetLang}
                        onLangChange={handleTargetLangChange}
                        disabled={state.isTranslating}
                        readOnly
                    />

                    {state.error && (
                        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900">
                            <p className="text-sm text-red-800 dark:text-red-200">
                                {state.error.message}
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button
                            onClick={handleTranslate}
                            disabled={
                                state.isTranslating || !state.sourceText.trim()
                            }
                            className="min-w-[120px]"
                        >
                            {state.isTranslating ? (
                                <LoadingSpinner size="sm" className="mr-2" />
                            ) : null}
                            {state.isTranslating
                                ? "Translating..."
                                : "Translate"}
                        </Button>
                    </div>
                </div>
            </Card>
        </ErrorBoundary>
    )
}
