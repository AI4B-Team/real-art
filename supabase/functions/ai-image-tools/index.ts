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
    const { action, imageUrl, prompt, width, height } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "remove-background":
        userPrompt = `Remove the background from this image completely, making it transparent. Keep only the main subject with clean edges. Output on a solid white background.`;
        break;
      case "enhance":
        userPrompt = `Enhance this image: improve clarity, color vibrancy, sharpness, and overall quality. Make it look professional and polished while keeping the same composition.`;
        break;
      case "upscale":
        userPrompt = `Upscale and enhance this image to higher quality. Improve resolution, add detail, reduce noise, and sharpen edges while maintaining the original composition.`;
        break;
      case "style-transfer":
        userPrompt = prompt || `Apply a cinematic color grade to this image with rich contrast and warm tones.`;
        break;
      case "colorize":
        userPrompt = `Colorize this image naturally if it's black and white. Add realistic, vibrant colors.`;
        break;
      case "restore":
        userPrompt = `Restore this image: fix any damage, remove scratches, reduce noise, improve clarity, and enhance colors while preserving the original subject.`;
        break;
      case "generate":
        userPrompt = prompt || "Generate a beautiful image";
        break;
      default:
        userPrompt = prompt || "Enhance this image";
    }

    const messages: any[] = [{ role: "user", content: [] as any[] }];

    if (imageUrl && action !== "generate") {
      messages[0].content.push({ type: "text", text: userPrompt });
      messages[0].content.push({
        type: "image_url",
        image_url: { url: imageUrl },
      });
    } else {
      messages[0].content = userPrompt;
    }

    const model =
      action === "generate"
        ? "google/gemini-3-pro-image-preview"
        : "google/gemini-2.5-flash-image";

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          modalities: ["image", "text"],
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
          JSON.stringify({
            error:
              "Credits exhausted. Please add funds in Settings > Workspace > Usage.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", status, errText);
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const resultImage =
      data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const resultText = data.choices?.[0]?.message?.content;

    return new Response(
      JSON.stringify({ success: true, imageUrl: resultImage, text: resultText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("ai-image-tools error:", e);
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
