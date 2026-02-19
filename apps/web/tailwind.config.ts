import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    electric: "#3B82F6",
                    neon: "#10B981",
                    glow: "#6366F1",
                },
                surface: {
                    DEFAULT: "#0F1117",
                    card: "#161B27",
                    elevated: "#1E2535",
                    border: "#2A3347",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            animation: {
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "fade-in": "fadeIn 0.3s ease-out",
                "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                "scale-in": "scaleIn 0.2s ease-out",
                "glow": "glow 2s ease-in-out infinite alternate",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(16px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                scaleIn: {
                    "0%": { transform: "scale(0.95)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
                glow: {
                    "0%": { boxShadow: "0 0 5px rgba(59, 130, 246, 0.3)" },
                    "100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.6)" },
                },
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "grid-pattern":
                    "linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)",
            },
            backgroundSize: {
                grid: "40px 40px",
            },
        },
    },
    plugins: [],
};

export default config;
