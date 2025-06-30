import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SUPPORTED_LANGUAGES } from "@/lib/constants.js"
import { X, Search, Copy, Star, Check, ChevronsUpDown } from "lucide-react"
import { Button } from "../ui/button.jsx"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.jsx"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command.jsx"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.jsx"
import { cn } from "@/lib/utils.js"

export function TranslationInput({
    label,
    text,
    language,
    onTextChange,
    onLanguageChange,
    readOnly = false,
    className,
    onSave,
}) {
    const [copied, setCopied] = useState(false)
    const [saved, setSaved] = useState(false)
    const [open, setOpen] = useState(false)

    const handleCopy = () => {
        if (text) {
            navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleSaveClick = () => {
        if (onSave) {
            onSave()
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        }
    }

    const handleGoogleSearch = () => {
        if (text)
            window.open(
                `https://www.google.com/search?q=${encodeURIComponent(text)}`,
                "_blank"
            )
    }

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <Label htmlFor={`${label}-text`} className="font-semibold">
                {label}
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full md:w-[160px] justify-between focus:ring-2 focus:ring-orange-500"
                    >
                        {language
                            ? SUPPORTED_LANGUAGES.find(
                                  (lang) => lang.code === language
                              )?.name
                            : "Select language..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandInput placeholder="Search language..." />
                        <CommandEmpty>No language found.</CommandEmpty>
                        <CommandGroup>
                            {SUPPORTED_LANGUAGES.map((lang) => (
                                <CommandItem
                                    key={lang.code}
                                    value={lang.name}
                                    onSelect={() => {
                                        onLanguageChange(lang.code)
                                        setOpen(false)
                                    }}
                                >
                                    {lang.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
            <div className="relative">
                <Textarea
                    id={`${label}-text`}
                    placeholder={
                        readOnly
                            ? "Translation will appear here"
                            : "Enter text to translate"
                    }
                    className="min-h-[160px] resize-none mt-2 focus:ring-2 focus:ring-orange-500"
                    value={text}
                    onChange={(e) => onTextChange(e.target.value)}
                    readOnly={readOnly}
                />
                {!readOnly && text && (
                    <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-4 right-2"
                        onClick={() => onTextChange("")}
                        aria-label="Clear input"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
                {readOnly && text && (
                    <div className="absolute top-4 right-2 flex gap-2">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleGoogleSearch}
                            aria-label="Google search"
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleCopy}
                            aria-label="Copy translation"
                            className={copied ? "text-green-500" : ""}
                        >
                            {copied ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                        {onSave && (
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleSaveClick}
                                aria-label="Save translation"
                                className={saved ? "text-yellow-500" : ""}
                            >
                                {saved ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Star className="h-4 w-4" />
                                )}
                            </Button>
                        )}
                    </div>
                )}
            </div>
            {copied && (
                <Alert className="mt-2">
                    <AlertTitle>Copied!</AlertTitle>
                    <AlertDescription>Text copied to clipboard.</AlertDescription>
                </Alert>
            )}
        </div>
    )
}
