"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: { value: number; isPositive: boolean };
    className?: string;
    iconClassName?: string;
}

export function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className,
    iconClassName,
}: StatsCardProps) {
    return (
        <Card className={cn("relative overflow-hidden", className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div
                    className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg",
                        iconClassName || "bg-indigo-500/10"
                    )}
                >
                    <Icon className={cn("h-4.5 w-4.5", iconClassName ? "" : "text-indigo-500")} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
                {trend && (
                    <p
                        className={cn(
                            "text-xs font-medium mt-1",
                            trend.isPositive ? "text-emerald-500" : "text-red-500"
                        )}
                    >
                        {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%{" "}
                        <span className="text-muted-foreground font-normal">from last month</span>
                    </p>
                )}
            </CardContent>
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-bl-full" />
        </Card>
    );
}
