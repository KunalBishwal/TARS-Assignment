"use client";

import { useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "convex/_generated/api";
import { useAuth } from "@clerk/nextjs";

export default function useOnlineStatus() {
    const { isSignedIn } = useAuth();
    const updateStatus = useMutation(api.users.updateStatus);

    useEffect(() => {
        if (!isSignedIn) return;

        // Set online
        updateStatus({ isOnline: true });

        const handleVisibilityChange = () => {
            updateStatus({ isOnline: document.visibilityState === "visible" });
        };

        const handleBeforeUnload = () => {
            // Note: This is a best effort. Navigator.sendBeacon might be better for production.
            updateStatus({ isOnline: false });
        };

        window.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            updateStatus({ isOnline: false });
        };
    }, [isSignedIn, updateStatus]);
}
