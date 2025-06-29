"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    BookmarkIcon,
    RotateCw,
    Save,
    Trash2,
    Copy,
    Check,
    X,
} from "lucide-react"
import { translateText } from "@/lib/translate-service"
import type { SavedPrompt } from "@/lib/types"
import { supabase } from "@/lib/supabaseClient"
import { User } from "@supabase/supabase-js"
import { LoginForm } from "@/components/login-form"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

export default function HomePage() {
    const [sourceText, setSourceText] = useState("")
    const [translatedText, setTranslatedText] = useState("")
    const [sourceLanguage, setSourceLanguage] = useState("EN")
    const [targetLanguage, setTargetLanguage] = useState("IT")
    const [isTranslating, setIsTranslating] = useState(false)
    const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([])
    const [promptName, setPromptName] = useState("")
    const [activeTab, setActiveTab] = useState("translate")
    const [isCopied, setIsCopied] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [copyFeedback, setCopyFeedback] = useState("")
    const router = useRouter()

    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            setUser(user)
            setLoading(false)
        }
        getUser()
        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null)
            }
        )
        return () => {
            listener?.subscription.unsubscribe()
        }
    }, [])

    const fetchSavedPrompts = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("translation")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) {
                throw error
            }
            setSavedPrompts(data || [])
        } catch (error) {
            console.error(
                "Error fetching prompts:",
                JSON.stringify(error, null, 2)
            )
        }
    }, [])

    useEffect(() => {
        fetchSavedPrompts()
    }, [fetchSavedPrompts])

    const handleCopy = () => {
        navigator.clipboard.writeText(translatedText)
        setIsCopied(true)
        setCopyFeedback("Copied!")
        setTimeout(() => {
            setIsCopied(false)
            setCopyFeedback("")
        }, 1500)
    }

    const handleTranslate = async () => {
        if (!sourceText.trim()) return
        setIsTranslating(true)
        setTranslatedText("")
        try {
            const result = await translateText(
                sourceText,
                sourceLanguage,
                targetLanguage
            )
            setTranslatedText(result)
        } catch {
            setTranslatedText("Error: Could not translate. Please try again.")
        } finally {
            setIsTranslating(false)
        }
    }

    const savePrompt = async () => {
        if (!sourceText.trim() || !promptName.trim()) return

        try {
            const { data, error } = await supabase
                .from("translation")
                .insert([
                    {
                        name: promptName,
                        source_text: sourceText,
                        source_language: sourceLanguage,
                        target_language: targetLanguage,
                        translated_text: translatedText,
                    },
                ])
                .select()

            if (error) {
                throw error
            }

            if (data) {
                setSavedPrompts([data[0], ...savedPrompts])
                setPromptName("")
            }
        } catch (error) {
            console.error(
                "Error saving prompt:",
                JSON.stringify(error, null, 2)
            )
        }
    }

    const loadPrompt = (prompt: SavedPrompt) => {
        setSourceText(prompt.source_text)
        setSourceLanguage(prompt.source_language)
        setTargetLanguage(prompt.target_language)
        setTranslatedText(prompt.translated_text)
        setActiveTab("translate")
    }

    const deletePrompt = async (id: number) => {
        try {
            const { error } = await supabase
                .from("translation")
                .delete()
                .match({ id })

            if (error) {
                throw error
            }

            setSavedPrompts(savedPrompts.filter((prompt) => prompt.id !== id))
        } catch (error) {
            console.error(
                "Error deleting prompt:",
                JSON.stringify(error, null, 2)
            )
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <span
                    className="animate-spin rounded-full border-4 border-gray-300 border-t-orange-500 h-10 w-10"
                    aria-label="Loading"
                />
            </div>
        )
    }
    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <LoginForm />
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-background flex flex-col items-center px-2 py-6">
            <header className="w-full max-w-4xl flex justify-between items-center mb-8 px-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center flex-1">
                    DeepL Translator
                </h1>
                <Button
                    onClick={async () => {
                        await supabase.auth.signOut()
                        router.push("/auth/login")
                    }}
                    aria-label="Sign out"
                    variant="ghost"
                    className="ml-4"
                >
                    Sign Out
                </Button>
            </header>
            <section className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-4 md:p-8 flex flex-col gap-8">
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="translate">Translate</TabsTrigger>
                        <TabsTrigger value="saved">Saved Prompts</TabsTrigger>
                    </TabsList>
                    <TabsContent value="translate">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <Label
                                    htmlFor="sourceText"
                                    className="font-semibold"
                                >
                                    Source Language
                                </Label>
                                <Select
                                    value={sourceLanguage}
                                    onValueChange={setSourceLanguage}
                                    aria-label="Select source language"
                                >
                                    <SelectTrigger className="w-full md:w-[160px] focus:ring-2 focus:ring-orange-500">
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EN">
                                            English
                                        </SelectItem>
                                        <SelectItem value="DE">
                                            German
                                        </SelectItem>
                                        <SelectItem value="FR">
                                            French
                                        </SelectItem>
                                        <SelectItem value="ES">
                                            Spanish
                                        </SelectItem>
                                        <SelectItem value="IT">
                                            Italian
                                        </SelectItem>
                                        <SelectItem value="JA">
                                            Japanese
                                        </SelectItem>
                                        <SelectItem value="ZH">
                                            Chinese
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Textarea
                                    id="sourceText"
                                    placeholder="Enter text to translate"
                                    className="min-h-[160px] resize-none mt-2 focus:ring-2 focus:ring-orange-500"
                                    value={sourceText}
                                    onChange={(e) =>
                                        setSourceText(e.target.value)
                                    }
                                    aria-label="Text to translate"
                                    autoFocus
                                />
                                {sourceText && (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute top-2 right-2"
                                        onClick={() => setSourceText("")}
                                        aria-label="Clear input"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <div className="flex flex-col gap-2 relative">
                                <Label
                                    htmlFor="translatedText"
                                    className="font-semibold"
                                >
                                    Target Language
                                </Label>
                                <Select
                                    value={targetLanguage}
                                    onValueChange={setTargetLanguage}
                                    aria-label="Select target language"
                                >
                                    <SelectTrigger className="w-full md:w-[160px] focus:ring-2 focus:ring-orange-500">
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EN">
                                            English
                                        </SelectItem>
                                        <SelectItem value="DE">
                                            German
                                        </SelectItem>
                                        <SelectItem value="FR">
                                            French
                                        </SelectItem>
                                        <SelectItem value="ES">
                                            Spanish
                                        </SelectItem>
                                        <SelectItem value="IT">
                                            Italian
                                        </SelectItem>
                                        <SelectItem value="JA">
                                            Japanese
                                        </SelectItem>
                                        <SelectItem value="ZH">
                                            Chinese
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="relative mt-2">
                                    <AnimatePresence>
                                        {isTranslating && (
                                            <motion.div
                                                key="loading"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 z-10 rounded-lg"
                                                aria-live="polite"
                                            >
                                                <span className="animate-spin rounded-full border-4 border-gray-300 border-t-orange-500 h-8 w-8 mr-2" />
                                                Translating...
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <Textarea
                                        id="translatedText"
                                        placeholder="Translation will appear here"
                                        className="min-h-[160px] resize-none focus:ring-2 focus:ring-orange-500 pr-20"
                                        value={translatedText}
                                        readOnly
                                        aria-label="Translation output"
                                        tabIndex={0}
                                    />
                                    <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={handleCopy}
                                            aria-label="Copy translation"
                                            tabIndex={0}
                                        >
                                            {isCopied ? (
                                                <Check className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <Copy className="h-5 w-5" />
                                            )}
                                        </Button>
                                        <a
                                            href={`https://www.google.com/search?q=${encodeURIComponent(
                                                translatedText
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="Search translation on Google"
                                            tabIndex={0}
                                        >
                                            <img
                                                src="/google.svg"
                                                alt="Search on Google"
                                                className="h-5 w-5"
                                            />
                                        </a>
                                    </div>
                                    <AnimatePresence>
                                        {copyFeedback && (
                                            <motion.div
                                                key="copy-feedback"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute bottom-10 right-2 bg-green-500 text-white px-3 py-1 rounded shadow"
                                                aria-live="polite"
                                            >
                                                {copyFeedback}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center mt-6">
                            <Button
                                onClick={handleTranslate}
                                disabled={isTranslating || !sourceText.trim()}
                                className="w-full max-w-[220px] text-lg py-2"
                                aria-label="Translate"
                            >
                                {isTranslating ? (
                                    <>
                                        <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                                        Translating...
                                    </>
                                ) : (
                                    "Translate"
                                )}
                            </Button>
                        </div>
                        <AnimatePresence>
                            {translatedText && !isTranslating && (
                                <motion.div
                                    key="save-section"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="border-t pt-4 mt-4"
                                >
                                    <h3 className="text-lg font-medium mb-2">
                                        Save this translation
                                    </h3>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Name this prompt"
                                            value={promptName}
                                            onChange={(e) =>
                                                setPromptName(e.target.value)
                                            }
                                            aria-label="Prompt name"
                                        />
                                        <Button
                                            onClick={savePrompt}
                                            disabled={!promptName.trim()}
                                            variant="outline"
                                            aria-label="Save translation"
                                        >
                                            <Save className="mr-2 h-4 w-4" />
                                            Save
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </TabsContent>
                    <TabsContent value="saved">
                        <div className="grid gap-4">
                            {savedPrompts.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <BookmarkIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
                                    <p>
                                        No saved prompts yet. Translate
                                        something and save it!
                                    </p>
                                </div>
                            ) : (
                                savedPrompts.map((prompt) => (
                                    <motion.div
                                        key={prompt.id}
                                        className="border rounded-lg p-4 hover:bg-orange-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        onClick={() => loadPrompt(prompt)}
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`Load saved prompt: ${prompt.name}`}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-medium text-lg truncate max-w-[70%]">
                                                {prompt.name}
                                            </h3>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        deletePrompt(prompt.id)
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
                                                    {getLanguageName(
                                                        prompt.source_language
                                                    )}
                                                </p>
                                                <p className="line-clamp-2">
                                                    {prompt.source_text}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground mb-1">
                                                    {getLanguageName(
                                                        prompt.target_language
                                                    )}
                                                </p>
                                                <p className="line-clamp-2">
                                                    {prompt.translated_text}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </section>
        </main>
    )
}

function getLanguageName(code: string): string {
    const languages: Record<string, string> = {
        EN: "English",
        DE: "German",
        FR: "French",
        ES: "Spanish",
        IT: "Italian",
        JA: "Japanese",
        ZH: "Chinese",
    }
    return languages[code] || code
}
