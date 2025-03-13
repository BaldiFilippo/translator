'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BookmarkIcon, RotateCw, Save, Trash2 } from 'lucide-react'
import { translateText } from '@/lib/translate-service'
import type { SavedPrompt } from '@/lib/types'

export default function TranslatorApp() {
  const [sourceText, setSourceText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState('EN')
  const [targetLanguage, setTargetLanguage] = useState('IT')
  const [isTranslating, setIsTranslating] = useState(false)
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([])
  const [promptName, setPromptName] = useState('')
  const [activeTab, setActiveTab] = useState('translate')

  // Load saved prompts from localStorage on component mount
  useEffect(() => {
    const savedPromptsData = localStorage.getItem('savedPrompts')
    if (savedPromptsData) {
      setSavedPrompts(JSON.parse(savedPromptsData))
    }
  }, [])

  // Save prompts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts))
  }, [savedPrompts])

  const handleTranslate = async () => {
    if (!sourceText.trim()) return

    setIsTranslating(true)
    try {
      const result = await translateText(
        sourceText,
        sourceLanguage,
        targetLanguage
      )
      setTranslatedText(result)
    } catch (error) {
      console.error('Translation error:', error)
      setTranslatedText('Error occurred during translation. Please try again.')
    } finally {
      setIsTranslating(false)
    }
  }

  const savePrompt = () => {
    if (!sourceText.trim() || !promptName.trim()) return

    const newPrompt: SavedPrompt = {
      id: Date.now().toString(),
      name: promptName,
      sourceText,
      sourceLanguage,
      targetLanguage,
      translatedText,
    }

    setSavedPrompts([...savedPrompts, newPrompt])
    setPromptName('')
  }

  // Update the loadPrompt function to switch to the translate tab after loading
  const loadPrompt = (prompt: SavedPrompt) => {
    setSourceText(prompt.sourceText)
    setSourceLanguage(prompt.sourceLanguage)
    setTargetLanguage(prompt.targetLanguage)
    setTranslatedText(prompt.translatedText)
    setActiveTab('translate') // Switch to translate tab
  }

  const deletePrompt = (id: string) => {
    setSavedPrompts(savedPrompts.filter((prompt) => prompt.id !== id))
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">DeepL Translator</h1>

      {/* Update the Tabs component to use the activeTab state */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full max-w-4xl mx-auto pointer"
      >
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="translate">Translate</TabsTrigger>
          <TabsTrigger value="saved">Saved Prompts</TabsTrigger>
        </TabsList>

        <TabsContent value="translate">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label htmlFor="sourceLanguage">Source Language</Label>
                      <Select
                        value={sourceLanguage}
                        onValueChange={setSourceLanguage}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EN">English</SelectItem>
                          <SelectItem value="DE">German</SelectItem>
                          <SelectItem value="FR">French</SelectItem>
                          <SelectItem value="ES">Spanish</SelectItem>
                          <SelectItem value="IT">Italian</SelectItem>
                          <SelectItem value="JA">Japanese</SelectItem>
                          <SelectItem value="ZH">Chinese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      id="sourceText"
                      placeholder="Enter text to translate"
                      className="min-h-[200px]"
                      value={sourceText}
                      onChange={(e) => setSourceText(e.target.value)}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label htmlFor="targetLanguage">Target Language</Label>
                      <Select
                        value={targetLanguage}
                        onValueChange={setTargetLanguage}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EN">English</SelectItem>
                          <SelectItem value="DE">German</SelectItem>
                          <SelectItem value="FR">French</SelectItem>
                          <SelectItem value="ES">Spanish</SelectItem>
                          <SelectItem value="IT">Italian</SelectItem>
                          <SelectItem value="JA">Japanese</SelectItem>
                          <SelectItem value="ZH">Chinese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      id="translatedText"
                      placeholder="Translation will appear here"
                      className="min-h-[200px]"
                      value={translatedText}
                      readOnly
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={handleTranslate}
                    disabled={isTranslating || !sourceText.trim()}
                    className="w-full max-w-[200px]"
                  >
                    {isTranslating ? (
                      <>
                        <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                        Translating...
                      </>
                    ) : (
                      'Translate'
                    )}
                  </Button>
                </div>

                {translatedText && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-medium mb-2">
                      Save this translation
                    </h3>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Name this prompt"
                        value={promptName}
                        onChange={(e) => setPromptName(e.target.value)}
                      />
                      <Button
                        onClick={savePrompt}
                        disabled={!promptName.trim()}
                        variant="outline"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardContent className="pt-6">
              {savedPrompts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookmarkIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>No saved prompts yet. Translate something and save it!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {savedPrompts.map((prompt) => (
                    <div
                      key={prompt.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{prompt.name}</h3>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => loadPrompt(prompt)}
                          >
                            Load
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deletePrompt(prompt.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">
                            {getLanguageName(prompt.sourceLanguage)}
                          </p>
                          <p className="line-clamp-2">{prompt.sourceText}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">
                            {getLanguageName(prompt.targetLanguage)}
                          </p>
                          <p className="line-clamp-2">
                            {prompt.translatedText}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    EN: 'English',
    DE: 'German',
    FR: 'French',
    ES: 'Spanish',
    IT: 'Italian',
    JA: 'Japanese',
    ZH: 'Chinese',
  }
  return languages[code] || code
}
