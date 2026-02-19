"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    LayoutDashboard,
    Banknote,
    MapPin,
    CalendarClock,
    CalendarArrowDown,
    CheckSquare,
    TrendingUp
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AdminDashboardProps {
    stats: any;
}

export function AdminDashboard({ stats }: AdminDashboardProps) {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Admin Dashboard"
                description="Overview of system performance and operations."
                icon={LayoutDashboard}
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-lg transition-shadow border-emerald-500/20 bg-emerald-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600">Monthly Revenue</CardTitle>
                        <Banknote className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            {formatCurrency(stats.monthlyRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Accrual for {new Date().toLocaleString('default', { month: 'long' })}
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
                        <CalendarClock className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeBookings}</div>
                        <p className="text-xs text-muted-foreground">
                            currently running campaigns
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Tasks</CardTitle>
                        <CheckSquare className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingTasks}</div>
                        <p className="text-xs text-muted-foreground">
                            Installations & Maintenance
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Holdings</CardTitle>
                        <MapPin className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalHoldings}</div>
                        <p className="text-xs text-muted-foreground">
                            across all cities
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Expiring Soon */}
                <Card className="col-span-1 border border-amber-500/30 bg-amber-500/5">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CalendarArrowDown className="h-5 w-5 text-amber-600" />
                            Expiring Soon (7 Days)
                        </CardTitle>
                        <CardDescription>Actions needed: Renew or re-market these holdings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stats.expiringBookings?.length > 0 ? (
                            <ul className="space-y-4">
                                {stats.expiringBookings.map((bk: any) => (
                                    <li key={bk.id} className="flex justify-between items-center text-sm border-b border-amber-500/20 pb-2 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium text-amber-900 dark:text-amber-100">{bk.holding.code}</p>
                                            <p className="text-xs text-muted-foreground">{bk.client.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-amber-900 dark:text-amber-100">{formatDate(bk.endDate)}</p>
                                            <Link href={`/bookings/${bk.id}`} className="text-xs text-amber-600 hover:underline">
                                                Review
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground py-4 text-center">No campaigns expiring this week.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Recent Bookings
                        </CardTitle>
                        <CardDescription>Latest confirmed campaigns.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stats.recentBookings?.length > 0 ? (
                            <ul className="space-y-4">
                                {stats.recentBookings.map((bk: any) => (
                                    <li key={bk.id} className="flex justify-between items-center text-sm border-b last:border-0 pb-2 last:pb-0">
                                        <div>
                                            <p className="font-medium">{bk.client.name}</p>
                                            <p className="text-xs text-muted-foreground">Booked: {bk.holding.code}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">{formatDate(bk.createdAt)}</p>
                                            <Link href={`/bookings/${bk.id}`} className="text-xs text-primary hover:underline">
                                                Details
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground py-4 text-center">No recent bookings found.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-1 items-center justify-center hover:bg-muted/50 border-emerald-500/20">
                    <Link href="/billing/invoices/new">
                        <Banknote className="h-6 w-6 mb-2 text-emerald-600" />
                        <span className="font-semibold text-emerald-600">Create Invoice</span>
                        <span className="text-xs text-muted-foreground font-normal">Bill a client</span>
                    </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-1 items-center justify-center hover:bg-muted/50 border-primary/20">
                    <Link href="/bookings/new">
                        <CalendarClock className="h-6 w-6 mb-2 text-primary" />
                        <span className="font-semibold text-primary">Confirm Booking</span>
                        <span className="text-xs text-muted-foreground font-normal">Start a campaign</span>
                    </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-1 items-center justify-center hover:bg-muted/50 border-amber-500/20">
                    <Link href="/tasks/new">
                        <CheckSquare className="h-6 w-6 mb-2 text-amber-500" />
                        <span className="font-semibold text-amber-500">Assign Task</span>
                        <span className="text-xs text-muted-foreground font-normal">Maintenance or Install</span>
                    </Link>
                </Button>
            </div>
        </div>
    );
}
