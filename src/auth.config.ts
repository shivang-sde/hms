import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    trustHost: true,
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
            const isPublicRoute = ["/login"].includes(nextUrl.pathname);

            if (isApiAuthRoute) return true;

            if (isPublicRoute) {
                if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
                return true;
            }

            if (!isLoggedIn) return false;

            // Role-based access control for STAFF
            const role = (auth.user as any)?.role;
            if (isLoggedIn && role === "STAFF") {
                const allowedPaths = ["/", "/tasks", "/suggestions", "/api"];
                const isAllowed = allowedPaths.some(path => nextUrl.pathname === path || nextUrl.pathname.startsWith(path));
                if (!isAllowed) return Response.redirect(new URL("/", nextUrl));
            }

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.role) {
                session.user.role = token.role as any;
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig;
