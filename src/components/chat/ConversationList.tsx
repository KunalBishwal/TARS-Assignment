"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/lib/dateUtils";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Loader2, MessageCircle, UserPlus, Users as UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ConversationList({ conversations }: { conversations: any[] }) {
    const { userId } = useAuth();
    const { conversationId } = useParams();
    const allUsers = useQuery(api.users.listAll, { search: "" });
    const createConversation = useMutation(api.conversations.createOrGet);
    const router = useRouter();

    const handleStartChat = async (targetUserId: string) => {
        try {
            const id = await createConversation({ participantId: targetUserId });
            router.push(`/chat/${id}`);
        } catch (error) {
            console.error("Error creating conversation:", error);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {conversations.length > 0 ? (
                <div className="px-2 space-y-1 mb-6">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">
                        Recent Chats
                    </h3>
                    {conversations.map((conversation) => (
                        <ConversationItem
                            key={conversation._id}
                            conversation={conversation}
                            currentUserId={userId!}
                            isActive={conversationId === conversation._id}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-slate-900/40 rounded-2xl border border-dashed border-white/5 mx-2 mb-6">
                    <MessageCircle className="w-10 h-10 text-slate-700 mb-2" />
                    <p className="text-slate-400 text-sm font-medium">No active chats</p>
                </div>
            )}

            <div className="px-2 space-y-3 pb-8">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">
                    Discover People
                </h3>
                <div className="space-y-1">
                    {allUsers === undefined ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-5 h-5 text-cyan-500 animate-spin" />
                        </div>
                    ) : allUsers.length === 0 ? (
                        <p className="text-xs text-slate-600 px-2 italic">Looking for friends? They'll appear here once they join.</p>
                    ) : (
                        allUsers.map((user) => (
                            <button
                                key={user._id}
                                onClick={() => handleStartChat(user.tokenIdentifier)}
                                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all text-left group"
                            >
                                <div className="relative">
                                    <img src={user.imageUrl} className="w-9 h-9 rounded-full border border-white/10" />
                                    {user.isOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-950 rounded-full" />}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{user.isOnline ? 'Online' : 'Offline'}</p>
                                </div>
                                <UserPlus className="w-4 h-4 text-cyan-500 opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100" />
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function ConversationItem({ conversation, currentUserId, isActive }: {
    conversation: any,
    currentUserId: string,
    isActive: boolean
}) {
    const allUsers = useQuery(api.users.listAll, { search: "" });

    if (conversation.isGroup) {
        return (
            <Link
                href={`/chat/${conversation._id}`}
                className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all border border-transparent",
                    isActive
                        ? "bg-cyan-500/10 border-cyan-500/20"
                        : "hover:bg-white/5"
                )}
            >
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shrink-0">
                    <UsersIcon className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-0.5">
                        <h3 className={cn("font-bold text-sm truncate", isActive ? "text-cyan-400" : "text-white")}>
                            {conversation.name}
                        </h3>
                        {conversation.lastMessage && (
                            <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                                {formatTimestamp(conversation.lastMessage._creationTime)}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center justify-between gap-1">
                        <p className={cn(
                            "text-xs truncate flex-1",
                            conversation.unreadCount > 0 && !isActive ? "text-slate-200 font-medium" : "text-slate-500"
                        )}>
                            <span className="text-cyan-500/70 mr-1">{conversation.participants.length} members •</span>
                            {conversation.lastMessage?.isDeleted
                                ? <span className="italic">This message was deleted</span>
                                : (conversation.lastMessage?.content || "No messages yet")
                            }
                        </p>
                        {conversation.unreadCount > 0 && !isActive && (
                            <div className="min-w-[18px] h-[18px] bg-cyan-500 rounded-full flex items-center justify-center px-1">
                                <span className="text-[10px] font-bold text-white leading-none">
                                    {conversation.unreadCount}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        );
    }

    const otherUserId = conversation.participants.find((id: string) => id !== currentUserId);
    const otherUser = allUsers?.find(u => u.tokenIdentifier === otherUserId);

    if (allUsers === undefined) return <div className="h-16 animate-pulse bg-white/5 rounded-xl m-1" />;
    if (!otherUser) return null;

    return (
        <Link
            href={`/chat/${conversation._id}`}
            className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all border border-transparent",
                isActive
                    ? "bg-cyan-500/10 border-cyan-500/20"
                    : "hover:bg-white/5"
            )}
        >
            <div className="relative">
                <img
                    src={otherUser.imageUrl}
                    alt={otherUser.name}
                    className="w-12 h-12 rounded-full border border-white/10"
                />
                {otherUser.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-slate-950 rounded-full" />
                )}
            </div>
            <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-0.5">
                    <h3 className={cn("font-bold text-sm truncate", isActive ? "text-cyan-400" : "text-white")}>
                        {otherUser.name}
                    </h3>
                    {conversation.lastMessage && (
                        <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                            {formatTimestamp(conversation.lastMessage._creationTime)}
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between gap-1">
                    <p className={cn(
                        "text-xs truncate flex-1",
                        conversation.unreadCount > 0 && !isActive ? "text-slate-200 font-medium" : "text-slate-500"
                    )}>
                        {conversation.lastMessage?.isDeleted
                            ? <span className="italic">This message was deleted</span>
                            : (conversation.lastMessage?.senderId === currentUserId ? "You: " : "") + (conversation.lastMessage?.content || "No messages yet")
                        }
                    </p>
                    {conversation.unreadCount > 0 && !isActive && (
                        <div className="min-w-[18px] h-[18px] bg-cyan-500 rounded-full flex items-center justify-center px-1">
                            <span className="text-[10px] font-bold text-white leading-none">
                                {conversation.unreadCount}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
