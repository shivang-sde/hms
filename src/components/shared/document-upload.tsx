"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DocumentUploadProps {
    label: string;
    value?: string;
    onChange: (url: string | undefined) => void;
    hint?: string;
    /** Accepted MIME types. Defaults to PDF only. */
    accept?: string;
    /** Max file size in MB. Defaults to 10. */
    maxSizeMb?: number;
}

export function DocumentUpload({
    label,
    value,
    onChange,
    hint,
    accept = "application/pdf,image/*",
    maxSizeMb = 10,
}: DocumentUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFile = async (file: File) => {
        if (!file) return;

        const allowedTypes = accept.split(",").map((t) => t.trim());
        const isAllowed = allowedTypes.some((type) => {
            if (type.endsWith("/*")) {
                return file.type.startsWith(type.replace("/*", "/"));
            }
            return file.type === type;
        });

        if (!isAllowed) {
            toast.error(`Only ${accept.replace(/application\//g, "").replace(/image\/\*/g, "images")} files are allowed`);
            return;
        }

        if (file.size > maxSizeMb * 1024 * 1024) {
            toast.error(`File must be smaller than ${maxSizeMb} MB`);
            return;
        }

        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            if (!res.ok) throw new Error("Upload failed");
            const { url } = await res.json();
            onChange(url);
            toast.success(`${label} uploaded successfully`);
        } catch {
            toast.error(`Failed to upload ${label}`);
        } finally {
            setUploading(false);
        }
    };

    const baseName = value
        ? decodeURIComponent(value.split("/").pop() ?? value)
        : null;

    return (
        <div className="flex flex-col gap-2">
            <span className="text-sm font-medium leading-none">{label}</span>
            {hint && (
                <p className="text-xs text-muted-foreground">{hint}</p>
            )}

            {value ? (
                <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5 transition-colors">
                    <FileText className="h-4 w-4 shrink-0 text-indigo-500" />
                    <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 truncate text-sm text-indigo-500 hover:underline"
                        title={baseName ?? undefined}
                    >
                        {baseName ?? "View Document"}
                    </a>
                    <button
                        type="button"
                        onClick={() => onChange(undefined)}
                        className="ml-auto rounded-full p-0.5 text-muted-foreground hover:text-destructive transition-colors"
                        title="Remove file"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    disabled={uploading}
                    onClick={() => inputRef.current?.click()}
                    className={cn(
                        "flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 px-4 py-5 text-sm text-muted-foreground transition-all duration-200",
                        "hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/5",
                        uploading && "cursor-not-allowed opacity-60"
                    )}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading…
                        </>
                    ) : (
                        <>
                            <Upload className="h-4 w-4" />
                            Click to upload (max {maxSizeMb} MB)
                        </>
                    )}
                </button>
            )}

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = "";
                }}
            />
        </div>
    );
}
