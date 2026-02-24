"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Search, X, Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function UserSearch({ onClose }: { onClose: () => void }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isGroupMode, setIsGroupMode] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [groupName, setGroupName] = useState("");
    const users = useQuery(api.users.listAll, { search: searchTerm });
    const createConversation = useMutation(api.conversations.createOrGet);
    const createGroup = useMutation(api.conversations.createGroup);
    const router = useRouter();

    const handleUserClick = (userId: string) => {
        if (isGroupMode) {
            setSelectedUsers(prev =>
                prev.includes(userId)
                    ? prev.filter(id => id !== userId)
                    : [...prev, userId]
            );
        } else {
            handleStartChat(userId);
        }
    };

    const handleStartChat = async (userId: string) => {
        try {
            const conversationId = await createConversation({ participantId: userId });
            router.push(`/chat/${conversationId}`);
            onClose();
        } catch (error) {
            console.error("Error creating conversation:", error);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedUsers.length < 1) return;
        try {
            const conversationId = await createGroup({
                name: groupName,
                participantIds: selectedUsers,
            });
            router.push(`/chat/${conversationId}`);
            onClose();
        } catch (error) {
            console.error("Error creating group:", error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white">
                            {isGroupMode ? "Create Group Chat" : "New Chat"}
                        </h2>
                        <button
                            onClick={() => setIsGroupMode(!isGroupMode)}
                            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-400/10 px-3 py-1.5 rounded-full"
                        >
                            {isGroupMode ? "Cancel Group" : "+ New Group"}
                        </button>
                    </div>

                    {isGroupMode && (
                        <input
                            className="w-full bg-slate-800 text-white text-sm py-2 px-4 rounded-xl border border-white/5 outline-none focus:border-cyan-500/50"
                            placeholder="Enter group name..."
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                    )}

                    <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2.5 rounded-xl border border-white/5">
                        <Search className="w-5 h-5 text-slate-400" />
                        <input
                            autoFocus
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-500 text-sm"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {users === undefined ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No users found matching your search.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {users.map((user) => {
                                const isSelected = selectedUsers.includes(user.tokenIdentifier);
                                return (
                                    <button
                                        key={user._id}
                                        onClick={() => handleUserClick(user.tokenIdentifier)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-xl transition-all group",
                                            isSelected ? "bg-cyan-500/20 border border-cyan-500/30" : "hover:bg-white/5 border border-transparent"
                                        )}
                                    >
                                        <div className="relative">
                                            <img
                                                src={user.imageUrl}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-full border border-white/10"
                                            />
                                            {isSelected && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                                                    <div className="w-2 h-2 bg-white rounded-full" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 text-left text-sm whitespace-nowrap overflow-hidden">
                                            <p className="font-semibold text-white truncate">{user.name}</p>
                                            <p className="text-slate-500 truncate">{user.email}</p>
                                        </div>
                                        {!isGroupMode && (
                                            <UserPlus className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    {isGroupMode && (
                        <div className="p-4 border-t border-white/10 bg-slate-950/50">
                            <button
                                onClick={handleCreateGroup}
                                disabled={!groupName.trim() || selectedUsers.length < 1}
                                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
                            >
                                Create Group ({selectedUsers.length} members)
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
