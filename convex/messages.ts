import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const send = mutation({
    args: {
        conversationId: v.id("conversations"),
        content: v.string(),
        type: v.union(v.literal("text"), v.literal("image")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: identity.tokenIdentifier,
            content: args.content,
            type: args.type,
            isDeleted: false,
        });

        // Update the conversation's last message ID
        await ctx.db.patch(args.conversationId, {
            lastMessageId: messageId,
        });

        // Increment unread counts for other participants
        const conversation = await ctx.db.get(args.conversationId);
        if (conversation) {
            const others = conversation.participants.filter(id => id !== identity.tokenIdentifier);
            for (const otherId of others) {
                const userConv = await ctx.db
                    .query("userConversations")
                    .withIndex("by_user_conversation", q => q.eq("userId", otherId).eq("conversationId", args.conversationId))
                    .unique();

                if (userConv) {
                    await ctx.db.patch(userConv._id, { unreadCount: userConv.unreadCount + 1 });
                }
            }
        }

        return messageId;
    },
});

export const markRead = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const userConv = await ctx.db
            .query("userConversations")
            .withIndex("by_user_conversation", q => q.eq("userId", identity.tokenIdentifier).eq("conversationId", args.conversationId))
            .unique();

        if (userConv) {
            await ctx.db.patch(userConv._id, { unreadCount: 0 });
        }
    },
});

export const list = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .collect();
    },
});

export const setTyping = mutation({
    args: { conversationId: v.id("conversations"), isTyping: v.boolean() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const existing = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .filter((q) => q.eq(q.field("userId"), identity.tokenIdentifier))
            .unique();

        if (args.isTyping) {
            if (existing) {
                await ctx.db.patch(existing._id, { expiresAt: Date.now() + 2000 });
            } else {
                await ctx.db.insert("typingIndicators", {
                    conversationId: args.conversationId,
                    userId: identity.tokenIdentifier,
                    expiresAt: Date.now() + 2000,
                });
            }
        } else if (existing) {
            await ctx.db.delete(existing._id);
        }
    },
});

export const getTyping = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const now = Date.now();
        const typing = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        return typing.filter((t) => t.expiresAt > now && t.userId !== identity.tokenIdentifier);
    },
});

export const remove = mutation({
    args: { id: v.id("messages") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const message = await ctx.db.get(args.id);
        if (!message || message.senderId !== identity.tokenIdentifier) {
            throw new Error("Unauthorized to delete this message");
        }

        await ctx.db.patch(args.id, { isDeleted: true });
    },
});

export const toggleReaction = mutation({
    args: { id: v.id("messages"), emoji: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const message = await ctx.db.get(args.id);
        if (!message) throw new Error("Message not found");

        const reactions = message.reactions || [];
        const existingIndex = reactions.findIndex(
            (r) => r.userId === identity.tokenIdentifier && r.emoji === args.emoji
        );

        if (existingIndex > -1) {
            // Remove reaction
            reactions.splice(existingIndex, 1);
        } else {
            // Add reaction
            reactions.push({ userId: identity.tokenIdentifier, emoji: args.emoji });
        }

        await ctx.db.patch(args.id, { reactions });
    },
});
