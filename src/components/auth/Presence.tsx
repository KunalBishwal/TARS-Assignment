"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";

export default function Presence() {
    const updateStatus = useMutation(api.users.updateStatus);

    useEffect(() => {
        // Set online when component mounts
        updateStatus({ isOnline: true });

        // Set offline when user leaves or closes tab
        const handleVisibilityChange = () => {
            updateStatus({ isOnline: document.visibilityState === "visible" });
        };

        const handleBeforeUnload = () => {
            updateStatus({ isOnline: false });
        };

        window.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            updateStatus({ isOnline: false });
            window.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [updateStatus]);

    return null;
}
