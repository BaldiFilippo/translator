"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card.jsx"
import { Button } from "@/components/ui/button.jsx"
import { TranslationInput } from "./TranslationInput.jsx"
import { TranslationService } from "@/lib/services/translation-service.js"
import { ErrorBoundary } from "@/components/ui/error-boundary.jsx"
import { LoadingSpinner } from "@/components/ui/loading-spinner.jsx"

function useErrorHandler() {
    const [error, setError] = useState(null)

    const handleError = (err, defaultMessage) => {
        setError(err instanceof Error ? { message: err.message } : { message: defaultMessage })
    }

    return { error, handleError, setError }
}

export function TranslationForm({ onSavePrompt, initialPrompt, user }) {
    const { error, handleError, setError } = useErrorHandler()
    const [state, setState] = useState({
        sourceText: initialPrompt?.source_text || "",
        sourceLang: initialPrompt?.source_language || "EN",
        targetLang: initialPrompt?.target_language || "ES",
        isTranslating: false,
        isSaving: false,
        result: {
            originalText: "",
            translatedText: "",
            sourceLang: "",
            targetLang: "",
            timestamp: "",
        },
    })

    useEffect(() => {
        if (initialPrompt) {
            setState(prev => ({
                ...prev,
                sourceText: initialPrompt.source_text,
                sourceLang: initialPrompt.source_language,
                targetLang: initialPrompt.target_language,
                isTranslating: false,
                isSaving: false,
                error: null,
                result: {
                    originalText: initialPrompt.source_text,
                    translatedText: initialPrompt.translated_text,
                    sourceLang: initialPrompt.source_language,
                    targetLang: initialPrompt.target_language,
                    timestamp: new Date().toISOString(),
                },
            }))
        }
    }, [initialPrompt])

    const handleSourceLangChange = (lang) => {
        setState((prev) => ({ ...prev, sourceLang: lang }))
    }

    const handleTargetLangChange = (lang) => {
        setState((prev) => ({ ...prev, targetLang: lang }))
    }

    const handleSourceTextChange = (text) => {
        setState((prev) => ({ ...prev, sourceText: text, error: null }))
    }

    const handleTranslate = async () => {
        if (!state.sourceText.trim()) {
            handleError(null, "Please enter text to translate")
            return
        }

        setState((prev) => ({ ...prev, isTranslating: true, error: null }))

        try {
            const response = await fetch("/api/translate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text: state.sourceText,
                    sourceLanguage: state.sourceLang,
                    targetLanguage: state.targetLang,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Translation failed")
            }

            const translationData = await response.json()

            // Store the translated text in state to be saved later
            setState((prev) => ({
                ...prev,
                result: {
                    originalText: state.sourceText,
                    translatedText: translationData.translatedText,
                    sourceLang: state.sourceLang,
                    targetLang: state.targetLang,
                    timestamp: new Date().toISOString(),
                },
            }))
        } catch (err) {
            handleError(err, "An unknown error occurred during translation")
        } finally {
            setState((prev) => ({ ...prev, isTranslating: false }))
        }
    }

    const handleSave = async () => {
        if (!state.result.translatedText) return // Only save if there's a translation result

        setState((prev) => ({ ...prev, isSaving: true, error: null }))

        try {
            const savedPrompt = await TranslationService.savePrompt(
                {
                    source_text: state.result.originalText,
                    translated_text: state.result.translatedText,
                    source_language: state.result.sourceLang,
                    target_language: state.result.targetLang,
                    name: user?.name || "",
                },
                user.id
            )

            if (savedPrompt.data) {
                onSavePrompt(savedPrompt.data)
            } else if (savedPrompt.error) {
                throw new Error(savedPrompt.error)
            }
        } catch (err) {
            handleError(err, "An unknown error occurred while saving")
        } finally {
            setState((prev) => ({ ...prev, isSaving: false }))
        }
    }

    const handleClear = () => {
        setState({
            sourceText: "",
            sourceLang: "EN",
            targetLang: "ES",
            isTranslating: false,
            isSaving: false,
            error: null,
            result: {
                originalText: "",
                translatedText: "",
                sourceLang: "",
                targetLang: "",
                timestamp: "",
            },
        })
    }

    return (
        <ErrorBoundary>
            <Card className="p-6">
                <div className="space-y-6">
                    <TranslationInput
                        label="Source"
                        text={state.sourceText}
                        language={state.sourceLang}
                        onTextChange={handleSourceTextChange}
                        onLanguageChange={handleSourceLangChange}
                        readOnly={false}
                        className=""
                    />

                    <TranslationInput
                        label="Target"
                        text={state.result?.translatedText || ""}
                        language={state.targetLang}
                        onTextChange={() => {}}
                        onLanguageChange={handleTargetLangChange}
                        readOnly={true}
                        className=""
                        onSave={handleSave}
                    />

                    {error && (
                        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900">
                            <p className="text-sm text-red-800 dark:text-red-200">
                                {error.message}
                            </p>
                        </div>
                    )}

                    <div className="flex gap-2 justify-end">
                        <Button
                            onClick={handleClear}
                            disabled={state.isTranslating}
                            className="min-w-[120px]"
                            variant="outline"
                        >
                            {state.isTranslating ? (
                                <LoadingSpinner size="sm" className="mr-2" />
                            ) : null}
                            {state.isTranslating ? "Canceling..." : "Clear"}
                        </Button>
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