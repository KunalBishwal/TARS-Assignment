"use client";

import { UserButton } from "@clerk/nextjs";
import { Search, MessageSquare, Home } from "lucide-react";
import { useState } from "react";
import UserSearch from "./UserSearch";
import ConversationList from "./ConversationList";
import { SidebarSkeleton } from "./Skeletons";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Sidebar() {
    const [isSearching, setIsSearching] = useState(false);
    const { conversationId } = useParams();
    const conversations = useQuery(api.conversations.list);

    if (conversations === undefined) {
        return <SidebarSkeleton />;
    }

    return (
        <aside className={cn(
            "w-full md:w-80 h-full border-r border-white/5 bg-slate-950 flex flex-col z-20 transition-all",
            conversationId ? "hidden md:flex" : "flex"
        )}>
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"
                        title="Back to Home"
                    >
                        <Home className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-cyan-400" />
                        Chats
                    </h1>
                </div>
                <UserButton afterSignOutUrl="/" />
            </div>

            {/* Tool Bar */}
            <div className="p-3">
                <div
                    onClick={() => setIsSearching(true)}
                    className="bg-slate-900/50 flex items-center gap-3 px-4 py-2.5 rounded-full cursor-pointer hover:bg-slate-800/50 transition-all border border-white/5 group"
                >
                    <Search className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    <span className="text-sm text-slate-500">Search users...</span>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <ConversationList conversations={conversations} />
            </div>

            {/* Search Modal/Overlay */}
            {isSearching && (
                <UserSearch onClose={() => setIsSearching(false)} />
            )}
        </aside>
    );
}
