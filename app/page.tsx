"use client";

import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Clock, Smartphone, Users, MapPin } from "lucide-react";
import { STORY, SUSPECTS, CulpritProfile } from "./storyData";

// --- HELPERS ---

const useTypewriter = (text: string, speed = 30) => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayText("");
    setIsTyping(true);
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isTyping };
};

const formatTime = (minutesFromStart: number) => {
  const startHour = 18; // 6:00 PM
  const totalMinutes = startHour * 60 + minutesFromStart;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  const displayMins = mins < 10 ? `0${mins}` : mins;
  return `${displayHour}:${displayMins} ${ampm}`;
};

export default function SamSpecterGame() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  // --- NEW GAME STATE (Cleaned) ---
  const [time, setTime] = useState(0); // Minutes passed
  const [focus, setFocus] = useState(100); // Hidden stat (0-100)
  const [currentCardId, setCurrentCardId] = useState<string>("start");

  // The profile we build up during the game
  const [culpritProfile, setCulpritProfile] = useState<CulpritProfile>({
    violent: 0,
    organized: 0,
    personalMotive: 0,
    financialMotive: 0,
    insideJob: 0,
  });

  // Bias tracking (unused in UI currently, but tracked)
  const [suspicion, setSuspicion] = useState<Record<string, number>>({});

  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Modal State
  const [showSuspects, setShowSuspects] = useState(false);
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(
    null
  );

  const currentCard = STORY[currentCardId];
  const { displayText, isTyping } = useTypewriter(currentCard?.text || "", 20);

  // --- ANIMATION ---
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-3, 3]);
  const opacityRight = useTransform(x, [0, 100], [0, 1]);
  const opacityLeft = useTransform(x, [0, -100], [0, 1]);

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth <= 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // --- LOGIC ---

  const resetGame = () => {
    setTime(0);
    setFocus(100);
    setCulpritProfile({
      violent: 0,
      organized: 0,
      personalMotive: 0,
      financialMotive: 0,
      insideJob: 0,
    });
    setSuspicion({});
    setCurrentCardId("start");
    setGameOver(false);
    setShowSuspects(false);
    setSelectedSuspectId(null);
    x.set(0);
  };

  // THE ARREST LOGIC
  const handleArrest = () => {
    if (!selectedSuspectId) return;

    setShowSuspects(false);
    const suspect = SUSPECTS.find((s) => s.id === selectedSuspectId);
    if (!suspect) return;

    // 1. Determine "True Killer" by finding the suspect whose traits
    //    are closest to the accumulated culpritProfile.
    let bestMatch = SUSPECTS[0];
    let lowestDiff = Infinity;

    SUSPECTS.forEach((s) => {
      const diff =
        Math.abs(s.traits.violent - culpritProfile.violent) +
        Math.abs(s.traits.organized - culpritProfile.organized) +
        Math.abs(s.traits.personalMotive - culpritProfile.personalMotive) +
        Math.abs(s.traits.financialMotive - culpritProfile.financialMotive) +
        Math.abs(s.traits.insideJob - culpritProfile.insideJob);

      if (diff < lowestDiff) {
        lowestDiff = diff;
        bestMatch = s;
      }
    });

    setGameOver(true);

    // 2. Compare Player Choice vs Calculated True Killer
    if (bestMatch.id === suspect.id) {
      setGameResult(
        `SUCCESS. The evidence aligns perfectly. ${suspect.name} confesses during the interrogation. The profile you built matches their MO exactly.`
      );
    } else {
      setGameResult(
        `FAILURE. You arrested ${suspect.name}, but the charges didn't stick. Weeks later, evidence surfaced implicating ${bestMatch.name}, but they had already fled the country.`
      );
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (isTyping) return;
    const threshold = 100;
    if (info.offset.x > threshold) handleChoice("right");
    else if (info.offset.x < -threshold) handleChoice("left");
  };

  const handleChoice = (direction: "left" | "right") => {
    if (!currentCard) return;

    // 1. Apply Scene Base Costs first (if any)
    let newTime = time + (currentCard.timeCost || 0);
    let newFocus = focus + (currentCard.focusDelta || 0);

    // Apply base profile/suspicion deltas from scene
    let newProfile = { ...culpritProfile };
    if (currentCard.culpritProfileDelta) {
      (
        Object.keys(currentCard.culpritProfileDelta) as Array<
          keyof CulpritProfile
        >
      ).forEach((key) => {
        newProfile[key] =
          (newProfile[key] || 0) + (currentCard.culpritProfileDelta![key] || 0);
      });
    }

    // 2. Apply Choice Specific Effects
    const choice = currentCard[direction];

    // Capture effect to avoid TS undefined error
    const effect = choice.effect;

    if (effect) {
      newTime += effect.timeCost || 0;
      newFocus += effect.focusDelta || 0;

      if (effect.culpritProfileDelta) {
        (
          Object.keys(effect.culpritProfileDelta) as Array<keyof CulpritProfile>
        ).forEach((key) => {
          newProfile[key] =
            (newProfile[key] || 0) + (effect.culpritProfileDelta![key] || 0);
        });
      }
    }

    // Update State
    setTime(newTime);
    setFocus(newFocus);
    setCulpritProfile(newProfile);

    // 3. Navigation
    if (STORY[choice.nextId]) {
      setCurrentCardId(choice.nextId);
      x.set(0);
    } else {
      setGameResult("Error: End of branch reached.");
      setGameOver(true);
    }
  };

  // --- RENDER ---

  if (!isMobile && isMobile !== null) {
    return (
      <div className="h-screen bg-zinc-950 text-gray-400 flex items-center justify-center p-4 font-mono">
        <div className="text-center max-w-md border border-zinc-800 p-8 rounded">
          <Smartphone className="mx-auto mb-4" size={32} />
          <h1 className="text-xl font-bold text-zinc-200 mb-2 uppercase">
            Mobile Terminal
          </h1>
          <p className="text-sm">Please use a phone.</p>
        </div>
      </div>
    );
  }

  if (!isMobile) return null;

  return (
    <div className="h-screen w-full bg-zinc-950 text-zinc-300 flex flex-col font-serif overflow-hidden selection:bg-zinc-700">
      {/* TOP BAR: Time & Location (No Money/Energy) */}
      <div className="flex justify-between items-center p-4 bg-black/50 border-b border-zinc-800 text-xs font-mono tracking-wider h-[60px] shrink-0">
        <div className="flex items-center gap-2 text-zinc-400">
          <Clock size={16} />
          <span className="font-bold text-lg text-zinc-200">
            {formatTime(time)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-zinc-500">
          <MapPin size={14} />
          <span className="uppercase">Sector 4</span>
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-4">
        {feedback && (
          <div className="absolute top-4 z-50 bg-zinc-800 text-zinc-200 px-4 py-2 rounded border border-zinc-600 animate-bounce font-mono text-xs">
            {feedback}
          </div>
        )}

        {/* SUSPECT / ARREST MODAL */}
        {showSuspects && !gameOver && (
          <div className="absolute inset-0 z-40 bg-black/95 flex flex-col p-6 animate-fade-in">
            <h2 className="text-xl font-mono font-bold text-red-500 mb-6 tracking-widest uppercase border-b border-red-900 pb-2 text-center">
              Suspect Database
            </h2>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {SUSPECTS.map((suspect) => (
                <button
                  key={suspect.id}
                  onClick={() => setSelectedSuspectId(suspect.id)}
                  className={`w-full p-4 border text-left transition flex justify-between items-center ${
                    selectedSuspectId === suspect.id
                      ? "bg-red-900/20 border-red-500 text-red-100"
                      : "bg-zinc-900 border-zinc-700 text-zinc-400"
                  }`}
                >
                  <span className="font-bold uppercase tracking-wider">
                    {suspect.name}
                  </span>
                  {selectedSuspectId === suspect.id && (
                    <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setShowSuspects(false)}
                className="flex-1 py-4 text-zinc-500 text-xs underline uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                disabled={!selectedSuspectId}
                onClick={handleArrest}
                className="flex-[2] bg-red-600 disabled:bg-zinc-800 text-white font-bold uppercase tracking-widest py-4 rounded disabled:text-zinc-600"
              >
                Arrest
              </button>
            </div>
          </div>
        )}

        {gameOver ? (
          <div className="w-full max-w-xs text-center bg-[#f4f1ea] p-8 rounded shadow-2xl text-zinc-900 border-2 border-zinc-800">
            <h2 className="text-2xl font-bold mb-4 uppercase tracking-widest border-b-2 border-zinc-900 pb-2">
              Final Report
            </h2>
            <p className="mb-8 text-sm font-medium leading-relaxed font-mono text-left">
              {gameResult}
            </p>
            <button
              onClick={resetGame}
              className="w-full bg-zinc-900 text-[#f4f1ea] font-bold py-4 rounded hover:bg-zinc-800 transition uppercase tracking-widest text-sm"
            >
              Archive Case
            </button>
          </div>
        ) : (
          <div className="relative w-full h-full max-h-[600px] flex items-center justify-center">
            <motion.div
              style={{ x, rotate }}
              drag={isTyping || showSuspects ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              className={`absolute w-full max-w-sm aspect-[3/5] bg-[#f4f1ea] text-zinc-900 p-6 shadow-[0_5px_25px_rgba(0,0,0,0.5)] flex flex-col justify-between border-2 border-zinc-800 ${
                isTyping ? "cursor-wait" : "cursor-grab active:cursor-grabbing"
              } touch-none relative overflow-hidden rounded-sm`}
            >
              {/* Overlay Colors */}
              <motion.div
                style={{ opacity: opacityRight }}
                className="absolute inset-0 bg-blue-900/90 flex items-center justify-center z-20 pointer-events-none"
              >
                <span className="text-white font-black font-mono text-xl text-center rotate-3 border-4 border-white p-4 rounded uppercase tracking-widest leading-tight mx-8">
                  {currentCard.right.text}
                </span>
              </motion.div>
              <motion.div
                style={{ opacity: opacityLeft }}
                className="absolute inset-0 bg-red-900/90 flex items-center justify-center z-20 pointer-events-none"
              >
                <span className="text-white font-black font-mono text-xl text-center -rotate-3 border-4 border-white p-4 rounded uppercase tracking-widest leading-tight mx-8">
                  {currentCard.left.text}
                </span>
              </motion.div>

              {/* Watermark Image (Faint Background) */}
              <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-5 overflow-hidden">
                <span className="text-[200px] grayscale transform rotate-12 select-none">
                  {currentCard.image}
                </span>
              </div>

              {/* Story Text */}
              <div className="flex-1 mt-2 select-none pointer-events-none overflow-hidden z-10 relative">
                <p className="text-base leading-relaxed font-medium font-serif text-left">
                  {displayText}
                  <span className="animate-pulse font-light ml-1">|</span>
                </p>
              </div>

              {/* Bottom Options */}
              <div
                className={`flex justify-between items-end text-[10px] font-bold uppercase tracking-widest mt-4 font-mono transition-opacity duration-500 ${
                  isTyping ? "opacity-0" : "opacity-100"
                }`}
              >
                <div className="flex flex-col max-w-[45%] text-left">
                  <span className="text-red-800 border-b border-red-300/50 pb-1 leading-tight">
                    ← {currentCard.left.text}
                  </span>
                </div>

                <div className="flex flex-col max-w-[45%] text-right">
                  <span className="text-blue-800 border-b border-blue-300/50 pb-1 leading-tight">
                    {currentCard.right.text} →
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* BOTTOM ACTIONS: Only Suspects Button */}
      <div className="h-[80px] shrink-0 bg-black/80 border-t border-zinc-800 flex items-center justify-center px-6 pb-safe font-mono z-50">
        <button
          onClick={() => setShowSuspects(true)}
          disabled={gameOver || isTyping}
          className="group flex flex-col items-center justify-center text-zinc-500 hover:text-red-500 transition disabled:opacity-30 active:scale-95"
        >
          <div className="bg-zinc-900 p-3 rounded-full mb-2 border border-zinc-800 group-hover:border-red-500/50 transition-colors shadow-lg">
            <Users size={20} />
          </div>
          <span className="text-[10px] font-bold tracking-widest">
            OPEN SUSPECT DB
          </span>
        </button>
      </div>
    </div>
  );
}
