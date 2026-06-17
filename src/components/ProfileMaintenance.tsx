import React, { useState, useEffect } from "react";
import { 
  X, User, Ruler, Heart, Calendar, Activity, Weight, Save, ShieldAlert,
  Lock, Key, Mail, CheckCircle, Smartphone, Sliders, LogOut, Loader2
} from "lucide-react";
import { UserProfile, LanguageCode } from "../types";
import { translations } from "../data/translations";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "../lib/firebase";
import { profileService, ExtendedProfile } from "../lib/profileService";

interface ProfileProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  lang: LanguageCode;
}

export default function ProfileMaintenance({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  lang,
}: ProfileProps) {
  const t = translations[lang] || translations.en;
  
  // Tab selection
  const [activeSubTab, setActiveSubTab] = useState<"account" | "metrics" | "health" | "prefs">("account");
  
  // Auth state
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  // Profile fields state
  const [formData, setFormData] = useState<ExtendedProfile>({
    ...profile,
    preferences: {
      theme: "light",
      language: lang,
      density: "high-density"
    },
    healthHistory: {
      hasDermatologyNotes: false,
      pelvicPainLevel: "None",
      insulinResistanceIndex: 1.2,
      diagnosedPCOS: false,
      familyPCOSHistory: false
    }
  });

  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Monitor Auth Changes
  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Offline Simulation Auth Check on LocalStorage
      const storedActiveUser = localStorage.getItem("ovuline_simulated_user");
      if (storedActiveUser) {
        setUser({
          uid: "simulated-user-123",
          email: storedActiveUser,
          emailVerified: true,
        } as unknown as FirebaseUser);
      }
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (current) => {
      setUser(current);
      if (current) {
        // Automatically sync clinical data from Firestore
        try {
          const cloudProfile = await profileService.getUserProfile(current.uid);
          if (cloudProfile) {
            setFormData(cloudProfile);
            onSaveProfile(cloudProfile);
          }
        } catch (err) {
          console.warn("Could not auto-fetch user profile from real Firestore:", err);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  // Sign In / Create Account Handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMsg(null);
    setAuthLoading(true);

    if (!isFirebaseConfigured) {
      // Simulated Auth Sandbox Flows
      if (email.trim() === "" || password.length < 5) {
        setAuthError("Please input an authentic email with a password exceeding 5 characters.");
        setAuthLoading(false);
        return;
      }

      if (isRegistering) {
        setAuthSuccessMsg("Account successfully registered securely inside your offline sandbox!");
        localStorage.setItem("ovuline_simulated_user", email);
        setUser({
          uid: "simulated-user-123",
          email: email,
          emailVerified: true
        } as unknown as FirebaseUser);
      } else {
        setAuthSuccessMsg("Successfully logged into your off-grid profile!");
        localStorage.setItem("ovuline_simulated_user", email);
        setUser({
          uid: "simulated-user-123",
          email: email,
          emailVerified: true
        } as unknown as FirebaseUser);
      }

      // Populate basic name to match email name prefix if unpopulated
      if (!formData.name || formData.name === "Dr. Ananya Sharma") {
        const defaultName = email.split("@")[0];
        setFormData(prev => ({ ...prev, name: defaultName }));
      }

      setAuthLoading(false);
      setTimeout(() => {
        setActiveSubTab("metrics");
        setAuthSuccessMsg(null);
      }, 1000);
      return;
    }

    // Real Firebase Auth
    try {
      if (isRegistering) {
        const credentials = await createUserWithEmailAndPassword(auth, email, password);
        setAuthSuccessMsg("Account registered successfully! Ready for real-time cloud tracking.");
        
        // Save initial blank profile in Firestore
        const newProfile: ExtendedProfile = {
          ...formData,
          id: credentials.user.uid,
          email: credentials.user.email || ""
        };
        await profileService.saveUserProfile(credentials.user.uid, newProfile);
        setFormData(newProfile);
        onSaveProfile(newProfile);
      } else {
        const credentials = await signInWithEmailAndPassword(auth, email, password);
        setAuthSuccessMsg("Logged in successfully! Real-time synchronization active.");
        
        const existingProf = await profileService.getUserProfile(credentials.user.uid);
        if (existingProf) {
          setFormData(existingProf);
          onSaveProfile(existingProf);
        }
      }

      setTimeout(() => {
        setActiveSubTab("metrics");
        setAuthSuccessMsg(null);
      }, 1000);

    } catch (error: any) {
      setAuthError(error.message || "An error occurred during authentication.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    if (!isFirebaseConfigured) {
      localStorage.removeItem("ovuline_simulated_user");
      setUser(null);
      setAuthLoading(false);
      return;
    }

    try {
      await signOut(auth);
      setUser(null);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Clinical Profile Update Handler
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(true);

    const activeUid = user ? user.uid : "profile-1";
    const currentProfile: ExtendedProfile = {
      ...formData,
      id: activeUid,
    };

    try {
      await profileService.saveUserProfile(activeUid, currentProfile);
      onSaveProfile(currentProfile);
      
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 800);
    } catch (err: any) {
      setSaveError(err.message || "Unable to save profile metrics at this time.");
      setSaveSuccess(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a0f11] border border-rose-100 dark:border-rose-950/30 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden transition-all transform scale-100 flex flex-col h-[580px]">
        
        {/* Top Header Row */}
        <div className="flex justify-between items-center border-b border-rose-100/60 dark:border-rose-950/25 p-4 bg-rose-50/25 dark:bg-[#251517]/30">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-rose-500 animate-pulse" />
              <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-rose-950 dark:text-rose-100">
                Ovuline Secure Clinical Profile
              </h3>
            </div>
            {/* Real-time sync connection indicator */}
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isFirebaseConfigured && user ? "bg-green-500" : "bg-amber-400 animate-pulse"}`} />
              <span className="text-[10px] font-mono text-rose-500 uppercase">
                {isFirebaseConfigured && user
                  ? "Cloud Synchronizer: Connected"
                  : "Database Status: Local Sandbox Sync Active"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-rose-100/40 dark:hover:bg-rose-950/25 text-rose-600 dark:text-rose-450 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal Navigation Sub-Tabs */}
        <div className="flex border-b border-rose-100/40 dark:border-rose-950/15 bg-white dark:bg-[#1a0f11] p-1 font-mono text-xs">
          <button
            onClick={() => setActiveSubTab("account")}
            className={`flex-1 py-2 text-center font-bold tracking-tight rounded-lg transition-all cursor-pointer ${
              activeSubTab === "account" ? "bg-rose-100/40 text-rose-600 dark:bg-rose-950/30" : "text-rose-400"
            }`}
          >
            Account
          </button>
          <button
            disabled={!user}
            onClick={() => setActiveSubTab("metrics")}
            className={`flex-1 py-2 text-center font-bold tracking-tight rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              activeSubTab === "metrics" ? "bg-rose-100/40 text-rose-600 dark:bg-rose-950/30" : "text-rose-400"
            }`}
          >
            Body Metrics
          </button>
          <button
            disabled={!user}
            onClick={() => setActiveSubTab("health")}
            className={`flex-1 py-2 text-center font-bold tracking-tight rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              activeSubTab === "health" ? "bg-rose-100/40 text-rose-600 dark:bg-rose-950/30" : "text-rose-400"
            }`}
          >
            Health History
          </button>
          <button
            disabled={!user}
            onClick={() => setActiveSubTab("prefs")}
            className={`flex-1 py-2 text-center font-bold tracking-tight rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              activeSubTab === "prefs" ? "bg-rose-100/40 text-rose-600 dark:bg-rose-950/30" : "text-rose-400"
            }`}
          >
            Preferences
          </button>
        </div>

        {/* Tab Canvas Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* 1. Account Configuration View */}
          {activeSubTab === "account" && (
            <div className="space-y-4">
              {authLoading ? (
                <div className="h-44 flex flex-col justify-center items-center gap-2">
                  <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                  <span className="text-xs font-mono text-rose-500">Processing credentials safely...</span>
                </div>
              ) : user ? (
                <div className="p-4 bg-rose-50/35 border border-rose-100 rounded-xl dark:bg-[#251517]/20 dark:border-rose-950/30 space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-10 h-10 text-rose-500" />
                    <div>
                      <h4 className="text-sm font-sans font-bold text-rose-950 dark:text-rose-100">
                        Authenticated Active User
                      </h4>
                      <p className="text-xs font-mono text-rose-500">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-rose-100/50 dark:border-rose-950/20 pt-3 flex justify-between items-center text-xs">
                    <span className="text-rose-450 font-sans">
                      All diagnostic metrics will sync to your secure clinical profile automatically.
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 flex items-center gap-1 hover:bg-rose-50 dark:border-rose-950/40 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div className="text-center max-w-sm mx-auto">
                    <h4 className="text-sm font-sans font-bold text-rose-900 dark:text-rose-100">
                      Sign In / Register Profile Account
                    </h4>
                    <p className="text-[11px] text-rose-450 mt-1 leading-relaxed">
                      Syncing physical indicators, PCOD diagnostics, and cycle periods across cloud devices requires an encrypted secure profile.
                    </p>
                  </div>

                  {authError && (
                    <div className="p-2 bg-rose-50 text-red-600 border border-rose-100 rounded-lg text-xs flex items-center gap-1.5 dark:bg-[#251517] dark:border-red-950/20">
                      <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {authSuccessMsg && (
                    <div className="p-2 bg-green-50 text-green-700 border border-green-100 rounded-lg text-xs flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      <span>{authSuccessMsg}</span>
                    </div>
                  )}

                  <div className="space-y-3 max-w-sm mx-auto">
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-rose-400" />
                      <input
                        type="email"
                        required
                        placeholder="Clinical Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-rose-100 bg-white dark:bg-[#1a0f11] dark:border-rose-950/40 text-rose-950 dark:text-rose-100 text-xs focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-rose-400" />
                      <input
                        type="password"
                        required
                        placeholder="Secure passkey (minimum 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-rose-100 bg-white dark:bg-[#1a0f11] dark:border-rose-950/40 text-rose-950 dark:text-rose-100 text-xs focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="submit"
                        className="flex-1 py-1.5 rounded-lg bg-rose-500 text-white font-sans font-semibold text-xs transition-all cursor-pointer hover:bg-rose-600"
                      >
                        {isRegistering ? "Register New User" : "Sign In Account"}
                      </button>
                    </div>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-[10px] font-mono text-rose-500 uppercase font-bold hover:underline cursor-pointer"
                      >
                        {isRegistering 
                          ? "Already possess an active profile? Log In" 
                          : "New to Ovuline? Complete a new account setup"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 2. Body Metrics & Menstrual Cycle parameters */}
          {activeSubTab === "metrics" && (
            <form onSubmit={handleSubmitProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-rose-500 block mb-1">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-rose-100 bg-white dark:bg-[#1a0f11] dark:border-rose-950/40 text-rose-950 dark:text-rose-100 text-xs font-semibold focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-rose-500 block mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg border border-rose-100 bg-white dark:bg-[#1a0f11] dark:border-rose-950/40 text-rose-950 dark:text-rose-100 text-xs font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-rose-500 block mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg border border-rose-100 bg-white dark:bg-[#1a0f11] dark:border-rose-950/40 text-rose-950 dark:text-rose-100 text-xs font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-rose-500 block mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg border border-rose-100 bg-white dark:bg-[#1a0f11] dark:border-rose-950/40 text-rose-950 dark:text-rose-100 text-xs font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-rose-500 block mb-1">
                    Cycle Length (Days)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.cycleLength}
                    onChange={(e) => setFormData({ ...formData, cycleLength: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg border border-rose-100 bg-white dark:bg-[#1a0f11] dark:border-rose-950/40 text-rose-950 dark:text-rose-100 text-xs font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-rose-500 block mb-1">
                    Period Duration (Days)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.periodDuration}
                    onChange={(e) => setFormData({ ...formData, periodDuration: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg border border-rose-100 bg-white dark:bg-[#1a0f11] dark:border-rose-950/40 text-rose-950 dark:text-rose-100 text-xs font-mono focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-mono uppercase font-bold text-rose-500 block mb-1">
                    Last Period Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.lastPeriodStartDate}
                    onChange={(e) => setFormData({ ...formData, lastPeriodStartDate: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-rose-100 bg-white dark:bg-[#1a0f11] dark:border-rose-950/40 text-rose-950 dark:text-rose-100 text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              {saveError && (
                <div className="p-2 text-xs bg-red-50 text-red-600 rounded-lg">{saveError}</div>
              )}

              <button
                type="submit"
                disabled={saveSuccess}
                className="w-full mt-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-sans font-semibold text-xs transition-all cursor-pointer flex justify-center items-center gap-2"
              >
                {saveSuccess ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Physical Indicators
              </button>
            </form>
          )}

          {/* 3. Clinical & Diagnosed Health History */}
          {activeSubTab === "health" && (
            <form onSubmit={handleSubmitProfile} className="space-y-4">
              <div className="p-3.5 bg-rose-50/20 border border-rose-105 rounded-xl dark:bg-[#251517]/10 dark:border-rose-950/30 space-y-3">
                <h4 className="text-xs font-mono font-bold text-rose-650 uppercase">Clinical Symptoms Registry</h4>
                
                <div className="flex items-center justify-between py-1 border-b border-rose-100/30">
                  <span className="text-xs font-sans text-rose-950 dark:text-rose-200">
                    Insulin Resistance Index (HOMA-IR)
                  </span>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0.1"
                    max="10.0"
                    value={formData.healthHistory?.insulinResistanceIndex ?? 1.2}
                    onChange={(e) => setFormData({
                      ...formData,
                      healthHistory: {
                        ...formData.healthHistory,
                        insulinResistanceIndex: Number(e.target.value)
                      }
                    })}
                    className="w-16 px-1.5 py-0.5 text-center font-mono text-xs rounded border border-rose-100 bg-white dark:bg-[#1a0f11] dark:border-rose-950/40"
                  />
                </div>

                <div className="flex items-center justify-between py-1 border-b border-rose-100/30">
                  <span className="text-xs font-sans text-rose-950 dark:text-rose-200">
                    Pelvic Pain Discomfort
                  </span>
                  <select 
                    value={formData.healthHistory?.pelvicPainLevel ?? "None"}
                    onChange={(e) => setFormData({
                      ...formData,
                      healthHistory: {
                        ...formData.healthHistory,
                        pelvicPainLevel: e.target.value as any
                      }
                    })}
                    className="px-2 py-0.5 text-xs rounded border border-rose-100 bg-white dark:bg-[#1a0f11] dark:border-rose-950/40 text-rose-950"
                  >
                    <option value="None">None</option>
                    <option value="Mild">Mild discomfort</option>
                    <option value="Severe">Severe Pain</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-xs font-sans text-rose-950 dark:text-rose-200">
                    Possess Dermatology Notes (Severe Acne / Hair loss)
                  </span>
                  <input 
                    type="checkbox" 
                    checked={formData.healthHistory?.hasDermatologyNotes ?? false}
                    onChange={(e) => setFormData({
                      ...formData,
                      healthHistory: {
                        ...formData.healthHistory,
                        hasDermatologyNotes: e.target.checked
                      }
                    })}
                    className="w-4 h-4 accent-rose-500 rounded focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-rose-50/20 border border-rose-105 rounded-xl dark:bg-[#251517]/10 dark:border-rose-950/30 space-y-3">
                <h4 className="text-xs font-mono font-bold text-rose-650 uppercase">Clinical Diagnostic Status</h4>
                
                <div className="flex items-center justify-between py-1 border-b border-rose-100/30">
                  <span className="text-xs font-sans text-rose-950 dark:text-rose-200">
                    Formally Diagnosed with PCOD/PCOS
                  </span>
                  <input 
                    type="checkbox" 
                    checked={formData.healthHistory?.diagnosedPCOS ?? false}
                    onChange={(e) => setFormData({
                      ...formData,
                      healthHistory: {
                        ...formData.healthHistory,
                        diagnosedPCOS: e.target.checked
                      }
                    })}
                    className="w-4 h-4 accent-rose-500 rounded"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-xs font-sans text-rose-950 dark:text-rose-200">
                    Family History of PCOS
                  </span>
                  <input 
                    type="checkbox" 
                    checked={formData.healthHistory?.familyPCOSHistory ?? false}
                    onChange={(e) => setFormData({
                      ...formData,
                      healthHistory: {
                        ...formData.healthHistory,
                        familyPCOSHistory: e.target.checked
                      }
                    })}
                    className="w-4 h-4 accent-rose-500 rounded"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saveSuccess}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-sans font-semibold text-xs transition-all cursor-pointer flex justify-center items-center gap-2"
              >
                {saveSuccess ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Sync Clinical Health Information
              </button>
            </form>
          )}

          {/* 4. Preference Configuration */}
          {activeSubTab === "prefs" && (
            <form onSubmit={handleSubmitProfile} className="space-y-4">
              <div className="p-3.5 bg-rose-50/20 border border-rose-105 rounded-xl dark:bg-[#251517]/10 dark:border-rose-950/30 space-y-4">
                <h4 className="text-xs font-mono font-bold text-rose-650 uppercase">Display & Language settings</h4>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-rose-400 block mb-1">
                    Interface Language Setup
                  </label>
                  <select
                    value={formData.preferences?.language ?? "en"}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        language: e.target.value as LanguageCode
                      }
                    })}
                    className="w-full px-3 py-1.5 rounded-lg border border-rose-100 bg-white dark:bg-[#1a0f11] dark:border-rose-950/40 text-rose-950 text-xs"
                  >
                    <option value="en">English (Default)</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="es">Español (Spanish)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-rose-400 block mb-1">
                    Layout density configuration
                  </label>
                  <select
                    value={formData.preferences?.density ?? "high-density"}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        density: e.target.value as any
                      }
                    })}
                    className="w-full px-3 py-1.5 rounded-lg border border-rose-100 bg-white dark:bg-[#1a0f11] dark:border-rose-950/40 text-rose-950 text-xs"
                  >
                    <option value="high-density">High Density (Full Information Layout)</option>
                    <option value="compact">Compact (Minimal Layout Theme)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={saveSuccess}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-sans font-semibold text-xs transition-all cursor-pointer flex justify-center items-center gap-2"
              >
                {saveSuccess ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Register Application Choices
              </button>
            </form>
          )}

        </div>

        {/* Static Modal Status Action bottom banner */}
        <div className="p-3.5 bg-rose-50/40 border-t border-rose-100/50 dark:bg-[#251517]/20 dark:border-rose-950/25 flex justify-between items-center text-[10px] font-mono text-rose-500 uppercase">
          <span>Patient Identity Enforcer Active</span>
          <span>v4.0 Security Lock</span>
        </div>

      </div>
    </div>
  );
}
