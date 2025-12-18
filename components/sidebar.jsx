"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const pages = [
  {
    name: "Today",
    description: "Daily reflection",
    path: "/me/today",
  },
  {
    name: "Journal",
    description: "Entry archive",
    path: "/me/journal",
  },
  {
    name: "Insights",
    description: "Pattern analysis",
    path: "/me/insights",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const selectedPath =
    pathname === "/"
      ? "/me/today"
      : pathname.split("/")[1]
        ? "/" + pathname.split("/")[1] + (pathname.split("/")[2] ? "/" + pathname.split("/")[2] : "")
        : pathname;

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col z-10">
      <div
        className="flex grow flex-col overflow-y-auto border-r pb-4 pt-8"
        style={{
          background: 'var(--background)',
          borderColor: 'var(--border)'
        }}
      >
        {/* Brand */}
        <div className="px-6 mb-8">
          <Link href="/me/today" className="flex items-center gap-2">
            <span
              className="text-lg tracking-tight"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--foreground)' }}
            >
              Neulo
            </span>
          </Link>
          <p
            className="text-[10px] uppercase tracking-[0.2em] mt-1"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
          >
            The AI Journal
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col px-4" aria-label="Sidebar">
          <div className="space-y-1">
            {pages.map((page) => {
              const isActive = selectedPath === page.path;
              return (
                <Link
                  href={page.path}
                  key={page.name}
                  className="group block rounded-lg px-3 py-2.5 transition-all duration-200"
                  style={{
                    background: isActive ? 'var(--surface-highlight)' : 'transparent',
                    borderLeft: isActive ? '2px solid var(--foreground)' : '2px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--surface-highlight)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                  tabIndex={0}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span
                    className="block text-sm font-medium"
                    style={{
                      color: isActive ? 'var(--foreground)' : 'var(--muted)',
                      fontFamily: 'var(--font-sans)'
                    }}
                  >
                    {page.name}
                  </span>
                  <span
                    className="block text-[10px] mt-0.5 uppercase tracking-wider"
                    style={{
                      color: 'var(--muted)',
                      fontFamily: 'var(--font-mono)',
                      opacity: isActive ? 0.8 : 0.6
                    }}
                  >
                    {page.description}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div
          className="border-t pt-4 mx-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between px-2">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
            />
            <span
              className="text-[9px] uppercase tracking-[0.15em]"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
            >
              v2.1
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
