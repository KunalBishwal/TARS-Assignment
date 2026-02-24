import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createOrGet = mutation({
    args: {
        participantId: v.string(), // Clerk userId
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!currentUser) throw new Error("User not found");

        // Check if a 1:1 conversation already exists
        const existing = await ctx.db
            .query("conversations")
            .filter((q) =>
                q.and(
                    q.eq(q.field("isGroup"), false),
                    q.or(
                        q.eq(q.field("participants"), [currentUser.tokenIdentifier, args.participantId]),
                        q.eq(q.field("participants"), [args.participantId, currentUser.tokenIdentifier])
                    )
                )
            )
            .unique();

        if (existing) return existing._id;

        // Create new conversation
        const conversationId = await ctx.db.insert("conversations", {
            participants: [currentUser.tokenIdentifier, args.participantId],
            isGroup: false,
        });

        // Initialize unread tracking for both participants
        await ctx.db.insert("userConversations", {
            userId: currentUser.tokenIdentifier,
            conversationId,
            unreadCount: 0,
        });

        await ctx.db.insert("userConversations", {
            userId: args.participantId,
            conversationId,
            unreadCount: 0,
        });

        return conversationId;
    },
});

export const createGroup = mutation({
    args: {
        name: v.string(),
        participantIds: v.array(v.string()), // Clerk userIds
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!currentUser) throw new Error("User not found");

        const allParticipants = [...new Set([...args.participantIds, currentUser.tokenIdentifier])];

        const conversationId = await ctx.db.insert("conversations", {
            participants: allParticipants,
            isGroup: true,
            name: args.name,
        });

        // Initialize unread tracking for all participants
        for (const userId of allParticipants) {
            await ctx.db.insert("userConversations", {
                userId,
                conversationId,
                unreadCount: 0,
            });
        }

        return conversationId;
    },
});

export const list = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const userConvs = await ctx.db
            .query("userConversations")
            .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
            .collect();

        const results = [];

        for (const uc of userConvs) {
            const conversation = await ctx.db.get(uc.conversationId);
            if (!conversation) continue;

            let lastMessage = null;
            if (conversation.lastMessageId) {
                lastMessage = await ctx.db.get(conversation.lastMessageId);
            }

            results.push({
                ...conversation,
                unreadCount: uc.unreadCount,
                lastMessage: lastMessage ? {
                    content: lastMessage.content,
                    senderId: lastMessage.senderId,
                    _creationTime: lastMessage._creationTime,
                    isDeleted: lastMessage.isDeleted,
                } : null,
            });
        }

        // Sort by last message time
        return results.sort((a, b) => {
            const aTime = a.lastMessage?._creationTime || a._creationTime;
            const bTime = b.lastMessage?._creationTime || b._creationTime;
            return bTime - aTime;
        });
    },
});
