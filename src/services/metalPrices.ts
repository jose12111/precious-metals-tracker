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

  // Get a baseline from the current mock prices for the most recent day
  const currentMockPrices = await fetchCurrentMetalPrices();
  let currentGoldPrice = currentMockPrices.goldPerGramZAR;
  let currentSilverPrice = currentMockPrices.silverPerGramZAR;

  // Generate prices for the last 30 days, working backwards
  for (let i = 0; i <= 30; i++) { // Loop from 0 (today) to 30 (30 days ago)
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split("T")[0];

    // Introduce small, cumulative fluctuations to simulate a trend
    // The fluctuations are a percentage of the current price to keep them relative
    const goldFluctuation = (Math.random() - 0.5) * 0.005 * currentGoldPrice; // +/- 0.25% daily change
    const silverFluctuation = (Math.random() - 0.5) * 0.007 * currentSilverPrice; // +/- 0.35% daily change

    // Apply fluctuation and ensure prices don't go negative (though unlikely with these small changes)
    currentGoldPrice = Math.max(0.1, currentGoldPrice + goldFluctuation);
    currentSilverPrice = Math.max(0.1, currentSilverPrice + silverFluctuation);

    historicalData.unshift({ // Add to the beginning of the array to keep dates in ascending order
      date: dateString,
      gold: parseFloat(currentGoldPrice.toFixed(2)),
      silver: parseFloat(currentSilverPrice.toFixed(2)),
    });
  }
  return historicalData;
};