"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";

interface VendorDeleteButtonProps {
    vendorId: string;
    vendorName: string;
}

export function VendorDeleteButton({ vendorId, vendorName }: VendorDeleteButtonProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDialog, setShowDialog] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await apiFetch(`/api/accounting/vendors/${vendorId}`, { method: 'DELETE' });
            toast.success("Vendor deleted successfully");
            router.push("/master-data/vendors");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete vendor");
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
                <Trash2 className="mr-2 h-4 w-4" /> Delete Vendor
            </Button>

            <DeleteConfirmationDialog
                isOpen={showDialog}
                onClose={() => setShowDialog(false)}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                title="Delete Vendor"
                description={`Are you sure you want to delete ${vendorName}? This action cannot be undone.`}
            />
        </>
    );
}
