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
            <Sidebar />
            <div className="flex-1 ml-[260px] transition-all duration-300">
                <Header />
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
