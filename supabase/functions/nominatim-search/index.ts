// UeiDo Edge Function: proxy for Nominatim (OpenStreetMap) geocoding.
// Nominatim requires a valid User-Agent; calling from the browser can trigger CORS preflight.
// This function adds User-Agent and returns results to the client.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "UeiDo-Fitness-App/1.0 (https://github.com/ueido)";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    let q: string | null = null;
    let limit = 5;
    const url = new URL(req.url);
    if (req.method === "GET") {
      q = url.searchParams.get("q");
      limit = Math.min(10, Math.max(1, parseInt(url.searchParams.get("limit") ?? "5", 10) || 5));
    } else if (req.method === "POST") {
      const body = (await req.json()) as { q?: string; limit?: number };
      q = body?.q ?? null;
      limit = body?.limit != null ? Math.min(10, Math.max(1, body.limit)) : 5;
    }
    if (!q || !String(q).trim()) {
      return new Response(
        JSON.stringify({ error: "Missing query parameter 'q'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const params = new URLSearchParams({
      format: "json",
      q: String(q).trim(),
      limit: String(limit),
    });
    const res = await fetch(`${NOMINATIM_BASE}?${params.toString()}`, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "Geocoding service error", status: res.status }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Search failed", message: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
