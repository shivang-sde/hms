"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDate, formatEnum } from "@/lib/utils";
import {
    LayoutDashboard,
    ClipboardCheck,
    ClipboardList,
    Clock,
    ArrowRight,
    MapPin,
    Calendar
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface StaffDashboardProps {
    stats: any;
}

export function StaffDashboard({ stats }: StaffDashboardProps) {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Staff Portal"
                description="Your personal task overview and activity."
                icon={LayoutDashboard}
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-lg transition-shadow border-indigo-500/20 bg-indigo-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-600">Pending Tasks</CardTitle>
                        <Clock className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-600">{stats.pendingTasks}</div>
                        <p className="text-xs text-muted-foreground">
                            Assigned to you for action
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-emerald-500/20 bg-emerald-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600">Completed This Month</CardTitle>
                        <ClipboardCheck className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{stats.tasksCompletedThisMonth}</div>
                        <p className="text-xs text-muted-foreground">
                            {new Date().toLocaleString('default', { month: 'long' })} achievements
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Work Distribution</CardTitle>
                        <ClipboardList className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 items-center flex-wrap">
                            {stats.taskTypeCounts?.map((type: any) => (
                                <div key={type.taskType} className="px-2 py-1 bg-muted rounded text-[10px] font-medium uppercase tracking-wider">
                                    {formatEnum(type.taskType)} ({type._count.id})
                                </div>
                            ))}
                            {(!stats.taskTypeCounts || stats.taskTypeCounts.length === 0) && (
                                <p className="text-xs text-muted-foreground italic">No tasks assigned yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Recent/Next Tasks */}
                <Card className="col-span-1 lg:col-span-2 shadow-md border-indigo-500/10">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
                            <CardDescription>Tasks scheduled for your attention.</CardDescription>
                        </div>
                        <Button asChild variant="link" size="sm" className="text-indigo-600">
                            <Link href="/tasks" className="flex items-center gap-1">
                                View All <ArrowRight className="h-3 w-3" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {stats.recentTasks?.length > 0 ? (
                            <div className="space-y-4">
                                {stats.recentTasks.map((task: any) => (
                                    <div key={task.id} className="group flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card hover:border-indigo-500/30 hover:shadow-md transition-all duration-300">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                                <MapPin className="h-4 w-4" />
                                            </div>
                                            <div>
                                                {/* <p className="font-semibold text-sm group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{task.holding.code}</p> */}
                                                <p className="text-xs text-muted-foreground line-clamp-1">{task.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-bold">
                                                        {formatEnum(task.taskType)}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                        <Calendar className="h-3 w-3" /> {formatDate(task.scheduledDate)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button asChild size="sm" variant="ghost" className="rounded-full h-8 w-8 p-0 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                            <Link href={`/tasks/${task.id}`}>
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
                                <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                                <p className="text-sm text-muted-foreground">No pending tasks assigned to you.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Help/Info */}
                <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl shadow-indigo-500/20 border-0">
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Guide</CardTitle>
                        <CardDescription className="text-indigo-100/80">How to complete your tasks.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="flex gap-3">
                            <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-bold text-xs">1</div>
                            <p className="text-indigo-50/90">Select a task from your list.</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-bold text-xs">2</div>
                            <p className="text-indigo-50/90">Update holding condition (Good/Damaged).</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-bold text-xs">3</div>
                            <p className="text-indigo-50/90">Upload mandatory photos (Front, Left, Right).</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-bold text-xs">4</div>
                            <p className="text-indigo-50/90 italic">Location is auto-captured for authenticity!</p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/10">
                            <p className="text-[10px] text-indigo-100/60 uppercase font-bold tracking-widest">Questions?</p>
                            <p className="text-xs font-medium mt-1">Contact Admin: +91 91234 56789</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
