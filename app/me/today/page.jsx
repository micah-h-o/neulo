"use client";
import { useRef, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSession, useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';

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

function formatOrdinal(day) {
  if (day > 3 && day < 21) return `${day}th`;
  const last = day % 10;
  if (last === 1) return `${day}st`;
  if (last === 2) return `${day}nd`;
  if (last === 3) return `${day}rd`;
  return `${day}th`;
}

function formatFriendlyDate(date) {
  const weekday = date.toLocaleDateString(undefined, { weekday: 'long' });
  const month = date.toLocaleDateString(undefined, { month: 'long' });
  const day = formatOrdinal(date.getDate());
  return `${weekday}, ${month} the ${day}`;
}

export default function Today() {
  const editorRef = useRef(null);
  const editEditorRef = useRef(null);
  const [showButton, setShowButton] = useState(false);
  const [hideTimer, setHideTimer] = useState(null);
  const [inputIsNonEmpty, setInputIsNonEmpty] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [hasDailyEntry, setHasDailyEntry] = useState(false);
  const [checkingDailyEntry, setCheckingDailyEntry] = useState(true);
  const [dailyEntryData, setDailyEntryData] = useState(null);
  const [goingDeeper, setGoingDeeper] = useState(false);
  const [deeperResponse, setDeeperResponse] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [allEntries, setAllEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editShowButton, setEditShowButton] = useState(false);
  const [editHideTimer, setEditHideTimer] = useState(null);
  const [editInputIsNonEmpty, setEditInputIsNonEmpty] = useState(false);
  const [editGoingDeeper, setEditGoingDeeper] = useState(false);
  const [editDeeperResponse, setEditDeeperResponse] = useState(null);

  const { session } = useSession();
  const { user } = useUser();

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

  // Fetch all entries for personality calculation
  useEffect(() => {
    if (!session) return;
    let isMounted = true;

    async function fetchAllEntries() {
      setLoadingEntries(true);
      try {
        const { data, error } = await client
          .from('entries')
          .select('id, personality_scores')
          .not('personality_scores', 'is', null)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching entries:', error);
          if (isMounted) {
            setAllEntries([]);
          }
          return;
        }

        if (isMounted) {
          setAllEntries(data || []);
        }
      } catch (err) {
        console.error('Unexpected error fetching entries:', err);
        if (isMounted) {
          setAllEntries([]);
        }
      } finally {
        if (isMounted) {
          setLoadingEntries(false);
        }
      }
    }

    fetchAllEntries();

    return () => {
      isMounted = false;
    };
  }, [session, client]);

  // Calculate personality scores
  function calculatePersonalityScores(entries) {
    if (!entries || entries.length === 0) {
      return [
        { subject: 'Openness', A: 50, fullMark: 100 },
        { subject: 'Conscientiousness', A: 50, fullMark: 100 },
        { subject: 'Extraversion', A: 50, fullMark: 100 },
        { subject: 'Agreeableness', A: 50, fullMark: 100 },
        { subject: 'Neuroticism', A: 50, fullMark: 100 },
      ];
    }

    const entriesWithPersonality = entries.filter(entry => entry.personality_scores);

    if (entriesWithPersonality.length === 0) {
      return [
        { subject: 'Openness', A: 50, fullMark: 100 },
        { subject: 'Conscientiousness', A: 50, fullMark: 100 },
        { subject: 'Extraversion', A: 50, fullMark: 100 },
        { subject: 'Agreeableness', A: 50, fullMark: 100 },
        { subject: 'Neuroticism', A: 50, fullMark: 100 },
      ];
    }

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

  const personalityData = useMemo(() => calculatePersonalityScores(allEntries), [allEntries]);

  // Entrance fade
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Focus editor once we know the user still needs to write
  useEffect(() => {
    if (checkingDailyEntry) return;
    if (!hasDailyEntry && editorRef.current) {
      editorRef.current.focus();
    }
  }, [checkingDailyEntry, hasDailyEntry]);

  // Check if today's daily entry already exists - fetch full data
  useEffect(() => {
    if (!session) return;
    let isMounted = true;

    async function fetchDailyEntryStatus() {
      setCheckingDailyEntry(true);
      try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const { data, error } = await client
          .from('entries')
          .select('id, name, created_at, emotion_scores')
          .gte('created_at', startOfDay.toISOString())
          .lt('created_at', endOfDay.toISOString())
          .eq('is_daily', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error checking daily entry:', error);
          if (isMounted) {
            setHasDailyEntry(false);
            setDailyEntryData(null);
          }
          return;
        }

        if (isMounted) {
          const alreadyLogged = data && data.length > 0;
          setHasDailyEntry(alreadyLogged);
          setDailyEntryData(alreadyLogged ? data[0] : null);
        }
      } catch (err) {
        console.error('Unexpected daily entry check error:', err);
        if (isMounted) {
          setHasDailyEntry(false);
          setDailyEntryData(null);
        }
      } finally {
        if (isMounted) {
          setCheckingDailyEntry(false);
        }
      }
    }

    fetchDailyEntryStatus();

    return () => {
      isMounted = false;
    };
  }, [session, client]);

  // Handler for input events in the editor
  const handleInput = () => {
    setShowButton(false);

    if (editorRef.current) {
      const htmlContent = editorRef.current.innerText || "";
      setInputIsNonEmpty(htmlContent.trim().length > 0);
      setTaskName(htmlContent);
    }

    if (hideTimer) {
      clearTimeout(hideTimer);
    }
    const timer = setTimeout(() => {
      if (editorRef.current) {
        const htmlContent = editorRef.current.innerText || "";
        setShowButton(htmlContent.trim().length > 0);
      } else {
        setShowButton(false);
      }
    }, 1200);
    setHideTimer(timer);
  };

  // Clean up any timers when unmounting
  useEffect(() => {
    return () => {
      if (hideTimer) clearTimeout(hideTimer);
      if (editHideTimer) clearTimeout(editHideTimer);
    };
  }, [hideTimer, editHideTimer]);

  // Preserve original entry content across re-renders (contentEditable doesn't persist on re-render)
  useEffect(() => {
    if (!hasDailyEntry && !isEditing && editorRef.current && taskName) {
      // Only restore if the div is empty but we have content saved
      const currentContent = editorRef.current.innerText || "";
      if (currentContent.trim() === "" && taskName.trim() !== "") {
        editorRef.current.innerText = taskName;
        // Move cursor to end
        const range = document.createRange();
        const sel = window.getSelection();
        if (editorRef.current.childNodes.length > 0) {
          range.selectNodeContents(editorRef.current);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
  });

  // Preserve edit content across re-renders (contentEditable doesn't persist on re-render)
  useEffect(() => {
    if (isEditing && editEditorRef.current && editContent) {
      // Only restore if the div is empty but we have content saved
      const currentContent = editEditorRef.current.innerText || "";
      if (currentContent.trim() === "" && editContent.trim() !== "") {
        editEditorRef.current.innerText = editContent;
        // Move cursor to end
        const range = document.createRange();
        const sel = window.getSelection();
        if (editEditorRef.current.childNodes.length > 0) {
          range.selectNodeContents(editEditorRef.current);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
  });

  // Handler for input events in the edit editor
  const handleEditInput = () => {
    // Don't hide buttons while typing - just update the timer
    if (editEditorRef.current) {
      const htmlContent = editEditorRef.current.innerText || "";
      setEditInputIsNonEmpty(htmlContent.trim().length > 0);
      setEditContent(htmlContent);
    }

    if (editHideTimer) {
      clearTimeout(editHideTimer);
    }
    const timer = setTimeout(() => {
      if (editEditorRef.current) {
        const htmlContent = editEditorRef.current.innerText || "";
        setEditShowButton(htmlContent.trim().length > 0);
      } else {
        setEditShowButton(false);
      }
    }, 1200);
    setEditHideTimer(timer);
  };

  const EMOTION_KEYS = ['happiness', 'stress', 'sadness', 'anxiety', 'excitement', 'calm', 'anger', 'hopefulness'];

  // Save entry when finish entry is clicked
  async function handleFinishEntry(e) {
    e.preventDefault();
    const contentToSave = (editorRef.current?.innerText ?? "").trim();
    if (!contentToSave) return;

    setIsAnalyzing(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

      const evaluateResponse = await fetch(`${supabaseUrl}/functions/v1/evaluate-journal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ journalEntry: contentToSave }),
      });

      let emotionScores = {};
      let personalityScores = {};

      if (evaluateResponse.ok) {
        const responseData = await evaluateResponse.json();
        emotionScores = {
          happiness: responseData.mood.happiness,
          stress: responseData.mood.stress,
          sadness: responseData.mood.sadness,
          anxiety: 0,
          excitement: responseData.mood.excitement,
          calm: responseData.mood.calm,
          anger: responseData.mood.anger,
          hopefulness: responseData.mood.hopefulness,
        };

        if (responseData.personality) {
          personalityScores = {
            openness: responseData.personality.openness,
            conscientiousness: responseData.personality.conscientiousness,
            extraversion: responseData.personality.extraversion,
            agreeableness: responseData.personality.agreeableness,
            neuroticism: responseData.personality.neuroticism,
          };
        }
      } else {
        console.error('Error calling evaluate-journal:', await evaluateResponse.text());
        EMOTION_KEYS.forEach(emotion => {
          emotionScores[emotion] = parseFloat(Math.random().toFixed(2));
        });
      }

      const timestamp = new Date().toISOString();
      const insertData = {
        name: contentToSave,
        created_at: timestamp,
        emotion_scores: emotionScores,
        is_daily: true,
      };

      if (Object.keys(personalityScores).length > 0) {
        insertData.personality_scores = personalityScores;
      }

      const { data, error } = await client.from('entries').insert(insertData).select();

      if (error) {
        console.error('Error saving entry:', error);
        return;
      }

      if (editorRef.current) {
        editorRef.current.innerText = "";
      }
      setHasDailyEntry(true);
      setDailyEntryData({
        id: data?.[0]?.id,
        name: contentToSave,
        created_at: timestamp,
        emotion_scores: emotionScores
      });
    } catch (err) {
      console.error('Unexpected error while saving entry:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Start editing
  function startEditing() {
    const content = dailyEntryData?.name || "";
    setEditContent(content);
    setEditInputIsNonEmpty(content.trim().length > 0);
    setEditShowButton(content.trim().length > 0); // Show buttons immediately if there's content
    setEditDeeperResponse(null);
    setIsEditing(true);
    // Focus the edit editor after render and set content
    setTimeout(() => {
      if (editEditorRef.current) {
        editEditorRef.current.innerText = content;
        editEditorRef.current.focus();
        // Move cursor to end
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(editEditorRef.current);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }, 100);
  }

  // Cancel editing
  function cancelEditing() {
    setIsEditing(false);
    setEditContent("");
    setEditShowButton(false);
    setEditInputIsNonEmpty(false);
    setEditDeeperResponse(null);
    if (editHideTimer) clearTimeout(editHideTimer);
  }

  // Save edit to Supabase
  async function saveEdit(e) {
    if (e) e.preventDefault();

    // Get content directly from the editor ref to ensure we have the latest
    const contentToSave = (editEditorRef.current?.innerText ?? "").trim();
    if (!contentToSave || !dailyEntryData?.id) {
      console.error('Cannot save: missing content or entry ID', { contentToSave, id: dailyEntryData?.id });
      return;
    }

    setIsSavingEdit(true);
    setIsAnalyzing(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

      console.log('Starting edit save for entry:', dailyEntryData.id);

      // Re-evaluate emotions for the edited content
      const evaluateResponse = await fetch(`${supabaseUrl}/functions/v1/evaluate-journal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ journalEntry: contentToSave }),
      });

      let emotionScores = dailyEntryData.emotion_scores || {};
      let personalityScores = {};

      if (evaluateResponse.ok) {
        const responseData = await evaluateResponse.json();
        console.log('Emotion evaluation response:', responseData);
        emotionScores = {
          happiness: responseData.mood.happiness,
          stress: responseData.mood.stress,
          sadness: responseData.mood.sadness,
          anxiety: 0,
          excitement: responseData.mood.excitement,
          calm: responseData.mood.calm,
          anger: responseData.mood.anger,
          hopefulness: responseData.mood.hopefulness,
        };

        if (responseData.personality) {
          personalityScores = {
            openness: responseData.personality.openness,
            conscientiousness: responseData.personality.conscientiousness,
            extraversion: responseData.personality.extraversion,
            agreeableness: responseData.personality.agreeableness,
            neuroticism: responseData.personality.neuroticism,
          };
        }
      } else {
        console.error('Error calling evaluate-journal:', await evaluateResponse.text());
      }

      const updateData = {
        name: contentToSave,
        emotion_scores: emotionScores
      };

      if (Object.keys(personalityScores).length > 0) {
        updateData.personality_scores = personalityScores;
      }

      console.log('=== EDIT SAVE DEBUG ===');
      console.log('Updating entry with data:', updateData);
      console.log('Entry ID being updated:', dailyEntryData.id);
      console.log('Entry ID type:', typeof dailyEntryData.id);
      console.log('Content being saved:', contentToSave);
      console.log('Content length:', contentToSave.length);
      console.log('Original content was:', dailyEntryData.name);
      console.log('Are they different?', contentToSave !== dailyEntryData.name);

      const { data, error } = await client
        .from('entries')
        .update(updateData)
        .eq('id', dailyEntryData.id)
        .select('*');

      console.log('=== UPDATE RESPONSE ===');
      console.log('Error:', error);
      console.log('Data:', JSON.stringify(data, null, 2));
      console.log('Rows returned:', data?.length ?? 0);

      if (error) {
        console.error('Error updating entry:', error);
        return;
      }

      if (!data || data.length === 0) {
        console.error('⚠️ Update returned no data - the row may not exist or RLS is blocking the update.');
        console.error('Try checking: 1) Does entry with ID exist? 2) Do you have update permissions?');
      } else {
        console.log('✅ Update confirmed! Returned data:', data[0]);
        console.log('New name in DB:', data[0].name);
      }

      setDailyEntryData(prev => ({
        ...prev,
        name: contentToSave,
        emotion_scores: emotionScores
      }));
      setIsEditing(false);
      setEditContent("");
      setEditShowButton(false);
      setEditInputIsNonEmpty(false);
      setEditDeeperResponse(null);
    } catch (err) {
      console.error('Unexpected error updating entry:', err);
    } finally {
      setIsSavingEdit(false);
      setIsAnalyzing(false);
    }
  }

  // Go deeper
  async function handleGoDeeper(e) {
    e.preventDefault();
    const contentToAnalyze = (editorRef.current?.innerText ?? "").trim();
    if (!contentToAnalyze || goingDeeper) return;

    setGoingDeeper(true);
    setDeeperResponse(null);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/go-deeper`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ journalEntry: contentToAnalyze }),
      });

      if (response.ok) {
        const data = await response.json();
        setDeeperResponse(data.result);
      } else {
        console.error('Error calling go-deeper:', await response.text());
        setDeeperResponse("I couldn't process that reflection right now. Try again in a moment.");
      }
    } catch (err) {
      console.error('Unexpected error in go-deeper:', err);
      setDeeperResponse("Something went wrong. Please try again.");
    } finally {
      setGoingDeeper(false);
    }
  }

  function dismissDeeperResponse() {
    setDeeperResponse(null);
  }

  // Go deeper for edit mode
  async function handleEditGoDeeper(e) {
    e.preventDefault();
    const contentToAnalyze = (editEditorRef.current?.innerText ?? "").trim();
    if (!contentToAnalyze || editGoingDeeper) return;

    setEditGoingDeeper(true);
    setEditDeeperResponse(null);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/go-deeper`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ journalEntry: contentToAnalyze }),
      });

      if (response.ok) {
        const data = await response.json();
        setEditDeeperResponse(data.result);
      } else {
        console.error('Error calling go-deeper:', await response.text());
        setEditDeeperResponse("I couldn't process that reflection right now. Try again in a moment.");
      }
    } catch (err) {
      console.error('Unexpected error in go-deeper:', err);
      setEditDeeperResponse("Something went wrong. Please try again.");
    } finally {
      setEditGoingDeeper(false);
    }
  }

  function dismissEditDeeperResponse() {
    setEditDeeperResponse(null);
  }

  const contentMarginX = "px-6 md:px-16 lg:px-32";
  const todayLabel = formatFriendlyDate(new Date());

  // Get top emotions from the entry
  const topEmotions = useMemo(() => {
    if (!dailyEntryData?.emotion_scores) return [];
    return Object.entries(dailyEntryData.emotion_scores)
      .filter(([_, value]) => value > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [dailyEntryData?.emotion_scores]);

  // Get dominant emotion
  const dominantEmotion = topEmotions[0];

  return (
    <div className={`min-h-screen py-10 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ background: 'var(--background)' }}>
      <div className={`${contentMarginX} max-w-[1400px]`}>
        {checkingDailyEntry ? (
          <div className="space-y-6 animate-fade-in-up">
            <div className="h-3 w-32 rounded bg-gray-200/50" />
            <div className="h-10 w-64 rounded bg-gray-200/50" />
            <div className="h-4 w-48 rounded bg-gray-200/30" />
            <div className="rounded-xl border p-6" style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}>
              <div className="space-y-3">
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="h-3 w-full rounded bg-gray-200/40 animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        ) : hasDailyEntry ? (
          <div className="animate-fade-in-up">
            {/* Header */}
            <div className="mb-8">
              <span
                className="text-[10px] uppercase tracking-[0.25em] mb-3 block"
                style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
              >
                {todayLabel}
              </span>
              <p
                className="text-sm mb-6"
                style={{ color: 'var(--muted)' }}
              >
                Entry recorded · {new Date(dailyEntryData?.created_at).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-stretch">
              {/* Left Column: Entry Content, Mood Summary, Actions */}
              <div className="lg:flex-1 space-y-6">
            {/* Entry Content / Edit Mode */}
            <div
              className="rounded-xl border p-6 mb-6 animate-fade-in-up"
              style={{
                background: 'var(--card-bg)',
                borderColor: isEditing ? 'var(--foreground)' : 'var(--border)',
                animationDelay: '0.15s'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span
                    className="text-[9px] uppercase tracking-[0.2em] block mb-1"
                    style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                  >
                    {isEditing ? 'Editing' : 'Entry Content'}
                  </span>
                </div>
                {!isEditing && (
                  <button
                    onClick={startEditing}
                    className="text-xs px-3 py-1 rounded-full transition-all"
                    style={{
                      color: 'var(--muted)',
                      border: '1px solid var(--border)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--foreground)';
                      e.currentTarget.style.color = 'var(--foreground)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--muted)';
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <div>
                  <div
                    ref={editEditorRef}
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    spellCheck={true}
                    onInput={handleEditInput}
                    className="outline-none focus:outline-none px-0 py-0 break-words"
                    style={{
                      fontSize: "15px",
                      fontFamily: "var(--font-sans)",
                      fontWeight: 400,
                      lineHeight: "1.75",
                      color: "var(--foreground)",
                      border: "none",
                      boxShadow: "none",
                      outline: "none",
                      background: "transparent",
                      resize: "none",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      whiteSpace: "pre-wrap",
                    }}
                  ></div>

                  {/* AI "Go Deeper" Response for Edit Mode */}
                  {(editGoingDeeper || editDeeperResponse) && (
                    <div
                      className="mt-2 mb-6 animate-fade-in-up"
                      style={{ animationDelay: '0.1s' }}
                    >
                      <div
                        className="relative pl-4 border-l-2"
                        style={{ borderColor: '#6366f1' }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className="text-[10px] uppercase tracking-[0.2em]"
                            style={{
                              color: '#6366f1',
                              fontFamily: 'var(--font-mono)'
                            }}
                          >
                            Reflection
                          </span>
                          {editGoingDeeper && (
                            <div className="flex gap-1">
                              <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: '#6366f1', animationDelay: '0ms' }} />
                              <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: '#6366f1', animationDelay: '150ms' }} />
                              <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: '#6366f1', animationDelay: '300ms' }} />
                            </div>
                          )}
                        </div>

                        {editDeeperResponse && (
                          <div className="space-y-3">
                            <p
                              className="text-sm leading-relaxed"
                              style={{
                                color: '#4b5563',
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic'
                              }}
                            >
                              {editDeeperResponse}
                            </p>
                            <button
                              onClick={dismissEditDeeperResponse}
                              className="text-xs transition-colors"
                              style={{
                                color: 'var(--muted)',
                                fontFamily: 'var(--font-mono)'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#6366f1'}
                              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
                            >
                              Dismiss
                            </button>
                          </div>
                        )}

                        {editGoingDeeper && !editDeeperResponse && (
                          <div className="space-y-2">
                            <div className="h-3 w-3/4 rounded bg-indigo-100 animate-pulse" />
                            <div className="h-3 w-1/2 rounded bg-indigo-100 animate-pulse" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* AI Buttons - same style as original entry */}
                  <div className="relative flex gap-2 mt-2">
                    <button
                      type="button"
                      className={`
                        px-4 py-1.5 rounded-lg text-sm font-medium
                        border transition-all duration-200
                        ${((editShowButton || editGoingDeeper || isSavingEdit) && editInputIsNonEmpty) ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
                      `}
                      style={{
                        zIndex: 10,
                        background: "transparent",
                        color: "var(--muted)",
                        borderColor: "var(--border)",
                        minWidth: "100px",
                      }}
                      onMouseEnter={(e) => {
                        if (!editGoingDeeper) {
                          e.currentTarget.style.background = "var(--background)";
                          e.currentTarget.style.borderColor = "var(--foreground)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = "var(--border)";
                      }}
                      tabIndex={(editShowButton || editGoingDeeper || isSavingEdit) && editInputIsNonEmpty ? 0 : -1}
                      onClick={handleEditGoDeeper}
                      disabled={editGoingDeeper || isSavingEdit}
                    >
                      {editGoingDeeper ? "Reflecting..." : "Go deeper"}
                    </button>
                    <button
                      type="button"
                      className={`
                        px-4 py-1.5 rounded-lg text-sm font-medium
                        transition-all duration-200
                        ${((editShowButton || editGoingDeeper || isSavingEdit) && editInputIsNonEmpty) ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
                      `}
                      style={{
                        zIndex: 10,
                        background: "var(--accent)",
                        color: "var(--surface)",
                        border: "none",
                        minWidth: "115px",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSavingEdit) {
                          e.currentTarget.style.background = "var(--accent-hover)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--accent)";
                      }}
                      tabIndex={(editShowButton || editGoingDeeper || isSavingEdit) && editInputIsNonEmpty ? 0 : -1}
                      onClick={saveEdit}
                      disabled={isSavingEdit || editGoingDeeper}
                    >
                      {isSavingEdit ? "Saving..." : "Save changes"}
                    </button>
                    <button
                      type="button"
                      className={`
                        px-4 py-1.5 rounded-lg text-sm font-medium
                        border transition-all duration-200
                        ${((editShowButton || editGoingDeeper || isSavingEdit) && editInputIsNonEmpty) ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
                      `}
                      style={{
                        zIndex: 10,
                        background: "transparent",
                        color: "var(--muted)",
                        borderColor: "var(--border)",
                        minWidth: "70px",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSavingEdit && !editGoingDeeper) {
                          e.currentTarget.style.background = "var(--background)";
                          e.currentTarget.style.borderColor = "var(--foreground)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = "var(--border)";
                      }}
                      tabIndex={(editShowButton || editGoingDeeper || isSavingEdit) && editInputIsNonEmpty ? 0 : -1}
                      onClick={cancelEditing}
                      disabled={isSavingEdit || editGoingDeeper}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: 'var(--foreground)' }}
                >
                  {dailyEntryData?.name || 'No content'}
                </p>
              )}
            </div>

            {/* Mood Summary Card */}
            {dailyEntryData?.emotion_scores && (
              <div
                className="rounded-xl border p-6 animate-fade-in-up"
                style={{
                  background: 'var(--card-bg)',
                  borderColor: 'var(--border)',
                  animationDelay: '0.1s'
                }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <span
                      className="text-[9px] uppercase tracking-[0.2em] block mb-1"
                      style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                    >
                      Emotional Analysis
                    </span>
                    <h2
                      className="text-lg"
                      style={{ fontFamily: 'var(--font-serif)', color: 'var(--foreground)' }}
                    >
                      Mood Dimensions
                    </h2>
                  </div>
                  {dominantEmotion && (
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                      style={{ background: `${EMOTION_COLORS[dominantEmotion[0]]}15` }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: EMOTION_COLORS[dominantEmotion[0]] }}
                      />
                      <span
                        className="text-xs capitalize"
                        style={{ color: EMOTION_COLORS[dominantEmotion[0]], fontFamily: 'var(--font-mono)' }}
                      >
                        {dominantEmotion[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Emotion bars */}
                <div className="space-y-3">
                  {EMOTION_KEYS.map((emotion) => {
                    const value = dailyEntryData.emotion_scores[emotion] || 0;
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

            {/* Actions */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              <button
                onClick={startEditing}
                className="flex items-center justify-between p-5 rounded-xl border transition-all"
                style={{
                  background: 'var(--card-bg)',
                  borderColor: 'var(--border)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--foreground)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div className="text-left">
                  <span
                    className="text-sm font-medium block mb-1"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Edit Entry
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--muted)' }}
                  >
                    Revise your reflection
                  </span>
                </div>
                <svg
                  className="w-5 h-5"
                  style={{ color: 'var(--muted)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                </svg>
              </button>

              <Link
                href="/me/insights"
                className="flex items-center justify-between p-5 rounded-xl border transition-all"
                style={{
                  background: 'var(--card-bg)',
                  borderColor: 'var(--border)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#6366f1';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div className="text-left">
                  <span
                    className="text-sm font-medium block mb-1"
                    style={{ color: 'var(--foreground)' }}
                  >
                    View Insights
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--muted)' }}
                  >
                    Explore your patterns
                  </span>
                </div>
                <svg
                  className="w-5 h-5"
                  style={{ color: '#6366f1' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </Link>
            </div>
              </div>

              {/* Right Column: Personality Radar Chart */}
              {dailyEntryData?.emotion_scores && (
                <div className="lg:flex-1 flex">
                  <div
                    className="rounded-xl border p-6 w-full flex flex-col animate-fade-in-up"
                    style={{
                      background: 'var(--card-bg)',
                      borderColor: 'var(--border)',
                      animationDelay: '0.1s'
                    }}
                  >
                    <div className="mb-5">
                      <span
                        className="text-[9px] uppercase tracking-[0.2em] block mb-1"
                        style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                      >
                        Psychological Model
                      </span>
                      <h2
                        className="text-lg"
                        style={{ fontFamily: 'var(--font-serif)', color: 'var(--foreground)' }}
                      >
                        Personality Profile
                      </h2>
                    </div>

                    <div className="flex-1 w-full min-h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart
                          data={personalityData}
                          outerRadius="85%"
                          style={{
                            filter: 'drop-shadow(0 8px 32px rgba(32,44,74,0.05))',
                          }}
                        >
                          <defs>
                            <radialGradient id="radar-fill-today" cx="50%" cy="50%" r="65%">
                              <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.32" />
                              <stop offset="80%" stopColor="#6366f1" stopOpacity="0.15" />
                              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.07" />
                            </radialGradient>
                          </defs>
                          <PolarGrid
                            stroke="var(--border)"
                            strokeWidth={1.25}
                            radialLines={true}
                          />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{
                              fontSize: 11,
                              fill: 'var(--foreground)',
                              fontWeight: 600,
                              fontFamily: 'var(--font-sans)',
                              opacity: 0.84,
                            }}
                            tickLine={false}
                          />
                          <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={{
                              fontSize: 9,
                              fill: 'var(--muted)',
                              fontFamily: 'var(--font-sans)',
                              fontWeight: 500,
                              opacity: 0.68,
                            }}
                            axisLine={false}
                            tickCount={5}
                            tickFormatter={(value) => value === 0 ? '' : `${value}`}
                            stroke="transparent"
                            tickMargin={6}
                          />
                          <Radar
                            name="Big Five"
                            dataKey="A"
                            stroke="#6366f1"
                            fill="url(#radar-fill-today)"
                            fillOpacity={1}
                            strokeWidth={3}
                            activeDot={{ fill: "#6366f1", r: 4.5, strokeWidth: 0 }}
                            dot={{ fill: "#fff", r: 2.5, stroke: '#6366f1', strokeWidth: 1.5, opacity: 0.95 }}
                            isAnimationActive={true}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div
              ref={editorRef}
              contentEditable={true}
              suppressContentEditableWarning={true}
              spellCheck={true}
              onInput={handleInput}
              className="outline-none focus:outline-none px-0 py-0 break-words"
              style={{
                fontSize: "15px",
                fontFamily: "var(--font-sans)",
                fontWeight: 400,
                lineHeight: "1.75",
                color: "var(--foreground)",
                border: "none",
                boxShadow: "none",
                outline: "none",
                background: "transparent",
                resize: "none",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                whiteSpace: "pre-wrap",
              }}
            ></div>
            {/* AI "Go Deeper" Response */}
            {(goingDeeper || deeperResponse) && (
              <div
                className="mt-2 mb-6 animate-fade-in-up"
                style={{ animationDelay: '0.1s' }}
              >
                <div
                  className="relative pl-4 border-l-2"
                  style={{ borderColor: '#6366f1' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-[10px] uppercase tracking-[0.2em]"
                      style={{
                        color: '#6366f1',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      Reflection
                    </span>
                    {goingDeeper && (
                      <div className="flex gap-1">
                        <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: '#6366f1', animationDelay: '0ms' }} />
                        <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: '#6366f1', animationDelay: '150ms' }} />
                        <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: '#6366f1', animationDelay: '300ms' }} />
                      </div>
                    )}
                  </div>

                  {deeperResponse && (
                    <div className="space-y-3">
                      <p
                        className="text-sm leading-relaxed"
                        style={{
                          color: '#4b5563',
                          fontFamily: 'var(--font-serif)',
                          fontStyle: 'italic'
                        }}
                      >
                        {deeperResponse}
                      </p>
                      <button
                        onClick={dismissDeeperResponse}
                        className="text-xs transition-colors"
                        style={{
                          color: 'var(--muted)',
                          fontFamily: 'var(--font-mono)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#6366f1'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {goingDeeper && !deeperResponse && (
                    <div className="space-y-2">
                      <div className="h-3 w-3/4 rounded bg-indigo-100 animate-pulse" />
                      <div className="h-3 w-1/2 rounded bg-indigo-100 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Buttons appear after user stops typing and input is non empty */}
            <div className="relative flex gap-2">
              <button
                type="button"
                className={`
                  mt-2 px-4 py-1.5 rounded-lg text-sm font-medium
                  border transition-all duration-200
                  ${((showButton || goingDeeper) && inputIsNonEmpty) ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
                `}
                style={{
                  zIndex: 10,
                  background: "transparent",
                  color: "var(--muted)",
                  borderColor: "var(--border)",
                  minWidth: "100px",
                }}
                onMouseEnter={(e) => {
                  if (!goingDeeper) {
                    e.currentTarget.style.background = "var(--background)";
                    e.currentTarget.style.borderColor = "var(--foreground)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
                tabIndex={(showButton || goingDeeper) && inputIsNonEmpty ? 0 : -1}
                onClick={handleGoDeeper}
                disabled={goingDeeper}
              >
                {goingDeeper ? "Reflecting..." : "Go deeper"}
              </button>
              <button
                type="button"
                className={`
                  mt-2 px-4 py-1.5 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${((showButton || goingDeeper) && inputIsNonEmpty) ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
                `}
                style={{
                  zIndex: 10,
                  background: "var(--accent)",
                  color: "var(--surface)",
                  border: "none",
                  minWidth: "105px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--accent-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--accent)";
                }}
                tabIndex={(showButton || goingDeeper) && inputIsNonEmpty ? 0 : -1}
                onClick={handleFinishEntry}
              >
                Finish entry
              </button>
            </div>
          </>
        )}
      </div>

      {/* AI Analysis Loading Indicator */}
      {isAnalyzing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in-up"
          style={{ background: "rgba(0, 0, 0, 0.15)" }}
        >
          <div
            className="rounded-xl border p-8 w-full max-w-md mx-4 animate-fade-in-up"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--border)",
              boxShadow: "var(--shadow)",
              animationDelay: "0.05s",
            }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#6366f1', animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#6366f1', animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#6366f1', animationDelay: '300ms' }} />
              </div>
              <div className="text-center">
                <p
                  className="text-sm font-medium mb-1"
                  style={{ color: "var(--foreground)", fontFamily: 'var(--font-serif)' }}
                >
                  Analyzing with artificial intelligence
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--muted)", fontFamily: 'var(--font-mono)' }}
                >
                  Processing your reflection...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
