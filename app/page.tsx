import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)] selection:text-white flex flex-col font-sans">

      {/* Navigation - Consistent with App UI */}
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-[var(--border)] bg-[var(--surface)]/85 backdrop-blur-lg">
        <div className="max-w-[1200px] mx-auto h-16 flex items-center justify-between px-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl tracking-tight font-medium text-[var(--foreground)] select-none">Neulo</span>
          </div>
          <div className="flex items-center gap-6">
            <SignedIn>
              <Link
                href="/me/today"
                className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors hover:underline underline-offset-4"
              >
                Dashboard
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors px-2 py-1 rounded-md hover:bg-[var(--surface-highlight)] active:bg-[var(--surface-highlight)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-sm font-medium bg-[var(--accent)] text-white px-5 py-2 rounded-full hover:bg-[var(--accent-hover)] transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center pt-36 pb-20 px-4 sm:px-6">
        <div className="w-full max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-serif text-[var(--foreground)]">
              The artificial intelligence <br />
              <span className="italic text-[var(--muted)] font-normal">journal that reflects back.</span>
            </h1>
            <p className="text-lg text-[var(--muted)] max-w-xl mx-auto leading-relaxed font-light">
              Improve your mental health, mindset, and cognitive skills with the most advanced AI-powered journal.
            </p>
          </div>
        </div>
        {/* CTA */}
        <div className="pt-8 flex justify-center">
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="bg-[var(--accent)] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm hover:shadow-md flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
                Start Analyzing
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/me/today" className="bg-[var(--accent)] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm hover:shadow-md flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>

        {/* --- Today Page Preview --- */}
        <section className="w-full max-w-[1200px] mx-auto pt-8 mt-20">
          <div className="rounded-2xl overflow-hidden border-2 border-[var(--border)] shadow-lg">
            {/* Browser top bar */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border)] bg-[var(--surface-highlight)]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#F9C846' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#22C55E' }} />
              </div>
              <div className="flex-1 mx-4 px-3 py-1 rounded text-xs bg-[var(--card-bg)] text-[var(--muted)] font-mono truncate">
                neulo.app/me/today
              </div>
            </div>
            <div className="flex bg-[var(--background)]">
              {/* Sidebar (cohesive with app) */}
              <aside className="w-60 md:w-64 border-r flex-shrink-0 border-[var(--border)] bg-[var(--background)] flex flex-col">
                <div className="p-6 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg tracking-tight font-serif text-[var(--foreground)]">
                      Neulo
                    </span>
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] font-mono">
                    The AI Journal
                  </p>
                </div>
                <nav className="p-4 space-y-1">
                  {[
                    { name: 'Today', desc: 'Daily reflection', active: true },
                    { name: 'Journal', desc: 'Entry archive', active: false },
                    { name: 'Insights', desc: 'Pattern analysis', active: false },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className={"flex flex-col rounded-lg px-3 py-2.5 group transition-all " + (item.active ? "bg-[var(--surface-highlight)] border-l-2 border-[var(--foreground)]" : "border-l-2 border-transparent hover:bg-[var(--surface-highlight)]")}
                    >
                      <span className={`block text-sm font-medium font-sans ${item.active ? "text-[var(--foreground)]" : "text-[var(--muted)]"} transition-colors`}>
                        {item.name}
                      </span>
                      <span className="block text-[10px] mt-0.5 uppercase tracking-wider text-[var(--muted)] font-mono opacity-70 transition-colors">
                        {item.desc}
                      </span>
                    </div>
                  ))}
                </nav>
                <div className="border-t border-[var(--border)] p-4 mt-auto">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-full bg-[var(--surface-highlight)]" />
                    <span className="text-[9px] uppercase tracking-[0.15em] text-[var(--muted)] font-mono">v2.1</span>
                  </div>
                </div>
              </aside>

              {/* Main content */}
              <div className="flex-1 p-6 sm:p-8 bg-[var(--background)]">
                {/* Header */}
                <div className="mb-6">
                  <span className="text-[10px] uppercase tracking-[0.25em] mb-2 block text-[var(--muted)] font-mono">
                    Saturday, December the 20th
                  </span>
                  <p className="text-sm text-[var(--muted)]">Entry recorded · 6:42 PM</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                  {/* Left column */}
                  <div className="lg:w-[55%] space-y-6">
                    {/* Entry Card */}
                    <div className="rounded-xl border border-[var(--border)] p-6 bg-[var(--card-bg)]">
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-[var(--muted)] block">
                          Entry Content
                        </span>
                        <div className="text-xs px-3 py-1 rounded-full border border-[var(--border)] text-[var(--muted)] cursor-pointer transition hover:bg-[var(--surface-highlight)] select-none">
                          Edit
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed mb-4 text-[var(--foreground)]">
                        I keep replaying the conversation in my head. I know I prepared, but I still felt tense the entire time. Maybe I'm overthinking it, but I can't shake this feeling that I could have done better.
                      </p>
                      {/* AI Reflection */}
                      <div className="relative pl-4 border-l-2 mt-4" style={{ borderColor: '#6366f1' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[10px] uppercase tracking-[0.2em] font-mono" style={{ color: "#6366f1" }}>
                            Reflection
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed italic text-[var(--muted)] font-serif">
                          When you say "I still felt tense the entire time," what was your mind predicting would happen—and what evidence do you have for and against that prediction?
                        </p>
                      </div>
                    </div>
                    {/* Mood Card */}
                    <div className="rounded-xl border border-[var(--border)] p-6 bg-[var(--card-bg)]">
                      <div className="flex items-start justify-between mb-5 gap-2">
                        <div>
                          <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-[var(--muted)] block mb-1">
                            Emotional Analysis
                          </span>
                          <h2 className="text-lg font-serif text-[var(--foreground)]">Mood Dimensions</h2>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: '#F9C84615' }}>
                          <div className="w-2 h-2 rounded-full" style={{ background: '#F9C846' }} />
                          <span className="text-xs capitalize font-mono" style={{ color: "#F9C846" }}>
                            happiness
                          </span>
                        </div>
                      </div>
                      {/* Mood bars */}
                      <div className="space-y-3">
                        {[
                          { emotion: 'happiness', value: 0.68, color: '#F9C846' },
                          { emotion: 'calm', value: 0.52, color: '#14B8A6' },
                          { emotion: 'stress', value: 0.28, color: '#EF4444' },
                          { emotion: 'anxiety', value: 0.15, color: '#8B5CF6' },
                        ].map((item) => (
                          <div key={item.emotion} className="flex items-center gap-3">
                            <span className="text-xs w-20 capitalize text-[var(--muted)] font-mono">{item.emotion}</span>
                            <div className="flex-1 h-2 rounded-full overflow-hidden bg-[var(--surface-highlight)]">
                              <div className="h-full rounded-full" style={{
                                width: `${item.value * 100}%`,
                                background: item.color
                              }} />
                            </div>
                            <span className="text-xs w-10 text-right text-[var(--muted)] font-mono">
                              {Math.round(item.value * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-5 rounded-xl border border-[var(--border)] bg-[var(--card-bg)]">
                        <div className="text-left">
                          <span className="text-sm font-medium block mb-1 text-[var(--foreground)]">
                            Edit Entry
                          </span>
                          <span className="text-xs text-[var(--muted)]">Revise your reflection</span>
                        </div>
                        <svg className="w-5 h-5 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                        </svg>
                      </div>
                      <div className="flex items-center justify-between p-5 rounded-xl border border-[var(--border)] bg-[var(--card-bg)]">
                        <div className="text-left">
                          <span className="text-sm font-medium block mb-1 text-[var(--foreground)]">
                            View Insights
                          </span>
                          <span className="text-xs text-[var(--muted)]">Explore your patterns</span>
                        </div>
                        <svg className="w-5 h-5" style={{ color: "#6366f1" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {/* Right column - Radar Chart */}
                  <div className="lg:w-[50%] flex">
                    <div className="rounded-xl border border-[var(--border)] p-6 w-full flex flex-col bg-[var(--card-bg)]">
                      <div className="mb-5">
                        <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-[var(--muted)] block mb-1">
                          Psychological Model
                        </span>
                        <h2 className="text-lg font-serif text-[var(--foreground)]">Personality Profile</h2>
                      </div>
                      <div className="flex flex-col flex-1 items-start justify-start w-full h-full pt-2">
                        <svg viewBox="0 0 380 210" className="w-full max-w-[340px] aspect-[16/9]">
                          <defs>
                            <radialGradient id="radar-fill" cx="50%" cy="50%" r="65%">
                              <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.32" />
                              <stop offset="80%" stopColor="#6366f1" stopOpacity="0.15" />
                              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.07" />
                            </radialGradient>
                          </defs>
                          {/* Radar grid */}
                          <g fill="none" stroke="#e5e7eb" strokeWidth="1.25">
                            <path d="M190 22 L288 88 L251 192 L129 192 L92 88 Z" />
                            <path d="M190 52 L260 100 L234 172 L146 172 L120 100 Z" />
                            <path d="M190 82 L232 112 L216 152 L164 152 L148 112 Z" />
                            <path d="M190 112 L204 124 L198 132 L182 132 L176 124 Z" />
                            <line x1="190" y1="22" x2="190" y2="192" />
                            <line x1="288" y1="88" x2="92" y2="88" />
                            <line x1="251" y1="192" x2="120" y2="100" />
                            <line x1="129" y1="192" x2="260" y2="100" />
                            <line x1="92" y1="88" x2="288" y2="88" />
                          </g>
                          {/* Radar shape */}
                          <path
                            d="M190 46 L256 104 L222 170 L152 154 L132 104 Z"
                            fill="url(#radar-fill)"
                            stroke="#6366f1"
                            strokeWidth="2"
                            style={{ transition: "d 0.4s" }}
                          />
                          {/* Dots at each trait */}
                          <circle cx="190" cy="46" r="5" fill="#6366f1" opacity="0.9" />
                          <circle cx="256" cy="104" r="5" fill="#6366f1" opacity="0.9" />
                          <circle cx="222" cy="170" r="5" fill="#6366f1" opacity="0.9" />
                          <circle cx="152" cy="154" r="5" fill="#6366f1" opacity="0.9" />
                          <circle cx="132" cy="104" r="5" fill="#6366f1" opacity="0.9" />
                          {/* Trait labels (abbreviate if necessary to avoid cutoff) */}
                          <text x="190" y="18" textAnchor="middle" fontSize="13" fontFamily="var(--font-mono)" fill="#6366f1">Openness</text>
                          <text x="294" y="96" textAnchor="start" fontSize="13" fontFamily="var(--font-mono)" fill="#6366f1">Conscient.</text>
                          <text x="245" y="202" textAnchor="middle" fontSize="13" fontFamily="var(--font-mono)" fill="#6366f1">Extraversion</text>
                          <text x="135" y="202" textAnchor="middle" fontSize="13" fontFamily="var(--font-mono)" fill="#6366f1">Agreeabl.</text>
                          <text x="86" y="96" textAnchor="end" fontSize="13" fontFamily="var(--font-mono)" fill="#6366f1">Neurotic.</text>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid (Consistent + Readable) */}
        <section className="mt-20 w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s', gridAutoRows: 'minmax(0, 1fr)', alignItems: 'stretch' }}>
          {/* Card 1: Personality */}
          <div className="md:col-span-5 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 md:p-10 flex flex-col hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500 group animate-slide-in-up" style={{ borderWidth: '1px', minHeight: '100%', animationDelay: '0.1s' }}>
            <div className="flex-1 min-h-0 mb-6">
              <div className="rounded-2xl border p-4 overflow-hidden h-full flex flex-col bg-[var(--card-bg)] border-[var(--border)] shadow-sm">
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--muted)] font-mono">
                    Psychological Model
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--muted)] font-mono">
                    Big Five
                  </span>
                </div>
                <div className="w-full aspect-[16/9] flex-1">
                  <svg viewBox="0 0 360 210" className="w-full h-full">
                    <defs>
                      <radialGradient id="lp-radar-fill" cx="50%" cy="50%" r="65%">
                        <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.32" />
                        <stop offset="80%" stopColor="#6366f1" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.07" />
                      </radialGradient>
                    </defs>
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
                    <path
                      d="M180 46 L246 104 L212 170 L142 154 L122 104 Z"
                      fill="url(#lp-radar-fill)"
                      stroke="#6366f1"
                      strokeWidth="3"
                      style={{ filter: "drop-shadow(0 8px 32px rgba(32,44,74,0.05))" }}
                    />
                    <g fill="#fff" stroke="#6366f1" strokeWidth="1.5" opacity="0.95">
                      <circle cx="180" cy="46" r="3" />
                      <circle cx="246" cy="104" r="3" />
                      <circle cx="212" cy="170" r="3" />
                      <circle cx="142" cy="154" r="3" />
                      <circle cx="122" cy="104" r="3" />
                    </g>
                    <g fontFamily="Inter, sans-serif" fontSize="12" fontWeight="600" fill="#262e3e" opacity="0.84">
                      <text x="180" y="16" textAnchor="middle">Openness</text>
                      <text x="304" y="88" textAnchor="start">Extraversion</text>
                      <text x="252" y="206" textAnchor="middle">Agreeabl.</text>
                      <text x="108" y="206" textAnchor="middle">Neurotic.</text>
                      <text x="56" y="88" textAnchor="end">Conscient.</text>
                    </g>
                  </svg>
                </div>
              </div>
            </div>
            <div className="mt-auto flex-shrink-0" style={{ minHeight: '80px' }}>
              <h3 className="font-serif text-xl mb-1.5 text-[var(--foreground)]">Personality Analysis</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">Discover your unique traits and patterns through advanced AI analysis of your journal entries.</p>
            </div>
          </div>
          {/* Card 2: Mood Trends */}
          <div className="md:col-span-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 md:p-10 relative overflow-hidden flex flex-col hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500 group animate-slide-in-up" style={{ borderWidth: '1px', minHeight: '100%', animationDelay: '0.2s' }}>
            <div className="flex-1 min-h-0 mb-6">
              <div className="rounded-2xl border p-4 overflow-hidden h-full flex flex-col bg-[var(--card-bg)] border-[var(--border)] shadow-sm">
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--muted)] font-mono">
                    Moods
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--muted)] font-mono">
                    14 days
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 flex-1">
                  {[
                    { key: "happiness", color: "#F9C846" },
                    { key: "stress", color: "#EF4444" },
                    { key: "anxiety", color: "#8B5CF6" },
                    { key: "calm", color: "#14B8A6" },
                  ].map((emotion, index) => (
                    <div
                      key={emotion.key}
                      className="rounded-xl border border-[var(--border)] overflow-hidden bg-white/60"
                    >
                      <div className="p-3 pb-2">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-medium capitalize text-[var(--foreground)] font-serif">{emotion.key}</h4>
                          <div className="w-2 h-2 rounded-full" style={{ background: emotion.color }} />
                        </div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--muted)] font-mono">trend</p>
                      </div>
                      <div
                        className="relative h-[68px] w-full overflow-hidden border-t border-[var(--border)]"
                        style={{ background: `linear-gradient(180deg, ${emotion.color}0f 0%, rgba(249,250,251,0) 60%, rgba(249,250,251,1) 100%)` }}
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
            <div className="mt-auto flex-shrink-0" style={{ minHeight: '80px' }}>
              <h3 className="font-serif text-xl mb-1.5 text-[var(--foreground)]">Mood Trends</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">Track your emotional patterns over time.</p>
            </div>
          </div>
          {/* Card 3: Weekly Reports */}
          <div className="md:col-span-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 md:p-10 flex flex-col hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500 group animate-slide-in-up" style={{ borderWidth: '1px', minHeight: '100%', animationDelay: '0.3s' }}>
            <div className="flex-1 min-h-0 mb-6">
              <div className="rounded-2xl border p-4 overflow-hidden h-full flex flex-col bg-[var(--card-bg)] border-[var(--border)] shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--muted)] font-mono">
                    Weekly Report
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-[#22C55E] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22C55E" }} />
                    Ready
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-[0.15em] block text-[var(--muted)] font-mono">
                      Emotional mix
                    </span>
                    <div className="space-y-1.5">
                      {[
                        { emotion: "calm", value: 0.68, color: "#14B8A6" },
                        { emotion: "happiness", value: 0.52, color: "#F9C846" },
                        { emotion: "stress", value: 0.28, color: "#EF4444" },
                      ].map((item) => (
                        <div key={item.emotion} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                          <span className="text-[10px] capitalize flex-shrink-0 text-[var(--muted)] font-mono w-[60px]">{item.emotion}</span>
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-gray-200/60">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${item.value * 100}%`,
                                background: item.color
                              }}
                            />
                          </div>
                          <span className="text-[9px] text-right flex-shrink-0 text-[var(--muted)] font-mono w-7">
                            {Math.round(item.value * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-[0.15em] block text-[var(--muted)] font-mono">
                      Themes
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Work-life balance",
                        "Self-reflection",
                        "Energy pacing",
                      ].map((theme, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-3 py-1 rounded-full border border-[var(--border)] bg-white/70 text-[var(--foreground)]"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-auto flex-shrink-0" style={{ minHeight: '80px' }}>
              <h3 className="font-serif text-xl mb-1.5 text-[var(--foreground)]">Weekly Reports</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">Comprehensive insights delivered weekly.</p>
            </div>
          </div>
          {/* Card 4: Go Deeper with AI */}
          <div className="md:col-span-7 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 md:p-10 flex flex-col hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500 group animate-slide-in-up" style={{ borderWidth: '1px', minHeight: '100%', animationDelay: '0.4s' }}>
            <div className="flex-1 min-h-0 mb-6">
              <div className="rounded-2xl border p-4 overflow-hidden h-full flex flex-col bg-[var(--card-bg)] border-[var(--border)] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--muted)] font-mono">Entry</span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--muted)] font-mono">Today</span>
                </div>
                <div className="rounded-xl border border-[var(--border)] p-4 mb-4 bg-white/60">
                  <p className="text-sm leading-relaxed text-[var(--foreground)]">
                    "I keep replaying the conversation in my head. I know I prepared, but I still felt tense
                    the entire time…"
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] font-mono">312 words</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] font-mono">6:42 pm</span>
                  </div>
                </div>
                <div className="relative pl-4 border-l-2" style={{ borderColor: "#6366f1" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-mono" style={{ color: "#6366f1" }}>Reflection</span>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: "#6366f1", animationDelay: "0ms" }} />
                      <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: "#6366f1", animationDelay: "150ms" }} />
                      <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: "#6366f1", animationDelay: "300ms" }} />
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--foreground)]">
                    When you say "I still felt tense the entire time," what was your mind predicting would happen—
                    and what evidence do you have for and against that prediction?
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-auto flex-shrink-0" style={{ minHeight: '80px' }}>
              <h3 className="font-serif text-xl mb-1.5 text-[var(--foreground)]">Go Deeper with AI</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">AI that asks the right questions.</p>
            </div>
          </div>
          {/* Card 5: Privacy */}
          <div className="md:col-span-5 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 md:p-10 flex flex-col hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500 group animate-slide-in-up" style={{ borderWidth: '1px', minHeight: '100%', animationDelay: '0.5s' }}>
            <div className="flex-1 min-h-0 mb-6">
              <div className="rounded-2xl border p-6 overflow-hidden h-full flex flex-col bg-[var(--card-bg)] border-[var(--border)] shadow-sm">
                {/* Header: Shield + Title */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[var(--foreground)] flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                      <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-[var(--foreground)]">Security First</h4>
                    <p className="text-xs text-[var(--muted)]">Your data is protected by default</p>
                  </div>
                </div>

                {/* Feature List - Below header */}
                <div className="space-y-2.5 flex-1">
                  {[
                    "End-to-end encryption",
                    "No third-party data sharing",
                    "SOC 2 compliant infrastructure",
                    "You own your data, always",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#22C55E" className="w-4 h-4 flex-shrink-0">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-[var(--foreground)]">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Status Bar - Animated "Protected" indicator */}
                <div className="mt-5 pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
                      </span>
                      <span className="text-xs font-medium text-[#22C55E]">Protected</span>
                    </div>
                    {/* Encryption visual - animated bars */}
                    <div className="flex items-end gap-0.5 h-4">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-1 bg-[var(--border)] rounded-full"
                          style={{
                            height: `${40 + Math.sin(i * 1.2) * 30 + 30}%`,
                            animation: `pulse 1.5s ease-in-out ${i * 0.15}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-auto flex-shrink-0" style={{ minHeight: '80px' }}>
              <h3 className="font-serif text-xl mb-1.5 text-[var(--foreground)]">Privacy by Design</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">Your journal is encrypted and never used for training.</p>
            </div>
          </div>
        </section>

        {/* CTA Card Consistent with App */}
        <section className="mt-20 w-full max-w-[1200px] mx-auto pb-20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
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
                {/* Features List, cohesive with UI */}
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
                    <button className="w-full md:w-auto bg-[var(--accent)] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
                      Get Started
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/me/today" className="block w-full md:w-auto text-center bg-[var(--accent)] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
                    Go to Dashboard
                  </Link>
                </SignedIn>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
