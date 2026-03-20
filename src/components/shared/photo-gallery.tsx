"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function PhotoGallery({ photos }: { photos: string[] }) {
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    if (!photos || photos.length === 0) return null;

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {photos.map((photo, index) => (
                    <div
                        key={index}
                        onClick={() => setSelectedPhoto(photo)}
                        className="cursor-pointer block aspect-video sm:aspect-square rounded-xl border border-border shadow-sm overflow-hidden hover:opacity-90 transition-opacity"
                    >
                        <img
                            src={photo}
                            alt={`Location photo ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>

            <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
                <DialogContent className="max-w-5xl w-full p-2 bg-transparent border-none shadow-none [&>button]:text-white [&>button]:bg-black/40 [&>button]:hover:bg-black/60 [&>button]:rounded-full [&>button]:p-1">
                    <DialogTitle className="sr-only">Photo Viewer</DialogTitle>
                    {selectedPhoto && (
                        <div className="relative w-full flex items-center justify-center">
                            <img
                                src={selectedPhoto}
                                alt="Full screen location view"
                                className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
