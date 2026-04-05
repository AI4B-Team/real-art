import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ACTION_PROMPTS: Record<string, string> = {
  "improve-writing": "Improve the writing quality, clarity, and flow of this text. Keep the same meaning and approximate length.",
  "fix-spelling": "Fix all spelling and grammar errors in this text. Keep everything else unchanged.",
  "make-shorter": "Make this text shorter and more concise while preserving the key meaning.",
  "make-longer": "Expand this text with more detail, examples, or elaboration while keeping the same style.",
  "plain-language": "Rewrite this text in plain, simple language that anyone can understand.",
  "change-focus": "Rewrite this text with a shifted emphasis, highlighting different aspects.",
  "simplify": "Simplify the language using shorter words and simpler sentence structures.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { text, action, tone, prompt, texts, customInstruction } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt: string;
    let userPrompt: string;

    // Batch mode: translate or custom instruction on multiple texts
    if (action === "custom" && texts && customInstruction) {
      systemPrompt = "You are a professional text editor and translator. Follow the instruction exactly. Return ONLY valid JSON with no markdown formatting, no code fences, no explanations.";
      userPrompt = `${customInstruction}\n\nTexts:\n${JSON.stringify(texts)}`;
    } else {
      // Single text mode
      systemPrompt = "You are a professional text editor for an ebook creator. Return ONLY the edited text with no explanations, no quotes, no markdown formatting. Just the raw edited text.";
      
      if (prompt) {
        userPrompt = `Apply this instruction to the text: "${prompt}"\n\nText:\n${text}`;
      } else if (action === "change-tone" && tone) {
        userPrompt = `Rewrite this text in a ${tone} tone. Keep the same meaning.\n\nText:\n${text}`;
      } else {
        userPrompt = `${ACTION_PROMPTS[action] || ACTION_PROMPTS["improve-writing"]}\n\nText:\n${text}`;
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim() || text || "";

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-text-edit error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
