import type { Config } from 'tailwindcss'

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                // Primary accent
                primary: "#ff0091",
                success: "#00ff88", // Neon Green accent

                // Light mode backgrounds
                "background-light": "#f8f5f7",

                // Dark mode backgrounds
                "background-dark": "#181A1C", // Dark charcoal
                "surface-dark": "#222528",    // Lighter gray surface

                // Dark mode borders
                "border-dark": "#3A3E42",     // Cool gray

                // Dark mode text
                "text-main-dark": "#EFEFEF",
                "text-secondary-dark": "#B0B3B6", // Muted text

                // Accent colors
                accent: {
                    blue: "#3B82F6",
                    purple: "#A855F7",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
                mono: ["JetBrains Mono", "Fira Code", "monospace"],
            },
            borderRadius: {
                DEFAULT: "0.125rem",
                sm: "0.125rem",
                md: "0.25rem",
                lg: "0.5rem",
                xl: "0.75rem",
                "2xl": "1rem",
            },
            boxShadow: {
                "primary-glow": "0 0 20px rgba(255, 0, 145, 0.4)",
            },
        },
    },
    plugins: [],
} satisfies Config

