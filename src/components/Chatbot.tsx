/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX, Bot, User, Sparkles, X, ChevronRight, HelpCircle } from "lucide-react";
import { ChatMessage, LanguageCode } from "../types";
import { translations } from "../data/translations";

interface ChatbotProps {
  lang: LanguageCode;
  isOpen: boolean;
  onClose: () => void;
}

export default function Chatbot({ lang, isOpen, onClose }: ChatbotProps) {
  const t = translations[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "first-greeting",
      sender: "assistant",
      text: "Hello! I am Ovuline's clinical AI companion. I can help interpret Level 1 questionnaire results, discuss Level 2 physical IOT readings (Temperature, Heart Rate, and Insulin), explain Rotterdam diagnostic criteria, and suggest custom endocrine diet recipes or yoga workouts. Ask me anything!",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputText, setInputText] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = lang === 'hi' ? 'hi-IN' : lang === 'es' ? 'es-ES' : 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
      };

      rec.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.error("Speech recognition error", event.error);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [lang]);

  // Adjust SpeechRecognition language whenever app language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang === 'hi' ? 'hi-IN' : lang === 'es' ? 'es-ES' : 'en-US';
    }
  }, [lang]);

  // Handle Automatic Scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Speech Synthesis: Speak Assistant Reply
  const speakText = (text: string) => {
    if (!isSpeakingEnabled || !window.speechSynthesis) return;
    
    // Stop any active synthesis
    window.speechSynthesis.cancel();
    
    // Clean markdown before speaking
    const cleanedText = text.replace(/[*#_~`\[\]\-]/g, " ").substring(0, 180); // Limit speech length to keep it concise
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'es' ? 'es-ES' : 'en-US';
    
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not fully supported in this browser container. Try opening the webapp in a new tab.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: inputText,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          previousMessages: messages.slice(-6) // Send recent context to preserve thread
        })
      });

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "assistant",
        text: data.reply || "I am processing high-density clinical inputs and couldn't build a response.",
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, assistantMsg]);
      speakText(assistantMsg.text);

    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "assistant",
        text: "My neural clinical synchronizer lost connection. I can still tell you that low-glycemic carrots and spearmint tea are highly beneficial for PCOS symptoms!",
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-[#1a0f11] border-l border-rose-100 dark:border-rose-950/30 shadow-2xl z-50 flex flex-col transition-all duration-300 transform translate-x-0">
      
      {/* Drawer Header */}
      <div className="p-4 border-b border-rose-100 dark:border-rose-950/40 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-rose-900/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          <div>
            <span className="font-sans font-bold text-rose-950 dark:text-rose-100 text-sm">
              Companion Assistant
            </span>
            <span className="block text-[10px] text-rose-600 dark:text-rose-300 uppercase font-mono tracking-wider font-semibold">
              AI Voice Enabled
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio toggle button */}
          <button
            onClick={() => setIsSpeakingEnabled(!isSpeakingEnabled)}
            className="p-1.5 rounded-lg hover:bg-rose-200/40 dark:hover:bg-rose-800/40 text-rose-700 dark:text-rose-300 transition-all"
            title={isSpeakingEnabled ? "Speech response enabled" : "Speech response muted"}
          >
            {isSpeakingEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-rose-200/40 dark:hover:bg-rose-800/40 text-rose-700 dark:text-rose-300 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-rose-400">
              {msg.sender === "user" ? (
                <>
                  <span>You</span>
                  <User className="w-3 h-3" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-rose-500" />
                  <span>Ovuline Companion</span>
                </>
              )}
            </div>

            <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
              msg.sender === "user"
                ? "bg-rose-500 text-white rounded-tr-none"
                : "bg-white dark:bg-rose-950/30 text-rose-950 dark:text-rose-50 border border-rose-100 dark:border-rose-800/60 rounded-tl-none"
            }`}>
              {msg.text}
            </div>
            
            <span className="text-[10px] font-mono text-rose-400/50 mt-1">
              {msg.timestamp}
            </span>
          </div>
        ))}
        {loading && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-rose-400">
              <Bot className="w-3 h-3 text-rose-500" />
              <span>Diagnostic core thinking...</span>
            </div>
            <div className="p-3 bg-white dark:bg-rose-950/30 rounded-2xl rounded-tl-none border border-rose-100 dark:border-rose-800/60 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Recommended Topics Row */}
      <div className="p-2.5 border-t border-rose-100 dark:border-rose-950/40 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/15 dark:to-rose-900/10 flex gap-1.5 overflow-x-auto text-[10px] font-sans text-rose-900 dark:text-rose-100 font-medium">
        <button
          onClick={() => setInputText("What is the Rotterdam diagnostic criteria?")}
          className="px-2 py-1 rounded bg-white dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-900 dark:text-rose-100 border border-rose-200 dark:border-rose-800/60 shrink-0 font-semibold transition-all"
        >
          Rotterdam Criteria
        </button>
        <button
          onClick={() => setInputText("Suggest a PCOS-friendly dinner menu")}
          className="px-2 py-1 rounded bg-white dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-900 dark:text-rose-100 border border-rose-200 dark:border-rose-800/60 shrink-0 font-semibold transition-all"
        >
          Diet Suggestion
        </button>
        <button
          onClick={() => setInputText("Explain Level 2 IOT Fasting Insulin levels")}
          className="px-2 py-1 rounded bg-white dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-900 dark:text-rose-100 border border-rose-200 dark:border-rose-800/60 shrink-0 font-semibold transition-all"
        >
          Explain IoT readings
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-rose-50 dark:border-rose-950/20 bg-white dark:bg-[#1a0f11] flex gap-2">
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
            isListening
              ? "bg-red-500 border-red-500 text-white animate-pulse"
              : "bg-rose-50 border-rose-100 hover:bg-rose-100 dark:bg-[#251619] dark:border-rose-950/40 text-rose-700 dark:text-rose-300"
          }`}
          title="Toggle Voice dictation"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isListening ? "Listening with AI assistance..." : "Inquire with Ovuline AI Companion..."}
          className="flex-1 px-3 py-2 rounded-xl text-xs border border-rose-100 bg-white dark:bg-[#1a0f11] dark:border-rose-950/30 text-rose-950 dark:text-rose-100 focus:outline-none focus:border-rose-500"
        />

        <button
          type="submit"
          className="p-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white flex items-center justify-center shadow transition-all transform active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
