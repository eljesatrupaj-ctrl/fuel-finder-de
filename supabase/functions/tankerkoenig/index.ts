import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.105.3/cors";

const API_BASE = "https://creativecommons.tankerkoenig.de/json";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("TANKERKOENIG_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "TANKERKOENIG_API_KEY mungon. Shtoje në Cloud secrets.",
          missingKey: true,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "list";

    let target: string;
    if (action === "list") {
      const lat = url.searchParams.get("lat");
      const lng = url.searchParams.get("lng");
      const rad = url.searchParams.get("rad") || "10";
      const type = url.searchParams.get("type") || "all";
      const sort = url.searchParams.get("sort") || "dist";
      if (!lat || !lng) {
        return new Response(JSON.stringify({ error: "lat/lng required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      target = `${API_BASE}/list.php?lat=${lat}&lng=${lng}&rad=${rad}&sort=${sort}&type=${type}&apikey=${apiKey}`;
    } else if (action === "detail") {
      const id = url.searchParams.get("id");
      if (!id) {
        return new Response(JSON.stringify({ error: "id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      target = `${API_BASE}/detail.php?id=${id}&apikey=${apiKey}`;
    } else {
      return new Response(JSON.stringify({ error: "unknown action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch(target);
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
