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

const normalizeTitle = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      action,
      prompt,
      model,
      language,
      tone,
      chapters,
      wordsPerChapter,
      title,
      chapterTitle,
      chapterDescription,
      chapterTopics,
      pageContent,
      pageCount,
      excludeTitles,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const defaultModel = MODEL_MAP[model] || MODEL_MAP.auto;
    const resolvedModel =
      action === "generate-chapter" && (!model || model === "auto")
        ? "google/gemini-2.5-flash"
        : defaultModel;
    const langInstruction = language && language !== "en" ? `Write all content in ${language}.` : "";
    const excludedTitles = Array.isArray(excludeTitles)
      ? excludeTitles
          .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
          .map((value) => value.trim())
          .slice(0, 12)
      : [];

    const excludedTitlesInstruction = excludedTitles.length > 0
      ? `

Fresh-title requirements:
- Generate a materially different set of title ideas than the previous batch
- Do NOT reuse or lightly remix any of these prior titles:
${excludedTitles.map((value) => `  • ${value}`).join("\n")}
- Use fresh hooks, lead phrases, metaphors, and positioning angles`
      : "";

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "generate-outline") {
      systemPrompt = `You are a world-class book author and content strategist. Generate a detailed book outline with title suggestions and chapter structure. ${langInstruction}

Respond ONLY with valid JSON matching this schema:
{
  "titles": ["string array of 8-10 creative, compelling title suggestions"],
  "recommendedIndex": number (0-based index of the single best title - pick the one with the strongest market appeal, clarity, and hook. It does NOT have to be the last one. Vary your pick.),
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
- Make the outline practical, actionable, and engaging${excludedTitlesInstruction}`;
    } else if (action === "generate-chapter") {
      const targetPageCount = Math.max(1, Math.min(12, Number(pageCount) || 5));
      const wordsPerPage = Math.max(220, Math.round((wordsPerChapter || 2000) / targetPageCount));

      systemPrompt = `You are a bestselling author writing a chapter for a book titled "${title}". Write engaging, well-structured content that is informative and keeps readers hooked. ${langInstruction}

Respond ONLY with valid JSON:
{
  "pages": [
    {
      "title": "string - specific page heading or subheading tied to the exact content on that page",
      "content": "string - ${wordsPerPage}-${wordsPerPage + 120} words of rich, well-written content for this page. Use multiple paragraphs. Include specific examples, data points, actionable advice, or compelling stories.",
      "imagePrompt": "string - a detailed prompt to generate a relevant illustration or photo that directly matches the exact topic, subject matter, and examples on this page",
      "type": "chapter-page"
    }
  ]
}`;
      userPrompt = `Write the chapter: "${chapterTitle}"
Description: ${chapterDescription}
Key topics to cover: ${(chapterTopics || []).join(", ")}
Tone: ${tone || "professional"}
Target length: approximately ${wordsPerChapter || 2000} words total across all pages.
Target pages: exactly ${targetPageCount}.

IMPORTANT RULES:
- Return EXACTLY ${targetPageCount} logical pages.
- Each page should contain roughly ${wordsPerPage}-${wordsPerPage + 120} words so the full chapter lands close to ${wordsPerChapter || 2000} words.
- Each page MUST have substantial, detailed content - never leave pages empty.
- Write in flowing paragraphs with real substance: examples, statistics, case studies, actionable steps.
- Each page title must be specific to that page section. Avoid generic titles like "Content Page" or "Overview".
- Each page should also include an imagePrompt describing a relevant visual that clearly matches that page's exact content, examples, and context.
- Do not repeat the same image idea across pages unless absolutely necessary.
- Do NOT write placeholder or filler text. Every sentence should add value.`;
    } else if (action === "generate-page") {
      systemPrompt = `You are a bestselling author. Write content for a single page of a book titled "${title}". ${langInstruction}

Respond ONLY with valid JSON:
{
  "content": "string - 300-500 words of polished, engaging content with multiple paragraphs",
  "imagePrompt": "string - a detailed prompt to generate a relevant illustration for this page"
}`;
      userPrompt = `Write content for this page.
Chapter: ${chapterTitle}
Page context: ${pageContent || "Continue from previous content"}
Tone: ${tone || "professional"}

IMPORTANT: Write at least 300 words of substantial content with real examples and actionable advice.`;
    } else if (action === "generate-full-book") {
      systemPrompt = `You are a world-class author writing a complete book. Generate the full content broken into chapters and pages. ${langInstruction}

CRITICAL: Every single page MUST contain 300-500 words of real, substantive content. No page should ever be empty or have less than 200 words.

Respond ONLY with valid JSON:
{
  "chapters": [
    {
      "title": "string - chapter title",
      "pages": [
        {
          "title": "string - descriptive page heading",
          "content": "string - 300-500 words of rich, detailed content with multiple paragraphs. Include examples, data, stories, and actionable advice.",
          "imagePrompt": "string - a detailed description for generating a relevant image (e.g. 'A diverse team analyzing data dashboards in a bright modern office')"
        }
      ]
    }
  ]
}`;
      userPrompt = `Write a complete book titled "${title}" about: "${prompt}"
Tone: ${tone || "professional"}
Number of chapters: ${chapters || 8}
Words per chapter: approximately ${wordsPerChapter || 2000}

CRITICAL REQUIREMENTS:
1. Each chapter MUST have 4-6 content pages.
2. Every page MUST have 300-500 words of real, substantive content — NEVER leave a page empty or with just a sentence.
3. Write in flowing paragraphs with specific examples, case studies, statistics, and actionable steps.
4. Each page must include an imagePrompt for a relevant visual illustration.
5. Do NOT write generic filler. Every paragraph should teach something valuable.
6. Use engaging storytelling, real-world examples, and practical frameworks.
7. Each page title should be a meaningful subheading that describes the content.`;
    } else {
      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const requestTemperature = action === "generate-outline" && excludedTitles.length > 0 ? 1 : 0.7;

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
        temperature: requestTemperature,
      max_tokens: 32000,
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

    const responseText = await response.text();
    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("AI gateway returned non-JSON:", responseText.substring(0, 500));
      return new Response(JSON.stringify({ error: "AI returned an empty or invalid response. Please try again.", retryable: true }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const rawContent = data.choices?.[0]?.message?.content || "";
    const finishReason = data.choices?.[0]?.finish_reason;

    if (finishReason === "length" || finishReason === "MAX_TOKENS") {
      console.warn("AI response was truncated due to token limits. finishReason:", finishReason);
    }

    let jsonStr = rawContent;
    const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1].trim();

    try {
      const parsed = JSON.parse(jsonStr);

      if (action === "generate-chapter" && Array.isArray(parsed.pages)) {
        parsed.pages = parsed.pages.filter((p: any) =>
          p && typeof p.title === "string" && typeof p.content === "string" && p.content.trim().length > 30
        );
      }

      if (action === "generate-outline" && Array.isArray(parsed.titles)) {
        const blockedTitles = new Set(excludedTitles.map(normalizeTitle));
        const seenTitles = new Set<string>();

        parsed.titles = parsed.titles.filter((value: unknown): value is string => {
          if (typeof value !== "string") return false;
          const normalized = normalizeTitle(value);
          if (!normalized) return false;
          if (blockedTitles.has(normalized) || seenTitles.has(normalized)) return false;
          seenTitles.add(normalized);
          return true;
        });
      }

      return new Response(JSON.stringify({ result: parsed, truncated: finishReason === "length" || finishReason === "MAX_TOKENS" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      console.error("Failed to parse AI response as JSON:", jsonStr.substring(0, 800));

      // Attempt to recover truncated JSON for chapter generation
      if (action === "generate-chapter" || action === "generate-full-book") {
        try {
          // Try to extract complete page objects from truncated JSON
          const pageMatches = [...jsonStr.matchAll(/\{\s*"title"\s*:\s*"([^"]+)"\s*,\s*"content"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"imagePrompt"\s*:\s*"((?:[^"\\]|\\.)*)"\s*(?:,\s*"type"\s*:\s*"[^"]*"\s*)?\}/g)];
          if (pageMatches.length > 0) {
            const recoveredPages = pageMatches
              .map(m => ({ title: m[1], content: m[2].replace(/\\n/g, '\n').replace(/\\"/g, '"'), imagePrompt: m[3], type: "chapter-page" }))
              .filter(p => p.content.trim().length > 30);
            if (recoveredPages.length > 0) {
              console.log(`Recovered ${recoveredPages.length} pages from truncated JSON`);
              return new Response(JSON.stringify({ result: { pages: recoveredPages }, truncated: true }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              });
            }
          }
        } catch (recoveryError) {
          console.error("JSON recovery also failed:", recoveryError);
        }
      }

      return new Response(JSON.stringify({ error: "AI returned invalid format. Please try again.", retryable: true }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("generate-ebook error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});