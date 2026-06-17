/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Info, Heart, Sparkles } from "lucide-react";
import { PeriodCycle, LanguageCode } from "../types";
import { translations } from "../data/translations";
import CycleHistoryChart from "./CycleHistoryChart";

interface CycleCalendarProps {
  pastCycles: PeriodCycle[];
  cycleLength: number; // standard e.g. 28 days
  periodDuration: number; // standard e.g. 5 days
  lastPeriodStartDate: string; // YYYY-MM-DD
  lang: LanguageCode;
}

const AVAILABLE_SYMPTOMS = [
  { id: "cramps", label: "Pelvic Cramps", detail: "Progesterone / prostaglandin-driven uterine sweeps." },
  { id: "fatigue", label: "Fatigue", detail: "Metabolic downshift in late luteal or early follicular phase." },
  { id: "bloating", label: "Bloating", detail: "Water retention triggered by hormonal transitions." },
  { id: "mood", label: "Mood Swings", detail: "Emotional sensitivity and neuro-hormonal fluctuations." },
  { id: "headache", label: "Headache / Migraine", detail: "Estrogen drop-induced vascular changes." },
  { id: "breakouts", label: "Skin Breakouts", detail: "Sebum upregulation from relative androgen ratios." },
  { id: "breast", label: "Breast Tenderness", detail: "Progesterone-induced mammary gland tissue density transition." }
];

export default function CycleCalendar({
  pastCycles,
  cycleLength,
  periodDuration,
  lastPeriodStartDate,
  lang,
}: CycleCalendarProps) {
  const t = translations[lang];
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Interactive Logger and Predictor state
  const [logStartDate, setLogStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [logEndDate, setLogEndDate] = useState<string>(
    new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [cycleLengthOverride, setCycleLengthOverride] = useState<number>(cycleLength || 28);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'log' | 'history'>('log');

  // Computed Predictions based on active user logger entries
  const [predictionResult, setPredictionResult] = useState<{
    nextPeriodStart: string;
    nextPeriodEnd: string;
    ovulationStart: string;
    ovulationEnd: string;
    duration: number;
    symptomsLogged: string[];
  } | null>(null);

// Helper functions for timezone-insulated date string operations
const addDaysStr = (dateStr: string, days: number): string => {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3) return dateStr;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + days);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
};

const getDaysDiffStr = (startStr: string, endStr: string): number => {
  const sParts = startStr.split("-").map(Number);
  const eParts = endStr.split("-").map(Number);
  const s = new Date(sParts[0], sParts[1] - 1, sParts[2]);
  const e = new Date(eParts[0], eParts[1] - 1, eParts[2]);
  const diffMs = e.getTime() - s.getTime();
  return Math.max(1, Math.round(diffMs / (24 * 60 * 60 * 1000)) + 1);
};

  const handleCalculatePrediction = (e: React.FormEvent) => {
    e.preventDefault();
    const durationDays = getDaysDiffStr(logStartDate, logEndDate);
    
    // Predicted next month period start date
    const nextStart = addDaysStr(logStartDate, cycleLengthOverride);
    const nextEnd = addDaysStr(nextStart, durationDays - 1);
    
    // Predicted ovulation date (roughly 14 days before the expected next period start date)
    const ovulationPeak = addDaysStr(nextStart, -14);
    
    // Ovulation fertile window: ovulation peak minus 4 days to ovulation peak plus 1 day
    const ovStart = addDaysStr(ovulationPeak, -4);
    const ovEnd = addDaysStr(ovulationPeak, 1);
    
    setPredictionResult({
      nextPeriodStart: nextStart,
      nextPeriodEnd: nextEnd,
      ovulationStart: ovStart,
      ovulationEnd: ovEnd,
      duration: durationDays,
      symptomsLogged: [...selectedSymptoms],
    });
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // First day of month (0-6)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // Helper to pre-calculate period ranges and ovulation ranges
  const activeRanges = React.useMemo(() => {
    const list: { type: "period" | "ovulation"; start: string; end: string }[] = [];
    
    // Add past cycles to list
    for (const c of pastCycles) {
      list.push({ type: "period", start: c.startDate, end: c.endDate });
    }
    
    // Add current logged period (if calculation active)
    if (predictionResult) {
      list.push({ type: "period", start: logStartDate, end: logEndDate });
    }
    
    // Compute future cycles (next 3 cycles)
    const baseStart = predictionResult ? logStartDate : lastPeriodStartDate;
    const len = predictionResult ? cycleLengthOverride : cycleLength;
    const dur = predictionResult ? predictionResult.duration : periodDuration;
    
    let currentSeed = baseStart;
    for (let i = 1; i <= 3; i++) {
      const pStart = addDaysStr(currentSeed, len);
      const pEnd = addDaysStr(pStart, dur - 1);
      list.push({ type: "period", start: pStart, end: pEnd });
      
      // Ovulation fertile window falls prior to the next period start
      // i.e. 14 days before the next period starts
      const ovPeak = addDaysStr(pStart, -14);
      const ovStart = addDaysStr(ovPeak, -4);
      const ovEnd = addDaysStr(ovPeak, 1);
      list.push({ type: "ovulation", start: ovStart, end: ovEnd });
      
      currentSeed = pStart;
    }
    
    return list;
  }, [pastCycles, predictionResult, logStartDate, logEndDate, lastPeriodStartDate, cycleLengthOverride, cycleLength, periodDuration]);

  // Helper: check if a specific day is a period day in any past or projected cycles
  const getDayStatus = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const cellDateStr = `${year}-${mm}-${dd}`;
    
    // Check if it belongs to any active period range
    const isPeriod = activeRanges.some(r => r.type === "period" && cellDateStr >= r.start && cellDateStr <= r.end);
    if (isPeriod) return "period" as const;
    
    // Check if it belongs to any active ovulation range
    const isOvulation = activeRanges.some(r => r.type === "ovulation" && cellDateStr >= r.start && cellDateStr <= r.end);
    if (isOvulation) return "ovulation" as const;
    
    return "normal" as const;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Build grid days
  const gridCells = [];
  // Add padding for previous month
  for (let s = 0; s < firstDay; s++) {
    gridCells.push(<div key={`empty-${s}`} className="p-2 border-b border-rose-100 dark:border-rose-950/20 text-transparent select-none">-</div>);
  }

  // Add month days
  for (let day = 1; day <= daysInMonth; day++) {
    const status = getDayStatus(currentYear, currentMonth, day);
    let cellStyle = "hover:bg-rose-100/30 dark:hover:bg-rose-900/10 cursor-pointer";
    let textStyle = "text-rose-900 dark:text-rose-100";
    let badge = null;

    if (status === "period") {
      cellStyle = "bg-rose-500/20 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200 ring-1 ring-rose-500/30 font-semibold";
      badge = <span className="absolute bottom-1 left-12 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />;
    } else if (status === "ovulation") {
      cellStyle = "bg-amber-500/15 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200 ring-1 ring-amber-500/30 font-semibold";
      badge = <span className="absolute bottom-1 left-12 w-2 h-2 rounded-full bg-amber-500" />;
    }

    gridCells.push(
      <div
        key={`day-${day}`}
        className={`relative h-14 p-2 border-b border-rose-100/50 dark:border-rose-950/20 transition-all ${cellStyle} rounded-lg flex flex-col justify-between`}
      >
        <span className={`text-sm font-medium ${textStyle}`}>{day}</span>
        {status === "period" && (
          <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold tracking-tight uppercase">Period</span>
        )}
        {status === "ovulation" && (
          <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold tracking-tight uppercase leading-none">Ovulation</span>
        )}
        {badge}
      </div>
    );
  }

  return (
    <div id="cycle-calendar-section" className="bg-white dark:bg-[#1a0f11] border border-rose-100 dark:border-rose-950/30 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-sans font-semibold tracking-tight text-rose-900 dark:text-rose-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-500" />
            {t.calendar}
          </h2>
          <p className="text-xs text-rose-500 font-mono mt-1 uppercase">
            Tracing cycle rhythms through clinical criteria
          </p>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-rose-500/20 ring-1 ring-rose-500/30 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            </span>
            <span className="text-rose-700 dark:text-rose-300 font-medium">Period days (Red)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-500/15 ring-1 ring-amber-500/30 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            </span>
            <span className="text-amber-700 dark:text-amber-300 font-medium font-sans">Ovulation days (Yellow)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* The Graphic Calendar */}
        <div className="lg:col-span-2 bg-rose-50/20 dark:bg-rose-950/5 rounded-xl p-4 border border-rose-100/50 dark:border-rose-950/10">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-1 px-2.5 rounded-lg border border-rose-100 dark:border-rose-950/30 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-700 dark:text-rose-300 transition-all font-mono text-sm flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-0.5" /> Prev
            </button>
            <h3 className="text-base font-sans font-medium text-rose-900 dark:text-rose-100">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-1 px-2.5 rounded-lg border border-rose-100 dark:border-rose-950/30 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-700 dark:text-rose-300 transition-all font-mono text-sm flex items-center"
            >
              Next <ChevronRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs font-semibold text-rose-400 mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {gridCells}
          </div>
        </div>

        {/* Sidebar container with Log Tab and History Tab */}
        <div className="bg-rose-50/10 dark:bg-rose-950/5 border border-rose-100/50 dark:border-rose-950/10 rounded-xl p-4">
          {predictionResult ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-rose-100/50 dark:border-rose-950/20 pb-3">
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-sans font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  Predictions Generated
                </div>
                <button
                  onClick={() => setPredictionResult(null)}
                  className="text-xs text-rose-550 hover:text-rose-750 dark:text-rose-300 dark:hover:text-white font-mono bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 p-1 px-2.5 rounded-lg border border-rose-100 dark:border-rose-950/30 transition-all cursor-pointer flex items-center gap-1"
                >
                  ← Edit Log
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-b border-rose-100/50 dark:border-rose-950/20 pb-2">
                <div>
                  <span className="block text-[9px] font-mono text-rose-450 dark:text-rose-300 uppercase">Input Duration</span>
                  <span className="font-mono text-rose-900 dark:text-rose-100 font-bold">{predictionResult.duration} days</span>
                </div>
                <div>
                  <span className="block text-[9px] font-mono text-rose-450 dark:text-rose-300 uppercase">Symptoms</span>
                  <span className="font-sans text-[10px] text-rose-700 dark:text-rose-300 leading-tight block">
                    {predictionResult.symptomsLogged.length > 0
                      ? predictionResult.symptomsLogged.join(", ")
                      : "None"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/10 flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-mono text-[9px] font-bold text-rose-500 uppercase tracking-tight">Next Month Period Cycle Date</div>
                    <div className="font-mono text-[11px] text-rose-950 dark:text-rose-100 font-bold mt-0.5">
                      {predictionResult.nextPeriodStart} to {predictionResult.nextPeriodEnd}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-500/5 dark:bg-amber-950/10 border border-amber-550/10 flex items-start gap-2">
                  <Heart className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-mono text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-tight">Predicted Ovulation Period</div>
                    <div className="font-mono text-[11px] text-amber-950 dark:text-amber-100 font-bold mt-0.5">
                      {predictionResult.ovulationStart} to {predictionResult.ovulationEnd}
                    </div>
                    <div className="text-[9px] text-amber-600/80 dark:text-amber-400/80 font-mono mt-0.5 leading-tight">
                      Includes peak fecundity and luteal window
                    </div>
                  </div>
                </div>
              </div>

              {predictionResult.symptomsLogged.length > 0 && (
                <div className="text-[10px] bg-white/40 dark:bg-black/10 p-2.5 rounded-lg font-mono text-rose-650 dark:text-rose-300 border border-rose-100/30 leading-snug">
                  <span className="font-bold">Advice</span>: 
                  {predictionResult.symptomsLogged.includes("Pelvic Cramps") && " Warm compresses and magnesium help reduce uterine prostaglandin swings. "}
                  {predictionResult.symptomsLogged.includes("Fatigue") && " Adapt sleep schedule. Energy limits surge post luteal drop. "}
                  {predictionResult.symptomsLogged.includes("Bloating") && " Stay active with mild aerobic stretches first thing in the morning to drain interstitial fluids. "}
                  {predictionResult.symptomsLogged.includes("Mood Swings") && " Whole carbs and proteins optimize dynamic blood sugar patterns. "}
                  {predictionResult.symptomsLogged.includes("Headache / Migraine") && " Vascular pressure changes are hormone-tied. Lower sound & screen intensity. "}
                  {predictionResult.symptomsLogged.includes("Skin Breakouts") && " Increased sebum corresponds to progesterone ratio peaks. "}
                  {predictionResult.symptomsLogged.includes("Breast Tenderness") && " Estrogen-triggered water-weight expands tissue structures. Keep sodium low. "}
                </div>
              )}

              <button
                type="button"
                onClick={() => setPredictionResult(null)}
                className="w-full py-2 bg-rose-105 hover:bg-rose-200 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-sans font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-rose-200/40"
              >
                ← Back to Edit Log
              </button>
            </div>
          ) : (
            <>
              <div className="flex bg-rose-100/40 dark:bg-rose-950/30 p-1 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setActiveSidebarTab('log')}
                  className={`flex-1 py-1.5 text-xs font-sans font-semibold rounded-lg transition-all cursor-pointer ${
                    activeSidebarTab === 'log'
                      ? "bg-rose-500 text-white shadow-sm"
                      : "text-rose-700 dark:text-rose-300 hover:bg-rose-100/30"
                  }`}
                >
                  Log Period & Predict
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSidebarTab('history')}
                  className={`flex-1 py-1.5 text-xs font-sans font-semibold rounded-lg transition-all cursor-pointer ${
                    activeSidebarTab === 'history'
                      ? "bg-rose-500 text-white shadow-sm"
                      : "text-rose-700 dark:text-rose-300 hover:bg-rose-100/30"
                  }`}
                >
                  Past 6 Cycles List
                </button>
              </div>

              {activeSidebarTab === 'log' ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-sans font-semibold text-rose-900 dark:text-rose-100 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-rose-505 bg-rose-500/10 p-0.5 rounded" />
                    Symptom Logger & Predictor
                  </h3>

                  <form onSubmit={handleCalculatePrediction} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-mono font-bold text-rose-550 dark:text-rose-300 uppercase block mb-1">Period Start</label>
                        <input
                          type="date"
                          required
                          value={logStartDate}
                          onChange={(e) => setLogStartDate(e.target.value)}
                          className="w-full text-xs font-mono p-2 bg-white dark:bg-[#1C0F11] border border-rose-100 dark:border-rose-950 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none text-rose-900 dark:text-rose-100"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono font-bold text-rose-550 dark:text-rose-300 uppercase block mb-1">Period End</label>
                        <input
                          type="date"
                          required
                          value={logEndDate}
                          onChange={(e) => setLogEndDate(e.target.value)}
                          className="w-full text-xs font-mono p-2 bg-white dark:bg-[#1C0F11] border border-rose-100 dark:border-rose-950 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none text-rose-900 dark:text-rose-105"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold text-rose-550 dark:text-rose-300 uppercase block mb-1">Your Cycle Length (Days)</label>
                      <input
                        type="number"
                        min="20"
                        max="45"
                        value={cycleLengthOverride}
                        onChange={(e) => setCycleLengthOverride(parseInt(e.target.value) || 28)}
                        className="w-full text-xs font-mono p-2 bg-white dark:bg-[#1C0F11] border border-rose-100 dark:border-rose-950 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none text-rose-900 dark:text-rose-100"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold text-rose-550 dark:text-rose-300 uppercase block mb-1.5">Symptoms Experienced</label>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950 rounded-lg">
                        {AVAILABLE_SYMPTOMS.map((sym) => (
                          <label key={sym.id} className="flex items-start gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={selectedSymptoms.includes(sym.label)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSymptoms([...selectedSymptoms, sym.label]);
                                } else {
                                  setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym.label));
                                }
                              }}
                              className="mt-0.5 rounded text-rose-550 focus:ring-rose-400"
                            />
                            <div className="flex flex-col">
                              <span className="text-[11px] font-medium text-rose-950 dark:text-rose-105">{sym.label}</span>
                              <span className="text-[9px] text-rose-500 dark:text-rose-400 leading-tight">{sym.detail}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-rose-505 hover:bg-rose-600 active:bg-rose-700 text-white text-xs font-sans font-bold rounded-lg transition-all shadow-sm cursor-pointer"
                    >
                      Calculate Predictions & Plot
                    </button>
                  </form>
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-sans font-semibold text-rose-900 dark:text-rose-100 mb-3 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-505 fill-rose-500/20" />
                    Past 6 Period Cycles Record
                  </h4>
                  <div className="space-y-2.5">
                    {pastCycles.map((cycle, i) => (
                      <div
                        key={cycle.id}
                        className="p-2.5 rounded-lg bg-white dark:bg-[#251619] border border-rose-100/70 dark:border-rose-950/25 flex justify-between items-center text-xs"
                      >
                        <div>
                          <div className="font-sans font-medium text-rose-900 dark:text-rose-200">
                            Cycle #{pastCycles.length - i}
                          </div>
                          <div className="font-mono text-[11px] text-rose-505 mt-0.5">
                            {cycle.startDate} to {cycle.endDate}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-medium text-rose-700 dark:text-rose-300">
                            {cycle.periodDuration} days duration
                          </div>
                          <div className="font-mono text-[10px] text-rose-400 mt-0.5">
                            Interval: {cycle.cycleLength} days
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tip Section */}
                  <div className="mt-4 p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/15 text-[11px] text-rose-700 dark:text-rose-300 border border-rose-100/30 flex gap-2">
                    <Info className="w-4 h-4 shrink-0 text-rose-500" />
                    <p className="leading-relaxed">
                      <strong>Ovulation Prediction Rule</strong>: Ovulation is estimated based on your average standard cycles (14 days prior to your next expected cycle start date). High fertility occurs around ovulation day.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Visual Analytics Chart Row */}
      <div className="mt-6 border-t border-rose-100 dark:border-rose-950/20 pt-6">
        <CycleHistoryChart pastCycles={pastCycles} lang={lang} />
      </div>
    </div>
  );
}
