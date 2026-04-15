"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function TaskReviewActions({ taskId }: { taskId: string }) {
    const router = useRouter();
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const handleApprove = async () => {
        setIsApproving(true);
        try {
            const res = await fetch(`/api/tasks/${taskId}/review`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "APPROVE" }),
            });
            if (!res.ok) throw new Error("Failed to approve task");
            toast.success("Task approved and marked as completed.");
            router.refresh();
        } catch (error) {
            toast.error("An error occurred while approving the task.");
            setIsApproving(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error("Please provide a rejection reason.");
            return;
        }
        setIsRejecting(true);
        try {
            const res = await fetch(`/api/tasks/${taskId}/review`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "REJECT", reason: rejectionReason }),
            });
            if (!res.ok) throw new Error("Failed to reject task");
            toast.success("Task rejected and reset to pending.");
            setIsRejectModalOpen(false);
            setRejectionReason("");
            router.refresh();
        } catch (error) {
            toast.error("An error occurred while rejecting the task.");
            setIsRejecting(false);
        }
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={isApproving}
                >
                    <X className="mr-2 h-4 w-4" /> Reject
                </Button>
                <Button 
                    size="sm" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleApprove}
                    disabled={isApproving}
                >
                    {isApproving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Check className="mr-2 h-4 w-4" />
                    )}
                    Approve
                </Button>
            </div>

            <Dialog open={isRejectModalOpen} onOpenChange={(open) => !isRejecting && setIsRejectModalOpen(open)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Task Execution</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this work. The task will be sent back to the staff as pending.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="my-4">
                        <Textarea 
                            placeholder="Reason for rejection..." 
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            disabled={isRejecting}
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsRejectModalOpen(false)}
                            disabled={isRejecting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleReject}
                            disabled={isRejecting || !rejectionReason.trim()}
                        >
                            {isRejecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Confirm Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
