/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Languages, User, Layout, Calendar, Heart, MessageSquare, Clipboard, Sparkles } from "lucide-react";
import { LanguageCode } from "../types";
import { translations } from "../data/translations";

interface HeaderProps {
  currentTab: 'dashboard' | 'calendar' | 'questionnaire' | 'lifestyle';
  setCurrentTab: (tab: 'dashboard' | 'calendar' | 'questionnaire' | 'lifestyle') => void;
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  onOpenProfile: () => void;
  onOpenChat: () => void;
}

export default function Header({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  onOpenProfile,
  onOpenChat,
}: HeaderProps) {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-rose-100/80 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Brand Identity / Logo & Tagline */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="w-12 h-12 rounded-3xl bg-gradient-to-tr from-rose-500 to-rose-400 flex items-center justify-center text-white shadow-[0_25px_70px_-40px_rgba(244,63,94,0.8)]">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-sans font-extrabold tracking-tight text-rose-950 leading-none">
              Ovuline
            </h1>
            <span className="text-[10px] text-rose-500 uppercase tracking-[0.35em] font-mono font-semibold block mt-1">
              the system that traces the rhythm of your cycle
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap gap-2 p-1 rounded-3xl bg-rose-50 border border-rose-100 shadow-sm">
          <button
            onClick={() => setCurrentTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-3xl text-xs font-semibold transition-all ${
              currentTab === 'calendar'
                ? 'bg-rose-500 text-white shadow-lg'
                : 'text-rose-700 hover:bg-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            {t.calendar}
          </button>
          <button
            onClick={() => setCurrentTab('questionnaire')}
            className={`flex items-center gap-2 px-4 py-2 rounded-3xl text-xs font-semibold transition-all ${
              currentTab === 'questionnaire'
                ? 'bg-rose-500 text-white shadow-lg'
                : 'text-rose-700 hover:bg-white'
            }`}
          >
            <Clipboard className="w-4 h-4" />
            {t.questionnaire}
          </button>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-3xl text-xs font-semibold transition-all ${
              currentTab === 'dashboard'
                ? 'bg-rose-500 text-white shadow-lg'
                : 'text-rose-700 hover:bg-white'
            }`}
          >
            <Layout className="w-4 h-4" />
            {t.dashboard}
          </button>
          <button
            onClick={() => setCurrentTab('lifestyle')}
            className={`flex items-center gap-2 px-4 py-2 rounded-3xl text-xs font-semibold transition-all ${
              currentTab === 'lifestyle'
                ? 'bg-rose-500 text-white shadow-lg'
                : 'text-rose-700 hover:bg-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Tips
          </button>
        </nav>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3 justify-end">
          <div className="inline-flex items-center gap-2 border border-rose-100 rounded-full bg-white px-3 py-2 text-xs text-rose-700 shadow-sm">
            <Languages className="w-4 h-4 text-rose-500" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LanguageCode)}
              className="bg-transparent outline-none font-mono font-semibold text-rose-700"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="es">Español</option>
            </select>
          </div>

          <div className="rounded-full bg-rose-50 px-4 py-2 text-[11px] font-semibold text-rose-700 border border-rose-100 shadow-sm">
            Light theme enabled
          </div>

          <button
            onClick={onOpenProfile}
            className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-white px-3 py-2 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50"
          >
            <User className="w-4 h-4 text-rose-500" />
            Profile
          </button>

          <button
            onClick={onOpenChat}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-rose-400 px-3 py-2 text-xs font-semibold text-white shadow-[0_16px_60px_-30px_rgba(244,63,94,0.95)] transition hover:brightness-105"
          >
            <MessageSquare className="w-4 h-4" />
            AI Companion
          </button>
        </div>
      </div>
    </header>
  );
}
