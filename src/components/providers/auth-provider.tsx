"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider
            // Refetch the session every time the window regains focus.
            // This ensures that after logout → login as a different user,
            // the client-side session (useSession) reflects the new user
            // immediately instead of showing stale data.
            refetchOnWindowFocus={true}
            // Refetch the session every 0 seconds (i.e. on every page navigation).
            // This is the most aggressive setting to prevent stale sessions.
            refetchInterval={0}
        >
            {children}
        </SessionProvider>
    );
}
