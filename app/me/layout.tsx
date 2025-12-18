"use client";
import React from "react";
import Sidebar from "@/components/sidebar";
import { useEffect } from "react";
import { SignIn, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { PricingTable } from "@clerk/nextjs";


import { Protect } from "@clerk/nextjs";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { user, isLoaded } = useUser();

    useEffect(() => {
        console.log("DashboardLayout rendered");
        console.log("User:", user);
        console.log("Is Loaded:", isLoaded);
    }, []);

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
                                        <PricingTable newSubscriptionRedirectUrl="/me/today"/>
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
                <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-6 py-20">
                    <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-12 md:gap-16 items-center md:items-start">
                        {/* Left Side: Branding & Features */}
                        <div className="w-full md:w-1/2 space-y-8 animate-fade-in-up md:pr-8">
                            <div>
                                <h1 className="font-serif text-4xl md:text-5xl mb-3 text-[var(--foreground)]">Neulo</h1>
                                <p className="text-lg text-[var(--muted)] leading-relaxed mb-6">
                                    The artificial intelligence journal that reflects back.
                                </p>
                                <p className="text-sm text-[var(--muted)] leading-relaxed">
                                    Sign in to continue your journey toward better mental health and self-awareness.
                                </p>
                            </div>

                            {/* Feature Highlights */}
                            <div className="space-y-4 pt-4">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 w-6 h-6 rounded-lg border border-[var(--border)] bg-[var(--surface-highlight)] flex items-center justify-center flex-shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-[var(--foreground)] mb-1">AI-Powered Insights</h3>
                                        <p className="text-xs text-[var(--muted)] leading-relaxed">
                                            Discover patterns in your thoughts and emotions through advanced analysis.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 w-6 h-6 rounded-lg border border-[var(--border)] bg-[var(--surface-highlight)] flex items-center justify-center flex-shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-[var(--foreground)] mb-1">Private & Secure</h3>
                                        <p className="text-xs text-[var(--muted)] leading-relaxed">
                                            Your thoughts are encrypted and yours alone. Complete privacy guaranteed.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 w-6 h-6 rounded-lg border border-[var(--border)] bg-[var(--surface-highlight)] flex items-center justify-center flex-shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-[var(--foreground)] mb-1">Weekly Reports</h3>
                                        <p className="text-xs text-[var(--muted)] leading-relaxed">
                                            Comprehensive insights delivered weekly to track your progress.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Sign In Form */}
                        <div className="w-full md:w-1/2 flex justify-center md:justify-start animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <div className="w-full max-w-md">
                                <SignIn 
                                    routing="hash"
                                    appearance={{
                                        variables: {
                                            colorPrimary: "#1a1a1a",
                                            colorText: "#1a1a1a",
                                            colorTextSecondary: "#737373",
                                            colorBackground: "#ffffff",
                                            colorInputBackground: "#ffffff",
                                            colorInputText: "#1a1a1a",
                                            borderRadius: "0.75rem",
                                            fontFamily: "var(--font-sans)",
                                            fontSize: "0.875rem",
                                        },
                                        elements: {
                                            rootBox: {
                                                margin: "0 auto",
                                            },
                                            card: {
                                                backgroundColor: "#ffffff",
                                                border: "1px solid #e5e5e5",
                                                borderRadius: "1.5rem",
                                                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.03)",
                                            },
                                            headerTitle: {
                                                fontFamily: "var(--font-serif)",
                                                fontSize: "1.5rem",
                                                fontWeight: "500",
                                                color: "#1a1a1a",
                                            },
                                            headerSubtitle: {
                                                fontSize: "0.875rem",
                                                color: "#737373",
                                            },
                                            formButtonPrimary: {
                                                backgroundColor: "#1a1a1a",
                                                color: "white",
                                                borderRadius: "9999px",
                                                fontSize: "0.875rem",
                                                fontWeight: "500",
                                                transition: "all 0.2s",
                                            },
                                            formFieldInput: {
                                                border: "1px solid #e5e5e5",
                                                borderRadius: "0.75rem",
                                                backgroundColor: "white",
                                                fontSize: "0.875rem",
                                            },
                                            formFieldLabel: {
                                                fontSize: "0.875rem",
                                                fontWeight: "500",
                                                color: "#1a1a1a",
                                            },
                                            socialButtonsBlockButton: {
                                                backgroundColor: "white",
                                                border: "1px solid #e5e5e5",
                                                color: "#1a1a1a",
                                                borderRadius: "0.75rem",
                                                fontSize: "0.875rem",
                                                fontWeight: "500",
                                                transition: "all 0.2s",
                                            },
                                            footerActionLink: {
                                                color: "#1a1a1a",
                                                fontSize: "0.875rem",
                                            },
                                            dividerLine: {
                                                backgroundColor: "#e5e5e5",
                                            },
                                            dividerText: {
                                                color: "#737373",
                                                fontSize: "0.75rem",
                                            },
                                            formResendCodeLink: {
                                                color: "#1a1a1a",
                                                fontSize: "0.875rem",
                                            },
                                            alertText: {
                                                fontSize: "0.875rem",
                                            },
                                            formFieldSuccessText: {
                                                fontSize: "0.75rem",
                                                color: "#737373",
                                            },
                                            formFieldErrorText: {
                                                fontSize: "0.75rem",
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </SignedOut>
        </div>
    );
}
