"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors border border-neutral-200 dark:border-neutral-800"
            aria-label="Toggle theme"
        >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>
    )
}
