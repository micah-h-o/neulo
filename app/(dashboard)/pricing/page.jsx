"use client";
import { useState, useEffect } from 'react';
import { PricingTable } from '@clerk/nextjs';

export default function PricingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`min-h-screen py-10 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'var(--background)' }}
    >
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
  );
}
