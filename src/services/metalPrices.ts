import { HistoricalPriceData } from "@/types";

// We are removing the dependency on the Supabase Edge Function for simplicity.
// All price data will now be generated as mock data directly within the application.

export const fetchCurrentMetalPrices = async () => {
  // Simulate an API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const OUNCE_TO_GRAMS = 28.35;
  const BASE_GOLD_PRICE_PER_OUNCE_ZAR = 64424;
  const BASE_SILVER_PRICE_PER_GRAM_ZAR = 28;
  const MOCK_ZAR_TO_USD_RATE = 0.055;

  // Introduce a small random fluctuation for "live" effect
  const goldFluctuation = (Math.random() - 0.5) * 0.03; // +/- 1.5%
  const silverFluctuation = (Math.random() - 0.5) * 0.04; // +/- 2%

  const goldPricePerOunceZAR = BASE_GOLD_PRICE_PER_OUNCE_ZAR * (1 + goldFluctuation);
  const goldPerGramZAR = goldPricePerOunceZAR / OUNCE_TO_GRAMS;
  const silverPerGramZAR = BASE_SILVER_PRICE_PER_GRAM_ZAR * (1 + silverFluctuation);

  return {
    goldPerGramZAR: parseFloat(goldPerGramZAR.toFixed(2)),
    silverPerGramZAR: parseFloat(silverPerGramZAR.toFixed(2)),
    zarToUsdRate: MOCK_ZAR_TO_USD_RATE,
  };
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