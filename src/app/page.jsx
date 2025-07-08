"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/useAuth.js"
import { LoginForm } from "@/components/login-form.jsx"
import { TranslationForm } from "@/components/translation/TranslationForm.jsx"
import { SavedPrompts } from "@/components/translation/SavedPrompts.jsx"
import { TranslationService } from "@/lib/services/translation-service.js"
import { AuthService } from "@/lib/services/auth-service.js"
import { Button } from "@/components/ui/button.jsx"
import { ErrorBoundary } from "@/components/ui/error-boundary.jsx"
import { LoadingSpinner } from "@/components/ui/loading-spinner.jsx"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog.jsx"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx"

function useErrorHandler() {
    const [error, setError] = useState(null)

    const handleError = (err, defaultMessage) => {
        setError(
            err instanceof Error
                ? { message: err.message }
                : { message: defaultMessage }
        )
    }

    return { error, handleError, setError }
}

export default function HomePage() {
    const { user, loading, error: authError } = useAuth()
    const { error, handleError, setError } = useErrorHandler()
    const [savedPrompts, setSavedPrompts] = useState([])
    const [activeTab, setActiveTab] = useState("translate")
    const [selectedPrompt, setSelectedPrompt] = useState()
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        if (user) {
            fetchSavedPrompts()
        } else if (!loading) {
            setIsLoading(false)
        }
    }, [user, loading])

    const fetchSavedPrompts = async () => {
        if (!user) return
        try {
            setIsLoading(true)
            const { data, error } = await TranslationService.getSavedPrompts(
                user.id
            )
            if (error) throw error
            if (data) {
                setSavedPrompts(data)
            }
        } catch (err) {
            handleError(err, "Failed to fetch saved prompts")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSavePrompt = (prompt) => {
        setSavedPrompts([prompt, ...savedPrompts])
    }

    const handleLoadPrompt = (prompt) => {
        setSelectedPrompt(prompt)
        setActiveTab("translate")
    }

    const handleDeletePrompt = async (id) => {
        if (!user) return
        try {
            const { error } = await TranslationService.deletePrompt(id, user.id)
            if (error) throw error
            setSavedPrompts(savedPrompts.filter((prompt) => prompt.id !== id))
        } catch (err) {
            handleError(err, "Failed to delete prompt")
        }
    }

    const handleSignOut = async () => {
        try {
            const { error } = await AuthService.signOut()
            if (error) throw error
            router.push("/auth/login")
        } catch (err) {
            handleError(err, "Failed to sign out")
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
                    <h1 className="text-lg md:text-4xl font-bold tracking-tight flex-1">
                        DeepL Translator
                    </h1>
                    {user && (
                        <div className="flex items-center space-x-4">
                            <Avatar>
                                <AvatarImage
                                    src={user.user_metadata.avatar_url}
                                />
                                <AvatarFallback>
                                    {user.email?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="font-medium hidden md:block">
                                {user.user_metadata.full_name || user.email}
                            </span>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="secondary"
                                        className="ml-4"
                                    >
                                        Sign Out
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Are you sure you want to sign out?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Signing out will end your current
                                            session.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleSignOut}
                                        >
                                            Sign Out
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
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
                                user={user}
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
