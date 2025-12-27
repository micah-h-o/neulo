"use client";
import React from "react";
import Sidebar from "@/components/sidebar";
import { useEffect } from "react";
import { SignIn, SignedIn, SignedOut, useUser, UserButton, useAuth } from "@clerk/nextjs";
import { PricingTable } from "@clerk/nextjs";
import { Protect } from "@clerk/nextjs";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { has } = useAuth()
    const { user, isLoaded } = useUser();
    const hasPremium = has?.({ plan: 'premium' }) ?? false
    const isAllowedEmail = user && (user.primaryEmailAddress?.emailAddress == "anneomondi@yahoo.com" || user.primaryEmailAddress?.emailAddress == "micah.hayes.mail@gmail.com")

    useEffect(() => {
        if (!isLoaded) {
            return;
        }
    }, [user, isLoaded]);

    return (
        <div>
            <SignedIn>
                <Protect
                    condition={() => !!hasPremium || !!isAllowedEmail}
                    fallback={
                        <div className="min-h-screen flex flex-col md:flex-row">
                            {/* Left Side: Dark Background with Branding & Features */}
                            <div
                                className="w-full md:w-1/2 md:min-h-screen p-8 md:p-12 lg:p-16 flex flex-col justify-between animate-fade-in-up"
                                style={{ background: 'var(--foreground)' }}
                            >
                                {/* Top: Branding */}
                                <div>
                                    <div className="mb-12">
                                        <span
                                            className="text-lg tracking-tight"
                                            style={{ fontFamily: 'var(--font-serif)', color: 'var(--background)' }}
                                        >
                                            Neulo
                                        </span>
                                        <p
                                            className="text-[10px] uppercase tracking-[0.2em] mt-1"
                                            style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.5)' }}
                                        >
                                            The AI Journal
                                        </p>
                                    </div>

                                    {/* Hero Text */}
                                    <div className="mb-12">
                                        <h1
                                            className="text-3xl md:text-4xl lg:text-5xl leading-tight mb-6"
                                            style={{ fontFamily: 'var(--font-serif)', color: 'var(--background)' }}
                                        >
                                            Begin your journey of <br />
                                            <span style={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
                                                self-understanding.
                                            </span>
                                        </h1>
                                        <p
                                            className="text-sm md:text-base leading-relaxed max-w-md"
                                            style={{ color: 'rgba(255,255,255,0.7)' }}
                                        >
                                            Unlock the full potential of AI-powered journaling with advanced insights,
                                            personality analysis, and weekly reports.
                                        </p>
                                    </div>

                                    {/* Features List */}
                                    <div className="space-y-4">
                                        {[
                                            { title: 'Personality Analysis', desc: 'Big Five psychological profiling from your entries' },
                                            { title: 'Emotional Tracking', desc: 'Real-time mood analysis and pattern detection' },
                                            { title: 'Weekly Reports', desc: 'Comprehensive insights delivered every week' },
                                            { title: 'AI Reflections', desc: 'Thoughtful prompts that guide deeper thinking' },
                                            { title: 'Unlimited Entries', desc: 'Journal as much as you want, whenever you want' },
                                        ].map((feature, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-start gap-4 animate-fade-in-up"
                                                style={{ animationDelay: `${0.1 + idx * 0.05}s` }}
                                            >
                                                <div
                                                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                                    style={{ background: 'rgba(255,255,255,0.1)' }}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="#22C55E"
                                                        className="w-3 h-3"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3
                                                        className="text-sm font-medium mb-0.5"
                                                        style={{ color: 'var(--background)' }}
                                                    >
                                                        {feature.title}
                                                    </h3>
                                                    <p
                                                        className="text-xs leading-relaxed"
                                                        style={{ color: 'rgba(255,255,255,0.5)' }}
                                                    >
                                                        {feature.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Bottom: Privacy Footer */}
                                <div
                                    className="pt-8 border-t animate-fade-in-up"
                                    style={{ borderColor: 'rgba(255,255,255,0.1)', animationDelay: '0.4s' }}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                                            style={{ background: 'rgba(255,255,255,0.1)' }}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="var(--background)"
                                                className="w-4 h-4"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <p
                                                className="text-xs font-medium"
                                                style={{ color: 'var(--background)' }}
                                            >
                                                End-to-end encrypted
                                            </p>
                                            <p
                                                className="text-[10px]"
                                                style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}
                                            >
                                                Your data is protected and never shared
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Light Background with Pricing Table */}
                            <div
                                className="hidden md:flex w-1/2 min-h-screen p-8 md:p-12 lg:p-16 flex-col justify-center items-center animate-fade-in-up relative"
                                style={{ background: 'var(--background)', animationDelay: '0.1s' }}
                            >
                                {/* Clerk UserButton in top right */}
                                <div className="absolute top-6 right-6 z-10">
                                    <UserButton />
                                </div>
                                <div className="w-full max-w-lg">
                                    {/* Header */}
                                    <div className="text-center mb-8">
                                        <h2
                                            className="text-2xl md:text-3xl mb-2"
                                            style={{ fontFamily: 'var(--font-serif)', color: 'var(--foreground)' }}
                                        >
                                            Pricing
                                        </h2>
                                        <p
                                            className="text-sm leading-relaxed"
                                            style={{ color: 'var(--muted)' }}
                                        >
                                            Your mental health is worth it.
                                        </p>
                                    </div>

                                    {/* Pricing Table */}
                                    <div className="w-full">
                                        {/* Annual Savings Banner */}
                                        <div
                                            className="mb-6 p-4 rounded-xl text-center"
                                            style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)' }}
                                        >
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <span
                                                    className="text-xs font-medium tracking-wide"
                                                    style={{ color: '#22C55E' }}
                                                >
                                                    Save 33% with annual
                                                </span>
                                            </div>
                                            <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                                                <span style={{ fontWeight: 500 }}>$6/mo</span>
                                                <span style={{ color: 'var(--muted)' }}> billed annually instead of </span>
                                                <span style={{ color: 'var(--muted)' }}>$9/mo</span>
                                            </p>
                                        </div>
                                        <PricingTable newSubscriptionRedirectUrl="/me/today" />
                                    </div>

                                    {/* Footer Note */}
                                    <div className="mt-8 text-center">
                                        <p
                                            className="text-xs"
                                            style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                                        >
                                            Cancel anytime, no questions asked.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile-only Pricing Section (shown below LHS on mobile) */}
                            <div
                                className="md:hidden w-full p-8 animate-fade-in-up"
                                style={{ background: 'var(--background)', animationDelay: '0.2s' }}
                            >
                                <div className="w-full max-w-lg mx-auto">
                                    {/* Place UserButton above pricing for mobile */}
                                    <div className="flex justify-end mb-4">
                                        <UserButton />
                                    </div>
                                    <div className="text-center mb-6">
                                        <span
                                            className="text-[10px] uppercase tracking-[0.25em] mb-2 block"
                                            style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                                        >
                                            Choose Your Plan
                                        </span>
                                        <h2
                                            className="text-2xl mb-2"
                                            style={{ fontFamily: 'var(--font-serif)', color: 'var(--foreground)' }}
                                        >
                                            Research Plans
                                        </h2>
                                    </div>
                                    <PricingTable newSubscriptionRedirectUrl="/me/today" />
                                    <div className="mt-6 text-center">
                                        <p
                                            className="text-xs"
                                            style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                                        >
                                            Cancel anytime · No commitment required
                                        </p>
                                    </div>
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
