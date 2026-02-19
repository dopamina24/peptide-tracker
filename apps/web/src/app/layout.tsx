import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "AminFX — Optimización de Péptidos",
    description: "Registra, gestiona y optimiza tus protocolos de péptidos de forma inteligente.",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "AminFX",
    },
    keywords: ["péptidos", "BPC-157", "TB-500", "semaglutida", "protocolo", "seguimiento", "AminFX"],
};

export const viewport: Viewport = {
    themeColor: "#0F1117",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es" className="dark">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body className={`${inter.variable} font-sans`}>
                <Providers>
                    {children}
                    <Toaster
                        position="top-center"
                        toastOptions={{
                            classNames: {
                                toast: "glass-card border-surface-border text-white",
                                success: "border-brand-neon/30",
                                error: "border-red-500/30",
                            },
                        }}
                        richColors
                    />
                </Providers>
            </body>
        </html>
    );
}
