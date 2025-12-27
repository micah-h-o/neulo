'use client'

import { usePathname } from "next/navigation"
import { useEffect } from "react"

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
      defaults: '2025-11-30'
    });

    if (pathname === "/me/today") {
      posthog.opt_out_capturing();
    } else {
      posthog.opt_in_capturing();
    }

    // Optionally, you may want to re-run this logic when the route changes.
    // Remove this event if not desired. The following event is just a placeholder.
    posthog.capture('my event', { property: 'value' });
  }, [pathname]);

  return (
    <PHProvider client={posthog}>
      {children}
    </PHProvider>
  )
}
