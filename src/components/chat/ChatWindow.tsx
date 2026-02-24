"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { ChatSkeleton } from "./Skeletons";
import { Loader2 } from "lucide-react";

export default function ChatWindow({ conversationId }: { conversationId: Id<"conversations"> }) {
    const { userId } = useAuth();
    const { isLoaded: isClerkLoaded } = useUser();
    const messages = useQuery(api.messages.list, { conversationId });
    const conversations = useQuery(api.conversations.list);
    const currentUser = useQuery(api.users.getMe);
    const markRead = useMutation(api.messages.markRead);
    const conversation = conversations?.find(c => c._id === conversationId);

    useEffect(() => {
        if (conversationId) {
            markRead({ conversationId });
        }
    }, [conversationId, messages?.length, markRead]);

    if (!isClerkLoaded || conversations === undefined || currentUser === undefined) {
        return <ChatSkeleton />;
    }

    if (!conversation || !currentUser) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mb-4" />
                <p className="text-slate-400">Loading conversation...</p>
            </div>
        );
    }

    // Find the other participant's ID using Convex identifier
    const otherUserId = conversation.participants.find((id: string) => id !== currentUser.tokenIdentifier);

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.5)_0%,_rgba(2,6,23,1)_100%)]">
            <ChatHeader
                userId={otherUserId}
                conversation={conversation}
            />

            <div className="flex-1 overflow-hidden relative">
                <MessageList
                    messages={messages}
                    currentUserId={currentUser?.tokenIdentifier || userId!}
                    conversationId={conversationId}
                    currentUser={currentUser}
                />
            </div>

            <MessageInput conversationId={conversationId} />
        </div>
    );
}
