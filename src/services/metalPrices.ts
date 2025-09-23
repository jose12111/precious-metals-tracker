import { HistoricalPriceData } from "@/types";

// IMPORTANT: Replace "YOUR_SUPABASE_FUNCTION_URL_HERE" with the actual URL
// you get after deploying your Supabase function.
const SUPABASE_METAL_PRICES_FUNCTION_URL = "YOUR_SUPABASE_FUNCTION_URL_HERE";

export const fetchCurrentMetalPrices = async () => {
  try {
    const response = await fetch(SUPABASE_METAL_PRICES_FUNCTION_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // If your Supabase function requires authentication, you might add an Authorization header here:
        // 'Authorization': `Bearer ${YOUR_CLIENT_SIDE_AUTH_TOKEN}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch live metal prices from Supabase function.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching live metal prices from Supabase function:", error);
    // Fallback to mock data if the Supabase function call fails
    const OUNCE_TO_GRAMS = 28.35;
    const BASE_GOLD_PRICE_PER_OUNCE_ZAR = 64424;
    const BASE_SILVER_PRICE_PER_GRAM_ZAR = 28;
    const MOCK_ZAR_TO_USD_RATE = 0.055;

    const goldFluctuation = (Math.random() - 0.5) * 0.02; // +/- 1%
    const silverFluctuation = (Math.random() - 0.5) * 0.03; // +/- 1.5%

    const goldPricePerOunceZAR = BASE_GOLD_PRICE_PER_OUNCE_ZAR * (1 + goldFluctuation);
    const goldPerGramZAR = goldPricePerOunceZAR / OUNCE_TO_GRAMS;
    const silverPerGramZAR = BASE_SILVER_PRICE_PER_GRAM_ZAR * (1 + silverFluctuation);

    return {
      goldPerGramZAR: parseFloat(goldPerGramZAR.toFixed(2)),
      silverPerGramZAR: parseFloat(silverPerGramZAR.toFixed(2)),
      zarToUsdRate: MOCK_ZAR_TO_USD_RATE,
    };
  }
};

export const fetchHistoricalMetalPrices = async (): Promise<HistoricalPriceData[]> => {
  // This function will continue to use mock data for historical prices.
  await new Promise((resolve) => setTimeout(resolve, 700));

  const historicalData: HistoricalPriceData[] = [];
  const today = new Date();

  const OUNCE_TO_GRAMS = 28.35;
  const BASE_GOLD_PRICE_PER_OUNCE_ZAR = 64424;
  const BASE_SILVER_PRICE_PER_GRAM_ZAR = 28;

  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split("T")[0];

    const goldPrice = (BASE_GOLD_PRICE_PER_OUNCE_ZAR / OUNCE_TO_GRAMS) * (1 + (Math.random() - 0.5) * 0.1);
    const silverPrice = BASE_SILVER_PRICE_PER_GRAM_ZAR * (1 + (Math.random() - 0.5) * 0.15);

    historicalData.push({
      date: dateString,
      gold: parseFloat(goldPrice.toFixed(2)),
      silver: parseFloat(silverPrice.toFixed(2)),
    });
  }
  return historicalData;
};