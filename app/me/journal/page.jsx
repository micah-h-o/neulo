"use client";
import { useState, useEffect, useRef } from 'react';
import { useSession } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

// Emotion colors matching the app
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

const EMOTION_KEYS = ['happiness', 'stress', 'sadness', 'anxiety', 'excitement', 'calm', 'anger', 'hopefulness'];

function ThreeDotsMenu({ onDelete, entryId, openId, setOpenId, onDeleteClick }) {
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setOpenId(null);
            }
        }
        if (openId === entryId) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openId, entryId, setOpenId]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                className="flex items-center justify-center rounded-full p-1.5 transition-all duration-200"
                style={{ color: "var(--muted)" }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--surface-highlight)";
                    e.currentTarget.style.color = "var(--foreground)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--muted)";
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    setOpenId(openId === entryId ? null : entryId);
                }}
                aria-label="Options"
                tabIndex={0}
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="4" cy="10" r="1.5" />
                    <circle cx="10" cy="10" r="1.5" />
                    <circle cx="16" cy="10" r="1.5" />
                </svg>
            </button>
            {openId === entryId && (
                <div
                    className="absolute right-0 z-10 mt-2 w-48 rounded-lg border py-1 animate-scale-in"
                    style={{
                        background: "var(--card-bg)",
                        borderColor: "var(--border)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenId(null);
                            onDeleteClick(entryId);
                        }}
                        className="w-full text-left px-3 py-2 transition-all duration-200 flex items-center gap-2 text-sm"
                        style={{
                            color: "var(--muted)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--surface-highlight)";
                            e.currentTarget.style.color = "#dc2626";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "var(--muted)";
                        }}
                    >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete Entry</span>
                    </button>
                </div>
            )}
        </div>
    );
}

export default function Journal() {
    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [menuOpenId, setMenuOpenId] = useState(null);
    const [expandedEntry, setExpandedEntry] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
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

    async function fetchEntries() {
        if (!session) return;
        const client = createClerkSupabaseClient();
        const { data, error } = await client
            .from('entries')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching entries:', error);
        } else {
            setEntries(data || []);
        }
        setIsLoading(false);
        setIsVisible(true);
    }

    useEffect(() => {
        fetchEntries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

    function handleDeleteClick(id) {
        setDeleteConfirmId(id);
    }

    function handleCancelDelete() {
        setDeleteConfirmId(null);
    }

    async function handleConfirmDelete() {
        if (!deleteConfirmId) return;

        setIsDeleting(true);
        const client = createClerkSupabaseClient();

        try {
            const { error } = await client
                .from('entries')
                .delete()
                .eq('id', deleteConfirmId);

            if (error) {
                console.error('Error deleting entry:', error);
                setIsDeleting(false);
                // Keep modal open to show error
                return;
            }

            console.log('Entry deleted successfully');
            // Update local state to remove the deleted entry
            setEntries(entries => entries.filter(entry => entry.id !== deleteConfirmId));
            if (expandedEntry === deleteConfirmId) setExpandedEntry(null);
            setDeleteConfirmId(null);
            setIsDeleting(false);
        } catch (err) {
            console.error('Unexpected error during deletion:', err);
            setIsDeleting(false);
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return {
            day: date.getDate(),
            month: date.toLocaleDateString(undefined, { month: 'short' }),
            year: date.getFullYear(),
            time: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        };
    }

    const contentMarginX = "px-6 md:px-16 lg:px-32";

    return (
        <div
            className={`min-h-screen py-10 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ background: 'var(--background)' }}
        >
            <div className={`${contentMarginX}`}>
                {/* Header */}
                <div className="mb-10 animate-fade-in-up">
                    <span
                        className="text-[10px] uppercase tracking-[0.25em] mb-2 block"
                        style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                    >
                        Archive
                    </span>
                    <h1
                        className="text-3xl mb-2"
                        style={{ fontFamily: 'var(--font-serif)', color: 'var(--foreground)' }}
                    >
                        Journal Entries
                    </h1>
                    <p
                        className="text-sm leading-relaxed max-w-xl"
                        style={{ color: 'var(--muted)' }}
                    >
                        A chronological record of your reflections. Each entry contributes to
                        the longitudinal dataset from which patterns emerge.
                    </p>
                </div>

                {/* Stats bar */}
                {!isLoading && entries.length > 0 && (
                    <div
                        className="flex items-center gap-6 mb-8 pb-6 border-b animate-fade-in-up"
                        style={{ borderColor: 'var(--border)', animationDelay: '0.1s' }}
                    >
                        <div>
                            <span
                                className="text-2xl block"
                                style={{ fontFamily: 'var(--font-serif)', color: 'var(--foreground)' }}
                            >
                                {entries.length}
                            </span>
                            <span
                                className="text-[10px] uppercase tracking-wider"
                                style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                            >
                                Total entries
                            </span>
                        </div>
                        <div
                            className="w-px h-10"
                            style={{ background: 'var(--border)' }}
                        />
                        <div>
                            <span
                                className="text-2xl block"
                                style={{ fontFamily: 'var(--font-serif)', color: 'var(--foreground)' }}
                            >
                                {entries.filter(e => {
                                    const d = new Date(e.created_at);
                                    const now = new Date();
                                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                                }).length}
                            </span>
                            <span
                                className="text-[10px] uppercase tracking-wider"
                                style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                            >
                                This month
                            </span>
                        </div>
                    </div>
                )}

                {/* Entries */}
                {isLoading ? (
                    <div
                        className="space-y-4 animate-fade-in-up"
                        style={{ animationDelay: '0.1s' }}
                    >
                        {[...Array(4)].map((_, idx) => (
                            <div
                                key={idx}
                                className="rounded-lg border p-5 animate-pulse"
                                style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
                            >
                                <div className="flex gap-4">
                                    <div className="w-12 h-14 rounded bg-gray-200/50" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-1/3 rounded bg-gray-200/50" />
                                        <div className="h-3 w-2/3 rounded bg-gray-200/30" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : entries.length === 0 ? (
                    <div
                        className="text-center py-16 animate-fade-in-up"
                        style={{ animationDelay: '0.1s' }}
                    >
                        <p
                            className="text-lg mb-2"
                            style={{ fontFamily: 'var(--font-serif)', color: 'var(--foreground)' }}
                        >
                            No entries yet
                        </p>
                        <p
                            className="text-sm"
                            style={{ color: 'var(--muted)' }}
                        >
                            Begin your practice by writing your first reflection.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {entries.map((entry, index) => {
                            const date = formatDate(entry.created_at);
                            const isExpanded = expandedEntry === entry.id;

                            return (
                                <div
                                    key={entry.id}
                                    className="group rounded-lg border transition-all duration-200 animate-fade-in-up"
                                    style={{
                                        borderColor: isExpanded ? 'var(--muted)' : 'var(--border)',
                                        background: 'var(--card-bg)',
                                        animationDelay: `${0.1 + index * 0.03}s`
                                    }}
                                    onMouseEnter={() => setHoveredRow(entry.id)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                >
                                    {/* Entry header */}
                                    <div
                                        className="flex items-start gap-4 p-5"
                                    >
                                        {/* Date block */}
                                        <div
                                            className="flex-shrink-0 w-12 text-center rounded-lg py-2 px-1"
                                            style={{ background: 'var(--surface-highlight)' }}
                                        >
                                            <span
                                                className="text-xl block leading-none"
                                                style={{ fontFamily: 'var(--font-serif)', color: 'var(--foreground)' }}
                                            >
                                                {date.day}
                                            </span>
                                            <span
                                                className="text-[9px] uppercase tracking-wider"
                                                style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                                            >
                                                {date.month}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div
                                            className="flex-1 min-w-0 cursor-pointer"
                                            onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                                        >
                                            <p
                                                className="text-sm leading-relaxed mb-2"
                                                style={{
                                                    color: 'var(--foreground)',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: isExpanded ? 'unset' : 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: isExpanded ? 'visible' : 'hidden',
                                                }}
                                            >
                                                {entry.name || entry.content || 'No content'}
                                            </p>

                                            {/* Primary emotion badge */}
                                            {entry.emotion_scores && (() => {
                                                const primaryEmotion = Object.entries(entry.emotion_scores)
                                                    .filter(([_, value]) => value > 0)
                                                    .sort((a, b) => b[1] - a[1])[0];

                                                if (primaryEmotion) {
                                                    const [emotion, value] = primaryEmotion;
                                                    return (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span
                                                                className="text-[9px] uppercase tracking-wider"
                                                                style={{
                                                                    color: 'var(--muted)',
                                                                    fontFamily: 'var(--font-mono)'
                                                                }}
                                                            >
                                                                Primary mood
                                                            </span>
                                                            <div
                                                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                                                                style={{
                                                                    background: `${EMOTION_COLORS[emotion]}15`,
                                                                    border: `1px solid ${EMOTION_COLORS[emotion]}30`
                                                                }}
                                                            >
                                                                <div
                                                                    className="w-1.5 h-1.5 rounded-full"
                                                                    style={{ background: EMOTION_COLORS[emotion] }}
                                                                />
                                                                <span
                                                                    className="text-[10px] font-medium capitalize"
                                                                    style={{
                                                                        color: EMOTION_COLORS[emotion],
                                                                        fontFamily: 'var(--font-mono)'
                                                                    }}
                                                                >
                                                                    {emotion}
                                                                </span>
                                                                <span
                                                                    className="text-[9px]"
                                                                    style={{
                                                                        color: EMOTION_COLORS[emotion],
                                                                        opacity: 0.7,
                                                                        fontFamily: 'var(--font-mono)'
                                                                    }}
                                                                >
                                                                    {Math.round(value * 100)}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="text-[10px] hidden sm:block"
                                                style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                                            >
                                                {date.time}
                                            </span>
                                            <div
                                                className={`transition-opacity duration-150 ${hoveredRow === entry.id || menuOpenId === entry.id
                                                    ? 'opacity-100'
                                                    : 'opacity-0'
                                                    }`}
                                            >
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <ThreeDotsMenu
                                                        entryId={entry.id}
                                                        openId={menuOpenId}
                                                        setOpenId={setMenuOpenId}
                                                        onDeleteClick={handleDeleteClick}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded entry content */}
                                    {isExpanded && (
                                        <div
                                            className="px-5 pb-5 pt-0 border-t"
                                            style={{ borderColor: 'var(--border)' }}
                                        >
                                            <div className="pt-5 space-y-4">
                                                {/* Full entry content */}
                                                <div>
                                                    <span
                                                        className="text-[9px] uppercase tracking-[0.2em] block mb-2"
                                                        style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                                                    >
                                                        Full Entry
                                                    </span>
                                                    <p
                                                        className="text-sm leading-relaxed whitespace-pre-wrap"
                                                        style={{ color: 'var(--foreground)' }}
                                                    >
                                                        {entry.name || entry.content || 'No content'}
                                                    </p>
                                                </div>

                                                {/* All emotion scores */}
                                                {entry.emotion_scores && (
                                                    <div>
                                                        <span
                                                            className="text-[9px] uppercase tracking-[0.2em] block mb-3"
                                                            style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                                                        >
                                                            All Mood Dimensions
                                                        </span>
                                                        <div className="space-y-2">
                                                            {EMOTION_KEYS.map((emotion) => {
                                                                const value = entry.emotion_scores[emotion] || 0;
                                                                return (
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
                                                                                className="h-full rounded-full transition-all duration-700"
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
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in-fast"
                    style={{ background: "rgba(0, 0, 0, 0.15)" }}
                    onClick={handleCancelDelete}
                >
                    <div
                        className="rounded-xl border p-6 w-full max-w-sm mx-4 animate-scale-in"
                        style={{
                            background: "var(--card-bg)",
                            borderColor: "var(--border)",
                            boxShadow: "var(--shadow)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center gap-3 mb-4 text-center">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ background: "rgba(220, 38, 38, 0.1)" }}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#dc2626" }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <div>
                                <h3
                                    className="text-lg font-medium"
                                    style={{ color: "var(--foreground)", fontFamily: 'var(--font-serif)' }}
                                >
                                    Delete Entry
                                </h3>
                                <p
                                    className="text-sm mt-1"
                                    style={{ color: "var(--muted)" }}
                                >
                                    Are you sure you want to delete this entry? This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={handleCancelDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm rounded-lg transition-colors flex-1"
                                style={{
                                    color: "var(--foreground)",
                                    background: "var(--surface)",
                                    border: "1px solid var(--border)"
                                }}
                                onMouseEnter={(e) => {
                                    if (!isDeleting) {
                                        e.currentTarget.style.background = "var(--surface-highlight)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "var(--surface)";
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-1 font-medium"
                                style={{
                                    background: "#dc2626",
                                    color: "white",
                                }}
                                onMouseEnter={(e) => {
                                    if (!isDeleting) {
                                        e.currentTarget.style.background = "#b91c1c";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "#dc2626";
                                }}
                            >
                                {isDeleting ? (
                                    <>
                                        <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    "Delete"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
