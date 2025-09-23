import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  try {
    // In a real scenario, you would validate an API key or authentication token
    // if your function requires it for security.
    // const authHeader = req.headers.get("Authorization");
    // if (!authHeader || !authHeader.startsWith("Bearer ")) {
    //   return new Response("Unauthorized", { status: 401 });
    // }

    // --- IMPORTANT: Replace this mock data with a real API call ---
    // Example of how you might fetch from a real external API (e.g., goldapi.io):
    // const apiKey = Deno.env.get("METAL_PRICE_API_KEY"); // Get API key from Supabase secrets
    // const goldApiResponse = await fetch(`https://www.goldapi.io/api/XAU/USD`, {
    //   headers: {
    //     'x-access-token': apiKey,
    //     'Content-Type': 'application/json'
    //   }
    // });
    // const goldData = await goldApiResponse.json();
    // const goldPricePerOunceUSD = goldData.price; // Adjust based on actual API response structure

    // For now, we'll use mock data with random fluctuations to simulate live prices.
    const OUNCE_TO_GRAMS = 28.35;
    const BASE_GOLD_PRICE_PER_OUNCE_ZAR = 64424; // Base price for gold
    const BASE_SILVER_PRICE_PER_GRAM_ZAR = 28; // Base price for silver
    const MOCK_ZAR_TO_USD_RATE = 0.055;

    // Introduce a small random fluctuation for "live" effect
    const goldFluctuation = (Math.random() - 0.5) * 0.03; // +/- 1.5%
    const silverFluctuation = (Math.random() - 0.5) * 0.04; // +/- 2%

    const goldPricePerOunceZAR = BASE_GOLD_PRICE_PER_OUNCE_ZAR * (1 + goldFluctuation);
    const goldPerGramZAR = goldPricePerOunceZAR / OUNCE_TO_GRAMS;
    const silverPerGramZAR = BASE_SILVER_PRICE_PER_GRAM_ZAR * (1 + silverFluctuation);

    const prices = {
      goldPerGramZAR: parseFloat(goldPerGramZAR.toFixed(2)),
      silverPerGramZAR: parseFloat(silverPerGramZAR.toFixed(2)),
      zarToUsdRate: MOCK_ZAR_TO_USD_RATE,
    };

    return new Response(JSON.stringify(prices), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Supabase function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});