"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SuggestionStatusActionsProps {
    id: string;
}

export function SuggestionStatusActions({ id }: SuggestionStatusActionsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleStatusUpdate = async (status: 'ACCEPTED' | 'REJECTED') => {
        setIsLoading(true);
        try {
            await apiFetch(`/api/suggestions/${id}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status }),
            });
            toast.success(`Suggestion ${status.toLowerCase()} successfully`);
            router.refresh();
        } catch (error) {
            toast.error(`Failed to ${status.toLowerCase()} suggestion`);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex gap-2">
            <Button
                variant="destructive"
                size="sm"
                onClick={() => handleStatusUpdate('REJECTED')}
                disabled={isLoading}
            >
                <XCircle className="mr-2 h-4 w-4" /> Reject
            </Button>
            <Button
                variant="default"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleStatusUpdate('ACCEPTED')}
                disabled={isLoading}
            >
                <CheckCircle className="mr-2 h-4 w-4" /> Accept
            </Button>
        </div>
    );
}
