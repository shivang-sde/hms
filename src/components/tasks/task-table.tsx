"use client";

import { useState, useMemo } from "react";
import { FilterableDataTable } from "@/components/shared/filterable-data-table";
import { getTaskListColumns } from "./columns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatEnum } from "@/lib/utils";

interface TaskTableProps {
    tasks: any[];
    role?: string;
}

const TASK_TYPES = ["INSTALLATION", "MOUNTING", "MAINTENANCE", "INSPECTION"];

const TASK_STATUS_OPTIONS = [
    { value: "ALL", label: "All Statuses" },
    { value: "PENDING", label: "Pending" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
];

const TASK_PRIORITY_OPTIONS = [
    { value: "ALL", label: "All Priorities" },
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "URGENT", label: "Urgent" },
];

export function TaskTable({ tasks, role }: TaskTableProps) {
    const columns = getTaskListColumns(role);
    const [activeTab, setActiveTab] = useState("ALL");

    const filteredByType = useMemo(() => {
        if (activeTab === "ALL") return tasks;
        return tasks.filter(task => task.taskType === activeTab);
    }, [tasks, activeTab]);

    return (
        <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="overflow-x-auto pb-2">
                    <TabsList className="inline-flex h-auto p-1 bg-muted/50 w-max sm:w-auto">
                        <TabsTrigger value="ALL" className="text-xs sm:text-sm">All Tasks</TabsTrigger>
                        {TASK_TYPES.map(type => (
                            <TabsTrigger key={type} value={type} className="text-xs sm:text-sm whitespace-nowrap">
                                {formatEnum(type)}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>
            </Tabs>
            <FilterableDataTable
                columns={columns}
                data={filteredByType}
                emptyMessage={`No ${activeTab === 'ALL' ? 'pending' : formatEnum(activeTab).toLowerCase()} tasks found.`}
                filteredEmptyMessage="No tasks match your filters."
                searchPlaceholder="Search by title or assigned to..."
                searchFields={[
                    { path: "title" },
                    { path: "assignedTo.name" },
                ]}
                filters={[
                    {
                        key: "status",
                        label: "Status",
                        options: TASK_STATUS_OPTIONS,
                        accessor: (row: any) => row.status,
                    },
                    {
                        key: "priority",
                        label: "Priority",
                        options: TASK_PRIORITY_OPTIONS,
                        accessor: (row: any) => row.priority,
                    },
                ]}
            />
        </div>
    );
}
