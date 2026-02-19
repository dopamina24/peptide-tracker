import { BottomNav } from "@/components/ui/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen max-w-lg mx-auto relative">
            <main className="pb-28">{children}</main>
            <BottomNav />
        </div>
    );
}
