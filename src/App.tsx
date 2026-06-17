/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import CreateAccount from "./components/CreateAccount";
import Dashboard from "./components/Dashboard";
import CycleCalendar from "./components/CycleCalendar";
import Questionnaire from "./components/Questionnaire";
import LifestyleTracker from "./components/LifestyleTracker";
import Chatbot from "./components/Chatbot";
import ProfileMaintenance from "./components/ProfileMaintenance";
import IotHardwareSimulator from "./components/IotHardwareSimulator";
import { UserProfile, PeriodCycle, IotReadings, PredictionResult, QuestionnaireAnswers, WaterLog, SleepLog, LanguageCode } from "./types";
import { translations } from "./data/translations";
import { Heart, Activity, AlertCircle, Sparkles, HelpCircle, Code, Settings } from "lucide-react";

// Default Clinical Profile
const initialProfile: UserProfile = {
  id: "profile-1",
  name: "Dr. Ananya Sharma",
  age: 26,
  height: 162,
  weight: 58,
  cycleLength: 28,
  periodDuration: 5,
  lastPeriodStartDate: "2026-05-18",
};

// Past 6 Period Cycle records mapping
const defaultPastCycles: PeriodCycle[] = [
  { id: "c1", startDate: "2026-04-20", endDate: "2026-04-24", cycleLength: 28, periodDuration: 5 },
  { id: "c2", startDate: "2026-03-23", endDate: "2026-03-27", cycleLength: 28, periodDuration: 5 },
  { id: "c3", startDate: "2026-02-22", endDate: "2026-02-26", cycleLength: 29, periodDuration: 5 },
  { id: "c4", startDate: "2026-01-25", endDate: "2026-01-29", cycleLength: 28, periodDuration: 5 },
  { id: "c5", startDate: "2025-12-28", endDate: "2025-12-31", cycleLength: 28, periodDuration: 4 },
  { id: "c6", startDate: "2025-11-30", endDate: "2025-12-04", cycleLength: 28, periodDuration: 5 },
];

export default function App() {
  const [lang, setLang] = useState<LanguageCode>("en");
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'calendar' | 'questionnaire' | 'lifestyle'>('dashboard');
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [showCreateAccount, setShowCreateAccount] = useState<boolean>(!localStorage.getItem("ovuline_user_email"));
  const [showLanding, setShowLanding] = useState<boolean>(true);
  
  // Settings trigger states
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [simPanelOpen, setSimPanelOpen] = useState<boolean>(true); // Keep Simulator Visible for calibration ease!

  // Profile and Cycles State
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [pastCycles, setPastCycles] = useState<PeriodCycle[]>(defaultPastCycles);

  // IoT Hardware active values
  const [iotReadings, setIotReadings] = useState<IotReadings>({
    temperature: 36.6,
    heartRate: 72,
    insulin: 8.5,
    glucose: 95,
    spo2: 98,
    ledDisplay: "Ovuline IoT Standby",
    timestamp: new Date().toISOString(),
  });

  const [manualLevel2Prediction, setManualLevel2Prediction] = useState<PredictionResult | null>(null);

  // Level 1 active results saved
  const [level1Prediction, setLevel1Prediction] = useState<PredictionResult | null>(null);
  const [level1Answers, setLevel1Answers] = useState<QuestionnaireAnswers | null>(null);

  // Lifestyle tracker logs (saved in session)
  const [waterLog, setWaterLog] = useState<WaterLog>({
    date: new Date().toISOString().split("T")[0],
    amountMl: 750,
    targetMl: 2500,
  });

  const [sleepLog, setSleepLog] = useState<SleepLog>({
    date: new Date().toISOString().split("T")[0],
    hours: 7.0,
    targetHours: 8.0,
  });

  // Hydrate states from localStorage on boot
  useEffect(() => {
    const savedProfile = localStorage.getItem("ovuline_profile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    const savedWater = localStorage.getItem("ovuline_water");
    if (savedWater) {
      setWaterLog(JSON.parse(savedWater));
    }
    const savedSleep = localStorage.getItem("ovuline_sleep");
    if (savedSleep) {
      setSleepLog(JSON.parse(savedSleep));
    }
  }, []);

  // Always render the light theme for a bright wellness experience
  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem("ovuline_profile", JSON.stringify(updatedProfile));
    
    // Dynamically shift pastCyclesStartDate or project future periods
    // To present standard past 6 cycles logs in the calendar nicely
    const mockUpdatedCycles: PeriodCycle[] = [...pastCycles];
    if (mockUpdatedCycles.length > 0) {
      mockUpdatedCycles[0].startDate = updatedProfile.lastPeriodStartDate;
      // Calculate derived end date
      const endD = new Date(new Date(updatedProfile.lastPeriodStartDate).getTime() + (updatedProfile.periodDuration - 1) * 24 * 60 * 60 * 1000);
      mockUpdatedCycles[0].endDate = endD.toISOString().split("T")[0];
      mockUpdatedCycles[0].periodDuration = updatedProfile.periodDuration;
      mockUpdatedCycles[0].cycleLength = updatedProfile.cycleLength;
      setPastCycles(mockUpdatedCycles);
    }
  };

  const handleLogWater = (amountMl: number) => {
    const updated = { ...waterLog, amountMl: waterLog.amountMl + amountMl };
    setWaterLog(updated);
    localStorage.setItem("ovuline_water", JSON.stringify(updated));
  };

  const handleResetWater = () => {
    const updated = { ...waterLog, amountMl: 0 };
    setWaterLog(updated);
    localStorage.setItem("ovuline_water", JSON.stringify(updated));
  };

  const handleLogSleep = (hours: number) => {
    const updated = { ...sleepLog, hours: hours };
    setSleepLog(updated);
    localStorage.setItem("ovuline_sleep", JSON.stringify(updated));
  };

  const handlePredictionComplete = (result: PredictionResult, answers: QuestionnaireAnswers) => {
    setLevel1Prediction(result);
    setLevel1Answers(answers);
    
    // Kept on Level 1 page for downloading results and reviewing risk %
  };

  const handleUpdateIotReadings = async (updatedReadings: Partial<IotReadings>) => {
    const nextReadings = {
      ...iotReadings,
      ...updatedReadings,
      timestamp: new Date().toISOString(),
      ledDisplay: updatedReadings.ledDisplay ?? iotReadings.ledDisplay,
    };

    setIotReadings(nextReadings);

    try {
      const response = await fetch("/api/iot-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextReadings),
      });
      const data = await response.json();

      if (data.currentState) {
        setIotReadings(data.currentState);
      }
      if (data.analysis) {
        setManualLevel2Prediction(data.analysis);
      }
    } catch (error) {
      console.warn("IoT update failed, using local readings only.", error);
      setManualLevel2Prediction({
        risk_percentage: 0,
        prediction_label: "Unlikely (Healthy)",
        confidence_score: 0.72,
        status: "Offline fallback"
      });
    }
  };

  const nextPeriodDate = (() => {
    const lastPeriod = new Date(profile.lastPeriodStartDate);
    const nextStart = new Date(lastPeriod.getTime() + profile.cycleLength * 24 * 60 * 60 * 1000);
    return nextStart.toISOString().split("T")[0];
  })();

  const t = translations[lang];

  return (
    <AnimatePresence mode="wait">
      {showCreateAccount ? (
        <CreateAccount
          onAccountCreated={(newProfile) => {
            setProfile(newProfile);
            setShowCreateAccount(false);
            setShowLanding(true);
          }}
          onCancel={() => {
            setShowCreateAccount(false);
            setShowLanding(true);
          }}
        />
      ) : !hasStarted && showLanding ? (
        <LandingPage onStart={() => {
          setHasStarted(true);
          setShowLanding(false);
        }} />
      ) : (
        <motion.div
          key="app-shell"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="min-h-screen bg-[#FFF8FA] text-rose-950 transition-colors duration-300 flex flex-col"
        >
          {/* HEADER SECTION --- Logo, selector, drawer indicators */}
          <Header
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            lang={lang}
            setLang={setLang}
            onOpenProfile={() => setProfileOpen(true)}
            onOpenChat={() => setChatOpen(true)}
          />

          <motion.main
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
            className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
          >
            <section className="rounded-[2rem] border border-rose-100/80 bg-white/95 shadow-[0_40px_120px_-48px_rgba(244,63,94,0.24)] p-6 backdrop-blur-sm">
              <div className="grid gap-5 lg:grid-cols-[1.5fr_0.95fr]">
                <div className="space-y-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.4em] text-rose-500 font-semibold">Light Wellness Experience</p>
                      <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-rose-950">Ovuline in a brighter, cleaner light interface</h2>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm">
                      <Sparkles className="w-4 h-4 text-rose-500" />
                      Clean, clinical, and elevated
                    </span>
                  </div>
                  <p className="max-w-2xl text-sm leading-7 text-rose-700">
                    Enjoy a fully reimagined premium wellness platform with glassmorphism layers, soft gradient surfaces, intelligent AI guidance, and elegant clinical clarity.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-[1.75rem] bg-rose-50 p-5 border border-rose-100 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-rose-500 font-semibold">Next period starts</p>
                <p className="mt-3 text-2xl font-extrabold text-rose-950">{nextPeriodDate}</p>
              </div>
            </div>
                </div>
                <div className="rounded-[1.75rem] border border-rose-100 bg-rose-50 p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="rounded-3xl bg-rose-500/10 p-3">
                      <Heart className="w-6 h-6 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.3em] text-rose-500 font-semibold">Wellness scorecard</p>
                      <h3 className="mt-3 text-xl font-semibold text-rose-950">Fast insights</h3>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-4">
                    <div className="rounded-[1.5rem] bg-white border border-rose-100 p-4 shadow-sm">
                      <div className="flex justify-between text-xs uppercase text-rose-500 font-semibold">
                        <span>Hydration</span>
                        <span>{Math.min(100, Math.round((waterLog.amountMl / waterLog.targetMl) * 100))}%</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-rose-100 overflow-hidden">
                        <div className="h-2 rounded-full bg-rose-500" style={{ width: `${Math.min(100, Math.round((waterLog.amountMl / waterLog.targetMl) * 100))}%` }} />
                      </div>
                    </div>
                    <div className="rounded-[1.5rem] bg-white border border-rose-100 p-4 shadow-sm">
                      <div className="flex justify-between text-xs uppercase text-rose-500 font-semibold">
                        <span>Sleep quality</span>
                        <span>{Math.round((sleepLog.hours / sleepLog.targetHours) * 100)}%</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-rose-100 overflow-hidden">
                        <div className="h-2 rounded-full bg-rose-500" style={{ width: `${Math.min(100, Math.round((sleepLog.hours / sleepLog.targetHours) * 100))}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Dynamic Nav View Blocks */}
            {currentTab === 'dashboard' && (
              <Dashboard
                pastCycles={pastCycles}
                profile={profile}
                iotReadings={iotReadings}
                level1Prediction={level1Prediction}
                level1Answers={level1Answers}
                manualLevel2Prediction={manualLevel2Prediction}
                onAnalyzeReadings={async () => {
                  await handleUpdateIotReadings({});
                }}
                lang={lang}
              />
            )}

            {currentTab === 'calendar' && (
              <CycleCalendar
                pastCycles={pastCycles}
                cycleLength={profile.cycleLength}
                periodDuration={profile.periodDuration}
                lastPeriodStartDate={profile.lastPeriodStartDate}
                lang={lang}
              />
            )}

            {currentTab === 'questionnaire' && (
              <Questionnaire
                lang={lang}
                onPredictionComplete={handlePredictionComplete}
              />
            )}

            {currentTab === 'lifestyle' && (
              <LifestyleTracker
                waterLog={waterLog}
                sleepLog={sleepLog}
                onLogWater={handleLogWater}
                onLogSleep={handleLogSleep}
                onResetWater={handleResetWater}
                lang={lang}
              />
            )}

            {/* Manual Level 2 entry portal for diagnostics and report workflows */}
            {currentTab === 'dashboard' && (
              <div className="border-t border-rose-100 pt-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <h3 className="text-sm font-sans font-bold text-rose-950 uppercase tracking-widest flex items-center gap-2">
                    <Settings className="w-4 h-4 text-rose-500" />
                    Manual Level 2 Diagnostic Entry
                  </h3>
                  <button
                    onClick={() => setSimPanelOpen(!simPanelOpen)}
                    className="px-3 py-1.5 rounded-lg border border-rose-150 text-xs font-mono font-bold hover:bg-rose-50 text-rose-600 transition-all"
                  >
                    {simPanelOpen ? "Hide Manual Entry" : "Show Manual Entry"}
                  </button>
                </div>

                {simPanelOpen && (
                  <IotHardwareSimulator
                    iotReadings={iotReadings}
                    onUpdateIotReadings={handleUpdateIotReadings}
                    riskPrediction={manualLevel2Prediction}
                    lang={lang}
                  />
                )}
              </div>
            )}
          </motion.main>

          {/* FLOATABLE MODULAR SIDE DRAWER COMPONENTS */}
          <Chatbot
            lang={lang}
            isOpen={chatOpen}
            onClose={() => setChatOpen(false)}
          />

          <ProfileMaintenance
            isOpen={profileOpen}
            onClose={() => setProfileOpen(false)}
            profile={profile}
            onSaveProfile={handleSaveProfile}
            lang={lang}
          />

          {/* FOOTER SECTION */}
          <footer className="py-6 border-t border-rose-100 bg-white text-xs font-mono text-rose-500 text-center">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                <span>Ovuline &copy; 2026. Tracing the rhythm of your cycle.</span>
              </div>
              <div>
                <span>Platform Integration Level 1 & Level 2 Active.</span>
              </div>
            </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
