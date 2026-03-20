"use client";

import { DataTable } from "@/components/shared/data-table";
import { getTaskListColumns } from "./columns";

interface TaskTableProps {
    tasks: any[];
    role?: string;
}

export function TaskTable({ tasks, role }: TaskTableProps) {
    const columns = getTaskListColumns(role);

    return (
        <DataTable
            columns={columns}
            data={tasks}
            emptyMessage="No pending tasks found."
        />
    );
}
