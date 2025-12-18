"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@clerk/nextjs';
import Link from 'next/link';

// Emotion colors
const EMOTION_COLORS = {
    happiness: '#F9C846',
    stress: '#EF4444',
    sadness: '#3B82F6',
    anxiety: '#8B5CF6',
    excitement: '#EC4899',
    calm: '#14B8A6',
    anger: '#F97316',
    hopefulness: '#22C55E',
};

export default function WeeklyReportPage() {
    const params = useParams();
    const router = useRouter();
    const { session } = useSession();
    const [isVisible, setIsVisible] = useState(false);
    const [report, setReport] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch report data
    useEffect(() => {
        if (!session) return;
        let isMounted = true;

        async function fetchReport() {
            setIsLoading(true);
            try {
                const token = await session.getToken(); const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-weekly-report`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            timezone: userTimezone
                        })
                    }
                );

                const data = await response.json();

                if (isMounted) {
                    if (data.ready) {
                        setReport(data);
                    } else {
                        setError('Report is not ready yet');
                    }
                    setIsLoading(false);
                    setIsVisible(true);
                }
            } catch (err) {
                console.error('Error fetching report:', err);
                if (isMounted) {
                    setError(err.message);
                    setIsLoading(false);
                    setIsVisible(true);
                }
            }
        }

        fetchReport();

        return () => {
            isMounted = false;
        };
    }, [session]);

    // Calculate trend based on emotion scores
    const getTrend = (emotionScores) => {
        if (!emotionScores) return 'stable';
        const positiveEmotions = (emotionScores.happiness || 0) + (emotionScores.calm || 0) + (emotionScores.hopefulness || 0) + (emotionScores.excitement || 0);
        const negativeEmotions = (emotionScores.stress || 0) + (emotionScores.sadness || 0) + (emotionScores.anxiety || 0) + (emotionScores.anger || 0);
        if (positiveEmotions > negativeEmotions + 0.3) return 'improving';
        if (negativeEmotions > positiveEmotions + 0.3) return 'declining';
        return 'stable';
    };

    // Get dominant and secondary emotions
    const getDominantEmotions = (emotionScores) => {
        if (!emotionScores) return { dominant: 'calm', dominantScore: 0.5, secondary: 'hopefulness', secondaryScore: 0.4 };
        const sorted = Object.entries(emotionScores).sort((a, b) => b[1] - a[1]);
        return {
            dominant: sorted[0]?.[0] || 'calm',
            dominantScore: sorted[0]?.[1] || 0.5,
            secondary: sorted[1]?.[0] || 'hopefulness',
            secondaryScore: sorted[1]?.[1] || 0.4,
        };
    };

    // Format week label
    const getWeekLabel = () => {
        if (!report?.week_start || !report?.week_end) return '';
        const start = new Date(report.week_start);
        const end = new Date(report.week_end);
        return `${start.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} – ${end.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen py-10" style={{ background: 'var(--background)' }}>
                <div className="w-full px-6 md:px-16 lg:px-32 max-w-5xl mx-auto">
                    <div className="animate-pulse space-y-8">
                        <div className="h-4 w-24 bg-gray-200/50 rounded" />
                        <div className="h-8 w-64 bg-gray-200/50 rounded" />
                        <div className="h-64 bg-gray-200/30 rounded-xl" />
                        <div className="h-48 bg-gray-200/30 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="min-h-screen py-10" style={{ background: 'var(--background)' }}>
                <div className="w-full px-6 md:px-16 lg:px-32 max-w-5xl mx-auto">
                    <Link
                        href="/insights"
                        className="inline-flex items-center gap-2 text-sm mb-8"
                        style={{ color: 'var(--muted)' }}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back to Insights
                    </Link>
                    <div className="text-center py-16">
                        <p style={{ color: 'var(--muted)' }}>{error || 'Report not available'}</p>
                    </div>
                </div>
            </div>
        );
    }

    const { dominant, dominantScore, secondary, secondaryScore } = getDominantEmotions(report.emotion_scores);
    const trend = getTrend(report.emotion_scores);
    const trendIcon = trend === 'improving' ? '↑' : trend === 'declining' ? '↓' : '→';
    const trendColor = trend === 'improving' ? '#22C55E' : trend === 'declining' ? '#EF4444' : 'var(--muted)';

    return (
        <div
            className={`min-h-screen py-10 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ background: 'var(--background)' }}
        >
            <div className="w-full px-6 md:px-16 lg:px-32 max-w-5xl mx-auto">
                {/* Back link */}
                <Link
                    href="/insights"
                    className="inline-flex items-center gap-2 text-sm mb-8 transition-colors animate-fade-in-up"
                    style={{ color: 'var(--muted)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--foreground)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Back to Insights
                </Link>

                {/* Header */}
                <header className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
                    <span
                        className="text-[10px] uppercase tracking-[0.25em] mb-3 block"
                        style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                    >
                        Weekly Synthesis
                    </span>
                    <h1
                        className="text-3xl md:text-4xl mb-3"
                        style={{ fontFamily: 'var(--font-serif)', color: 'var(--foreground)' }}
                    >
                        Your Weekly Report
                    </h1>
                    <p
                        className="text-sm leading-relaxed max-w-2xl"
                        style={{ color: 'var(--muted)' }}
                    >
                        {getWeekLabel()}
                    </p>
                </header>

                {/* Mood Summary Section */}
                <section className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div
                        className="rounded-xl border p-6"
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <span
                                    className="text-[9px] uppercase tracking-[0.2em] block mb-2"
                                    style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                                >
                                    Mood Summary
                                </span>
                                <h2
                                    className="text-xl"
                                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--foreground)' }}
                                >
                                    Emotional Landscape
                                </h2>
                            </div>
                            <div
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                                style={{ background: `${trendColor}15` }}
                            >
                                <span style={{ color: trendColor, fontFamily: 'var(--font-mono)' }}>{trendIcon}</span>
                                <span
                                    className="text-xs capitalize"
                                    style={{ color: trendColor, fontFamily: 'var(--font-mono)' }}
                                >
                                    {trend}
                                </span>
                            </div>
                        </div>

                        {/* Dominant emotions */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div
                                className="rounded-lg p-4 border"
                                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                            >
                                <span
                                    className="text-[9px] uppercase tracking-[0.15em] block mb-1"
                                    style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                                >
                                    Dominant
                                </span>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ background: EMOTION_COLORS[dominant] }}
                                    />
                                    <span
                                        className="text-lg capitalize"
                                        style={{ fontFamily: 'var(--font-serif)', color: 'var(--foreground)' }}
                                    >
                                        {dominant}
                                    </span>
                                    <span
                                        className="text-sm ml-auto"
                                        style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                                    >
                                        {Math.round(dominantScore * 100)}%
                                    </span>
                                </div>
                            </div>
                            <div
                                className="rounded-lg p-4 border"
                                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                            >
                                <span
                                    className="text-[9px] uppercase tracking-[0.15em] block mb-1"
                                    style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                                >
                                    Secondary
                                </span>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ background: EMOTION_COLORS[secondary] }}
                                    />
                                    <span
                                        className="text-lg capitalize"
                                        style={{ fontFamily: 'var(--font-serif)', color: 'var(--foreground)' }}
                                    >
                                        {secondary}
                                    </span>
                                    <span
                                        className="text-sm ml-auto"
                                        style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                                    >
                                        {Math.round(secondaryScore * 100)}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Emotion bars */}
                        <div className="space-y-3">
                            {Object.entries(report.emotion_scores || {})
                                .sort((a, b) => b[1] - a[1])
                                .map(([emotion, value]) => (
                                    <div key={emotion} className="flex items-center gap-3">
                                        <span
                                            className="text-xs w-20 capitalize"
                                            style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                                        >
                                            {emotion}
                                        </span>
                                        <div
                                            className="flex-1 h-2 rounded-full overflow-hidden"
                                            style={{ background: 'var(--surface-highlight)' }}
                                        >
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${value * 100}%`,
                                                    background: EMOTION_COLORS[emotion]
                                                }}
                                            />
                                        </div>
                                        <span
                                            className="text-xs w-10 text-right"
                                            style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                                        >
                                            {Math.round(value * 100)}%
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </section>

                {/* Weekly Themes Section */}
                <section className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                    <span
                        className="text-[9px] uppercase tracking-[0.2em] block mb-3"
                        style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                    >
                        Pattern Recognition
                    </span>
                    <h2
                        className="text-xl mb-6"
                        style={{ fontFamily: 'var(--font-serif)', color: 'var(--foreground)' }}
                    >
                        Weekly Themes
                    </h2>

                    <div className="space-y-3">
                        {(report.themes || []).map((theme, index) => (
                            <div
                                key={index}
                                className="rounded-xl border p-5 transition-all duration-200"
                                style={{
                                    background: 'var(--card-bg)',
                                    borderColor: 'var(--border)',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--muted)'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                            >
                                <p
                                    className="text-sm leading-relaxed"
                                    style={{ color: 'var(--foreground)' }}
                                >
                                    {theme}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Recommendations Section */}
                <section className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <span
                        className="text-[9px] uppercase tracking-[0.2em] block mb-3"
                        style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                    >
                        Recommendations
                    </span>
                    <h2
                        className="text-xl mb-6"
                        style={{ fontFamily: 'var(--font-serif)', color: 'var(--foreground)' }}
                    >
                        Suggestions for Next Week
                    </h2>

                    <div className="grid gap-4 md:grid-cols-3">
                        {report.recommendations && (
                            <>
                                <div
                                    className="rounded-xl border p-5"
                                    style={{
                                        background: 'var(--card-bg)',
                                        borderColor: 'var(--border)',
                                        borderTop: '3px solid #22C55E'
                                    }}
                                >
                                    <span
                                        className="text-[9px] uppercase tracking-[0.15em] block mb-2"
                                        style={{ color: '#22C55E', fontFamily: 'var(--font-mono)' }}
                                    >
                                        Continue
                                    </span>
                                    <p
                                        className="text-sm leading-relaxed"
                                        style={{ color: 'var(--foreground)' }}
                                    >
                                        {report.recommendations.continue}
                                    </p>
                                </div>
                                <div
                                    className="rounded-xl border p-5"
                                    style={{
                                        background: 'var(--card-bg)',
                                        borderColor: 'var(--border)',
                                        borderTop: '3px solid #6366F1'
                                    }}
                                >
                                    <span
                                        className="text-[9px] uppercase tracking-[0.15em] block mb-2"
                                        style={{ color: '#6366F1', fontFamily: 'var(--font-mono)' }}
                                    >
                                        Explore
                                    </span>
                                    <p
                                        className="text-sm leading-relaxed"
                                        style={{ color: 'var(--foreground)' }}
                                    >
                                        {report.recommendations.explore}
                                    </p>
                                </div>
                                <div
                                    className="rounded-xl border p-5"
                                    style={{
                                        background: 'var(--card-bg)',
                                        borderColor: 'var(--border)',
                                        borderTop: '3px solid #F59E0B'
                                    }}
                                >
                                    <span
                                        className="text-[9px] uppercase tracking-[0.15em] block mb-2"
                                        style={{ color: '#F59E0B', fontFamily: 'var(--font-mono)' }}
                                    >
                                        Consider
                                    </span>
                                    <p
                                        className="text-sm leading-relaxed"
                                        style={{ color: 'var(--foreground)' }}
                                    >
                                        {report.recommendations.consider}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* Highlights & Lowlights Section */}
                <section className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                    <div className="grid gap-8 md:grid-cols-2">
                        {/* Highlights */}
                        <div>
                            <span
                                className="text-[9px] uppercase tracking-[0.2em] block mb-3"
                                style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                            >
                                Noteworthy Moments
                            </span>
                            <h2
                                className="text-xl mb-6"
                                style={{ fontFamily: 'var(--font-serif)', color: 'var(--foreground)' }}
                            >
                                Highlights
                            </h2>

                            <div className="space-y-4">
                                {(report.highlights || []).map((highlight, index) => (
                                    <div
                                        key={index}
                                        className="relative pl-4 border-l-2"
                                        style={{ borderColor: '#22C55E' }}
                                    >
                                        <p
                                            className="text-sm leading-relaxed"
                                            style={{ color: 'var(--foreground)', fontStyle: 'italic' }}
                                        >
                                            {highlight}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Lowlights */}
                        <div>
                            <span
                                className="text-[9px] uppercase tracking-[0.2em] block mb-3"
                                style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                            >
                                Areas of Friction
                            </span>
                            <h2
                                className="text-xl mb-6"
                                style={{ fontFamily: 'var(--font-serif)', color: 'var(--foreground)' }}
                            >
                                Lowlights
                            </h2>

                            <div className="space-y-4">
                                {(report.lowlights || []).map((lowlight, index) => (
                                    <div
                                        key={index}
                                        className="relative pl-4 border-l-2"
                                        style={{ borderColor: '#EF4444' }}
                                    >
                                        <p
                                            className="text-sm leading-relaxed"
                                            style={{ color: 'var(--foreground)', fontStyle: 'italic' }}
                                        >
                                            {lowlight}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer
                    className="pt-8 border-t text-center animate-fade-in-up"
                    style={{ borderColor: 'var(--border)', animationDelay: '0.3s' }}
                >
                    <p
                        className="text-xs mb-4"
                        style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                    >
                        Report generated {report.created_at ? new Date(report.created_at).toLocaleDateString(undefined, {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        }) : 'recently'}
                    </p>
                    <Link
                        href="/today"
                        className="inline-flex items-center gap-2 text-sm px-6 py-2.5 rounded-full transition-all"
                        style={{
                            background: 'var(--foreground)',
                            color: 'var(--surface)'
                        }}
                    >
                        Continue journaling
                    </Link>
                </footer>
            </div>
        </div>
    );
}
