import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(), // Clerk userId
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    isOnline: v.boolean(),
    lastSeen: v.number(),
  }).index("by_token", ["tokenIdentifier"]),

  conversations: defineTable({
    participants: v.array(v.string()), // store userIds
    isGroup: v.boolean(),
    name: v.optional(v.string()),
    lastMessageId: v.optional(v.id("messages")),
  }).index("by_participants", ["participants"]),

  userConversations: defineTable({
    userId: v.string(),
    conversationId: v.id("conversations"),
    lastReadMessageId: v.optional(v.id("messages")),
    unreadCount: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_conversation", ["userId", "conversationId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(), // Clerk userId
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("image")),
    isDeleted: v.boolean(),
    reactions: v.optional(v.array(v.object({
      emoji: v.string(),
      userId: v.string(),
    }))),
  }).index("by_conversation", ["conversationId"]),

  typingIndicators: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),
    expiresAt: v.number(),
  }).index("by_conversation", ["conversationId"]),
});
