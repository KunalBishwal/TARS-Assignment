"use client";

import { useEffect, useRef, useState } from "react";
import { Id } from "convex/_generated/dataModel";
import { formatTimestamp } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { ChevronDown, Loader2, Trash2, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MessageList({ messages, currentUserId, conversationId, currentUser }: {
    messages: any[] | undefined,
    currentUserId: string,
    conversationId: Id<"conversations">,
    currentUser?: any
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const typingUsers = useQuery(api.messages.getTyping, { conversationId });
    const removeMessage = useMutation(api.messages.remove);
    const toggleReaction = useMutation(api.messages.toggleReaction);
    const allUsers = useQuery(api.users.listAll, { search: "" });

    const emojis = ["👍", "❤️", "🔥", "😂", "😮", "😢"];

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior,
            });
        }
    };

    useEffect(() => {
        // Initial scroll
        if (messages && messages.length > 0) {
            scrollToBottom("auto");
        }
    }, [messages === undefined]);

    useEffect(() => {
        // Scroll on new message if close to bottom
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;

            if (isNearBottom) {
                scrollToBottom();
            } else if (messages && messages.length > 0) {
                setShowScrollButton(true);
            }
        }
    }, [messages?.length]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollButton(!isAtBottom && (messages?.length || 0) > 0);
    };

    if (messages === undefined) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
        );
    }

    return (
        <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto px-4 py-8 space-y-6 custom-scrollbar scroll-smooth"
        >
            <AnimatePresence initial={false}>
                {messages.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50"
                    >
                        <p className="text-lg">No messages yet.</p>
                        <p className="text-sm">Be the first to say hello! 👋</p>
                    </motion.div>
                ) : (
                    messages.map((message, index) => {
                        const isSender = message.senderId === currentUserId;
                        const sender = isSender ? currentUser : allUsers?.find(u => u.tokenIdentifier === message.senderId);

                        return (
                            <motion.div
                                key={message._id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className={cn(
                                    "flex items-end gap-2 group/msg w-full",
                                    isSender ? "justify-end" : "justify-start"
                                )}
                            >
                                {/* Recipient Avatar */}
                                {!isSender && (
                                    <div className="flex-shrink-0 mb-1">
                                        {sender?.imageUrl ? (
                                            <img
                                                src={sender.imageUrl}
                                                alt={sender.name}
                                                className="w-8 h-8 rounded-full border border-white/10 shadow-lg shadow-black/20"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/5">
                                                <User className="w-4 h-4 text-slate-500" />
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className={cn(
                                    "flex flex-col max-w-[75%] space-y-1",
                                    isSender ? "items-end" : "items-start"
                                )}>
                                    <div
                                        className={cn(
                                            "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-xl relative group/content transition-all",
                                            isSender
                                                ? "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-tr-none shadow-cyan-500/10"
                                                : "bg-[#1e293b] text-slate-100 rounded-tl-none border border-white/5 shadow-black/20"
                                        )}
                                    >
                                        {message.isDeleted ? (
                                            <span className="italic opacity-60 text-xs">This message was deleted</span>
                                        ) : (
                                            <>
                                                <span className="whitespace-pre-wrap">{message.content}</span>

                                                {/* Reaction Picker Overlay */}
                                                <div className={cn(
                                                    "absolute -top-11 flex gap-1 bg-slate-900/90 backdrop-blur-md border border-white/10 p-1.5 rounded-2xl shadow-2xl opacity-0 scale-75 group-hover/content:opacity-100 group-hover/content:scale-100 transition-all z-30 pointer-events-none group-hover/content:pointer-events-auto",
                                                    isSender ? "right-0" : "left-0"
                                                )}>
                                                    {emojis.map(emoji => (
                                                        <button
                                                            key={emoji}
                                                            onClick={() => toggleReaction({ id: message._id, emoji })}
                                                            className="hover:scale-150 active:scale-90 transition-transform px-1.5 text-lg"
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Delete Button */}
                                                {isSender && (
                                                    <button
                                                        onClick={() => removeMessage({ id: message._id })}
                                                        className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-full opacity-0 group-hover/msg:opacity-100 transition-all"
                                                        title="Delete message"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </>
                                        )}

                                        {/* Reactions Display */}
                                        {message.reactions && message.reactions.length > 0 && (
                                            <div className={cn(
                                                "absolute -bottom-4 flex flex-wrap gap-1 z-10 scale-90 origin-top",
                                                isSender ? "right-2" : "left-2"
                                            )}>
                                                {Object.entries(
                                                    message.reactions.reduce((acc: any, curr: any) => {
                                                        acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
                                                        return acc;
                                                    }, {})
                                                ).map(([emoji, count]: [any, any]) => (
                                                    <button
                                                        key={emoji}
                                                        onClick={() => toggleReaction({ id: message._id, emoji })}
                                                        className="flex items-center gap-1.5 bg-slate-900 border border-white/10 px-2 py-0.5 rounded-full text-[11px] hover:bg-slate-800 transition-colors shadow-lg"
                                                    >
                                                        <span>{emoji}</span>
                                                        <span className="text-cyan-400 font-black">{count}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 px-1">
                                        <span className="text-[10px] font-medium text-slate-500/80">
                                            {formatTimestamp(message._creationTime)}
                                        </span>
                                    </div>
                                </div>

                                {/* Sender Avatar */}
                                {isSender && (
                                    <div className="flex-shrink-0 mb-1">
                                        {sender?.imageUrl ? (
                                            <img
                                                src={sender.imageUrl}
                                                alt={sender.name}
                                                className="w-8 h-8 rounded-full border border-white/10 shadow-lg shadow-black/20"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/5">
                                                <User className="w-4 h-4 text-slate-500" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })
                )}

                {/* Typing indicators */}
                {typingUsers && typingUsers.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 text-xs text-cyan-400/80 font-medium px-10 pt-2"
                    >
                        <div className="flex gap-1.5 bg-slate-800/50 p-2 rounded-full rounded-tl-none border border-white/5">
                            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-duration:0.6s]" />
                            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.4s]" />
                        </div>
                        <span className="italic truncate max-w-[200px]">
                            {typingUsers.map(t => allUsers?.find(u => u.tokenIdentifier === t.userId)?.name || "Someone").join(", ")} {typingUsers.length > 1 ? "are" : "is"} typing...
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* New message scroll button */}
            <AnimatePresence>
                {showScrollButton && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        onClick={() => scrollToBottom()}
                        className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-cyan-500 text-white px-5 py-2.5 rounded-full shadow-[0_10px_30px_rgba(6,182,212,0.4)] flex items-center gap-2 text-sm font-black hover:bg-cyan-400 hover:scale-105 active:scale-95 transition-all z-40 border border-white/20"
                    >
                        <ChevronDown className="w-5 h-5 animate-bounce" />
                        NEW MESSAGES
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}

// End of MessageList component
