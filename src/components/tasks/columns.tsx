"use client";

import { Task } from "@prisma/client";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { deleteTask } from "@/actions/tasks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatEnum } from "@/lib/utils";

export const TaskListColumns = [
    {
        header: "Title",
        accessorKey: "title",
        className: "font-medium",
    },
    {
        header: "Type",
        cell: (row: any) => formatEnum(row.taskType),
    },
    {
        header: "Priority",
        cell: (row: any) => <StatusBadge status={row.priority} />,
    },
    {
        header: "Due Date",
        cell: (row: any) => formatDate(row.scheduledDate),
    },
    {
        header: "Assigned To",
        cell: (row: any) => row.assignedTo?.name || "Unassigned",
    },
    {
        header: "Status",
        cell: (row: any) => <StatusBadge status={row.status} />,
    },
    {
        header: "Actions",
        cell: (row: any) => <TaskActions task={row} />,
        className: "text-right",
    },
];

function TaskActions({ task }: { task: Task }) {
    const router = useRouter();

    const handleDelete = async () => {
        try {
            await deleteTask(task.id);
            toast.success("Task deleted successfully");
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete task");
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                    <Link href={`/tasks/${task.id}`}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`/tasks/${task.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
