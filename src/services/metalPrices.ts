import { HistoricalPriceData } from "@/types";

// We are removing the dependency on the Supabase Edge Function for simplicity.
// All price data will now be generated as mock data directly within the application.

export const fetchCurrentMetalPrices = async () => {
  // Simulate an API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const OUNCE_TO_GRAMS = 31.1035; // Updated to Troy ounces (previously 28.35 for standard ounce)
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
  await new Promise((resolve) => setTimeout(resolve, 700));

  const historicalData: HistoricalPriceData[] = [];
  const today = new Date();

  // Fetch current prices to use as the starting point for today's historical data
  const currentMockPrices = await fetchCurrentMetalPrices();
  let goldPriceForDay = currentMockPrices.goldPerGramZAR;
  let silverPriceForDay = currentMockPrices.silverPerGramZAR;

  // Generate prices for the last 30 days, working backwards from today
  for (let i = 0; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split("T")[0];

    // Add the current day's price to the historical data
    historicalData.unshift({
      date: dateString,
      gold: parseFloat(goldPriceForDay.toFixed(2)),
      silver: parseFloat(silverPriceForDay.toFixed(2)),
    });

    // Apply small, inverse fluctuations for the previous day's price
    // This simulates a trend going backward in time
    const goldFluctuation = (Math.random() - 0.5) * 0.005 * goldPriceForDay; // +/- 0.25% daily change
    const silverFluctuation = (Math.random() - 0.5) * 0.007 * silverPriceForDay; // +/- 0.35% daily change

    goldPriceForDay = Math.max(0.1, goldPriceForDay - goldFluctuation); // Subtract fluctuation to go backward
    silverPriceForDay = Math.max(0.1, silverPriceForDay - silverFluctuation); // Subtract fluctuation to go backward
  }
  return historicalData;
};