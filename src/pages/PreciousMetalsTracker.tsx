"use client";

import React, { useState, useEffect } from "react";
import { Coin, Jewellery, MetalType, WeightUnit, Currency } from "@/types";
import { fetchCurrentMetalPrices } from "@/services/metalPrices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { v4 as uuidv4 } from 'uuid';
import { showSuccess, showError } from "@/utils/toast";
import { Switch } from "@/components/ui/switch";
import GoldCoinLogo from "@/components/GoldCoinLogo"; // Import the new logo component

const PreciousMetalsTracker = () => {
  // Nisab Thresholds
  const NISAB_GOLD_GRAMS = 87.48;
  const NISAB_GOLD_OUNCES = 2.81; // Troy ounces
  const NISAB_SILVER_GRAMS = 612.36;
  const NISAB_SILVER_OUNCES = 19.687; // Troy ounces
  const OUNCE_TO_GRAMS = 31.1035; // Updated to Troy ounces (previously 28.35 for standard ounce)

  // Initialize state from localStorage or empty array
  const [coins, setCoins] = useState<Coin[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCoins = localStorage.getItem("preciousMetalsCoins");
      return savedCoins ? JSON.parse(savedCoins) : [];
    }
    return [];
  });
  const [jewellery, setJewellery] = useState<Jewellery[]>(() => {
    if (typeof window !== 'undefined') {
      const savedJewellery = localStorage.getItem("preciousMetalsJewellery");
      return savedJewellery ? JSON.parse(savedJewellery) : [];
    }
    return [];
  });

  const [currentCurrency, setCurrentCurrency] = useState<Currency>("ZAR");
  const [currentPrices, setCurrentPrices] = useState<{
    goldPerGramZAR: number;
    silverPerGramZAR: number;
    zarToUsdRate: number;
  } | null>(null);

  // New states for manual price input
  const [useManualPrices, setUseManualPrices] = useState(false);
  const [manualGoldPricePerGramZAR, setManualGoldPricePerGramZAR] = useState(0);
  const [manualSilverPricePerGramZAR, setManualSilverPricePerGramZAR] = useState(0);

  // Form states for adding coins
  const [newCoinName, setNewCoinName] = useState("");
  const [newCoinMetalType, setNewCoinMetalType] = useState<MetalType>("Gold");
  const [newCoinQuantity, setNewCoinQuantity] = useState(1);
  const [newCoinWeight, setNewCoinWeight] = useState(1); // Default to 1 ounce
  const [newCoinWeightUnit, setNewCoinWeightUnit] = useState<WeightUnit>("Ounces"); // Default to Ounces
  const [selectedCoinOunceOption, setSelectedCoinOunceOption] = useState<string>("1"); // Default to 1 oz

  // Form states for adding jewellery
  const [newJewelleryName, setNewJewelleryName] = useState("");
  const [newJewelleryMetalType, setNewJewelleryMetalType] = useState<MetalType>("Gold");
  const [newJewelleryWeight, setNewJewelleryWeight] = useState(0); // Default to 0 grams
  const [newJewelleryWeightUnit, setNewJewelleryWeightUnit] = useState<WeightUnit>("Grams"); // Default to Grams
  const [newJewelleryDescription, setNewJewelleryDescription] = useState("");
  const [newJewelleryKarat, setNewJewelleryKarat] = useState<number>(24); // Default to 24K for gold
  const [selectedJewelleryOunceOption, setSelectedJewelleryOunceOption] = useState<string>("custom"); // Default to custom for grams

  // State for Zakah calculation results
  const [zakahResult, setZakahResult] = useState<{
    amountZAR: number;
    goldHoldingsGrams: number;
    silverHoldingsGrams: number;
    message: string;
  } | null>(null);

  useEffect(() => {
    const loadPrices = async () => {
      try {
        const prices = await fetchCurrentMetalPrices();
        setCurrentPrices(prices);
        // Pre-fill manual prices with fetched prices
        setManualGoldPricePerGramZAR(prices.goldPerGramZAR);
        setManualSilverPricePerGramZAR(prices.silverPerGramZAR);
      } catch (error) {
        console.error("Failed to fetch metal prices:", error);
        showError("Failed to load metal prices.");
      }
    };
    loadPrices();
  }, []);

  // Effect to save coins to localStorage whenever coins state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("preciousMetalsCoins", JSON.stringify(coins));
    }
  }, [coins]);

  // Effect to save jewellery to localStorage whenever jewellery state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("preciousMetalsJewellery", JSON.stringify(jewellery));
    }
  }, [jewellery]);

  // Derived effective prices based on manual input toggle
  const effectiveGoldPricePerGramZAR = useManualPrices
    ? manualGoldPricePerGramZAR
    : currentPrices?.goldPerGramZAR || 0;

  const effectiveSilverPricePerGramZAR = useManualPrices
    ? manualSilverPricePerGramZAR
    : currentPrices?.silverPerGramZAR || 0;

  const convertWeightToGrams = (weight: number, unit: WeightUnit) => {
    // Using standard OUNCE_TO_GRAMS for general conversion, but troy ounce is 31.1035g
    // For simplicity, we'll use 28.35g for input conversion and clarify Nisab in troy ounces.
    return unit === "Ounces" ? weight * OUNCE_TO_GRAMS : weight;
  };

  // Helper to get the effective price per gram based on metal type
  const getEffectiveMetalPricePerGramZAR = (metalType: MetalType) => {
    return metalType === "Gold" ? effectiveGoldPricePerGramZAR : effectiveSilverPricePerGramZAR;
  };

  // Helper to get karat purity factor
  const getKaratPurityFactor = (karat: number) => {
    switch (karat) {
      case 24: return 1.0;
      case 22: return 22 / 24;
      case 18: return 18 / 24;
      case 9: return 9 / 24;
      default: return 1.0; // Default to 24K if unknown
    }
  };

  const calculateItemValue = (
    metalType: MetalType,
    totalWeightInGrams: number,
    currency: Currency,
    karat?: number // Added karat as an optional parameter
  ) => {
    // If no prices are available (neither current nor manual), return 0
    if (effectiveGoldPricePerGramZAR === 0 && effectiveSilverPricePerGramZAR === 0) return 0;

    let pricePerGramZAR = getEffectiveMetalPricePerGramZAR(metalType);

    // Adjust gold price based on karat purity
    if (metalType === "Gold" && karat) {
      pricePerGramZAR *= getKaratPurityFactor(karat);
    }

    const valueZAR = totalWeightInGrams * pricePerGramZAR;

    return currency === "USD" && currentPrices ? valueZAR * currentPrices.zarToUsdRate : valueZAR;
  };

  const totalPortfolioValue = coins.reduce((sum, coin) => {
    const totalWeightInGrams = convertWeightToGrams(coin.weight * coin.quantity, coin.weightUnit);
    return sum + calculateItemValue(coin.metalType, totalWeightInGrams, currentCurrency);
  }, 0) + jewellery.reduce((sum, item) => {
    const totalWeightInGrams = convertWeightToGrams(item.weight, item.weightUnit);
    return sum + calculateItemValue(item.metalType, totalWeightInGrams, currentCurrency, item.karat);
  }, 0);

  const handleAddCoin = () => {
    if (!newCoinName || newCoinWeight <= 0 || newCoinQuantity <= 0) {
      showError("Please fill in all coin fields correctly.");
      return;
    }
    const newCoin: Coin = {
      id: uuidv4(),
      name: newCoinName,
      metalType: newCoinMetalType,
      quantity: newCoinQuantity,
      weight: newCoinWeight,
      weightUnit: newCoinWeightUnit,
    };
    setCoins([...coins, newCoin]);
    setNewCoinName("");
    setNewCoinQuantity(1);
    setNewCoinWeight(1); // Reset to 1 ounce
    setNewCoinMetalType("Gold");
    setNewCoinWeightUnit("Ounces"); // Reset to Ounces
    setSelectedCoinOunceOption("1"); // Reset to 1 oz
    showSuccess("Coin added successfully!");
  };

  const handleAddJewellery = () => {
    if (!newJewelleryName || newJewelleryWeight <= 0) {
      showError("Please fill in all jewellery fields correctly.");
      return;
    }
    const newItem: Jewellery = {
      id: uuidv4(),
      name: newJewelleryName,
      metalType: newJewelleryMetalType,
      weight: newJewelleryWeight,
      weightUnit: newJewelleryWeightUnit,
      description: newJewelleryDescription,
      karat: newJewelleryMetalType === "Gold" ? newJewelleryKarat : undefined, // Only add karat if metal is Gold
    };
    setJewellery([...jewellery, newItem]);
    setNewJewelleryName("");
    setNewJewelleryWeight(0); // Reset to 0 grams
    setNewJewelleryDescription("");
    setNewJewelleryMetalType("Gold");
    setNewJewelleryWeightUnit("Grams"); // Reset to Grams
    setNewJewelleryKarat(24); // Reset karat to 24K
    setSelectedJewelleryOunceOption("custom"); // Reset to custom for grams
    showSuccess("Jewellery added successfully!");
  };

  const calculateZakah = () => {
    if (effectiveGoldPricePerGramZAR === 0 && effectiveSilverPricePerGramZAR === 0) {
      setZakahResult({
        amountZAR: 0,
        goldHoldingsGrams: 0,
        silverHoldingsGrams: 0,
        message: "Cannot calculate Zakah, metal prices not loaded or manually entered.",
      });
      showError("Cannot calculate Zakah, metal prices not loaded or manually entered.");
      return;
    }

    let totalGoldHoldingsGrams = 0;
    let totalSilverHoldingsGrams = 0;

    coins.forEach(coin => {
      const weightInGrams = convertWeightToGrams(coin.weight * coin.quantity, coin.weightUnit);
      if (coin.metalType === "Gold") {
        totalGoldHoldingsGrams += weightInGrams;
      } else {
        totalSilverHoldingsGrams += weightInGrams;
      }
    });

    jewellery.forEach(item => {
      const weightInGrams = convertWeightToGrams(item.weight, item.weightUnit);
      if (item.metalType === "Gold") {
        totalGoldHoldingsGrams += weightInGrams * getKaratPurityFactor(item.karat || 24); // Assume 24K if karat not specified for gold
      } else {
        totalSilverHoldingsGrams += weightInGrams;
      }
    });

    const totalPreciousMetalValueZAR =
      (totalGoldHoldingsGrams * effectiveGoldPricePerGramZAR) +
      (totalSilverHoldingsGrams * effectiveSilverPricePerGramZAR);

    let message = "";
    let zakahAmountZAR = 0;

    if (totalGoldHoldingsGrams >= NISAB_GOLD_GRAMS || totalSilverHoldingsGrams >= NISAB_SILVER_GRAMS) {
      zakahAmountZAR = totalPreciousMetalValueZAR * 0.025; // 2.5% of total precious metal value
      message = `Zakah to pay: R${zakahAmountZAR.toFixed(2)}`;
      showSuccess(message);
    } else {
      message = "Your holdings are below the Nisab threshold. No Zakah is due.";
      showSuccess(message);
    }

    setZakahResult({
      amountZAR: zakahAmountZAR,
      goldHoldingsGrams: totalGoldHoldingsGrams,
      silverHoldingsGrams: totalSilverHoldingsGrams,
      message: message,
    });
  };

  const handleCoinWeightUnitChange = (value: WeightUnit) => {
    setNewCoinWeightUnit(value);
    if (value === "Ounces") {
      setNewCoinWeight(1); // Default to 1 ounce
      setSelectedCoinOunceOption("1");
    } else {
      setNewCoinWeight(0); // Default to 0 grams
      setSelectedCoinOunceOption("custom");
    }
  };

  const handleCoinOunceOptionChange = (value: string) => {
    setSelectedCoinOunceOption(value);
    if (value !== "custom") {
      setNewCoinWeight(parseFloat(value));
    } else {
      setNewCoinWeight(0); // Reset weight when switching to custom
    }
  };

  const handleJewelleryWeightUnitChange = (value: WeightUnit) => {
    setNewJewelleryWeightUnit(value);
    if (value === "Ounces") {
      setNewJewelleryWeight(1); // Default to 1 ounce
      setSelectedJewelleryOunceOption("1");
    } else {
      setNewJewelleryWeight(0); // Default to 0 grams
      setSelectedJewelleryOunceOption("custom");
    }
  };

  const handleJewelleryOunceOptionChange = (value: string) => {
    setSelectedJewelleryOunceOption(value);
    if (value !== "custom") {
      setNewJewelleryWeight(parseFloat(value));
    } else {
      setNewJewelleryWeight(0); // Reset weight when switching to custom
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <GoldCoinLogo /> {/* Added the GoldCoinLogo component here */}
      <h1 className="text-4xl font-bold text-center mb-8 text-accent text-shadow">Precious Metals Tracker</h1>

      {/* Portfolio Summary */}
      <Card className="bg-light-green shadow-lg">
        <CardHeader>
          <CardTitle className="flex justify-between items-center text-foreground text-shadow">
            Total Portfolio Value
            <Select value={currentCurrency} onValueChange={(value: Currency) => setCurrentCurrency(value)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ZAR">ZAR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-foreground">
            {currentCurrency === "ZAR" ? "R" : "$"}
            {totalPortfolioValue.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      {/* Manual Price Input Section */}
      <Card className="bg-light-blue shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-shadow">Manual Price Input</span>
            <div className="flex items-center space-x-2">
              <Label htmlFor="manual-prices-toggle">Enable Manual Input</Label>
              <Switch
                id="manual-prices-toggle"
                checked={useManualPrices}
                onCheckedChange={setUseManualPrices}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="manualGoldPrice">Gold Price per Gram (ZAR)</Label>
            <Input
              id="manualGoldPrice"
              type="number"
              value={manualGoldPricePerGramZAR.toFixed(2)}
              onChange={(e) => setManualGoldPricePerGramZAR(parseFloat(e.target.value))}
              min="0"
              step="0.01"
              disabled={!useManualPrices}
            />
          </div>
          <div>
            <Label htmlFor="manualSilverPrice">Silver Price per Gram (ZAR)</Label>
            <Input
              id="manualSilverPrice"
              type="number"
              value={manualSilverPricePerGramZAR.toFixed(2)}
              onChange={(e) => setManualSilverPricePerGramZAR(parseFloat(e.target.value))}
              min="0"
              step="0.01"
              disabled={!useManualPrices}
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Coin Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-shadow">Add New Coin</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="coinName">Coin Name</Label>
            <Input id="coinName" value={newCoinName} onChange={(e) => setNewCoinName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="coinMetalType">Metal Type</Label>
            <Select value={newCoinMetalType} onValueChange={(value: MetalType) => setNewCoinMetalType(value)}>
              <SelectTrigger id="coinMetalType">
                <SelectValue placeholder="Select Metal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="coinQuantity">Quantity</Label>
            <Input id="coinQuantity" type="number" value={newCoinQuantity} onChange={(e) => setNewCoinQuantity(parseInt(e.target.value))} min="1" />
          </div>
          <div className="flex space-x-2">
            <div className="flex-grow">
              <Label htmlFor="coinWeight">Weight</Label>
              {newCoinWeightUnit === "Ounces" ? (
                <Select value={selectedCoinOunceOption} onValueChange={handleCoinOunceOptionChange}>
                  <SelectTrigger id="coinWeight">
                    <SelectValue placeholder="Select Ounce Weight" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.1">1/10 oz</SelectItem>
                    <SelectItem value="0.25">1/4 oz</SelectItem>
                    <SelectItem value="0.5">Half oz</SelectItem>
                    <SelectItem value="1">1 oz</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input id="coinWeight" type="number" value={newCoinWeight} onChange={(e) => setNewCoinWeight(parseFloat(e.target.value))} min="0" step="0.01" />
              )}
              {newCoinWeightUnit === "Ounces" && selectedCoinOunceOption === "custom" && (
                <Input id="coinWeightCustom" type="number" value={newCoinWeight} onChange={(e) => setNewCoinWeight(parseFloat(e.target.value))} min="0" step="0.01" className="mt-2" placeholder="Enter custom ounces" />
              )}
            </div>
            <div className="w-1/3">
              <Label htmlFor="coinWeightUnit">Unit</Label>
              <Select value={newCoinWeightUnit} onValueChange={handleCoinWeightUnitChange}>
                <SelectTrigger id="coinWeightUnit">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ounces">Ounces</SelectItem>
                  <SelectItem value="Grams">Grams</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="md:col-span-2">
            <Button onClick={handleAddCoin} className="w-full">Add Coin</Button>
          </div>
        </CardContent>
      </Card>

      {/* Display Coins */}
      {coins.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-shadow">Your Coins</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {coins.map((coin) => (
                <li key={coin.id} className="flex justify-between items-center p-2 border rounded-md">
                  <span>{coin.name} ({coin.metalType}) - {coin.quantity} x {coin.weight} {coin.weightUnit}</span>
                  <span>
                    {currentCurrency === "ZAR" ? "R" : "$"}
                    {calculateItemValue(coin.metalType, convertWeightToGrams(coin.weight * coin.quantity, coin.weightUnit), currentCurrency).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Add Jewellery Section */}
      <Card className="bg-accent shadow-lg">
        <CardHeader>
          <CardTitle className="text-shadow">Add New Jewellery</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="jewelleryName">Item Name</Label>
            <Select value={newJewelleryName} onValueChange={setNewJewelleryName}>
              <SelectTrigger id="jewelleryName">
                <SelectValue placeholder="Select Item" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Necklace">Necklace</SelectItem>
                <SelectItem value="Ring">Ring</SelectItem>
                <SelectItem value="Bracelet">Bracelet</SelectItem>
                <SelectItem value="Bangle">Bangle</SelectItem>
                <SelectItem value="Earrings">Earrings</SelectItem>
                <SelectItem value="Anklet">Anklet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="jewelleryMetalType">Metal Type</Label>
            <Select value={newJewelleryMetalType} onValueChange={(value: MetalType) => {
              setNewJewelleryMetalType(value);
              if (value === "Silver") {
                setNewJewelleryKarat(24); // Reset karat if switching to silver
              }
            }}>
              <SelectTrigger id="jewelleryMetalType">
                <SelectValue placeholder="Select Metal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {newJewelleryMetalType === "Gold" && (
            <div>
              <Label htmlFor="jewelleryKarat">Karat</Label>
              <Select value={String(newJewelleryKarat)} onValueChange={(value) => setNewJewelleryKarat(parseInt(value))}>
                <SelectTrigger id="jewelleryKarat">
                  <SelectValue placeholder="Select Karat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24K</SelectItem>
                  <SelectItem value="22">22K</SelectItem>
                  <SelectItem value="18">18K</SelectItem>
                  <SelectItem value="9">9K</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex space-x-2">
            <div className="flex-grow">
              <Label htmlFor="jewelleryWeight">Weight</Label>
              {newJewelleryWeightUnit === "Ounces" ? (
                <Select value={selectedJewelleryOunceOption} onValueChange={handleJewelleryOunceOptionChange}>
                  <SelectTrigger id="jewelleryWeight">
                    <SelectValue placeholder="Select Ounce Weight" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.1">1/10 oz</SelectItem>
                    <SelectItem value="0.25">1/4 oz</SelectItem>
                    <SelectItem value="0.5">Half oz</SelectItem>
                    <SelectItem value="1">1 oz</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input id="jewelleryWeight" type="number" value={newJewelleryWeight} onChange={(e) => setNewJewelleryWeight(parseFloat(e.target.value))} min="0" step="0.01" />
              )}
              {newJewelleryWeightUnit === "Ounces" && selectedJewelleryOunceOption === "custom" && (
                <Input id="jewelleryWeightCustom" type="number" value={newJewelleryWeight} onChange={(e) => setNewJewelleryWeight(parseFloat(e.target.value))} min="0" step="0.01" className="mt-2" placeholder="Enter custom ounces" />
              )}
            </div>
            <div className="w-1/3">
              <Label htmlFor="jewelleryWeightUnit">Unit</Label>
              <Select value={newJewelleryWeightUnit} onValueChange={handleJewelleryWeightUnitChange}>
                <SelectTrigger id="jewelleryWeightUnit">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ounces">Ounces</SelectItem>
                  <SelectItem value="Grams">Grams</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="jewelleryDescription">Description (Optional)</Label>
            <Input id="jewelleryDescription" value={newJewelleryDescription} onChange={(e) => setNewJewelleryDescription(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Button onClick={handleAddJewellery} className="w-full">Add Jewellery</Button>
          </div>
        </CardContent>
      </Card>

      {/* Display Jewellery */}
      {jewellery.length > 0 && (
        <Card className="bg-accent shadow-lg">
          <CardHeader>
            <CardTitle className="text-shadow">Your Jewellery</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {jewellery.map((item) => (
                <li key={item.id} className="flex justify-between items-center p-2 border rounded-md">
                  <span>
                    {item.name} ({item.metalType} {item.karat ? `(${item.karat}K)` : ''}) - {item.weight} {item.weightUnit} {item.description && `(${item.description})`}
                  </span>
                  <span>
                    {currentCurrency === "ZAR" ? "R" : "$"}
                    {calculateItemValue(item.metalType, convertWeightToGrams(item.weight, item.weightUnit), currentCurrency, item.karat).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Zakah Calculator */}
      <Card className="bg-medium-green shadow-lg min-h-[250px]"> {/* Added min-h for bigger card */}
        <CardHeader>
          <CardTitle className="text-shadow">Zakah Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Calculate your Zakah based on the total value of your precious metals (coins and jewellery).</p>
          <div className="mb-4 text-sm">
            <h3 className="font-semibold mb-1">Nisab Thresholds:</h3>
            <p><strong>Gold:</strong> {NISAB_GOLD_GRAMS} Grams or {NISAB_GOLD_OUNCES} Troy Oz</p>
            <p><strong>Silver:</strong> {NISAB_SILVER_GRAMS} Grams or {NISAB_SILVER_OUNCES} Troy Oz</p>
          </div>
          <Button onClick={calculateZakah} className="w-full mb-4">Calculate Zakah (2.5%)</Button>

          {zakahResult && (
            <div className="mt-4 p-3 border rounded-md bg-background text-foreground">
              <h3 className="font-semibold mb-2">Your Holdings:</h3>
              <p><strong>Gold Equivalent:</strong> {zakahResult.goldHoldingsGrams.toFixed(2)} Grams</p>
              <p><strong>Silver Equivalent:</strong> {zakahResult.silverHoldingsGrams.toFixed(2)} Grams</p>
              <p className="mt-2 font-bold">{zakahResult.message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PreciousMetalsTracker;