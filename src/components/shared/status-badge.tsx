"use client";

import { Badge } from "@/components/ui/badge";
import { cn, getStatusColor, formatEnum } from "@/lib/utils";

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    return (
        <Badge
            variant="secondary"
            className={cn(
                "font-medium text-[11px] px-2 py-0.5",
                getStatusColor(status),
                className
            )}
        >
            {formatEnum(status)}
        </Badge>
    );
}
