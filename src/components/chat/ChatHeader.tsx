"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { ChevronLeft, Info, MoreVertical, Phone, Users, Video } from "lucide-react";
import Link from "next/link";

export default function ChatHeader({
    userId,
    conversation
}: {
    userId?: string,
    conversation?: any
}) {
    const user = useQuery(api.users.listAll, { search: "" })?.find(u => u.tokenIdentifier === userId);

    if (conversation?.isGroup) {
        return (
            <div className="h-16 border-b border-white/5 bg-slate-950/50 backdrop-blur-md px-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3 overflow-hidden">
                    <Link href="/chat" className="md:hidden p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6 text-slate-400" />
                    </Link>

                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shrink-0">
                        <Users className="w-5 h-5 text-cyan-400" />
                    </div>

                    <div className="overflow-hidden">
                        <h2 className="font-bold text-white leading-tight truncate">{conversation.name}</h2>
                        <p className="text-xs text-slate-500 truncate">
                            {conversation.participants.length} members
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                        <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                        <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    if (!user) return <div className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md" />;

    return (
        <div className="h-16 border-b border-white/5 bg-slate-950/50 backdrop-blur-md px-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
                <Link href="/chat" className="md:hidden p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6 text-slate-400" />
                </Link>

                <div className="relative">
                    <img
                        src={user.imageUrl}
                        alt={user.name}
                        className="w-10 h-10 rounded-full border border-white/10"
                    />
                    {user.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-950 rounded-full" />
                    )}
                </div>

                <div>
                    <h2 className="font-bold text-white leading-tight">{user.name}</h2>
                    <p className="text-xs text-slate-500">
                        {user.isOnline ? "Online" : "Offline"}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                    <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                    <Video className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
