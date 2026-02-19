"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

const TABS = [
    {
        href: "/dashboard",
        label: "Resumen",
        icon: (active: boolean) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "#22d3ee" : "none"}
                stroke={active ? "#22d3ee" : "rgba(255,255,255,0.4)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
        ),
    },
    {
        href: "/history",
        label: "Dosis",
        icon: (active: boolean) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke={active ? "#22d3ee" : "rgba(255,255,255,0.4)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2l4 4-9.5 9.5-4-4L18 2Z" />
                <path d="M12.5 7.5l-8 8L3 21l5.5-1.5 8-8" />
                <path d="M15 9l-6 6" />
            </svg>
        ),
    },
    {
        href: "/protocols",
        label: "Protocolos",
        icon: (active: boolean) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke={active ? "#22d3ee" : "rgba(255,255,255,0.4)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
        ),
    },
    {
        href: "/library",
        label: "Biblioteca",
        icon: (active: boolean) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke={active ? "#22d3ee" : "rgba(255,255,255,0.4)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
        ),
    },
    {
        href: "/profile",
        label: "Ajustes",
        icon: (active: boolean) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke={active ? "#22d3ee" : "rgba(255,255,255,0.4)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
        ),
    },
];

export function BottomNav() {
    const pathname = usePathname();
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-30
      bg-[#0c1018]/95 backdrop-blur-xl
      border-t border-white/[0.07]
      pb-safe">
            <div className="flex items-center justify-around px-2 pt-2 pb-1 max-w-lg mx-auto">
                {TABS.map(tab => {
                    const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
                    return (
                        <Link key={tab.label} href={tab.href}
                            className="flex flex-col items-center gap-1 py-1 px-2 min-w-[52px] transition-opacity active:opacity-60">
                            {tab.icon(active)}
                            <span className={`text-[10px] font-medium tracking-tight ${active ? "text-[#22d3ee]" : "text-white/40"}`}>
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
