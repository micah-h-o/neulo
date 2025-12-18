/// <reference path="./deno.d.ts" />

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"
import { GoogleGenAI } from "npm:@google/genai"
import { z } from "npm:zod"
import { zodToJsonSchema } from "npm:zod-to-json-schema"
import { verifyToken } from "npm:@clerk/backend"

/**
 * Calculate week boundaries for weekly reports.
 * Reports cover Monday (week_start) to Sunday (week_end).
 * If called on a Sunday, returns that week. Otherwise, returns the most recent completed week.
 */
// Configuration: Day of week when reports become ready (0 = Sunday, 1 = Monday, etc.)
const REPORT_READY_DAY = 0; // Sunday (0 = Sunday, 1 = Monday, etc.)

/**
 * Get the current date in a specific timezone
 * @param timezone - IANA timezone identifier (e.g., 'America/New_York', 'Europe/London')
 * @returns Date object representing current time in the specified timezone
 */
function getCurrentDateInTimezone(timezone?: string): Date {
  if (!timezone) {
    return new Date(); // Fallback to server time (UTC)
  }

  try {
    const now = new Date();

    // Get the date components in the user's timezone
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const parts = formatter.formatToParts(now);
    const partsObj = parts.reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {} as Record<string, string>);

    // Create a date object for the current date in the user's timezone
    // This represents the "local date" for the user (ignoring time)
    return new Date(`${partsObj.year}-${partsObj.month}-${partsObj.day}T00:00:00`);
  } catch (error) {
    console.warn(`Invalid timezone '${timezone}', falling back to server time:`, error);
    return new Date(); // Fallback to server time
  }
}

/**
 * Convert a date to UTC while preserving the date boundaries in the user's timezone
 * This ensures database queries use correct UTC timestamps for the user's local dates
 */
function convertTimezoneAwareDateToUTC(date: Date, timezone?: string): Date {
  if (!timezone) {
    return date; // No conversion needed if no timezone specified
  }

  try {
    // Get the offset for this date in the user's timezone
    const utcDate = new Date(date.getTime());

    // Create a date representing the same "wall clock" time in the user's timezone
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const localTimeStr = formatter.format(utcDate);
    const localDate = new Date(localTimeStr);

    // Calculate the offset between UTC and the user's timezone for this date
    const utcTime = utcDate.getTime();
    const localTime = localDate.getTime();
    const offset = utcTime - localTime;

    // Apply the offset to get the correct UTC time for the user's local date
    return new Date(date.getTime() + offset);
  } catch (error) {
    console.warn(`Error converting date to UTC for timezone '${timezone}':`, error);
    return date; // Fallback to original date
  }
}

function getWeekBoundaries(referenceDate?: Date, timezone?: string): { weekStart: Date; weekEnd: Date; isCurrentWeek: boolean } {
  // Get the current date in the user's timezone if no reference date provided
  const date = referenceDate ? new Date(referenceDate) : getCurrentDateInTimezone(timezone);
  date.setHours(0, 0, 0, 0);

  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

  let weekEnd: Date;
  let isCurrentWeek = false;

  if (dayOfWeek === REPORT_READY_DAY) {
    // Today is Sunday, use today as week_end (current week is ready)
    weekEnd = new Date(date);
    isCurrentWeek = true;
  } else {
    // Find the previous Sunday (most recent completed week)
    weekEnd = new Date(date);
    weekEnd.setDate(date.getDate() - dayOfWeek);
    isCurrentWeek = false;
  }

  // Find Monday (start of week) - 6 days before Sunday
  const weekStart = new Date(weekEnd);
  weekStart.setDate(weekEnd.getDate() - 6);

  return { weekStart, weekEnd, isCurrentWeek };
}

/**
 * Format a Date to YYYY-MM-DD string for database storage
 */
function formatDateToISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Extract JSON from Gemini response that may be wrapped in markdown code blocks
 */
function extractJsonFromResponse(responseText: string): string {
  // Remove markdown code block formatting if present
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }

  // If no code blocks found, return the original text (it might already be clean JSON)
  return responseText.trim();
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const emotionScoresSchema = z.object({
  calm: z.number().min(0).max(1).describe("The amount of calmness observed."),
  anger: z.number().min(0).max(1).describe("The amount of anger observed."),
  stress: z.number().min(0).max(1).describe("The amount of stress observed."),
  anxiety: z.number().min(0).max(1).describe("The amount of anxiety observed."),
  sadness: z.number().min(0).max(1).describe("The amount of sadness observed."),
  happiness: z.number().min(0).max(1).describe("The amount of happiness observed."),
  excitement: z.number().min(0).max(1).describe("The amount of excitement observed."),
  hopefulness: z.number().min(0).max(1).describe("The amount of hopefulness observed."),
})

const recommendationsSchema = z.object({
  continue: z.string().describe("Actionable positive habit to maintain."),
  explore: z.string().describe("Actionable behavior or mindset to try."),
  consider: z.string().describe("Gentle suggestion for improvement."),
})

const weeklyReportSchema = z.object({
  emotion_scores: emotionScoresSchema.describe("Average emotion scores across all entries."),
  themes: z.array(z.string()).describe("Key recurring themes, patterns, or topics identified across the journal entries (3-5 themes)."),
  recommendations: recommendationsSchema.describe("Actionable recommendations based on the patterns observed."),
  highlights: z.array(z.string()).describe("Positive moments, achievements, or uplifting observations from the week (3-5 highlights)."),
  lowlights: z.array(z.string()).describe("Challenging moments, concerns, or areas that need attention from the week (3-5 lowlights)."),
})

const ai = new GoogleGenAI(Deno.env.get('GEMINI_API_KEY')!);

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Clerk JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: "Authorization header with Clerk JWT token required"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Validate the token format (should be "Bearer <jwt_token>")
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        error: "Invalid authorization header format. Expected 'Bearer <token>'"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Extract the JWT token
    const clerkJWT = authHeader.substring(7); // Remove "Bearer " prefix
    console.log('Verifying Clerk JWT token...');

    // Verify Clerk JWT token using Clerk's backend SDK
    let clerkUser;
    try {
      const clerkSecretKey = Deno.env.get('CLERK_SECRET_KEY');
      if (!clerkSecretKey) {
        throw new Error('CLERK_SECRET_KEY environment variable not set');
      }

      clerkUser = await verifyToken(clerkJWT, {
        secretKey: clerkSecretKey,
      });

      console.log(`Clerk user verified: ${clerkUser.sub}`);
    } catch (error) {
      console.error('Clerk JWT verification failed:', error);
      return new Response(JSON.stringify({
        error: "Invalid or expired Clerk token. Please log in again."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Parse request body to get timezone information
    let timezone: string | undefined;
    try {
      const body = await req.text();
      if (body) {
        const requestData = JSON.parse(body);
        timezone = requestData.timezone;
      }
    } catch (error) {
      // If body parsing fails, continue without timezone (will use server time)
      console.warn('Failed to parse request body for timezone:', error);
    }

    // Create Supabase client with secret key for server-side operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseSecretKey = 'sb_secret_ldFoTN8hsmInJ6etpFaSEA_XAi1lVkB';

    const supabase = createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Use Clerk user ID for database operations
    const userId = clerkUser.sub;
    console.log(`Using Clerk user ID for database operations: ${userId}`);

    // Calculate week boundaries (Monday to Sunday) using user's timezone
    const { weekStart, weekEnd, isCurrentWeek } = getWeekBoundaries(undefined, timezone);
    const today = getCurrentDateInTimezone(timezone);
    const weekStartStr = formatDateToISO(weekStart);
    const weekEndStr = formatDateToISO(weekEnd);

    console.log(`Processing request for user ${userId} with timezone: ${timezone || 'UTC (fallback)'}`);
    console.log(`Week boundaries: ${weekStartStr} to ${weekEndStr} (${isCurrentWeek ? 'current' : 'completed'} week)`);

    // Calculate days until the report ready day using user's timezone
    const currentDayOfWeek = today.getDay();
    let daysUntilReady = (REPORT_READY_DAY - currentDayOfWeek + 7) % 7;

    if (currentDayOfWeek !== REPORT_READY_DAY) {
      console.log(currentDayOfWeek, REPORT_READY_DAY)
      // Calculate days until the next occurrence of REPORT_READY_DAY
      daysUntilReady = (REPORT_READY_DAY - currentDayOfWeek + 7) % 7;
      if (daysUntilReady === 0) daysUntilReady = 7; // If same day but not ready, wait full week
    }

    // Only generate report if it's the configured ready day (current week is ready) OR if daysUntilReady is 0
    // On other days, reports should be accessed via previous reports query
    if (!isCurrentWeek && daysUntilReady !== 0) {
      return new Response(JSON.stringify({
        ready: false,
        isCurrentWeek: false,
        daysUntilReady: daysUntilReady,
        message: `Weekly reports are only ready on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][REPORT_READY_DAY]}s. Please check previous reports for completed weeks.`,
        week_start: weekStartStr,
        week_end: weekEndStr,
        timezone: timezone || 'UTC',
        user_id: userId,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 with ready: false instead of error
      });
    }

    // Check if a report already exists for this week for this user
    const { data: existingReport, error: reportQueryError } = await supabase
      .from('weekly_reports')
      .select('id, emotion_scores, themes, recommendations, highlights, lowlights, week_start, week_end, created_at')
      .eq('week_start', weekStartStr)
      .eq('week_end', weekEndStr)
      .eq('user_id', userId)
      .maybeSingle();

    if (reportQueryError) {
      console.error('Database query error:', reportQueryError);
      return new Response(JSON.stringify({
        error: `Database error checking existing report: ${reportQueryError.message}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // If report exists, return it immediately
    if (existingReport) {
      return new Response(JSON.stringify({
        id: existingReport.id,
        emotion_scores: existingReport.emotion_scores,
        themes: existingReport.themes,
        recommendations: existingReport.recommendations,
        highlights: existingReport.highlights,
        lowlights: existingReport.lowlights,
        week_start: existingReport.week_start,
        week_end: existingReport.week_end,
        created_at: existingReport.created_at,
        cached: true,
        isCurrentWeek: isCurrentWeek,
        ready: true,
        user_id: userId,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // No existing report - fetch entries for the week and generate a new one
    // Fetch entries from the week (Monday 00:00:00 to Sunday 23:59:59)
    // Convert the timezone-aware dates to UTC for database queries
    const weekStartUTC = convertTimezoneAwareDateToUTC(weekStart, timezone);
    const weekEndPlusOne = new Date(weekEnd);
    weekEndPlusOne.setDate(weekEndPlusOne.getDate() + 1);
    const weekEndPlusOneUTC = convertTimezoneAwareDateToUTC(weekEndPlusOne, timezone);

    console.log(`Fetching entries for timezone ${timezone || 'UTC'}:`);
    console.log(`  Local week: ${formatDateToISO(weekStart)} to ${formatDateToISO(weekEnd)}`);
    console.log(`  UTC range: ${weekStartUTC.toISOString()} to ${weekEndPlusOneUTC.toISOString()}`);

    const { data: entries, error } = await supabase
      .from('entries')
      .select('name, created_at')
      .eq('user_id', userId)
      .gte('created_at', weekStartUTC.toISOString())
      .lt('created_at', weekEndPlusOneUTC.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Database query error for entries:', error);
      return new Response(JSON.stringify({
        error: `Database error fetching entries: ${error.message}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!entries || entries.length === 0) {
      return new Response(JSON.stringify({
        error: `No journal entries found for user ${userId} for the week of ${weekStartStr} to ${weekEndStr}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    console.log(`Found ${entries.length} entries for user ${userId} in week ${weekStartStr} to ${weekEndStr}`);

    // Combine all entries for analysis
    const combinedEntries = entries
      .map((entry: any) => entry.content || entry.name || '')
      .filter((content: string) => content.trim().length > 0)
      .join('\n\n---\n\n');

    const weeklyReportPrompt = `
      You are analyzing journal entries to generate a comprehensive weekly report. You must respond with valid JSON only that exactly matches the specified schema.
      
      Analyze the following journal entry/entries:

      ${combinedEntries}

      Generate a weekly emotional report in **valid JSON only**. Follow these exact rules:

      1. Output must be valid JSON with no extra text, no comments, and no explanations.

      2. Use this structure exactly:

      {
        "emotion_scores": {
          "calm": float (0.0–1.0),
          "anger": float (0.0–1.0),
          "stress": float (0.0–1.0),
          "anxiety": float (0.0–1.0),
          "sadness": float (0.0–1.0),
          "happiness": float (0.0–1.0),
          "excitement": float (0.0–1.0),
          "hopefulness": float (0.0–1.0)
        },
        "themes": [
          "concise weekly theme (max 100 chars)",
          "concise weekly theme (max 100 chars)",
          "concise weekly theme (max 100 chars)"
        ],
        "recommendations": {
          "continue": "actionable positive habit to maintain (max 200 chars)",
          "explore": "actionable behavior or mindset to try (max 200 chars)",
          "consider": "gentle suggestion for improvement (max 200 chars)"
        },
        "highlights": [
          "specific positive moment (max 150 chars)",
          "specific positive moment (optional, max 150 chars)",
          "specific positive moment (optional, max 150 chars)"
        ],
        "lowlights": [
          "specific challenging moment (max 150 chars)",
          "specific challenging moment (optional, max 150 chars)",
          "specific challenging moment (optional, max 150 chars)"
        ]
      }

      3. Requirements for all strings:
        - Must be meaningful, specific, emotionally intelligent, and helpful.
        - Must stay within character limits.
        - Must feel empathetic, supportive, and insightful without being generic.

      4. Requirements for numbers:
        - Use decimal floats between 0.0 and 1.0.
        - Do not use whole numbers without decimals.

      5. Do not repeat the prompt or add surrounding text. Do NOT put triple backticks or any sort of markdown formatting. Output JSON ONLY.
    `;

    // Call Gemini to generate the weekly report
    const reportResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [{ text: weeklyReportPrompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: zodToJsonSchema(weeklyReportSchema)
      }
    });

    // Extract JSON from response (handles markdown code blocks)
    const cleanJsonText = extractJsonFromResponse(reportResponse.text);
    console.log('Clean JSON text:', cleanJsonText);

    // Parse and validate the AI response
    const report = weeklyReportSchema.parse(JSON.parse(cleanJsonText));

    // Store the new report in the database for this specific user
    const { data: storedReport, error: insertError } = await supabase
      .from('weekly_reports')
      .insert({
        user_id: userId,
        week_start: weekStartStr,
        week_end: weekEndStr,
        emotion_scores: report.emotion_scores,
        themes: report.themes,
        recommendations: report.recommendations,
        highlights: report.highlights,
        lowlights: report.lowlights,
      })
      .select('id, created_at')
      .single();

    if (insertError) {
      console.error('Error storing report:', insertError);
      // For errors, still return the report but log the storage failure
      console.warn('Report generated successfully but could not be stored:', insertError.message);
    }

    // Return the weekly report as JSON
    return new Response(JSON.stringify({
      id: storedReport?.id,
      emotion_scores: report.emotion_scores,
      themes: report.themes,
      recommendations: report.recommendations,
      highlights: report.highlights,
      lowlights: report.lowlights,
      week_start: weekStartStr,
      week_end: weekEndStr,
      created_at: storedReport?.created_at,
      cached: false,
      isCurrentWeek: isCurrentWeek,
      ready: true,
      user_id: userId,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request with a valid Clerk JWT token:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-weekly-report' \
    --header 'Authorization: Bearer <CLERK_JWT_TOKEN>' \
    --header 'Content-Type: application/json' \
    --data '{"timezone":"America/New_York"}'

  Note: Replace <CLERK_JWT_TOKEN> with a valid Clerk JWT token from your authenticated session.
  The function will verify the Clerk token and filter entries by the authenticated user's ID.

*/