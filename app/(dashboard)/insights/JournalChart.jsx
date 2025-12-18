"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis
} from 'recharts';
import { useSession } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

const EMOTIONS = [
    { key: 'happiness', color: '#F9C846' },   // warm ochre
    { key: 'stress', color: '#EF4444' },      // soft red
    { key: 'sadness', color: '#3B82F6' },     // blue
    { key: 'anxiety', color: '#8B5CF6' },     // violet
    { key: 'excitement', color: '#EC4899' },  // pink
    { key: 'calm', color: '#14B8A6' },        // teal
    { key: 'anger', color: '#F97316' },       // amber
    { key: 'hopefulness', color: '#22C55E' }, // green
];

// Big 5 Personality Traits
const BIG5_TRAITS = [
    { subject: 'Openness', fullMark: 100 },
    { subject: 'Conscientiousness', fullMark: 100 },
    { subject: 'Extraversion', fullMark: 100 },
    { subject: 'Agreeableness', fullMark: 100 },
    { subject: 'Neuroticism', fullMark: 100 },
];

// Calculate average personality scores from entries
function calculatePersonalityScores(entries) {
    if (!entries || entries.length === 0) {
        // Return default values if no entries
        return [
            { subject: 'Openness', A: 50, fullMark: 100 },
            { subject: 'Conscientiousness', A: 50, fullMark: 100 },
            { subject: 'Extraversion', A: 50, fullMark: 100 },
            { subject: 'Agreeableness', A: 50, fullMark: 100 },
            { subject: 'Neuroticism', A: 50, fullMark: 100 },
        ];
    }

    // Filter entries that have personality_scores
    const entriesWithPersonality = entries.filter(entry => entry.personality_scores);

    if (entriesWithPersonality.length === 0) {
        // Return default values if no personality scores
        return [
            { subject: 'Openness', A: 50, fullMark: 100 },
            { subject: 'Conscientiousness', A: 50, fullMark: 100 },
            { subject: 'Extraversion', A: 50, fullMark: 100 },
            { subject: 'Agreeableness', A: 50, fullMark: 100 },
            { subject: 'Neuroticism', A: 50, fullMark: 100 },
        ];
    }

    // Calculate averages
    const sums = {
        openness: 0,
        conscientiousness: 0,
        extraversion: 0,
        agreeableness: 0,
        neuroticism: 0,
    };

    entriesWithPersonality.forEach(entry => {
        const scores = entry.personality_scores;
        if (scores) {
            sums.openness += scores.openness || 0;
            sums.conscientiousness += scores.conscientiousness || 0;
            sums.extraversion += scores.extraversion || 0;
            sums.agreeableness += scores.agreeableness || 0;
            sums.neuroticism += scores.neuroticism || 0;
        }
    });

    const count = entriesWithPersonality.length;

    return [
        { subject: 'Openness', A: Math.round((sums.openness / count)), fullMark: 100 },
        { subject: 'Conscientiousness', A: Math.round((sums.conscientiousness / count)), fullMark: 100 },
        { subject: 'Extraversion', A: Math.round((sums.extraversion / count)), fullMark: 100 },
        { subject: 'Agreeableness', A: Math.round((sums.agreeableness / count)), fullMark: 100 },
        { subject: 'Neuroticism', A: Math.round((sums.neuroticism / count)), fullMark: 100 },
    ];
}

// Utility to get Monday of the week for a given date
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

// Utility to get Sunday of the week for a given date
function getWeekEnd(date) {
    const weekStart = getWeekStart(date);
    const sunday = new Date(weekStart);
    sunday.setDate(sunday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return sunday;
}

// Get current week's Sunday
function getCurrentSunday() {
    const now = new Date();
    const currentSunday = new Date(now);
    currentSunday.setDate(currentSunday.getDate() - currentSunday.getDay()); // Get this Sunday
    currentSunday.setHours(23, 59, 59, 999);
    return currentSunday;
}

// Get next Sunday
function getNextSunday() {
    const currentSunday = getCurrentSunday();
    const nextSunday = new Date(currentSunday);
    nextSunday.setDate(nextSunday.getDate() + 7);
    return nextSunday;
}

// Generate a report for a given week
function generateReportForWeek(weekStart, weekEnd, weekEntries, reportId) {
    if (weekEntries.length === 0) return null;

    // Calculate average emotions for the week
    const avgEmotions = {};
    const emotionKeys = ['happiness', 'stress', 'sadness', 'anxiety', 'excitement', 'calm', 'anger', 'hopefulness'];

    emotionKeys.forEach(emotion => {
        const sum = weekEntries.reduce((acc, entry) => acc + (entry.emotions?.[emotion] || 0), 0);
        avgEmotions[emotion] = sum / weekEntries.length;
    });

    // Find dominant emotion
    const dominantEmotion = Object.entries(avgEmotions).reduce((a, b) =>
        avgEmotions[a[0]] > avgEmotions[b[0]] ? a : b
    )[0];

    // Generate report text
    const entryCount = weekEntries.length;
    const dominantValue = avgEmotions[dominantEmotion];
    const avgIntensity = Object.values(avgEmotions).reduce((a, b) => a + b, 0) / emotionKeys.length;

    // Capitalize first letter of emotion
    const dominantEmotionFormatted = dominantEmotion.charAt(0).toUpperCase() + dominantEmotion.slice(1);

    const reportText = `This week you wrote ${entryCount} ${entryCount === 1 ? 'entry' : 'entries'}. Your emotional landscape was marked by ${dominantEmotionFormatted.toLowerCase()} (${(dominantValue * 100).toFixed(0)}%), with an average emotional intensity of ${(avgIntensity * 100).toFixed(0)}% across all measured dimensions.`;

    return {
        id: reportId,
        date: weekEnd,
        weekStart: weekStart,
        entryCount: entryCount,
        report: reportText,
        avgEmotions: avgEmotions
    };
}

// Generate weekly reports for each Sunday
function generateWeeklyReports(entries) {
    if (!entries || entries.length === 0) return { current: null, previous: [] };

    const now = new Date();
    const currentSunday = getCurrentSunday();
    const currentWeekStart = getWeekStart(currentSunday);
    const currentWeekEnd = getWeekEnd(currentSunday);

    // Check current week
    const currentWeekEntries = entries.filter(entry => {
        const entryDate = new Date(entry.created_at);
        return entryDate >= currentWeekStart && entryDate <= currentWeekEnd;
    });

    const currentReport = currentWeekEntries.length > 0
        ? generateReportForWeek(currentWeekStart, currentWeekEnd, currentWeekEntries, 'current')
        : null;

    // Get previous reports (excluding current week)
    const previousReports = [];
    const twelveWeeksAgo = new Date(now);
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84); // 12 weeks

    let sunday = new Date(currentSunday);
    sunday.setDate(sunday.getDate() - 7); // Start from previous Sunday

    let index = 0;
    while (sunday >= twelveWeeksAgo) {
        const weekStart = getWeekStart(sunday);
        const weekEnd = getWeekEnd(sunday);

        const weekEntries = entries.filter(entry => {
            const entryDate = new Date(entry.created_at);
            return entryDate >= weekStart && entryDate <= weekEnd;
        });

        if (weekEntries.length > 0) {
            const report = generateReportForWeek(weekStart, weekEnd, weekEntries, index);
            if (report) {
                previousReports.push(report);
            }
        }

        sunday.setDate(sunday.getDate() - 7);
        index++;
    }

    return {
        current: currentReport,
        previous: previousReports.reverse() // Most recent first
    };
}

export default function JournalChart({ data, view, effectiveView, onViewChange, needsMoreMessage = null, entries = [], allEntries = [], weeklyReport = null, weeklyReportLoading = false }) {
    // No reports open by default - REPLACED
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [error, setError] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [previousReports, setPreviousReports] = useState([]);
    const [isLoadingReports, setIsLoadingReports] = useState(true);
    const { session } = useSession();
    const weeklyReports = generateWeeklyReports(entries);
    const big5Data = calculatePersonalityScores(allEntries);

    function createClerkSupabaseClient() {
        return createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_KEY,
            {
                async accessToken() {
                    return session?.getToken() ?? null
                }
            }
        )
    }

    // Fetch previous reports from Supabase
    useEffect(() => {
        if (!session) return;
        let isMounted = true;

        async function fetchPreviousReports() {
            setIsLoadingReports(true);
            try {
                const client = createClerkSupabaseClient();
                const { data: reports, error } = await client
                    .from('weekly_reports')
                    .select('*')
                    .order('week_start', { ascending: false })
                    .limit(10); // Limit to most recent 10 reports

                console.log("Previous Reports:", reports);

                if (error) {
                    console.error('Error fetching reports:', error);
                } else if (isMounted) {
                    setPreviousReports(reports || []);
                }
            } catch (err) {
                console.error('Unexpected error fetching reports:', err);
            } finally {
                if (isMounted) {
                    setIsLoadingReports(false);
                }
            }
        }
        console.log("fetching previous reports");
        fetchPreviousReports();

        return () => {
            isMounted = false;
        };
    }, [session]);

    // Fetch report data
    useEffect(() => {
        if (!session) return;
        let isMounted = true;

        async function fetchReport() {
            setIsLoading(true);
            try {
                const token = await session.getToken();
                const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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

                // Console log the full weekly report
                console.log('Full weekly report from generate-weekly-report:', data);

                if (isMounted) {
                    // Update state with the fetched report data regardless of whether it is ready
                    setReport(data);

                    // Only set error if there's an actual error in the response, not just ready: false
                    if (data.error) {
                        setError(data.error);
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

    // Determine the active report object (prioritize fetched state over prop)
    const activeReport = report || weeklyReport;

    // Calculate days until ready from active report or fallback
    const daysUntilReady = activeReport?.daysUntilReady || 0;

    // Calculate the ready date based on daysUntilReady
    const readyDate = new Date();
    readyDate.setDate(readyDate.getDate() + daysUntilReady);

    // Determine current report status
    let currentReportStatus = 'waiting';
    if (isLoading || weeklyReportLoading) {
        currentReportStatus = 'loading';
    } else if (activeReport?.ready) {
        currentReportStatus = 'ready';
    } else {
        // If we have an active report object with ready: false, it's waiting
        // If we have no report object at all, it's also waiting (or could be 'none')
        currentReportStatus = 'waiting';
    }
    const hasSinglePoint = needsMoreMessage !== null;
    // Use effectiveView for formatting (may be different from selected view if we fell back to more detailed)
    const displayView = effectiveView || view;

    // Format date for XAxis based on effective view
    const formatXAxis = (tickItem) => {
        // tickItem is a timestamp (number), convert to Date
        const date = new Date(tickItem);
        if (displayView === 'week') {
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        } else if (displayView === 'month') {
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        } else {
            return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
        }
    };

    // Format tooltip label based on effective view
    const formatTooltipLabel = (label) => {
        // Label is a timestamp, convert to Date
        const date = new Date(label);
        if (displayView === 'week') {
            return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        } else if (displayView === 'month') {
            return `Week of ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
        } else {
            return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        }
    };

    // Prepare chart data - convert date to timestamp and keep all emotions
    const chartData = (data || []).map(item => {
        const result = {
            date: item.date.getTime(),
        };
        // Copy all emotion properties
        EMOTIONS.forEach(emotion => {
            result[emotion.key] = item[emotion.key] || 0;
        });
        return result;
    });

    return (
        <div className="w-full">
            {/* Header */}
            <div className="mb-10 animate-fade-in-up">
                <span
                    className="text-[10px] uppercase tracking-[0.25em] mb-2 block"
                    style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                >
                    Analysis
                </span>
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1
                            className="text-3xl mb-2"
                            style={{ fontFamily: 'var(--font-serif)', color: 'var(--foreground)' }}
                        >
                            Emotional Patterns
                        </h1>
                        <p
                            className="text-sm leading-relaxed max-w-xl"
                            style={{ color: 'var(--muted)' }}
                        >
                            AI-derived insights from {data?.length || 0} journal entr{(data?.length === 1) ? 'y' : 'ies'}.
                            Patterns emerge as your dataset grows.
                        </p>
                    </div>
                    <div
                        className="flex space-x-1 rounded-lg border p-1"
                        style={{
                            borderColor: "var(--border)",
                            background: "var(--card-bg)",
                        }}
                    >
                        {['week', 'month', 'all'].map((range) => (
                            <button
                                key={range}
                                onClick={() => onViewChange(range)}
                                className="px-4 py-1.5 text-xs font-medium rounded-md transition-all uppercase tracking-wider"
                                style={view === range ? {
                                    background: "var(--foreground)",
                                    color: "var(--surface)",
                                    fontFamily: "var(--font-mono)",
                                } : {
                                    color: "var(--muted)",
                                    background: "transparent",
                                    fontFamily: "var(--font-mono)",
                                }}
                                onMouseEnter={(e) => {
                                    if (view !== range) {
                                        e.currentTarget.style.background = "var(--surface-highlight)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (view !== range) {
                                        e.currentTarget.style.background = "transparent";
                                    }
                                }}
                            >
                                {range === 'all' ? 'All Time' : range.charAt(0).toUpperCase() + range.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {EMOTIONS.map((emotion, index) => (
                    <div
                        key={emotion.key}
                        className="rounded-xl border backdrop-blur-sm animate-fade-in-up overflow-hidden"
                        style={{
                            background: "var(--card-bg)",
                            borderColor: "var(--border)",
                            boxShadow: "var(--shadow)",
                            animationDelay: `${0.1 + index * 0.05}s`,
                        }}
                    >
                        <div className="p-4 pb-2">
                            <div className="flex items-center justify-between mb-1">
                                <h3
                                    className="text-sm font-medium"
                                    style={{ color: "var(--foreground)", fontFamily: "var(--font-serif)" }}
                                >
                                    {emotion.key.charAt(0).toUpperCase() + emotion.key.slice(1)}
                                </h3>
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ background: emotion.color }}
                                />
                            </div>
                            <p
                                className="text-[9px] uppercase tracking-[0.2em]"
                                style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
                            >
                                trend
                            </p>
                        </div>
                        <div className="relative h-[180px] w-full overflow-hidden border-t bg-gradient-to-b from-white via-white to-gray-50/50" style={{ borderColor: 'var(--border)' }}>
                            {hasSinglePoint && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
                                >
                                    <div
                                        className="text-center px-4 py-3 rounded-lg backdrop-blur-sm"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.9)',
                                            border: '1px solid var(--border)',
                                        }}
                                    >
                                        <p
                                            className="text-xs leading-tight"
                                            style={{
                                                color: "var(--muted)",
                                                fontFamily: "var(--font-sans)"
                                            }}
                                        >
                                            {needsMoreMessage}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {!hasSinglePoint && (
                                <>
                                    <div
                                        className="pointer-events-none absolute inset-0 opacity-60"
                                        style={{
                                            background: `linear-gradient(180deg, ${emotion.color}0f 0%, rgba(249,250,251,0) 60%, rgba(249,250,251,1) 100%)`,
                                        }}
                                    />
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={chartData}
                                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                                        >
                                            <defs>
                                                <linearGradient id={`area-${emotion.key}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={emotion.color} stopOpacity={0.32} />
                                                    <stop offset="85%" stopColor={emotion.color} stopOpacity={0.05} />
                                                    <stop offset="100%" stopColor={emotion.color} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#edf0f4" />
                                            <XAxis
                                                dataKey="date"
                                                type="number"
                                                scale="time"
                                                domain={['dataMin', 'dataMax']}
                                                tickFormatter={formatXAxis}
                                                stroke="#cdd3dd"
                                                tick={{ fontSize: 10 }}
                                                hide
                                            />
                                            <YAxis
                                                domain={[0, 1]}
                                                stroke="#cdd3dd"
                                                tick={{ fontSize: 10 }}
                                                width={30}
                                                hide
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fdfdfd',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e5e7eb',
                                                    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
                                                    fontSize: '12px'
                                                }}
                                                labelFormatter={formatTooltipLabel}
                                                formatter={(value) => [`${(value * 100).toFixed(0)}%`, '']}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey={emotion.key}
                                                stroke="none"
                                                fill={`url(#area-${emotion.key})`}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey={emotion.key}
                                                stroke={emotion.color}
                                                strokeWidth={2.2}
                                                dot={{ r: 0 }}
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-xl border p-6 animate-fade-in-up" style={{
                    background: "var(--card-bg)",
                    borderColor: "var(--border)",
                    boxShadow: "var(--shadow)",
                    animationDelay: "0.2s",
                }}>
                    <span
                        className="text-[9px] uppercase tracking-[0.2em] block mb-2"
                        style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                    >
                        Psychological Model
                    </span>
                    <h3
                        className="text-xl mb-1"
                        style={{ color: "var(--foreground)", fontFamily: "var(--font-serif)" }}
                    >
                        Personality Profile
                    </h3>
                    <p className="mb-6 text-xs" style={{ color: "var(--muted)" }}>
                        Big Five traits derived from linguistic patterns in your entries
                    </p>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart
                                data={big5Data}
                                outerRadius="85%"
                                style={{
                                    filter: 'drop-shadow(0 8px 32px rgba(32,44,74,0.05))',
                                }}
                            >
                                <defs>
                                    <radialGradient id="radar-fill" cx="50%" cy="50%" r="65%">
                                        <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.32" />
                                        <stop offset="80%" stopColor="#6366f1" stopOpacity="0.15" />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.07" />
                                    </radialGradient>
                                </defs>
                                <PolarGrid
                                    stroke="#e5e7eb"
                                    strokeWidth={1.25}
                                    radialLines={true}
                                />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    tick={{
                                        fontSize: 13,
                                        fill: '#262e3e',
                                        fontWeight: 600,
                                        fontFamily: 'Inter, sans-serif',
                                        opacity: 0.84,
                                    }}
                                    tickLine={false}
                                />
                                <PolarRadiusAxis
                                    angle={90}
                                    domain={[0, 100]}
                                    tick={{
                                        fontSize: 11,
                                        fill: '#a1a8b8',
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 500,
                                        opacity: 0.68,
                                    }}
                                    axisLine={false}
                                    tickCount={5}
                                    tickFormatter={(value) => value === 0 ? '' : `${value}`}
                                    stroke="#fff"
                                    tickMargin={6}
                                />
                                <Radar
                                    name="Big Five"
                                    dataKey="A"
                                    stroke="#6366f1"
                                    fill="url(#radar-fill)"
                                    fillOpacity={1}
                                    strokeWidth={3}
                                    activeDot={{ fill: "#6366f1", r: 4.5, strokeWidth: 0 }}
                                    dot={{ fill: "#fff", r: 2.5, stroke: '#6366f1', strokeWidth: 1.5, opacity: 0.95 }}
                                    isAnimationActive={true}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'linear-gradient(110deg, #f8fafc 60%, #e0e7ff 100%)',
                                        borderRadius: '10px',
                                        border: '1px solid #e0e7ef',
                                        boxShadow: '0 8px 32px rgba(41,65,137,0.07)',
                                        fontSize: '13px',
                                        fontFamily: 'Inter,sans-serif',
                                        minWidth: 90,
                                        color: '#262e3e',
                                        padding: '10px 15px',
                                        letterSpacing: 0.1,
                                    }}
                                    labelStyle={{
                                        fontWeight: 700,
                                        color: "#6366f1",
                                        fontSize: 13,
                                        marginBottom: 4,
                                        fontFamily: 'Inter,sans-serif',
                                    }}
                                    formatter={(value, name, props) => [`${value}%`, `${props.payload.subject}`]}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="rounded-xl border p-6 animate-fade-in-up" style={{
                    background: "var(--card-bg)",
                    borderColor: "var(--border)",
                    boxShadow: "var(--shadow)",
                    animationDelay: "0.25s",
                }}>
                    <div className="mb-4">
                        <span
                            className="text-[9px] uppercase tracking-[0.2em] block mb-2"
                            style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                        >
                            Synthesis
                        </span>
                        <div className="flex items-center justify-between">
                            <h3
                                className="text-xl"
                                style={{ color: "var(--foreground)", fontFamily: "var(--font-serif)" }}
                            >
                                Weekly Reports
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Current Report Panel */}
                        <div className="rounded-xl border overflow-hidden" style={{
                            borderColor: "var(--border)",
                            background: "var(--card-bg)",
                            boxShadow: "var(--shadow)"
                        }}>
                            {currentReportStatus === 'loading' ? (
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="relative flex-shrink-0">
                                            <div
                                                className="relative rounded-lg p-3 border animate-pulse"
                                                style={{
                                                    borderColor: "var(--border)",
                                                    background: "var(--card-bg)",
                                                }}
                                            >
                                                <ClockIcon className="w-6 h-6" style={{ color: "#94A3B8" }} />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="h-4 w-48 rounded bg-gray-200/50 mb-2 animate-pulse" />
                                            <div className="h-3 w-32 rounded bg-gray-200/30 animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            ) : currentReportStatus === 'ready' && activeReport ? (
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="relative flex-shrink-0">
                                            <div
                                                className="absolute inset-0 rounded-lg blur-xl opacity-20"
                                                style={{ background: "#22C55E" }}
                                            />
                                            <div
                                                className="relative rounded-lg p-3 border"
                                                style={{
                                                    borderColor: "var(--border)",
                                                    background: "var(--card-bg)",
                                                }}
                                            >
                                                <CheckCircleIcon className="w-6 h-6" style={{ color: "#22C55E" }} />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold mb-2" style={{ color: "var(--foreground)", fontFamily: "var(--font-sans)" }}>
                                                Your weekly report is ready
                                            </p>
                                            <p className="text-xs leading-relaxed" style={{ color: "var(--muted)", fontFamily: "var(--font-sans)" }}>
                                                Week of {new Date(activeReport.week_start).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })} – {new Date(activeReport.week_end).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Report content section */}
                                    <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                                        <Link
                                            href={`/insights/report/${activeReport.week_start}`}
                                            className="flex items-center justify-between w-full rounded-lg border p-3 transition-all"
                                            style={{
                                                borderColor: "var(--border)",
                                                background: "transparent",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = "#22C55E";
                                                e.currentTarget.style.background = "rgba(34, 197, 94, 0.05)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = "var(--border)";
                                                e.currentTarget.style.background = "transparent";
                                            }}
                                        >
                                            <span className="text-sm font-medium" style={{ fontFamily: "var(--font-sans)", color: "var(--foreground)" }}>
                                                View full report
                                            </span>
                                            <svg
                                                className="w-4 h-4"
                                                style={{ color: "var(--muted)" }}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="relative flex-shrink-0">
                                            <div
                                                className="absolute inset-0 rounded-lg blur-xl opacity-20"
                                                style={{ background: "#94A3B8" }}
                                            />
                                            <div
                                                className="relative rounded-lg p-3 border"
                                                style={{
                                                    borderColor: "var(--border)",
                                                    background: "var(--card-bg)",
                                                }}
                                            >
                                                <ClockIcon className="w-6 h-6" style={{ color: "#94A3B8" }} />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold mb-2" style={{ color: "var(--foreground)", fontFamily: "var(--font-sans)" }}>
                                                Write at least one entry to access your weekly report
                                            </p>
                                            <p className="text-xs leading-relaxed" style={{ color: "var(--muted)", fontFamily: "var(--font-sans)" }}>
                                                {daysUntilReady === 0
                                                    ? `Available today`
                                                    : daysUntilReady === 1
                                                        ? `Available in ${daysUntilReady} day on ${readyDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}`
                                                        : `Available in ${daysUntilReady} days on ${readyDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Previous Reports Panel */}
                        <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)" }}>
                            <h4 className="text-sm font-semibold mb-3 sticky top-0" style={{ color: "var(--foreground)", fontFamily: "var(--font-sans)", background: "var(--card-bg)" }}>Previous Reports</h4>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                {isLoadingReports ? (
                                    <p className="text-sm" style={{ color: "var(--muted)", fontFamily: "var(--font-sans)" }}>
                                        Loading reports...
                                    </p>
                                ) : previousReports.length === 0 ? (
                                    <p className="text-sm" style={{ color: "var(--muted)", fontFamily: "var(--font-sans)" }}>
                                        No previous reports available yet.
                                    </p>
                                ) : (
                                    previousReports.map((report) => {
                                        const weekStart = new Date(report.week_start);
                                        const weekEnd = new Date(report.week_end);
                                        const weekLabel = weekStart.toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            year: weekStart.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                                        });
                                        const weekEndLabel = weekEnd.toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric'
                                        });

                                        // Get primary emotion
                                        const primaryEmotion = report.emotion_scores ? Object.entries(report.emotion_scores)
                                            .filter(([_, value]) => value > 0)
                                            .sort((a, b) => b[1] - a[1])[0] : null;

                                        return (
                                            <Link
                                                key={report.id}
                                                href={`/insights/report/${report.week_start}`}
                                                className="block overflow-hidden rounded-lg border transition-all"
                                                style={{
                                                    borderColor: "var(--border)",
                                                    background: "transparent"
                                                }}
                                            >
                                                <div
                                                    className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
                                                    style={{
                                                        color: "var(--foreground)",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.parentElement.style.background = "var(--background)";
                                                        e.currentTarget.parentElement.style.borderColor = "var(--muted)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.parentElement.style.background = "transparent";
                                                        e.currentTarget.parentElement.style.borderColor = "var(--border)";
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-medium" style={{ fontFamily: "var(--font-sans)" }}>
                                                            Week of {weekLabel} – {weekEndLabel}
                                                        </span>
                                                        {primaryEmotion && (
                                                            <span
                                                                className="text-[10px] px-2 py-0.5 rounded-full capitalize"
                                                                style={{
                                                                    background: `${EMOTIONS.find(e => e.key === primaryEmotion[0])?.color || '#999'}15`,
                                                                    color: EMOTIONS.find(e => e.key === primaryEmotion[0])?.color || '#999',
                                                                    fontFamily: "var(--font-mono)"
                                                                }}
                                                            >
                                                                {primaryEmotion[0]}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <svg
                                                        className="w-4 h-4"
                                                        style={{ color: "var(--muted)" }}
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </Link>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
