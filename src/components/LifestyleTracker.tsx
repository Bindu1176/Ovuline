/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Carrot, Armchair as Yoga, Droplets, Moon, Sparkles, Check, HelpCircle, TrendingUp, RefreshCw } from "lucide-react";
import { WaterLog, SleepLog, LanguageCode } from "../types";
import { translations } from "../data/translations";

interface LifestyleTrackerProps {
  waterLog: WaterLog;
  sleepLog: SleepLog;
  onLogWater: (amountMl: number) => void;
  onLogSleep: (hours: number) => void;
  onResetWater: () => void;
  lang: LanguageCode;
}

export default function LifestyleTracker({
  waterLog,
  sleepLog,
  onLogWater,
  onLogSleep,
  onResetWater,
  lang,
}: LifestyleTrackerProps) {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'diet' | 'yoga' | 'water' | 'sleep'>('diet');
  const [inputSleep, setInputSleep] = useState<number>(8);

  const waterPercentage = Math.min((waterLog.amountMl / waterLog.targetMl) * 100, 100);
  const sleepPercentage = Math.min((sleepLog.hours / sleepLog.targetHours) * 100, 100);

  // Diet recommendations data
  const dietRecommendations = {
    principles: [
      "Low Glycemic Index (GI) Foods: Prevents rapid spikes in blood glucose and insulin levels.",
      "Anti-Inflammatory Focus: High levels of antioxidants (berries, leafy greens) combat systemic inflammation.",
      "Healthy Balanced Fats: Omega-3 fatty acids regulate reproductive hormones (seeds, nuts, avocados)."
    ],
    foods_to_include: [
      { name: "Leafy Greens (Spinach, Kale)", desc: "Rich in Vitamin B which regulates endocrine production and fights cell inflation." },
      { name: "Berries (Blueberries, Blackberries)", desc: "Loaded with clinical antioxidants that stabilize vascular and insulin receptors." },
      { name: "Nuts & Seeds (Pumpkin, Flax)", desc: "Pumpkin seeds are rich in zinc which relieves facial acne and alopecia symptoms." },
      { name: "Lean Salmon & Tuna", desc: "Abundant omega-3 oils improve menstrual consistency and combat fatigue." },
      { name: "Spices (Turmeric, Cinnamon)", desc: "Cinnamon has been shown in clinical trials to improve overall insulin uptake." }
    ],
    foods_to_limit: [
      { name: "Refined Starches (White bread, pastas)", desc: "Spikes insulin pathways quickly, worsening PCOD ovarian follicles." },
      { name: "processed meats & Dairy", desc: "Can exacerbate clinical hormonal androgen imbalances and facial hirsutism." },
      { name: "Sugary Drinks & Chocolates", desc: "Dramatically forces metabolic fat cells storage around pelvic area." }
    ]
  };

  // Yoga postures recommendations
  const yogaPostures = [
    {
      name: "Supta Baddha Konasana (Reclined Butterfly)",
      desc: "An incredible posture focusing on opening the pelvic bowl and improving blood circulation to ovaries.",
      steps: [
        "Lie flat on your back, knees bent, and feet flat on the floor.",
        "gently allow your knees to fall outward to the sides, pressing the soles of your feet together.",
        "Support your thighs with pillows if tension is felt. Keep arms resting at your sides.",
        "Deeply inhale for 5-10 minutes, letting your pelvis release fully."
      ]
    },
    {
      name: "Malasana (Garland Squat)",
      desc: "A deep squatting posture that stretches the hips and stimulates endocrine glands in the lower abdomen.",
      steps: [
        "Stand with feet slightly wider than hip-width apart, toes pointing outwards.",
        "Lower your hips down into a deep squat, keeping heels flat on the floor.",
        "Press your elbows against the inside of your knees, bringing hands to prayer position.",
        "Lengthen your spine and expand your collarbones. Hold for 10-15 deep breaths."
      ]
    },
    {
      name: "Bhujangasana (Cobra Pose)",
      desc: "Stretches the belly muscles, stimulates ovarian tissues, and strengthens pelvic endocrine loops.",
      steps: [
        "Lie on your stomach, forehead on the floor, hands close to shoulders.",
        "Inhale and slowly lift your head and chest from the floor, keeping elbows slightly bent.",
        "Gaze forward without neck strain, letting hips anchor to the mat.",
        "Hold for 20-30 seconds, then slowly lower down."
      ]
    }
  ];

  const handleDrinkGlass = () => {
    onLogWater(250); // standard active cup 250ml
  };

  const handleSaveSleep = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSleep > 0 && inputSleep <= 18) {
      onLogSleep(inputSleep);
    }
  };

  return (
    <div id="lifestyle-tracker-section" className="bg-white dark:bg-[#1a0f11] border border-rose-100 dark:border-rose-950/30 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-rose-50 dark:border-rose-950/10 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-sans font-semibold text-rose-900 dark:text-rose-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-500" />
            {t.lifestyleTitle}
          </h2>
          <p className="text-xs text-rose-500 font-mono mt-1 uppercase">
            Clinically backed recommendations for PCOD symptoms management
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-1 bg-rose-50 dark:bg-rose-950/20 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('diet')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
              activeTab === 'diet'
                ? "bg-rose-500 text-white shadow-sm"
                : "text-rose-700 dark:text-rose-300 hover:bg-rose-100/30"
            }`}
          >
            <Carrot className="w-3.5 h-3.5" />
            Dietary Guides
          </button>
          <button
            onClick={() => setActiveTab('yoga')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
              activeTab === 'yoga'
                ? "bg-rose-500 text-white shadow-sm"
                : "text-rose-700 dark:text-rose-300 hover:bg-rose-100/30"
            }`}
          >
            {/* Standard lucide Icon resembling yoga */}
            <Yoga className="w-3.5 h-3.5" />
            Therapeutic Yoga
          </button>
          <button
            onClick={() => setActiveTab('water')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
              activeTab === 'water'
                ? "bg-rose-500 text-white shadow-sm"
                : "text-rose-700 dark:text-rose-300 hover:bg-rose-100/30"
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            Water Tracker
          </button>
          <button
            onClick={() => setActiveTab('sleep')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
              activeTab === 'sleep'
                ? "bg-rose-500 text-white shadow-sm"
                : "text-rose-700 dark:text-rose-300 hover:bg-rose-100/30"
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            Sleep Quality
          </button>
        </div>
      </div>

      <div className="min-h-[280px]">
        {/* DIET RECOMMENDATIONS */}
        {activeTab === 'diet' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-rose-50/40 dark:bg-rose-950/10 border border-rose-100/30">
              <h3 className="text-sm font-sans font-semibold text-rose-950 dark:text-rose-200 mb-2">
                Hormonal Diet Principles
              </h3>
              <ul className="space-y-2">
                {dietRecommendations.principles.map((pr, i) => (
                  <li key={i} className="text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{pr}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Incorporate list */}
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-500/5">
                <h4 className="text-xs font-mono font-bold tracking-wider text-emerald-800 dark:text-emerald-300 uppercase mb-3 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Clinical Foods to Incorporate
                </h4>
                <div className="space-y-2.5">
                  {dietRecommendations.foods_to_include.map((fd, i) => (
                    <div key={i} className="text-xs">
                      <span className="font-sans font-bold text-emerald-900 dark:text-emerald-200">{fd.name}</span>
                      <p className="text-emerald-700/80 dark:text-emerald-300/80 leading-relaxed mt-0.5">{fd.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Avoid list */}
              <div className="p-4 rounded-xl border border-rose-100 bg-rose-500/5">
                <h4 className="text-xs font-mono font-bold tracking-wider text-rose-800 dark:text-rose-300 uppercase mb-3 flex items-center gap-1.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  Clinically Inflammatory Foods to Limit
                </h4>
                <div className="space-y-2.5">
                  {dietRecommendations.foods_to_limit.map((fd, i) => (
                    <div key={i} className="text-xs">
                      <span className="font-sans font-bold text-rose-900 dark:text-rose-200">{fd.name}</span>
                      <p className="text-rose-700/80 dark:text-rose-300/80 leading-relaxed mt-0.5">{fd.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* YOGA RECOMMENDATIONS */}
        {activeTab === 'yoga' && (
          <div className="space-y-5">
            {yogaPostures.map((yg, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-rose-50/20 dark:bg-rose-950/10 border border-rose-100/30 flex flex-col md:flex-row gap-4"
              >
                <div className="md:w-1/3 shrink-0">
                  <h3 className="text-sm font-sans font-bold text-rose-900 dark:text-rose-100">
                    {yg.name}
                  </h3>
                  <p className="text-xs text-rose-500/80 dark:text-rose-300/80 leading-relaxed mt-1">
                    {yg.desc}
                  </p>
                </div>
                <div className="flex-1 border-t md:border-t-0 md:border-l border-rose-100/50 dark:border-rose-950/10 pt-3 md:pt-0 md:pl-4">
                  <span className="text-[10px] font-mono font-bold uppercase text-rose-400">Step Instructions</span>
                  <ol className="mt-1.5 space-y-1.5">
                    {yg.steps.map((st, i) => (
                      <li key={i} className="text-xs text-rose-700 dark:text-rose-300 flex gap-2">
                        <span className="font-mono text-rose-500 font-bold text-[11px]">{i + 1}.</span>
                        <span className="leading-relaxed">{st}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WATER TRACKER */}
        {activeTab === 'water' && (
          <div className="flex flex-col items-center py-4">
            <span className="text-sm font-sans font-semibold text-rose-950 dark:text-rose-100">
              Interactive Hydration Balance
            </span>
            <p className="text-xs text-rose-500/70 dark:text-rose-300/70 mt-1 max-w-sm text-center">
              Water filters excessive circulatory testosterone metabolites and balances cellular fluid pressures.
            </p>

            <div className="mt-6 flex flex-col items-center">
              <div className="relative w-40 h-40 bg-rose-50 dark:bg-rose-950/20 rounded-full border border-rose-100 flex items-center justify-center overflow-hidden">
                {/* Simulated Water levels wave */}
                <div
                  className="absolute bottom-0 left-0 right-0 bg-rose-500/20 dark:bg-rose-500/30 transition-all duration-700"
                  style={{ height: `${waterPercentage}%` }}
                />
                
                <div className="z-10 text-center">
                  <Droplets className="w-8 h-8 text-rose-500 mx-auto animate-bounce" />
                  <div className="font-mono font-bold text-rose-950 dark:text-rose-100 text-lg mt-1">
                    {waterLog.amountMl} / {waterLog.targetMl} ml
                  </div>
                  <span className="text-[10px] uppercase font-mono text-rose-400">
                    {waterPercentage.toFixed(0)}% Logged
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleDrinkGlass}
                  className="px-5 py-2 rounded-xl bg-rose-500 text-white font-sans font-semibold text-xs hover:bg-rose-600 transition-all shadow-sm flex items-center gap-1.5 transform active:scale-95"
                >
                  <Droplets className="w-4.5 h-4.5 shrink-0" />
                  {t.addWater}
                </button>
                <button
                  onClick={onResetWater}
                  className="px-4 py-2 rounded-xl border border-rose-100 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-700 dark:text-rose-300 font-mono text-xs font-semibold flex items-center gap-1 transition-all transform active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {t.resetWater}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SLEEP QUALITY */}
        {activeTab === 'sleep' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-4">
            <div className="p-4 rounded-xl bg-rose-50/20 dark:bg-rose-950/10 border border-rose-100/30 flex flex-col items-center text-center">
              <Moon className="w-10 h-10 text-rose-500 mb-2" />
              <span className="text-sm font-sans font-bold text-rose-900 dark:text-rose-100">
                Endocrine Circadian Sleep Log
              </span>
              <p className="text-xs text-rose-500/70 dark:text-rose-300/70 mt-1 max-w-xs leading-relaxed">
                Melatonin synthesis regularizes LH and FSH hormone ratios. 7.5 to 8.5 hours are essential.
              </p>

              <div className="mt-4 flex items-center gap-2">
                <div className="text-2xl font-mono font-bold text-rose-950 dark:text-rose-100">
                  {sleepLog.hours} hrs
                </div>
                <div className="text-xs font-mono text-rose-400 mt-1">
                  ({t.target}: {sleepLog.targetHours} hrs)
                </div>
              </div>

              {/* Static visual gauge progress */}
              <div className="w-full h-2 rounded bg-rose-100 dark:bg-rose-950/20 overflow-hidden mt-4">
                <div className="h-full bg-rose-500 transition-all" style={{ width: `${sleepPercentage}%` }} />
              </div>
            </div>

            {/* Input Log hour */}
            <form onSubmit={handleSaveSleep} className="p-4 border border-rose-100/50 dark:border-rose-950/15 rounded-xl space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-900 dark:text-rose-200">
                Register Sleep Duration
              </h4>
              <div>
                <label className="text-xs text-rose-600 block mb-1">Duration slept last night (Hours):</label>
                <input
                  type="number"
                  step="0.5"
                  min="2"
                  max="18"
                  value={inputSleep}
                  onChange={(e) => setInputSleep(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-rose-100 bg-white dark:bg-[#1a0f11] dark:border-rose-950/50 text-rose-950 dark:text-rose-100 font-mono text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 text-white font-sans font-semibold text-xs hover:from-rose-600 hover:to-rose-700 transition-all shrink-0 active:scale-95"
              >
                {t.logSleep}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
