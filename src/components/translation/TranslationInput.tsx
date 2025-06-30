import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SUPPORTED_LANGUAGES } from "@/lib/types"
import { X, Search, Copy, Star } from "lucide-react"
import { Button } from "../ui/button"

interface TranslationInputProps {
    label: string
    text: string
    language: string
    onTextChange: (text: string) => void
    onLanguageChange: (language: string) => void
    readOnly?: boolean
    className?: string
    onSave?: () => void
}

export function TranslationInput({
    label,
    text,
    language,
    onTextChange,
    onLanguageChange,
    readOnly = false,
    className,
    onSave,
}: TranslationInputProps) {
    const handleCopy = () => {
        if (text) navigator.clipboard.writeText(text)
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
            <Select value={language} onValueChange={onLanguageChange}>
                <SelectTrigger className="w-full md:w-[160px] focus:ring-2 focus:ring-orange-500">
                    <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
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
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                        {onSave && (
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={onSave}
                                aria-label="Save translation"
                            >
                                <Star className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
