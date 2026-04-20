const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function heuristicCheck(url: string) {
  let score = 0;
  const signals: string[] = [];

  if (url.length > 75) {
    score += 20;
    signals.push("Long URL");
  }
  if (url.includes("@")) {
    score += 20;
    signals.push("Contains @ symbol");
  }
  if (url.match(/https?:\/\/\d+\.\d+\.\d+\.\d+/)) {
    score += 30;
    signals.push("IP-based URL");
  }
  if (url.includes("-")) {
    score += 10;
    signals.push("Suspicious hyphen usage");
  }
  return { score, signals };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const heuristic = heuristicCheck(url);

    // Gemini AI call
    let aiResult: { score: number; category: string; explanation: string; signals: string[] } | null = null;
    let aiFailed = false;

    try {
      const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
      if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analyze this URL for security risk and respond ONLY in raw JSON (no markdown, no code fences) with this exact shape:
{
  "score": number (0-100),
  "category": "safe" | "phishing" | "malware" | "suspicious",
  "explanation": "short explanation (2-3 sentences)",
  "signals": ["list", "of", "reasons"]
}
URL: ${url}`,
                  },
                ],
              },
            ],
            generationConfig: { responseMimeType: "application/json" },
          }),
        },
      );

      if (!geminiResponse.ok) {
        const errText = await geminiResponse.text();
        console.error("Gemini error", geminiResponse.status, errText);
        throw new Error(`Gemini API ${geminiResponse.status}`);
      }

      const data = await geminiResponse.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("No text in Gemini response");
      aiResult = JSON.parse(text);
    } catch (err) {
      console.log("AI failed:", err);
      aiFailed = true;
    }

    // Merge
    let finalScore = heuristic.score;
    let category = "safe";
    let explanation = "No major threats detected";
    let signals = [...heuristic.signals];

    if (aiResult) {
      finalScore = Math.min(100, Math.round(heuristic.score * 0.4 + aiResult.score * 0.6));
      category = aiResult.category;
      explanation = aiResult.explanation;
      signals = [...new Set([...signals, ...(aiResult.signals || [])])];
    } else {
      if (finalScore > 60) category = "malware";
      else if (finalScore > 30) category = "suspicious";
    }

    const result = {
      url,
      score: Math.min(100, finalScore),
      status: finalScore < 30 ? "safe" : finalScore < 60 ? "warning" : "danger",
      category,
      explanation,
      signals,
      ai_used: !aiFailed,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("scan-url error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
