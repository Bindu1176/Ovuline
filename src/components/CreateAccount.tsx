/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { UserPlus, Mail, Lock, User, Calendar, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface CreateAccountProps {
  onAccountCreated: (profile: any) => void;
  onCancel: () => void;
}

export default function CreateAccount({ onAccountCreated, onCancel }: CreateAccountProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    cycleLength: "28",
    periodDuration: "5",
    lastPeriodStartDate: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleStep1 = () => {
    if (!formData.name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setStep(2);
  };

  const handleCreateAccount = () => {
    if (!formData.age) {
      setError("Please enter your age");
      return;
    }
    if (!formData.lastPeriodStartDate) {
      setError("Please enter your last period start date");
      return;
    }

    const profile = {
      id: `profile-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      age: Number(formData.age),
      height: 162,
      weight: 58,
      cycleLength: Number(formData.cycleLength),
      periodDuration: Number(formData.periodDuration),
      lastPeriodStartDate: formData.lastPeriodStartDate,
    };

    localStorage.setItem("ovuline_profile", JSON.stringify(profile));
    localStorage.setItem("ovuline_user_email", formData.email);
    onAccountCreated(profile);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-[#0f0a0b] dark:to-[#1a0f11] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-[#120709] border border-rose-100 dark:border-rose-950/30 rounded-3xl shadow-xl p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-rose-950 dark:text-rose-100">Create Account</h1>
            <p className="text-xs text-rose-500 font-mono uppercase">Join Ovuline Today</p>
          </div>
        </div>

        {step === 1 ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-rose-900 dark:text-rose-100 mb-2 uppercase">Full Name</label>
              <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-950/20 rounded-xl px-3 py-2">
                <User className="w-4 h-4 text-rose-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Dr. Ananya Sharma"
                  className="flex-1 bg-transparent outline-none text-sm text-rose-950 dark:text-rose-100 placeholder-rose-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-900 dark:text-rose-100 mb-2 uppercase">Email Address</label>
              <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-950/20 rounded-xl px-3 py-2">
                <Mail className="w-4 h-4 text-rose-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className="flex-1 bg-transparent outline-none text-sm text-rose-950 dark:text-rose-100 placeholder-rose-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-900 dark:text-rose-100 mb-2 uppercase">Password</label>
              <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-950/20 rounded-xl px-3 py-2">
                <Lock className="w-4 h-4 text-rose-500" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••"
                  className="flex-1 bg-transparent outline-none text-sm text-rose-950 dark:text-rose-100 placeholder-rose-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-900 dark:text-rose-100 mb-2 uppercase">Confirm Password</label>
              <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-950/20 rounded-xl px-3 py-2">
                <Lock className="w-4 h-4 text-rose-500" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••"
                  className="flex-1 bg-transparent outline-none text-sm text-rose-950 dark:text-rose-100 placeholder-rose-400"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-rose-100/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs text-rose-700 dark:text-rose-300"
              >
                {error}
              </motion.div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 rounded-lg border border-rose-200 dark:border-rose-950/30 text-rose-700 dark:text-rose-300 font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleStep1}
                className="flex-1 px-4 py-2 rounded-lg bg-rose-500 text-white font-semibold hover:bg-rose-600 transition-all active:scale-95"
              >
                Next
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="p-3 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-950/20 rounded-lg">
              <p className="text-xs text-rose-700 dark:text-rose-300 font-semibold">Welcome, <span className="font-bold">{formData.name}</span>!</p>
              <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">Let's set up your cycle profile</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-900 dark:text-rose-100 mb-2 uppercase">Age</label>
              <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-950/20 rounded-xl px-3 py-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="26"
                  className="flex-1 bg-transparent outline-none text-sm text-rose-950 dark:text-rose-100 placeholder-rose-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-900 dark:text-rose-100 mb-2 uppercase">Cycle Length (Days)</label>
              <input
                type="number"
                name="cycleLength"
                value={formData.cycleLength}
                onChange={handleInputChange}
                min="21"
                max="35"
                className="w-full bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-950/20 rounded-xl px-3 py-2 text-sm text-rose-950 dark:text-rose-100 outline-none focus:ring-2 focus:ring-rose-300"
              />
              <p className="text-[10px] text-rose-500 mt-1">Normal range: 21-35 days</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-900 dark:text-rose-100 mb-2 uppercase">Period Duration (Days)</label>
              <input
                type="number"
                name="periodDuration"
                value={formData.periodDuration}
                onChange={handleInputChange}
                min="2"
                max="7"
                className="w-full bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-950/20 rounded-xl px-3 py-2 text-sm text-rose-950 dark:text-rose-100 outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-900 dark:text-rose-100 mb-2 uppercase">Last Period Start Date</label>
              <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-950/20 rounded-xl px-3 py-2">
                <Calendar className="w-4 h-4 text-rose-500" />
                <input
                  type="date"
                  name="lastPeriodStartDate"
                  value={formData.lastPeriodStartDate}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent outline-none text-sm text-rose-950 dark:text-rose-100"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-rose-100/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs text-rose-700 dark:text-rose-300"
              >
                {error}
              </motion.div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 rounded-lg border border-rose-200 dark:border-rose-950/30 text-rose-700 dark:text-rose-300 font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/10 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleCreateAccount}
                className="flex-1 px-4 py-2 rounded-lg bg-rose-500 text-white font-semibold hover:bg-rose-600 transition-all active:scale-95"
              >
                Create Account
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
