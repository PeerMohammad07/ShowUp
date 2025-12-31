"use client"

import { motion } from "framer-motion";

export function ShowUpLogo({ className = "h-8 w-auto", iconOnly = false }: { className?: string, iconOnly?: boolean }) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* The Icon Path - derived from visual analysis and SVG trace logic */}
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-auto"
            >
                {/* Green Bar Chart background */}
                <rect x="10" y="55" width="16" height="30" rx="6" fill="#00D261" />
                <rect x="32" y="35" width="16" height="50" rx="6" fill="#00D261" />
                <rect x="54" y="15" width="16" height="70" rx="6" fill="#00D261" />

                {/* White Graph Line / Checkmark */}
                <path
                    d="M18 65L38 45L48 55L78 25"
                    stroke="white"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            {!iconOnly && (
                <span className="font-display font-black text-2xl tracking-tighter dark:text-white text-black">
                    ShowUp<span className="text-[#00D261]">.</span>
                </span>
            )}
        </div>
    );
}

export function FaviconLogo() {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#00D261" />
            <path d="M9 16L14 21L23 11" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
