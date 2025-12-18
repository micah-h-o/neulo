"use client";
import React from "react";
import Sidebar from "@/components/sidebar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignIn, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { PricingTable } from "@clerk/nextjs";


import { Protect } from "@clerk/nextjs";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Use Clerk's user hook to get the user object
    const { user, isLoaded } = useUser();
    const router = useRouter();

    // Redirect to sign-in if user is not signed in
    useEffect(() => {
        if (isLoaded && !user) {
            router.replace("/sign-in");
        }
    }, [isLoaded, user, router]);

    // Log all Clerk user information
    useEffect(() => {
        console.log("=== CLERK USER INFORMATION ===");
        console.log("isLoaded:", isLoaded);
        console.log("hasUser:", !!user);
        
        if (user) {
            console.log("User ID:", user.id);
            console.log("Username:", user.username);
            console.log("First Name:", user.firstName);
            console.log("Last Name:", user.lastName);
            console.log("Full Name:", user.fullName);
            console.log("Image URL:", user.imageUrl);
            console.log("Primary Email:", user.primaryEmailAddress?.emailAddress);
            console.log("Primary Phone:", user.primaryPhoneNumber?.phoneNumber);
            console.log("Email Addresses:", user.emailAddresses);
            console.log("Phone Numbers:", user.phoneNumbers);
            console.log("External Accounts:", user.externalAccounts);
            console.log("Public Metadata:", user.publicMetadata);
            console.log("Private Metadata:", user.privateMetadata);
            console.log("Unsafe Metadata:", user.unsafeMetadata);
            console.log("Created At:", user.createdAt);
            console.log("Updated At:", user.updatedAt);
            console.log("Last Sign In At:", user.lastSignInAt);
            console.log("Two Factor Enabled:", user.twoFactorEnabled);
            console.log("Two Factor Methods:", user.twoFactorMethods);
            console.log("Password Enabled:", user.passwordEnabled);
            console.log("SAML Accounts:", user.samlAccounts);
            console.log("Web3 Wallets:", user.web3Wallets);
            console.log("Organization Memberships:", user.organizationMemberships);
            console.log("Full User Object:", user);
        } else {
            console.log("No user found - user is null or undefined");
        }
        console.log("=============================");
    }, [user, isLoaded]);

    return (
        <div>
            <SignedIn>
                <Protect
                    plan="premium"
                    fallback={
                        <div className="min-h-screen py-10" style={{ background: 'var(--background)' }}>
                            <div className="w-full px-6 md:px-16 lg:px-32">
                                {/* Header */}
                                <div className="mb-10 animate-fade-in-up">
                                    <span
                                        className="text-[10px] uppercase tracking-[0.25em] mb-2 block"
                                        style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                                    >
                                        Subscription
                                    </span>
                                    <h1
                                        className="text-3xl mb-2"
                                        style={{ fontFamily: 'var(--font-serif)', color: 'var(--foreground)' }}
                                    >
                                        Research Plans
                                    </h1>
                                    <p
                                        className="text-sm leading-relaxed max-w-xl"
                                        style={{ color: 'var(--muted)' }}
                                    >
                                        Choose the level of analysis that fits your self-discovery practice.
                                        All plans include unlimited journal entries and basic emotional tracking.
                                    </p>
                                </div>

                                {/* Pricing table */}
                                <div
                                    className="flex justify-center animate-fade-in-up"
                                    style={{ animationDelay: '0.1s' }}
                                >
                                    <div className="w-full max-w-3xl">
                                        <PricingTable />
                                    </div>
                                </div>

                                {/* Footer note */}
                                <div
                                    className="mt-12 text-center animate-fade-in-up"
                                    style={{ animationDelay: '0.2s' }}
                                >
                                    <p
                                        className="text-xs"
                                        style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                                    >
                                        Your data remains encrypted and private regardless of plan.
                                    </p>
                                </div>
                            </div>
                        </div>
                    }
                >
                    <div className="min-h-full flex" style={{ background: 'var(--background)' }}>
                        <Sidebar />
                        <div className="mx-auto flex flex-1 flex-col lg:pl-64">
                            {children}
                        </div>
                    </div>
                </Protect>
            </SignedIn>
            <SignedOut>
                {/* Show loading state while redirecting */}
                <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-sm text-[var(--muted)]">Redirecting to sign in...</p>
                    </div>
                </div>
            </SignedOut>
        </div>
    );
}
