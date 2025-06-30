import { cn } from "@/lib/utils.js"

const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
}

export function LoadingSpinner({
    size = "md",
    className,
}) {
    return (
        <div
            className={cn(
                "animate-spin rounded-full border-gray-300 border-t-orange-500",
                sizeClasses[size],
                className
            )}
            role="status"
            aria-label="Loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    )
}
