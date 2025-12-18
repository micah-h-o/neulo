import React from "react";
import Sidebar from "@/components/sidebar";
import { SignIn, SignedIn, SignedOut } from "@clerk/nextjs";


export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <SignedIn>
                <div className="min-h-full flex" style={{ background: 'var(--background)' }}>
                    <Sidebar />
                    <div className="mx-auto flex flex-1 flex-col lg:pl-64">
                        {children}
                    </div>
                </div>
            </SignedIn>
            <SignedOut>
                <SignIn />
            </SignedOut>
        </div>
    );
}
