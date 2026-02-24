import Sidebar from "@/components/chat/Sidebar";

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden">
            <div className="flex-shrink-0">
                <Sidebar />
            </div>
            <main className="flex-1 flex flex-col relative min-w-0 h-full overflow-hidden">
                {children}
            </main>
        </div>
    );
}
