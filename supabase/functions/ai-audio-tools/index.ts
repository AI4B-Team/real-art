import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { action, text, voice, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "text-to-speech":
        systemPrompt =
          "You are a voice synthesis assistant. Generate natural, expressive speech from the provided text. Respond with the spoken text clearly.";
        userPrompt = `Generate voiceover for: "${text}". Voice style: ${voice || "professional narrator"}. Language: ${language || "English"}.`;
        break;
      case "generate-script":
        systemPrompt =
          "You are a professional scriptwriter for video content.";
        userPrompt = `Write a compelling ${language || "30-second"} video script about: ${text}. Include scene descriptions and voiceover text.`;
        break;
      case "generate-captions":
        systemPrompt =
          "You are a caption/subtitle generator. Generate timed captions in SRT format.";
        userPrompt = `Generate SRT captions for this script: "${text}". Estimate timing for natural speech pace.`;
        break;
      case "translate":
        systemPrompt =
          "You are a professional translator for video content.";
        userPrompt = `Translate this text to ${language || "Spanish"}: "${text}". Maintain the tone and style suitable for video narration.`;
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again shortly." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Credits exhausted. Add funds in Settings > Workspace > Usage." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("ai-audio-tools error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
