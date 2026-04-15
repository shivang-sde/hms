"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";

export function HoardingSearch() {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);

    // Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    // Fetch matching holdings
    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const fetchResults = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/holdings/search?q=${encodeURIComponent(debouncedQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                    setIsOpen(true);
                }
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [debouncedQuery]);

    // Handle clicks outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (id: string) => {
        setIsOpen(false);
        setQuery("");
        router.push(`/holdings/${id}`);
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-sm ml-auto sm:ml-0 md:mr-4">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by Hoarding Code..."
                    className="w-full pl-9 bg-muted/40 md:w-[300px] lg:w-[400px] border-border/50 focus-visible:ring-primary/30 shadow-sm transition-all"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (results.length > 0 && query.trim()) setIsOpen(true);
                    }}
                />
                {isLoading && (
                    <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                )}
            </div>

            {isOpen && (
                <div className="absolute top-12 left-0 w-full z-50 bg-popover border shadow-lg rounded-xl overflow-hidden">
                    <Command className="border-none shadow-none bg-transparent">
                        <CommandList className="max-h-[300px] overflow-y-auto w-full p-1">
                            {results.length === 0 && !isLoading ? (
                                <CommandEmpty className="py-6 text-sm text-center">No hoarding found.</CommandEmpty>
                            ) : (
                                <CommandGroup heading="Holdings">
                                    {results.map((holding) => (
                                        <CommandItem
                                            key={holding.id}
                                            value={holding.code}
                                            onSelect={() => handleSelect(holding.id)}
                                            className="flex flex-col items-start gap-1 p-3 cursor-pointer mb-1 hover:bg-muted/50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-2 w-full">
                                                <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                                                    <MapPin className="h-4 w-4" />
                                                </div>
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <span className="font-semibold">{holding.code}</span>
                                                    <span className="text-xs text-muted-foreground truncate">{holding.name}</span>
                                                </div>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </Command>
                </div>
            )}
        </div>
    );
}
