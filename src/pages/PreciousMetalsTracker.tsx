"use client";

import React, { useState, useEffect } from "react";
import { Coin, Jewellery, MetalType, WeightUnit, Currency, HistoricalPriceData } from "@/types";
import { fetchCurrentMetalPrices, fetchHistoricalMetalPrices } from "@/services/metalPrices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { v4 as uuidv4 } from 'uuid';
import { showSuccess, showError } from "@/utils/toast";
import { Switch } from "@/components/ui/switch"; // Import Switch component

const PreciousMetalsTracker = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [jewellery, setJewellery] = useState<Jewellery[]>([]);
  const [currentCurrency, setCurrentCurrency] = useState<Currency>("ZAR");
  const [currentPrices, setCurrentPrices] = useState<{
    goldPerGramZAR: number;
    silverPerGramZAR: number;
    zarToUsdRate: number;
  } | null>(null);
  const [historicalPrices, setHistoricalPrices] = useState<HistoricalPriceData[]>([]);

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
  const [newJewelleryWeight, setNewJewelleryWeight] = useState(1); // Default to 1 ounce
  const [newJewelleryWeightUnit, setNewJewelleryWeightUnit] = useState<WeightUnit>("Ounces"); // Default to Ounces
  const [newJewelleryDescription, setNewJewelleryDescription] = useState("");
  const [selectedJewelleryOunceOption, setSelectedJewelleryOunceOption] = useState<string>("1"); // Default to 1 oz

  useEffect(() => {
    const loadPrices = async () => {
      try {
        const prices = await fetchCurrentMetalPrices();
        setCurrentPrices(prices);
        // Pre-fill manual prices with fetched prices
        setManualGoldPricePerGramZAR(prices.goldPerGramZAR);
        setManualSilverPricePerGramZAR(prices.silverPerGramZAR);

        const historical = await fetchHistoricalMetalPrices();
        setHistoricalPrices(historical);
      } catch (error) {
        console.error("Failed to fetch metal prices:", error);
        showError("Failed to load metal prices.");
      }
    };
    loadPrices();
  }, []);

  const convertWeightToGrams = (weight: number, unit: WeightUnit) => {
    return unit === "Ounces" ? weight * 28.35 : weight;
  };

  // Helper to get the effective price per gram based on manual input toggle
  const getEffectiveMetalPricePerGramZAR = (metalType: MetalType) => {
    if (useManualPrices) {
      return metalType === "Gold" ? manualGoldPricePerGramZAR : manualSilverPricePerGramZAR;
    }
    return metalType === "Gold" ? currentPrices?.goldPerGramZAR || 0 : currentPrices?.silverPerGramZAR || 0;
  };

  const calculateItemValue = (
    metalType: MetalType,
    totalWeightInGrams: number,
    currency: Currency
  ) => {
    if (!currentPrices && !useManualPrices) return 0; // If no prices and not manual mode, return 0

    const pricePerGramZAR = getEffectiveMetalPricePerGramZAR(metalType);
    const valueZAR = totalWeightInGrams * pricePerGramZAR;

    return currency === "USD" && currentPrices ? valueZAR * currentPrices.zarToUsdRate : valueZAR;
  };

  const totalPortfolioValue = coins.reduce((sum, coin) => {
    const totalWeightInGrams = convertWeightToGrams(coin.weight * coin.quantity, coin.weightUnit);
    return sum + calculateItemValue(coin.metalType, totalWeightInGrams, currentCurrency);
  }, 0) + jewellery.reduce((sum, item) => {
    const totalWeightInGrams = convertWeightToGrams(item.weight, item.weightUnit);
    return sum + calculateItemValue(item.metalType, totalWeightInGrams, currentCurrency);
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
    };
    setJewellery([...jewellery, newItem]);
    setNewJewelleryName("");
    setNewJewelleryWeight(1); // Reset to 1 ounce
    setNewJewelleryDescription("");
    setNewJewelleryMetalType("Gold");
    setNewJewelleryWeightUnit("Ounces"); // Reset to Ounces
    setSelectedJewelleryOunceOption("1"); // Reset to 1 oz
    showSuccess("Jewellery added successfully!");
  };

  const calculateZakah = () => {
    if (!currentPrices && !useManualPrices) {
      showError("Cannot calculate Zakah, metal prices not loaded or manually entered.");
      return;
    }

    const totalCoinValueZAR = coins.reduce((sum, coin) => {
      const totalWeightInGrams = convertWeightToGrams(coin.weight * coin.quantity, coin.weightUnit);
      return sum + calculateItemValue(coin.metalType, totalWeightInGrams, "ZAR");
    }, 0);

    const totalJewelleryValueZAR = jewellery.reduce((sum, item) => {
      const totalWeightInGrams = convertWeightToGrams(item.weight, item.weightUnit);
      return sum + calculateItemValue(item.metalType, totalWeightInGrams, "ZAR");
    }, 0);

    const totalPreciousMetalValueZAR = totalCoinValueZAR + totalJewelleryValueZAR;

    const zakahAmountZAR = totalPreciousMetalValueZAR * 0.025; // 2.5% of total precious metal value
    const zakahAmountUSD = zakahAmountZAR * (currentPrices?.zarToUsdRate || 0);

    showSuccess(
      `Zakah to pay:\nZAR: ${zakahAmountZAR.toFixed(2)}\nUSD: ${zakahAmountUSD.toFixed(2)}`
    );
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
      <h1 className="text-4xl font-bold text-center mb-8">Precious Metals Tracker</h1>

      {/* Portfolio Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
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
          <p className="text-3xl font-semibold">
            {currentCurrency === "ZAR" ? "R" : "$"}
            {totalPortfolioValue.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      {/* Manual Price Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Manual Price Input
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
      <Card>
        <CardHeader>
          <CardTitle>Add New Coin</CardTitle>
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
        <Card>
          <CardHeader>
            <CardTitle>Your Coins</CardTitle>
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
      <Card>
        <CardHeader>
          <CardTitle>Add New Jewellery</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="jewelleryName">Item Name</Label>
            <Input id="jewelleryName" value={newJewelleryName} onChange={(e) => setNewJewelleryName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="jewelleryMetalType">Metal Type</Label>
            <Select value={newJewelleryMetalType} onValueChange={(value: MetalType) => setNewJewelleryMetalType(value)}>
              <SelectTrigger id="jewelleryMetalType">
                <SelectValue placeholder="Select Metal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
        <Card>
          <CardHeader>
            <CardTitle>Your Jewellery</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {jewellery.map((item) => (
                <li key={item.id} className="flex justify-between items-center p-2 border rounded-md">
                  <span>{item.name} ({item.metalType}) - {item.weight} {item.weightUnit} {item.description && `(${item.description})`}</span>
                  <span>
                    {currentCurrency === "ZAR" ? "R" : "$"}
                    {calculateItemValue(item.metalType, convertWeightToGrams(item.weight, item.weightUnit), currentCurrency).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Historical Prices Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Metal Prices (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {historicalPrices.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalPrices}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${currentCurrency === "ZAR" ? "R" : "$"}${value.toFixed(2)}`} />
                  <Line type="monotone" dataKey="gold" stroke="#FFD700" name="Gold" />
                  <Line type="monotone" dataKey="silver" stroke="#C0C0C0" name="Silver" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p>Loading historical prices...</p>
          )}
        </CardContent>
      </Card>

      {/* Zakah Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>Zakah Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Calculate your Zakah based on the total value of your precious metals (coins and jewellery).</p>
          <Button onClick={calculateZakah} className="w-full">Calculate Zakah (2.5%)</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreciousMetalsTracker;