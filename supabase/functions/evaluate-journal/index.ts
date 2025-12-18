/// <reference path="./deno.d.ts" />

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"
import { GoogleGenAI } from "npm:@google/generative-ai"
import { z } from "npm:zod"
import { zodToJsonSchema } from "npm:zod-to-json-schema"

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

const weeklyReportSchema = z.object({
  emotion_scores: emotionScoresSchema.describe("Average emotion scores across all entries."),
  themes: z.array(z.string()).describe("Key recurring themes, patterns, or topics identified across the journal entries (3-5 themes)."),
  recommendations: z.array(z.string()).describe("Actionable recommendations based on the patterns observed (3-5 recommendations)."),
  highlights: z.array(z.string()).describe("Positive moments, achievements, or uplifting observations from the week (3-5 highlights)."),
  lowlights: z.array(z.string()).describe("Challenging moments, concerns, or areas that need attention from the week (3-5 lowlights)."),
})

const ai = new GoogleGenAI(Deno.env.get('GEMINI_API_KEY')!);

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization header for Supabase
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: "Authorization header required"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch entries from the last 7 days
    const { data: entries, error } = await supabase
      .from('entries')
      .select('content, name, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      return new Response(JSON.stringify({
        error: `Database error: ${error.message}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!entries || entries.length === 0) {
      return new Response(JSON.stringify({
        error: "No journal entries found in the last 7 days"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // Combine all entries for analysis
    const combinedEntries = entries
      .map((entry: any) => entry.content || entry.name || '')
      .filter((content: string) => content.trim().length > 0)
      .join('\n\n---\n\n');

    const weeklyReportPrompt = `
      You are analyzing journal entries to generate a comprehensive weekly report.
      
      Analyze the following journal entry/entries and provide insights:

      ${combinedEntries}

      Generate a weekly report that includes:
      1. Average emotion scores across all entries (calm, anger, stress, anxiety, sadness, happiness, excitement, hopefulness)
      2. Key recurring themes, patterns, or topics (3-5 themes)
      3. Actionable recommendations based on observed patterns (3-5 recommendations)
      4. Positive highlights from the week (3-5 highlights)
      5. Challenging moments or areas needing attention (3-5 lowlights)

      Be thoughtful, empathetic, and constructive in your analysis.
    `;

    // Call Gemini to generate the weekly report
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const reportResponse = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: weeklyReportPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: zodToJsonSchema(weeklyReportSchema)
      }
    });

    // Parse and validate the AI response
    const report = weeklyReportSchema.parse(JSON.parse(reportResponse.response.text()));

    // Return the weekly report as JSON
    return new Response(JSON.stringify({
      emotion_scores: report.emotion_scores,
      themes: report.themes,
      recommendations: report.recommendations,
      highlights: report.highlights,
      lowlights: report.lowlights,
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
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/evaluate-journal' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

