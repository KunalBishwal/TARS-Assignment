import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const store = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        imageUrl: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called storeUser without authentication identifier");
        }

        // Check if the user already exists
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();


        //
        if (user !== null) {
            // If we've seen this user before but their name or image has changed, patch them.
            if (user.name !== args.name || user.imageUrl !== args.imageUrl) {
                await ctx.db.patch(user._id, { name: args.name, imageUrl: args.imageUrl });
            }
            return user._id;
        }

        // If it's a new user, create them.
        return await ctx.db.insert("users", {
            name: args.name,
            email: args.email,
            imageUrl: args.imageUrl,
            tokenIdentifier: identity.tokenIdentifier,
            isOnline: true,
            lastSeen: Date.now(),
        });
    },
});

export const getMe = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();
    },
});

export const listAll = query({
    args: {
        search: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        let users;
        if (args.search) {
            users = await ctx.db
                .query("users")
                .withSearchIndex("search_name", (q) => q.search("name", args.search!))
                .collect();
        } else {
            users = await ctx.db.query("users").collect();
        }

        // Filter out the current user
        return users.filter((user) => user.tokenIdentifier !== identity.tokenIdentifier);
    },
});

export const updateStatus = mutation({
    args: { isOnline: v.boolean() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (user) {
            await ctx.db.patch(user._id, {
                isOnline: args.isOnline,
                lastSeen: Date.now()
            });
        }
    },
});
