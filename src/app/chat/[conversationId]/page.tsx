"use client";

import { useParams } from "next/navigation";
import { Id } from "convex/_generated/dataModel";
import ChatWindow from "@/components/chat/ChatWindow";

export default function ConversationPage() {
    const { conversationId } = useParams();

    return <ChatWindow conversationId={conversationId as Id<"conversations">} />;
}
