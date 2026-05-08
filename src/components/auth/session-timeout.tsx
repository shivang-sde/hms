"use client";

import { useEffect, useRef, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";

interface SessionTimeoutProps {
    inactivityTimeout?: number;
    checkInterval?: number;
}

export function SessionTimeout({ 
    inactivityTimeout = 30 * 60 * 1000, 
    checkInterval = 10 * 1000 
}: SessionTimeoutProps) {
    const { data: session, status } = useSession();
    const lastActivityRef = useRef<number>(Date.now());
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const logout = useCallback(async () => {
        if (status === "authenticated") {
            toast.info("Session expired due to inactivity. Logging out...", {
                duration: 5000,
            });
            await signOut({ callbackUrl: "/login" });
        }
    }, [status]);

    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();
    }, []);

    useEffect(() => {
        if (status !== "authenticated") return;

        // Events to track activity
        const activityEvents = [
            "mousedown",
            "mousemove",
            "keydown",
            "scroll",
            "touchstart",
            "click",
            "activity",
        ];

        // Add event listeners
        activityEvents.forEach((event) => {
            window.addEventListener(event, resetTimer, { passive: true });
        });

        // Setup interval to check for inactivity
        timeoutRef.current = setInterval(() => {
            const now = Date.now();
            if (now - lastActivityRef.current > inactivityTimeout) {
                logout();
            }
        }, checkInterval);

        return () => {
            // Cleanup
            activityEvents.forEach((event) => {
                window.removeEventListener(event, resetTimer);
            });
            if (timeoutRef.current) {
                clearInterval(timeoutRef.current);
            }
        };
    }, [status, logout, resetTimer]);

    // This component doesn't render anything
    return null;
}

// Global function to trigger activity from API calls
export function recordActivity() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("activity"));
    }
}
