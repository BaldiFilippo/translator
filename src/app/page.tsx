"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SavedPrompt, ApiError } from "@/lib/types"
import { useAuth } from "@/lib/useAuth"
import { LoginForm } from "@/components/login-form"
import { TranslationForm } from "@/components/translation/TranslationForm"
import { SavedPrompts } from "@/components/translation/SavedPrompts"
import { TranslationService } from "@/lib/services/translation-service"
import { AuthService } from "@/lib/services/auth-service"
import { Button } from "@/components/ui/button"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function HomePage() {
    const { user, loading, error: authError } = useAuth()
    const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([])
    const [activeTab, setActiveTab] = useState("translate")
    const [selectedPrompt, setSelectedPrompt] = useState<
        SavedPrompt | undefined
    >()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<ApiError | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (user) {
            fetchSavedPrompts()
        } else if (!loading) {
            setIsLoading(false)
        }
    }, [user, loading])

    const fetchSavedPrompts = async () => {
        try {
            setIsLoading(true)
            const { data, error } = await TranslationService.getSavedPrompts()
            if (error) throw error
            if (data) {
                setSavedPrompts(data)
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? { message: err.message }
                    : { message: "Failed to fetch saved prompts" }
            )
        } finally {
            setIsLoading(false)
        }
    }

    const handleSavePrompt = (prompt: SavedPrompt) => {
        setSavedPrompts([prompt, ...savedPrompts])
    }

    const handleLoadPrompt = (prompt: SavedPrompt) => {
        setSelectedPrompt(prompt)
        setActiveTab("translate")
    }

    const handleDeletePrompt = async (id: number) => {
        try {
            const { error } = await TranslationService.deletePrompt(id)
            if (error) throw error
            setSavedPrompts(savedPrompts.filter((prompt) => prompt.id !== id))
        } catch (err) {
            setError(
                err instanceof Error
                    ? { message: err.message }
                    : { message: "Failed to delete prompt" }
            )
        }
    }

    const handleSignOut = async () => {
        try {
            const { error } = await AuthService.signOut()
            if (error) throw error
            router.push("/auth/login")
        } catch (err) {
            setError(
                err instanceof Error
                    ? { message: err.message }
                    : { message: "Failed to sign out" }
            )
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <ErrorBoundary>
                    <LoginForm />
                </ErrorBoundary>
            </div>
        )
    }

    return (
        <ErrorBoundary>
            <main className="min-h-screen bg-background flex flex-col items-center px-2 py-6">
                <header className="w-full max-w-4xl flex justify-between items-center mb-8 px-2">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center flex-1">
                        DeepL Translator
                    </h1>
                    <Button
                        onClick={handleSignOut}
                        aria-label="Sign out"
                        variant="ghost"
                        className="ml-4"
                    >
                        Sign Out
                    </Button>
                </header>

                <section className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-4 md:p-8 flex flex-col gap-8">
                    {(error || authError) && (
                        <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900">
                            <p className="text-sm text-red-800 dark:text-red-200">
                                {error?.message || authError?.message}
                            </p>
                        </div>
                    )}

                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="translate">
                                Translate
                            </TabsTrigger>
                            <TabsTrigger value="saved">
                                Saved Prompts
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="translate">
                            <TranslationForm
                                onSavePrompt={handleSavePrompt}
                                initialPrompt={selectedPrompt}
                            />
                        </TabsContent>

                        <TabsContent value="saved">
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <LoadingSpinner size="md" />
                                </div>
                            ) : (
                                <SavedPrompts
                                    prompts={savedPrompts}
                                    onLoadPrompt={handleLoadPrompt}
                                    onDeletePrompt={handleDeletePrompt}
                                />
                            )}
                        </TabsContent>
                    </Tabs>
                </section>
            </main>
        </ErrorBoundary>
    )
}
