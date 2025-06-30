import { Component } from "react"
import { Button } from "./button.jsx"

export class ErrorBoundary extends Component {
    state = {
        hasError: false,
        error: undefined,
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="flex min-h-[200px] w-full flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
                        <h2 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-200">
                            Something went wrong
                        </h2>
                        <p className="mb-4 text-sm text-red-600 dark:text-red-300">
                            {this.state.error?.message ||
                                "An unexpected error occurred"}
                        </p>
                        <Button
                            onClick={() => this.setState({ hasError: false })}
                            variant="outline"
                            className="border-red-200 hover:bg-red-100 dark:border-red-900 dark:hover:bg-red-900"
                        >
                            Try again
                        </Button>
                    </div>
                )
            )
        }

        return this.props.children
    }
}
