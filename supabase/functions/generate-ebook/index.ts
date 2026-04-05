import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODEL_MAP: Record<string, string> = {
  auto: "google/gemini-2.5-pro",
  "gemini-3-flash": "google/gemini-3-flash-preview",
  "gemini-2.5-pro": "google/gemini-2.5-pro",
  "gpt-5": "openai/gpt-5",
  "gpt-5-mini": "openai/gpt-5-mini",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, prompt, model, language, tone, chapters, wordsPerChapter, title, chapterTitle, chapterDescription, chapterTopics, pageContent } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const resolvedModel = MODEL_MAP[model] || MODEL_MAP["auto"];
    const langInstruction = language && language !== "en" ? `Write all content in ${language}.` : "";

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "generate-outline") {
      systemPrompt = `You are a world-class book author and content strategist. Generate a detailed book outline with title suggestions and chapter structure. ${langInstruction}
      
Respond ONLY with valid JSON matching this schema:
{
  "titles": ["string array of 8-10 creative, compelling title suggestions"],
  "description": "string - a compelling 1-2 sentence book description",
  "chapters": [
    {
      "title": "string",
      "description": "string - 1-2 sentence chapter summary",
      "topics": ["string array of 2-4 key topics"],
      "pageCount": number (5-15)
    }
  ]
}`;
      userPrompt = `Create a comprehensive book outline about: "${prompt}"

Requirements:
- Tone: ${tone || "professional"}
- Target chapters: ${chapters || 8}
- Words per chapter: approximately ${wordsPerChapter || 2000}
- Generate 8-10 creative, marketable title suggestions
- Each chapter should have clear topics and estimated page counts
- Make the outline practical, actionable, and engaging`;

    } else if (action === "generate-chapter") {
      systemPrompt = `You are a bestselling author writing a chapter for a book titled "${title}". Write engaging, well-structured content that is informative and keeps readers hooked. ${langInstruction}

Respond ONLY with valid JSON:
{
  "pages": [
    {
      "title": "string - page heading or subheading",
      "content": "string - 200-400 words of rich, well-written content for this page. Use paragraphs.",
      "type": "chapter-page"
    }
  ]
}`;
      userPrompt = `Write the chapter: "${chapterTitle}"
Description: ${chapterDescription}
Key topics to cover: ${(chapterTopics || []).join(", ")}
Tone: ${tone || "professional"}
Target length: approximately ${wordsPerChapter || 2000} words total across all pages.
Break the content into logical pages (each 200-400 words).`;

    } else if (action === "generate-page") {
      systemPrompt = `You are a bestselling author. Write content for a single page of a book titled "${title}". ${langInstruction}

Respond ONLY with valid JSON:
{
  "content": "string - 200-400 words of polished, engaging content"
}`;
      userPrompt = `Write content for this page.
Chapter: ${chapterTitle}
Page context: ${pageContent || "Continue from previous content"}
Tone: ${tone || "professional"}`;

    } else if (action === "generate-full-book") {
      // For auto model, use the most powerful model for full book generation
      systemPrompt = `You are a world-class author writing a complete book. Generate the full content broken into chapters and pages. ${langInstruction}

Respond ONLY with valid JSON:
{
  "chapters": [
    {
      "title": "string",
      "pages": [
        {
          "title": "string - page heading",
          "content": "string - 200-400 words of rich content"
        }
      ]
    }
  ]
}`;
      userPrompt = `Write a complete book titled "${title}" about: "${prompt}"
Tone: ${tone || "professional"}
Chapters: ${chapters || 8}
Words per chapter: approximately ${wordsPerChapter || 2000}
Make it engaging, practical, and well-structured. Each chapter should have 3-6 pages.`;

    } else {
      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: resolvedModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please wait a moment and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    // Extract JSON from the response (handle markdown code blocks)
    let jsonStr = rawContent;
    const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1].trim();

    try {
      const parsed = JSON.parse(jsonStr);
      return new Response(JSON.stringify({ result: parsed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      console.error("Failed to parse AI response as JSON:", jsonStr.substring(0, 500));
      return new Response(JSON.stringify({ error: "AI returned invalid format. Please try again." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("generate-ebook error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
