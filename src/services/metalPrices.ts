import { HistoricalPriceData } from "@/types";

// Mock current prices (per gram for simplicity, assuming 1 ounce = 28.35 grams)
// In a real app, these would come from an API.
const OUNCE_TO_GRAMS = 28.35;
const MOCK_GOLD_PRICE_PER_OUNCE_ZAR = 64424; // User provided value
const MOCK_GOLD_PRICE_PER_GRAM_ZAR = MOCK_GOLD_PRICE_PER_OUNCE_ZAR / OUNCE_TO_GRAMS; // Calculated from ounce price
const MOCK_SILVER_PRICE_PER_GRAM_ZAR = 28; // Example: R28 per gram of silver (updated for realism)
const MOCK_ZAR_TO_USD_RATE = 0.055; // Example: 1 ZAR = 0.055 USD

export const fetchCurrentMetalPrices = async () => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    goldPerGramZAR: MOCK_GOLD_PRICE_PER_GRAM_ZAR,
    silverPerGramZAR: MOCK_SILVER_PRICE_PER_GRAM_ZAR,
    zarToUsdRate: MOCK_ZAR_TO_USD_RATE,
  };
};

export const fetchHistoricalMetalPrices = async (): Promise<HistoricalPriceData[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 700));

  const historicalData: HistoricalPriceData[] = [];
  const today = new Date();

  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split("T")[0];

    // Simulate price fluctuations based on the new mock prices
    const goldPrice = MOCK_GOLD_PRICE_PER_GRAM_ZAR * (1 + (Math.random() - 0.5) * 0.1); // +/- 5% fluctuation
    const silverPrice = MOCK_SILVER_PRICE_PER_GRAM_ZAR * (1 + (Math.random() - 0.5) * 0.15); // +/- 7.5% fluctuation

    historicalData.push({
      date: dateString,
      gold: parseFloat(goldPrice.toFixed(2)),
      silver: parseFloat(silverPrice.toFixed(2)),
    });
  }
  return historicalData;
};