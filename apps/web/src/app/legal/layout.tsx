export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen max-w-2xl mx-auto p-4 py-12">
            {children}
        </div>
    );
}
