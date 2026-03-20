"use client";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";

export function JournalActionButtons({ id, status }: { id: string; status: string }) {
    const router = useRouter();

    const handlePost = async () => {
        try {
            await apiFetch(`/api/accounting/journal-entries/${id}/post`, {
                method: "POST",
            });
            toast.success("Journal entry posted");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to post");
        }
    };

    const handleVoid = async () => {
        if (!confirm("Are you sure you want to void this journal entry? This action cannot be undone.")) return;
        try {
            await apiFetch(`/api/accounting/journal-entries/${id}/void`, {
                method: "POST",
            });
            toast.success("Journal entry voided");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to void");
        }
    };

    return (
        <div className="flex gap-2">
            {status === "DRAFT" && (
                <Button size="sm" onClick={handlePost} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Post
                </Button>
            )}
            {status !== "VOID" && (
                <Button size="sm" variant="destructive" onClick={handleVoid}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Void
                </Button>
            )}
        </div>
    );
}
