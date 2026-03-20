"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    if (isLoginPage) {
        return <div className="min-h-screen w-full">{children}</div>;
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar className="hidden md:block" />
            <div className="flex-1 md:ml-[260px] transition-all duration-300">
                <Header />
                <main className="p-4 md:p-6">{children}</main>
            </div>
        </div>
    );
}
