"use client";

import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Heart, Coins, Crown, RefreshCw } from "lucide-react";

// --- DATA: The "Cards" (Eventually move this to Node.js backend) ---
const SCENARIOS = [
  {
    id: 1,
    text: "A mysterious merchant offers you a potion.",
    image: "🧙‍♂️",
    left: { text: "Refuse", effect: { gold: 0, health: 0, rep: -5 } },
    right: {
      text: "Buy (-10 Gold)",
      effect: { gold: -10, health: +20, rep: 0 },
    },
  },
  {
    id: 2,
    text: "The King demands higher taxes.",
    image: "👑",
    left: { text: "Rebel!", effect: { gold: +10, health: -20, rep: +20 } },
    right: { text: "Pay Up", effect: { gold: -20, health: 0, rep: +10 } },
  },
  {
    id: 3,
    text: "You find a lost wallet on the street.",
    image: "💰",
    left: { text: "Keep it", effect: { gold: +50, health: 0, rep: -20 } },
    right: { text: "Return it", effect: { gold: 0, health: 0, rep: +20 } },
  },
];

export default function SwipeGame() {
  // Game State
  const [stats, setStats] = useState({ health: 50, gold: 50, rep: 50 });
  const [cardIndex, setCardIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState("");

  // Animation Values
  const x = useMotionValue(0);
  // Rotate the card slightly as you drag it
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  // Change background color opacity based on swipe direction
  const opacityRight = useTransform(x, [0, 150], [0, 1]);
  const opacityLeft = useTransform(x, [0, -150], [0, 1]);

  // Helper: Reset Game
  const resetGame = () => {
    setStats({ health: 50, gold: 50, rep: 50 });
    setCardIndex(0);
    setGameOver(false);
    x.set(0);
  };

  // Helper: Handle Swipe Completion
  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100; // How far user must swipe to trigger action

    if (info.offset.x > threshold) {
      handleChoice("right");
    } else if (info.offset.x < -threshold) {
      handleChoice("left");
    }
  };

  const handleChoice = (direction: "left" | "right") => {
    const currentCard = SCENARIOS[cardIndex];
    const effect = currentCard[direction].effect;

    // Update Stats
    const newStats = {
      health: stats.health + effect.health,
      gold: stats.gold + effect.gold,
      rep: stats.rep + effect.rep,
    };

    setStats(newStats);

    // Check Death Conditions
    if (newStats.health <= 0 || newStats.gold <= 0 || newStats.rep <= 0) {
      setGameResult("You ran out of resources! Game Over.");
      setGameOver(true);
      return;
    }

    // Next Card
    if (cardIndex + 1 < SCENARIOS.length) {
      setCardIndex(cardIndex + 1);
      x.set(0); // Reset card position
    } else {
      setGameResult("You survived the week! You Win!");
      setGameOver(true);
    }
  };

  const currentCard = SCENARIOS[cardIndex];

  return (
    <div className="h-screen w-full bg-gray-900 text-white flex flex-col items-center overflow-hidden font-sans">
      {/* --- HUD (Heads Up Display) --- */}
      <div className="w-full max-w-md p-4 flex justify-between bg-gray-800 border-b border-gray-700 z-10">
        <StatIcon
          icon={<Heart className="text-red-500" />}
          value={stats.health}
          label="HP"
        />
        <StatIcon
          icon={<Coins className="text-yellow-400" />}
          value={stats.gold}
          label="Gold"
        />
        <StatIcon
          icon={<Crown className="text-purple-400" />}
          value={stats.rep}
          label="Rep"
        />
      </div>

      {/* --- GAME AREA --- */}
      <div className="flex-1 flex items-center justify-center w-full max-w-md relative p-4">
        {gameOver ? (
          <div className="text-center p-6 bg-gray-800 rounded-xl shadow-lg animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">{gameResult}</h2>
            <button
              onClick={resetGame}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-bold transition w-full"
            >
              <RefreshCw size={20} /> Play Again
            </button>
          </div>
        ) : (
          <div className="relative w-full h-[60vh]">
            {/* Background Card (Visual Stack Effect) */}
            <div className="absolute top-4 left-4 w-full h-full bg-gray-700 rounded-3xl border-2 border-gray-600" />

            {/* Active Card */}
            <motion.div
              style={{ x, rotate }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              className="absolute top-0 left-0 w-full h-full bg-white text-gray-900 rounded-3xl shadow-2xl flex flex-col items-center p-6 border-4 border-gray-200 cursor-grab active:cursor-grabbing touch-none"
            >
              {/* Swipe Indicators (Overlays) */}
              <motion.div
                style={{ opacity: opacityRight }}
                className="absolute top-8 left-8 border-4 border-green-500 text-green-500 font-black text-2xl px-4 py-2 rounded transform -rotate-12 z-20"
              >
                YES
              </motion.div>
              <motion.div
                style={{ opacity: opacityLeft }}
                className="absolute top-8 right-8 border-4 border-red-500 text-red-500 font-black text-2xl px-4 py-2 rounded transform rotate-12 z-20"
              >
                NO
              </motion.div>

              {/* Card Content */}
              <div className="flex-1 flex flex-col items-center justify-center pointer-events-none select-none">
                <div className="text-8xl mb-6">{currentCard.image}</div>
                <h3 className="text-2xl font-bold text-center mb-8">
                  {currentCard.text}
                </h3>
              </div>

              <div className="w-full flex justify-between text-sm font-bold text-gray-500 uppercase tracking-wider pointer-events-none">
                <span>← {currentCard.left.text}</span>
                <span>{currentCard.right.text} →</span>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <div className="p-4 text-gray-500 text-sm">Swipe cards to survive</div>
    </div>
  );
}

// Simple Component for Stats
function StatIcon({
  icon,
  value,
  label,
}: {
  icon: any;
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1">
        {icon}
        <span className="font-bold text-lg">{value}</span>
      </div>
      <span className="text-xs text-gray-400 uppercase">{label}</span>
    </div>
  );
}
