"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        // Revalidate all cached pages BEFORE sign-in so that
        // the Next.js Router Cache doesn't serve stale pages
        // from the previous user's session after redirect.
        revalidatePath("/", "layout");

        await signIn("credentials", {
            ...Object.fromEntries(formData.entries()),
            redirectTo: "/"
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials.";
                default:
                    return "Something went wrong.";
            }
        }
        throw error;
    }
}

export async function logout() {
    // Revalidate all cached pages so the next user who logs in
    // doesn't see stale content from this session.
    revalidatePath("/", "layout");
    await signOut({ redirectTo: "/login" });
}