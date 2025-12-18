"use client";
import { useState, useEffect, useMemo } from 'react';
import { useSession } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import JournalChart from './JournalChart';

const EMOTION_KEYS = ['happiness', 'stress', 'sadness', 'anxiety', 'excitement', 'calm', 'anger', 'hopefulness'];

// Utility to get Monday of the week for a given date
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

// Utility to get the 1st day of month for a given date
function getMonthStart(date) {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}

// For week view: daily moods of each journal entry (past 7 days only)
function aggregateByDay(entries) {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Filter to past 7 days
    const filteredEntries = entries.filter(entry => {
        const entryDate = new Date(entry.created_at);
        return entryDate >= sevenDaysAgo;
    });

    // Each entry represents a day, keep all emotions
    return filteredEntries.map((entry) => {
        const dataPoint = {
            date: new Date(entry.created_at),
        };
        // Add each emotion as a separate property, defaulting to 0 if missing
        EMOTION_KEYS.forEach(emotion => {
            dataPoint[emotion] = parseFloat((entry.emotions?.[emotion] || 0).toFixed(2));
        });
        return dataPoint;
    });
}

// For month view: mood of each week (past 4 weeks only)
function aggregateByWeek(entries) {
    const now = new Date();
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28); // 4 weeks = 28 days
    fourWeeksAgo.setHours(0, 0, 0, 0);

    // Filter to past 4 weeks
    const filteredEntries = entries.filter(entry => {
        const entryDate = new Date(entry.created_at);
        return entryDate >= fourWeeksAgo;
    });

    const byWeek = {};
    filteredEntries.forEach((entry) => {
        const weekStart = getWeekStart(new Date(entry.created_at)).toISOString().split('T')[0];
        if (!byWeek[weekStart]) byWeek[weekStart] = [];
        byWeek[weekStart].push(entry);
    });

    return Object.entries(byWeek).map(([weekStart, weekEntries]) => {
        const dataPoint = {
            date: new Date(weekStart + "T12:00:00Z"),
        };

        // Calculate average for each emotion
        EMOTION_KEYS.forEach(emotion => {
            const sum = weekEntries.reduce((acc, entry) => acc + (entry.emotions?.[emotion] || 0), 0);
            const avg = weekEntries.length > 0 ? sum / weekEntries.length : 0;
            dataPoint[emotion] = parseFloat(avg.toFixed(2));
        });

        return dataPoint;
    });
}

// For all view: mood of each month
function aggregateByMonth(entries) {
    const byMonth = {};
    entries.forEach((entry) => {
        const monthStart = getMonthStart(new Date(entry.created_at));
        const key = `${monthStart.getFullYear()}-${(monthStart.getMonth() + 1).toString().padStart(2, '0')}`;
        if (!byMonth[key]) byMonth[key] = [];
        byMonth[key].push(entry);
    });

    return Object.entries(byMonth).map(([month, monthEntries]) => {
        const dataPoint = {
            date: getMonthStart(new Date(monthEntries[0].created_at)),
        };

        // Calculate average for each emotion
        EMOTION_KEYS.forEach(emotion => {
            const sum = monthEntries.reduce((acc, entry) => acc + (entry.emotions?.[emotion] || 0), 0);
            const avg = monthEntries.length > 0 ? sum / monthEntries.length : 0;
            dataPoint[emotion] = parseFloat(avg.toFixed(2));
        });

        return dataPoint;
    });
}

export default function Insights() {
    const [data, setData] = useState([]);
    const [view, setView] = useState('week');
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { session } = useSession();

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

    const client = useMemo(() => createClerkSupabaseClient(), [session?.id]);

    // Fetch entries from Supabase
    useEffect(() => {
        if (!session) return;
        let isMounted = true;

        async function fetchEntries() {
            setIsLoading(true);
            try {
                const { data: entries, error } = await client
                    .from('entries')
                    .select('id, created_at, emotion_scores, personality_scores')
                    .not('emotion_scores', 'is', null)
                    .order('created_at', { ascending: true });

                if (error) {
                    console.error('Error fetching entries:', error);
                    if (isMounted) {
                        setIsLoading(false);
                        setIsVisible(true);
                    }
                    return;
                }

                if (isMounted) {
                    // Transform entries to match the expected format
                    // Convert emotion_scores to emotions for compatibility
                    const transformedEntries = (entries || []).map(entry => ({
                        id: entry.id,
                        created_at: entry.created_at,
                        emotions: entry.emotion_scores || {},
                        personality_scores: entry.personality_scores || null
                    }));

                    setData(transformedEntries);
                    setIsLoading(false);
                    setIsVisible(true);
                }
            } catch (err) {
                console.error('Unexpected error fetching entries:', err);
                if (isMounted) {
                    setIsLoading(false);
                    setIsVisible(true);
                }
            }
        }

        fetchEntries();

        return () => {
            isMounted = false;
        };
    }, [session, client]);

    let aggregatedData = [];
    let needsMoreMessage = null;
    let effectiveView = view; // Track the actual view being displayed (may fall back to more detailed)

    // Show "2 more" for 0 entries, "1 more" for 1 entry, else nothing
    let needsMoreCount = null;
    if (data.length === 0) {
        needsMoreCount = 2;
    } else if (data.length === 1) {
        needsMoreCount = 1;
    }

    if (view === 'week') {
        // Daily moods of each journal entry
        aggregatedData = aggregateByDay(data)
            .sort((a, b) => a.date - b.date);
        if (needsMoreCount) {
            needsMoreMessage = `${needsMoreCount} more entr${needsMoreCount === 1 ? 'y' : 'ies'} needed to see trends`;
        }
    } else if (view === 'month') {
        // Mood of each week
        const weeklyData = aggregateByWeek(data)
            .sort((a, b) => a.date - b.date);

        // If only one week of data, fall back to daily view
        if (weeklyData.length === 1) {
            aggregatedData = aggregateByDay(data)
                .sort((a, b) => a.date - b.date);
            effectiveView = 'week'; // Use week formatting
            if (needsMoreCount) {
                needsMoreMessage = `${needsMoreCount} more entr${needsMoreCount === 1 ? 'y' : 'ies'} needed to see trends`;
            }
        } else {
            aggregatedData = weeklyData;
            if (needsMoreCount) {
                needsMoreMessage = `${needsMoreCount} more entr${needsMoreCount === 1 ? 'y' : 'ies'} needed to see trends`;
            }
        }
    } else if (view === 'all') {
        // Mood of each month
        const monthlyData = aggregateByMonth(data)
            .sort((a, b) => a.date - b.date);

        // If only one month of data, check if we should fall back to weekly or daily
        if (monthlyData.length === 1) {
            const weeklyData = aggregateByWeek(data)
                .sort((a, b) => a.date - b.date);

            // If only one week, fall back to daily view
            if (weeklyData.length === 1) {
                aggregatedData = aggregateByDay(data)
                    .sort((a, b) => a.date - b.date);
                effectiveView = 'week'; // Use week formatting
                if (needsMoreCount) {
                    needsMoreMessage = `${needsMoreCount} more entr${needsMoreCount === 1 ? 'y' : 'ies'} needed to see trends`;
                }
            } else {
                // Multiple weeks but only one month, show weekly view
                aggregatedData = weeklyData;
                effectiveView = 'month'; // Use month formatting
                if (needsMoreCount) {
                    needsMoreMessage = `${needsMoreCount} more entr${needsMoreCount === 1 ? 'y' : 'ies'} needed to see trends`;
                }
            }
        } else {
            aggregatedData = monthlyData;
            if (needsMoreCount) {
                needsMoreMessage = `${needsMoreCount} more entr${needsMoreCount === 1 ? 'y' : 'ies'} needed to see trends`;
            }
        }
    }

    return (
        <div className={`min-h-screen py-10 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ background: 'var(--background)' }}>
            <div className="w-full px-6 md:px-16 lg:px-32">
                {isLoading ? (
                    <div className="space-y-8 animate-fade-in-up">
                        {/* Header skeleton */}
                        <div>
                            <div className="h-3 w-20 rounded bg-gray-200/50 mb-3" />
                            <div className="h-8 w-48 rounded bg-gray-200/50 mb-2" />
                            <div className="h-4 w-72 rounded bg-gray-200/30" />
                        </div>
                        {/* Chart skeletons */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-xl border p-4 animate-pulse"
                                    style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
                                >
                                    <div className="h-3 w-16 rounded bg-gray-200/50 mb-3" />
                                    <div className="h-32 rounded bg-gray-200/30" />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <JournalChart data={aggregatedData} view={view} effectiveView={effectiveView} onViewChange={setView} needsMoreMessage={needsMoreMessage} entries={data} allEntries={data} />
                )}
            </div>
        </div>
    );
}