"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";

interface ClientDeleteButtonProps {
    clientId: string;
    clientName: string;
}

export function ClientDeleteButton({ clientId, clientName }: ClientDeleteButtonProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDialog, setShowDialog] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await apiFetch(`/api/clients/${clientId}`, { method: 'DELETE' });
            toast.success("Client deleted successfully");
            router.push("/clients");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete client");
        } finally {
            setIsDeleting(false);
            setShowDialog(false);
        }
    };

    return (
        <>
            <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setShowDialog(true)}
            >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Client
            </Button>

            <DeleteConfirmationDialog
                isOpen={showDialog}
                onClose={() => setShowDialog(false)}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                title="Delete Client"
                description={`Are you sure you want to delete ${clientName}? This action cannot be undone.`}
            />
        </>
    );
}
