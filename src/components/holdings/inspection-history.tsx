"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { PhotoGallery } from "@/components/shared/photo-gallery";
import { formatDate } from "@/lib/utils";
import { 
    ClipboardCheck, 
    ChevronDown, 
    ChevronUp, 
    MapPin, 
    Zap, 
    ShieldCheck, 
    Eye,
    User,
    Calendar
} from "lucide-react";

interface InspectionHistoryProps {
    inspections: any[];
}

export function InspectionHistory({ inspections }: InspectionHistoryProps) {
    const [showAll, setShowAll] = useState(false);

    if (!inspections || inspections.length === 0) {
        return (
            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4" /> Inspection History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">No inspections recorded yet.</p>
                </CardContent>
            </Card>
        );
    }

    const displayedInspections = showAll ? inspections : inspections.slice(0, 1);

    return (
        <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4" /> Inspection History
                </CardTitle>
                {inspections.length > 1 && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowAll(!showAll)}
                        className="text-xs h-8"
                    >
                        {showAll ? (
                            <>Hide <ChevronUp className="ml-1 h-3 w-3" /></>
                        ) : (
                            <>Show More ({inspections.length - 1}) <ChevronDown className="ml-1 h-3 w-3" /></>
                        )}
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
                {displayedInspections.map((inspection, index) => (
                    <div key={inspection.id} className="space-y-6">
                        {index > 0 && <div className="border-t pt-6" />}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Date</p>
                                <div className="flex items-center gap-2 font-medium">
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                    {formatDate(inspection.inspectionDate)}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Inspector</p>
                                <div className="flex items-center gap-2 font-medium">
                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                    {inspection.inspectorName || "N/A"}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Condition</p>
                                <StatusBadge status={inspection.condition} />
                            </div>
                            <div className="space-y-1 sm:col-span-2 lg:col-span-4">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Detailed Status</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <StatusBox active={inspection.illuminationOk} icon={Zap} label="Illumination" />
                                    <StatusBox active={inspection.structureOk} icon={ShieldCheck} label="Structure" />
                                    <StatusBox active={inspection.visibilityOk} icon={Eye} label="Visibility" />
                                </div>
                            </div>
                        </div>

                        {inspection.remarks && (
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Remarks</p>
                                <p className="text-sm bg-slate-50 p-3 rounded-md border border-slate-100 italic dark:bg-slate-700 dark:border-slate-700 dark:text-slate-300">
                                    &quot;{inspection.remarks}&quot;
                                </p>
                            </div>
                        )}

                        {inspection.photos && inspection.photos.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Photos</p>
                                <PhotoGallery photos={inspection.photos} />
                            </div>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

function StatusBox({ active, icon: Icon, label }: { active: boolean, icon: any, label: string }) {
    return (
        <div className={`flex items-center gap-2 p-2 rounded-md border ${active ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
            <Icon className="h-4 w-4" />
            <span className="text-xs font-semibold">{label}: {active ? 'OK' : 'FAIL'}</span>
        </div>
    );
}
