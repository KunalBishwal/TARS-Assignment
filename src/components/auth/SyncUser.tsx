"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "convex/_generated/api";

export default function SyncUser() {
    const { user } = useUser();
    const storeUser = useMutation(api.users.store);

    useEffect(() => {
        if (!user) return;

        const sync = async () => {
            try {
                await storeUser({
                    name: user.fullName || user.username || "Anonymous",
                    email: user.emailAddresses[0]?.emailAddress || "",
                    imageUrl: user.imageUrl,
                });
            } catch (error) {
                console.error("Error syncing user to Convex:", error);
            }
        };

        sync();
    }, [user, storeUser]);

    return null;
}
