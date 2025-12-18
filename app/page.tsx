import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)] selection:text-white flex flex-col font-sans">

      {/* Navigation - Minimal & Clean */}
      <nav className="fixed top-0 w-full z-50 border-b border-[var(--border)] bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl tracking-tight font-medium text-[var(--foreground)]">Neulo</span>
          </div>

          <div className="flex items-center gap-6">
            <SignedIn>
              <Link href="/me/today" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                Dashboard
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-sm font-medium bg-[var(--accent)] text-white px-5 py-2 rounded-full hover:bg-[var(--accent-hover)] transition-all shadow-sm">
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>
          </div>
        </div>
      </nav>

      {/* Hero Section - Soft Scientific */}
      <main className="flex-1 flex flex-col items-center pt-36 pb-20 px-6">
        <div className="w-full max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">

          {/* Main Copy */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-serif text-[var(--foreground)] leading-[1.1]">
              The artificial intelligence <br />
              <span className="italic text-[var(--muted)]">journal that reflects back.</span>
            </h1>

            <p className="text-lg text-[var(--muted)] max-w-xl mx-auto leading-relaxed font-light">
              Improve your mental health, mindset, and cognitive skills with the most advanced AI-powered journal.
            </p>
          </div>

          {/* CTA */}
          <div className="pt-2 flex justify-center">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="bg-[var(--accent)] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm hover:shadow-md flex items-center gap-2">
                  Start Analyzing
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/me/today" className="bg-[var(--accent)] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm hover:shadow-md flex items-center gap-2">
                Go to Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="mt-20 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s', gridAutoRows: '1fr' }}>

          {/* Card 1: Personality Analysis - Top Left, 5 columns */}
          <div className="md:col-span-5 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 md:p-10 flex flex-col hover:shadow-lg transition-all duration-500 group h-full">
            <div className="mb-6">
              <h3 className="font-serif text-xl mb-1 text-[var(--foreground)]">Personality Analysis</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">Discover your unique traits and patterns through advanced AI analysis of your journal entries.</p>
            </div>
            {/* Mini preview: Big Five radar (mirrors Insights > Personality Profile styling) */}
            <div className="rounded-2xl border p-4 overflow-hidden" style={{ background: "var(--card-bg)", borderColor: "var(--border)", boxShadow: "var(--shadow)" }}>
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                  Psychological Model
                </span>
                <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                  Big Five
                </span>
              </div>
              <div className="w-full aspect-[16/9]">
                <svg viewBox="0 0 360 210" className="w-full h-full">
                  <defs>
                    <radialGradient id="lp-radar-fill" cx="50%" cy="50%" r="65%">
                      <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.32" />
                      <stop offset="80%" stopColor="#6366f1" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.07" />
                    </radialGradient>
                  </defs>
                  {/* grid */}
                  <g fill="none" stroke="#e5e7eb" strokeWidth="1.25">
                    <path d="M180 22 L278 88 L241 192 L119 192 L82 88 Z" />
                    <path d="M180 52 L250 100 L224 172 L136 172 L110 100 Z" />
                    <path d="M180 82 L222 112 L206 152 L154 152 L138 112 Z" />
                    <path d="M180 112 L194 124 L188 132 L172 132 L166 124 Z" />
                    <line x1="180" y1="22" x2="180" y2="192" />
                    <line x1="278" y1="88" x2="82" y2="88" />
                    <line x1="241" y1="192" x2="110" y2="100" />
                    <line x1="119" y1="192" x2="250" y2="100" />
                    <line x1="82" y1="88" x2="278" y2="88" />
                  </g>
                  {/* shape */}
                  <path
                    d="M180 46 L246 104 L212 170 L142 154 L122 104 Z"
                    fill="url(#lp-radar-fill)"
                    stroke="#6366f1"
                    strokeWidth="3"
                    style={{ filter: "drop-shadow(0 8px 32px rgba(32,44,74,0.05))" }}
                  />
                  {/* dots */}
                  <g fill="#fff" stroke="#6366f1" strokeWidth="1.5" opacity="0.95">
                    <circle cx="180" cy="46" r="3" />
                    <circle cx="246" cy="104" r="3" />
                    <circle cx="212" cy="170" r="3" />
                    <circle cx="142" cy="154" r="3" />
                    <circle cx="122" cy="104" r="3" />
                  </g>
                  {/* labels */}
                  <g fontFamily="Inter, sans-serif" fontSize="12" fontWeight="600" fill="#262e3e" opacity="0.84">
                    <text x="180" y="16" textAnchor="middle">Openness</text>
                    <text x="304" y="88" textAnchor="start">Extraversion</text>
                    <text x="252" y="206" textAnchor="middle">Agreeableness</text>
                    <text x="108" y="206" textAnchor="middle">Neuroticism</text>
                    <text x="56" y="88" textAnchor="end">Conscient.</text>
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Card 2: Mood Trends - Top Middle, 4 columns */}
          <div className="md:col-span-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 relative overflow-hidden flex flex-col hover:shadow-lg transition-all duration-500 group h-full">
            <div className="mb-6">
              <h3 className="font-serif text-xl mb-1 text-[var(--foreground)]">Mood Trends</h3>
              <p className="text-sm text-[var(--muted)]">Track your emotional patterns over time.</p>
            </div>
            {/* Mini preview: multi-emotion trend tiles (mirrors Insights emotion grid + trend charts) */}
            <div className="rounded-2xl border p-4 overflow-hidden" style={{ background: "var(--card-bg)", borderColor: "var(--border)", boxShadow: "var(--shadow)" }}>
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                  Moods
                </span>
                <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                  14 days
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "happiness", color: "#F9C846" },
                  { key: "stress", color: "#EF4444" },
                  { key: "anxiety", color: "#8B5CF6" },
                  { key: "calm", color: "#14B8A6" },
                ].map((emotion, index) => (
                  <div
                    key={emotion.key}
                    className="rounded-xl border overflow-hidden"
                    style={{
                      borderColor: "var(--border)",
                      background: "rgba(255,255,255,0.6)",
                    }}
                  >
                    <div className="p-3 pb-2">
                      <div className="flex items-center justify-between mb-1">
                        <h4
                          className="text-xs font-medium capitalize"
                          style={{ color: "var(--foreground)", fontFamily: "var(--font-serif)" }}
                        >
                          {emotion.key}
                        </h4>
                        <div className="w-2 h-2 rounded-full" style={{ background: emotion.color }} />
                      </div>
                      <p
                        className="text-[9px] uppercase tracking-[0.2em]"
                        style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
                      >
                        trend
                      </p>
                    </div>
                    <div
                      className="relative h-[68px] w-full overflow-hidden border-t"
                      style={{
                        borderColor: "var(--border)",
                        background: `linear-gradient(180deg, ${emotion.color}0f 0%, rgba(249,250,251,0) 60%, rgba(249,250,251,1) 100%)`,
                      }}
                    >
                      <svg viewBox="0 0 120 60" className="absolute inset-0 w-full h-full">
                        <defs>
                          <linearGradient id={`lp-em-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={emotion.color} stopOpacity="0.32" />
                            <stop offset="85%" stopColor={emotion.color} stopOpacity="0.05" />
                            <stop offset="100%" stopColor={emotion.color} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0 40 C 18 30, 28 52, 44 36 C 60 20, 74 28, 88 18 C 102 8, 110 16, 120 12 L120 60 L0 60 Z"
                          fill={`url(#lp-em-${index})`}
                        />
                        <path
                          d="M0 40 C 18 30, 28 52, 44 36 C 60 20, 74 28, 88 18 C 102 8, 110 16, 120 12"
                          fill="none"
                          stroke={emotion.color}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          style={{ filter: "drop-shadow(0 8px 18px rgba(32,44,74,0.04))" }}
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Weekly Reports - Top Right, 3 columns */}
          <div className="md:col-span-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 flex flex-col hover:shadow-lg transition-all duration-500 group h-full">
            <div className="mb-6">
              <h3 className="font-serif text-xl mb-1 text-[var(--foreground)]">Weekly Reports</h3>
              <p className="text-sm text-[var(--muted)]">Comprehensive insights delivered weekly.</p>
            </div>
            {/* Mini preview: weekly report card (mirrors report page + insights "ready" styling) */}
            <div className="rounded-2xl border p-4 overflow-hidden" style={{ background: "var(--card-bg)", borderColor: "var(--border)", boxShadow: "var(--shadow)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                  Weekly Report
                </span>
                <span className="text-[10px] font-medium" style={{ color: "var(--foreground)", fontFamily: "var(--font-sans)" }}>
                  Ready
                </span>
              </div>
              <div className="rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.6)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] uppercase tracking-[0.15em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                    Dominant
                  </span>
                  <span className="ml-auto text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                    68%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#14B8A6" }} />
                  <span className="text-sm capitalize" style={{ fontFamily: "var(--font-serif)", color: "var(--foreground)" }}>
                    calm
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: "rgba(229,231,235,0.8)" }}>
                  <div className="h-full rounded-full" style={{ width: "68%", background: "linear-gradient(90deg, #c7d2fe 0%, #6366f1 100%)" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Go Deeper with AI - Bottom Left, 7 columns */}
          <div className="md:col-span-7 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 flex flex-col hover:shadow-lg transition-all duration-500 group h-full">
            <div className="mb-6">
              <h3 className="font-serif text-xl mb-1 text-[var(--foreground)]">Go Deeper with AI</h3>
              <p className="text-sm text-[var(--muted)]">AI that asks the right questions.</p>
            </div>
            {/* Mini preview: journal excerpt + Reflection block (mirrors Today page "Reflection" styling) */}
            <div className="rounded-2xl border p-4 overflow-hidden" style={{ background: "var(--card-bg)", borderColor: "var(--border)", boxShadow: "var(--shadow)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                  Entry
                </span>
                <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                  Today
                </span>
              </div>
              <div className="rounded-xl border p-4 mb-4" style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.6)" }}>
                <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
                  "I keep replaying the conversation in my head. I know I prepared, but I still felt tense
                  the entire time…"
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                    312 words
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                    6:42 pm
                  </span>
                </div>
              </div>

              <div className="relative pl-4 border-l-2" style={{ borderColor: "#6366f1" }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "#6366f1", fontFamily: "var(--font-mono)" }}>
                    Reflection
                  </span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: "#6366f1", animationDelay: "0ms" }} />
                    <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: "#6366f1", animationDelay: "150ms" }} />
                    <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: "#6366f1", animationDelay: "300ms" }} />
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
                  When you say "I still felt tense the entire time," what was your mind predicting would happen—
                  and what evidence do you have for and against that prediction?
                </p>
              </div>
            </div>
          </div>

          {/* Card 5: Privacy and Security - Bottom Right, 5 columns */}
          <div className="md:col-span-5 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 flex flex-col hover:shadow-lg transition-all duration-500 group h-full">
            <div className="mb-6">
              <h3 className="font-serif text-xl mb-1 text-[var(--foreground)]">Privacy and Security</h3>
              <p className="text-sm text-[var(--muted)]">Your thoughts are encrypted and yours alone.</p>
            </div>
            {/* Mini preview: privacy-first visual motif (no "settings" implication) */}
            <div className="rounded-2xl border p-4 overflow-hidden" style={{ background: "var(--card-bg)", borderColor: "var(--border)", boxShadow: "var(--shadow)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                  Privacy
                </span>
                <span className="text-[10px] font-medium" style={{ color: "var(--foreground)" }}>
                  Protected
                </span>
              </div>
              <div className="rounded-xl border p-4 relative overflow-hidden" style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.6)" }}>
                <div
                  className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
                  style={{ background: "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.22) 0%, rgba(99,102,241,0.00) 70%)" }}
                />
                <div
                  className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full"
                  style={{ background: "radial-gradient(circle at 60% 60%, rgba(199,210,254,0.55) 0%, rgba(199,210,254,0.00) 70%)" }}
                />
                <div className="relative flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center border" style={{ borderColor: "rgba(99,102,241,0.25)", background: "rgba(99,102,241,0.10)" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="#6366f1" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm mb-2" style={{ color: "var(--foreground)", fontFamily: "var(--font-serif)" }}>
                      A private place for your thoughts.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { k: "Encrypted storage", v: "at rest" },
                        { k: "Minimal exposure", v: "by design" },
                        { k: "Sensitive by default", v: "always" },
                        { k: "Secure handling", v: "end‑to‑end" },
                      ].map((b) => (
                        <div key={b.k} className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.55)" }}>
                          <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                            {b.k}
                          </div>
                          <div className="text-xs mt-1" style={{ color: "var(--foreground)" }}>
                            {b.v}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* CTA Card */}
        <div className="mt-20 w-full max-w-6xl mx-auto pb-20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 md:p-10 hover:shadow-lg transition-all duration-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              {/* Left: Pricing & Features */}
              <div className="flex-1 space-y-6">
                <div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-serif text-3xl md:text-4xl text-[var(--foreground)]">$9</span>
                    <span className="text-sm text-[var(--muted)]">per month</span>
                  </div>
                  <p className="text-sm text-[var(--muted)] leading-relaxed max-w-md">
                    Start your journey toward better mental health and self-awareness.
                  </p>
                </div>
                
                {/* Features List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "AI-powered personality analysis",
                    "Emotional pattern tracking",
                    "Weekly insight reports",
                    "Private, encrypted storage",
                    "Reflective AI conversations",
                    "Unlimited journal entries"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2.5">
                      <div className="w-1 h-1 rounded-full bg-[var(--accent)] flex-shrink-0" />
                      <span className="text-sm text-[var(--foreground)]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: CTA Button */}
              <div className="flex-shrink-0 md:self-center">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <button className="w-full md:w-auto bg-[var(--accent)] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm hover:shadow-md">
                      Get Started
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/me/today" className="block w-full md:w-auto text-center bg-[var(--accent)] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm hover:shadow-md">
                    Go to Dashboard
                  </Link>
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
