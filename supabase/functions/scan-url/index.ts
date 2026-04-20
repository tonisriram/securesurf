import { corsHeaders } from "@supabase/supabase-js/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "Missing url" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are SecureSurf, an expert cybersecurity URL threat analyzer. Analyze the given URL for phishing, malware, scams, and other threats. Consider: HTTPS usage, domain reputation, suspicious keywords (login, verify, secure, banking), IP-based hosts, excessive subdomains, hyphen abuse, URL length, typosquatting, and known brand impersonation. Return a structured threat assessment.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this URL for threats: ${url}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_threat_assessment",
              description: "Return a structured threat assessment for the URL.",
              parameters: {
                type: "object",
                properties: {
                  threatScore: { type: "number", description: "0-100, where 0=safe, 100=highly dangerous" },
                  status: { type: "string", enum: ["safe", "warning", "danger"] },
                  category: {
                    type: "string",
                    enum: ["legitimate", "phishing", "malware", "scam", "suspicious", "unknown"],
                  },
                  explanation: {
                    type: "string",
                    description: "Plain-English explanation (2-4 sentences) of why this URL got this score.",
                  },
                  recommendation: {
                    type: "string",
                    description: "Short actionable recommendation for the user.",
                  },
                  detectedSignals: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of specific suspicious or trustworthy signals detected.",
                  },
                },
                required: ["threatScore", "status", "category", "explanation", "recommendation", "detectedSignals"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_threat_assessment" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const errText = await response.text();
      console.error("AI gateway error", response.status, errText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const assessment = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ url, ...assessment, timestamp: new Date().toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("scan-url error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
