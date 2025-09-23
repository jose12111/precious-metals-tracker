export type MetalType = "Gold" | "Silver";
export type WeightUnit = "Ounces" | "Grams";
export type Currency = "ZAR" | "USD";

export interface Coin {
  id: string;
  name: string;
  metalType: MetalType;
  quantity: number;
  weight: number; // Total weight
  weightUnit: WeightUnit;
}

export interface Jewellery {
  id: string;
  name: string; // e.g., "Necklace", "Ring"
  metalType: MetalType;
  weight: number; // Total weight
  weightUnit: WeightUnit;
  description?: string; // Optional description for the item
  karat?: number; // Optional: for gold jewellery (e.g., 24, 22, 18, 9)
}

export interface HistoricalPriceData {
  date: string; // YYYY-MM-DD
  gold: number;
  silver: number;
}