import { MessageSquareDashed } from "lucide-react";

export default function ChatPage() {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-950/50 p-6 text-center">
            <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 animate-pulse border border-white/5">
                <MessageSquareDashed className="w-12 h-12 text-slate-700" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Select a conversation</h2>
            <p className="text-slate-500 max-w-sm">
                Choose a chat from the sidebar or search for a new user to start messaging in real-time.
            </p>
        </div>
    );
}
