"use client";

import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Loader2, Plus, Send, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MessageInput({ conversationId }: { conversationId: Id<"conversations"> }) {
    const [content, setContent] = useState("");
    const sendMessage = useMutation(api.messages.send);
    const setTyping = useMutation(api.messages.setTyping);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const emojis = ["😊", "😂", "🥰", "😎", "🤔", "🥺", "🔥", "👍", "❤️", "✨"];

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!content.trim()) return;

        const currentContent = content;
        setContent("");

        // Clear typing indicator immediately
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        await setTyping({ conversationId, isTyping: false });

        setIsSending(true);
        setError(null);
        try {
            await sendMessage({
                conversationId,
                content: currentContent,
                type: "text",
            });
        } catch (err) {
            console.error("Error sending message:", err);
            setError("Failed to send message");
            setContent(currentContent); // Restore on error
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);

        // Typing flag
        setTyping({ conversationId, isTyping: true });

        // Clear indicator after 2 seconds of inactivity
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setTyping({ conversationId, isTyping: false });
        }, 2000);
    };

    const handleEmojiClick = (emoji: string) => {
        setContent(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            alert("File upload feature coming soon! (Mocking photo selection)");
        }
    };

    return (
        <div className="p-4 bg-slate-950/90 backdrop-blur-xl border-t border-white/5 relative">
            {/* Emoji Picker Overlay */}
            {showEmojiPicker && (
                <div className="absolute bottom-full left-4 mb-4 p-3 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-5 gap-2">
                        {emojis.map(e => (
                            <button
                                key={e}
                                type="button"
                                onClick={() => handleEmojiClick(e)}
                                className="text-2xl hover:scale-125 transition-transform p-1"
                            >
                                {e}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={handleSend} className="max-w-6xl mx-auto flex items-end gap-3 px-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*"
                />

                <div className="flex gap-1 mb-1">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-cyan-400 transition-all active:scale-90"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-cyan-400 transition-all active:scale-90"
                    >
                        <ImageIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 relative">
                    <textarea
                        rows={1}
                        className="w-full bg-slate-900 text-slate-100 text-sm py-3 px-5 pr-14 rounded-2xl border border-white/5 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none max-h-40"
                        placeholder="Type a message..."
                        value={content}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={cn(
                            "absolute right-3 bottom-2.5 p-1.5 transition-all active:scale-90",
                            showEmojiPicker ? "text-cyan-400" : "text-slate-500 hover:text-cyan-400"
                        )}
                    >
                        <Smile className="w-5 h-5" />
                    </button>
                </div>

                <button
                    disabled={!content.trim() || isSending}
                    className="mb-1 p-3.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl transition-all shadow-[0_4px_15px_rgba(6,182,212,0.3)] hover:shadow-[0_4px_25px_rgba(6,182,212,0.5)] hover:scale-105 active:scale-95 flex items-center justify-center shrink-0 disabled:shadow-none"
                >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
            </form>
        </div>
    );
}
