/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface QuestionnaireAnswers {
  irregular_periods: boolean;
  missed_periods: boolean;
  pms_severity: 'None' | 'Mild' | 'Moderate' | 'Severe';
  weight_gain: boolean;
  bloating: boolean;
  acne: boolean;
  facial_hair: boolean;
  hair_loss: boolean;
  sleep_irregularity: boolean;
  mood_swings: boolean;
  pelvic_pain: boolean;
  family_history: boolean;
  exercise_frequency: 'Rarely' | '1-2 times/week' | '3-4 times/week' | 'Daily';
  food_habits: 'Unhealthy' | 'Balanced' | 'Healthy' | 'Strict Diet';
}

export type LanguageCode = 'en' | 'hi' | 'es';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  cycleLength: number; // in days, e.g. 28
  periodDuration: number; // in days, e.g. 5
  lastPeriodStartDate: string; // YYYY-MM-DD
}

export interface PeriodCycle {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  cycleLength: number; // cycle length in days
  periodDuration: number; // duration in days
}

export interface IotReadings {
  temperature: number; // in °C
  heartRate: number; // in BPM
  insulin: number; // in mIU/L or µIU/mL
  glucose: number; // in mg/dL Fasting Blood Glucose
  spo2: number;
  ledDisplay: string; // What is showing on the 16x2 display
  timestamp: string; // Last received timestamp
}

export interface MedicinePlan {
  name: string;
  timing: string;
  completed: boolean;
}

export interface WaterLog {
  date: string;
  amountMl: number; // e.g., 2500
  targetMl: number; // e.g., 3000
}

export interface SleepLog {
  date: string;
  hours: number; // e.g., 7.5
  targetHours: number; // e.g., 8
}

export interface PredictionResult {
  risk_percentage: number;
  prediction_label: 'PCOS Detected' | 'Unlikely (Healthy)';
  confidence_score: number;
  status?: string; // e.g. "Model Not Connected" index
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
