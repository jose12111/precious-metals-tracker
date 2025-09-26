"use client";

import React from 'react';
import { Coins } from 'lucide-react';

const GoldCoinLogo = () => {
  return (
    <div className="flex items-center justify-center mb-6">
      <Coins className="h-16 w-16 text-yellow-500 drop-shadow-lg" />
    </div>
  );
};

export default GoldCoinLogo;