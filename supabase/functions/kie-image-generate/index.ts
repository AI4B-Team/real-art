const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const KIE_BASE = "https://api.kie.ai/api/v1/jobs";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("KIE_AI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "KIE_AI_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { prompt, aspect_ratio = "auto", resolution } = await req.json();
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const input: Record<string, unknown> = { prompt, aspect_ratio };
    if (resolution && aspect_ratio !== "auto" && aspect_ratio !== "1:1") input.resolution = resolution;

    // Create task
    const createRes = await fetch(`${KIE_BASE}/createTask`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-image-2-text-to-image", input }),
    });
    const createJson = await createRes.json();
    if (!createRes.ok || createJson.code !== 200) {
      console.error("kie createTask error:", createJson);
      return new Response(JSON.stringify({ error: createJson.msg || "Failed to create task" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const taskId = createJson.data?.taskId;
    if (!taskId) {
      return new Response(JSON.stringify({ error: "No taskId returned" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Poll for result (up to ~120s)
    const start = Date.now();
    const TIMEOUT_MS = 120_000;
    while (Date.now() - start < TIMEOUT_MS) {
      await new Promise((r) => setTimeout(r, 3000));
      const statusRes = await fetch(`${KIE_BASE}/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const statusJson = await statusRes.json();
      console.log("poll status:", JSON.stringify(statusJson));
      const data = statusJson?.data;
      if (!data) continue;

      // kie.ai: state is "success" / "fail" / "waiting" / "queuing" / "generating"
      const state = data.state || data.status;
      if (state === "success") {
        const out = data.resultJson ? JSON.parse(data.resultJson) : data.result || {};
        const imageUrl =
          out.resultUrls?.[0] || out.imageUrls?.[0] || out.images?.[0]?.url || out.url || null;
        if (!imageUrl) {
          return new Response(JSON.stringify({ error: "No image in result", raw: out }), {
            status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ imageUrl, taskId }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (state === "fail" || state === "failed") {
        return new Response(JSON.stringify({ error: data.failMsg || "Generation failed" }), {
          status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Timed out waiting for image" }), {
      status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("kie-image-generate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
