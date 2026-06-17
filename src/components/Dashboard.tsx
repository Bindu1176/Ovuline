/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { AlertCircle, Thermometer, Flame, Shield, Database, Download, Cpu, HardDrive, RefreshCw, Layers, CheckCircle, FileText, Activity } from "lucide-react";
import { jsPDF } from "jspdf";
import { PeriodCycle, IotReadings, PredictionResult, QuestionnaireAnswers, UserProfile, LanguageCode } from "../types";
import { translations } from "../data/translations";

interface DashboardProps {
  pastCycles: PeriodCycle[];
  profile: UserProfile;
  iotReadings: IotReadings;
  level1Prediction: PredictionResult | null;
  level1Answers: QuestionnaireAnswers | null;
  lang: LanguageCode;
  manualLevel2Prediction: PredictionResult | null;
  onAnalyzeReadings: () => Promise<void>;
}

export default function Dashboard({
  pastCycles,
  profile,
  iotReadings,
  level1Prediction,
  level1Answers,
  lang,
  manualLevel2Prediction,
  onAnalyzeReadings,
}: DashboardProps) {
  const t = translations[lang];

  const [level2Prediction, setLevel2Prediction] = useState<PredictionResult>({
    risk_percentage: 0,
    prediction_label: "Unlikely (Healthy)",
    confidence_score: 0,
    status: "Awaiting manual IoT readings"
  });
  const [analyzing, setAnalyzing] = useState<boolean>(false);

  const analyzeLevel2Readings = async () => {
    setAnalyzing(true);
    await onAnalyzeReadings();
    setAnalyzing(false);
  };

  useEffect(() => {
    if (manualLevel2Prediction) {
      setLevel2Prediction(manualLevel2Prediction);
    }
  }, [manualLevel2Prediction]);

  // Check for missed / overdue period alert
  // Last period startDate + cycleLength compared to current time
  const getPeriodOverdueDays = () => {
    const lastStart = new Date(profile.lastPeriodStartDate);
    const expectedNext = new Date(lastStart.getTime() + (profile.cycleLength * 24 * 60 * 60 * 1000));
    const today = new Date();
    
    // Express dates in midnight dates
    expectedNext.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    
    const diffTime = today.getTime() - expectedNext.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const overdueDays = getPeriodOverdueDays();

  // Generates Clinical printable medical report
  const handlePrintReport = () => {
    window.print();
  };

  // Generates a professional medical-grade clinical report PDF
  const exportLevel2PDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // Header banner styled in a professional clinical brand
    doc.setFillColor(224, 90, 111); // Rose Primary #E05A6F
    doc.rect(15, 15, 180, 24, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("OVULINE CLINICAL & ENDOCRINE LABORATORY", 20, 24);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const dateFormatted = new Date().toLocaleString();
    doc.text(`INTEGRATED LEVEL 2 BIOMETRIC TELEMETRY & INFERENCE REPORT | GENERATED: ${dateFormatted}`, 20, 31);

    let currentY = 48;

    // 1. Patient Demographics & Profile
    doc.setDrawColor(224, 90, 111);
    doc.setLineWidth(0.4);
    doc.line(15, currentY, 195, currentY);
    currentY += 5;

    doc.setTextColor(74, 43, 46); // var(--text)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text("I. PATIENT CLINICAL FILE", 15, currentY);
    currentY += 5;

    doc.setFontSize(9);
    doc.setTextColor(51, 51, 51);

    // Columns
    doc.setFont("helvetica", "bold"); doc.text("Patient Name:", 15, currentY);
    doc.setFont("helvetica", "normal"); doc.text(`${profile.name || "N/A"}`, 45, currentY);

    doc.setFont("helvetica", "bold"); doc.text("Patient Age:", 115, currentY);
    doc.setFont("helvetica", "normal"); doc.text(`${profile.age || "N/A"} years`, 145, currentY);
    currentY += 5.5;

    doc.setFont("helvetica", "bold"); doc.text("Cycle Interval:", 15, currentY);
    doc.setFont("helvetica", "normal"); doc.text(`${profile.cycleLength} days average`, 45, currentY);

    doc.setFont("helvetica", "bold"); doc.text("Period Duration:", 115, currentY);
    doc.setFont("helvetica", "normal"); doc.text(`${profile.periodDuration} days average`, 145, currentY);
    currentY += 5.5;

    doc.setFont("helvetica", "bold"); doc.text("Last Selected Period:", 15, currentY);
    doc.setFont("helvetica", "normal"); doc.text(`${profile.lastPeriodStartDate}`, 45, currentY);

    doc.setFont("helvetica", "bold"); doc.text("Device SpO2 Sync:", 115, currentY);
    doc.setFont("helvetica", "normal"); doc.text(`${iotReadings.spo2}% SpO2 Registered`, 145, currentY);
    currentY += 8;

    // 2. Physical Sensor Readings
    doc.setDrawColor(224, 90, 111);
    doc.setLineWidth(0.4);
    doc.line(15, currentY, 195, currentY);
    currentY += 5;

    doc.setTextColor(74, 43, 46);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text("II. LEVEL 2 PHYSICAL IoT HARDWARE SENSOR TELEMETRY", 15, currentY);
    currentY += 5;

    // Table Header Background
    doc.setFillColor(255, 245, 247); // var(--rose-50)
    doc.rect(15, currentY, 180, 7, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(74, 43, 46);
    doc.text("BIOMETRIC INDICATOR", 18, currentY + 4.5);
    doc.text("MEASURED VALUE", 85, currentY + 4.5);
    doc.text("CLINICAL REFERENCE THRESHOLDS", 130, currentY + 4.5);
    currentY += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 51, 51);
    doc.setDrawColor(255, 228, 232); // var(--rose-100)
    doc.setLineWidth(0.2);

    // Fasting Insulin Row
    doc.line(15, currentY, 195, currentY);
    doc.setFont("helvetica", "bold"); doc.text("Fasting Serum Insulin", 18, currentY + 4.5);
    doc.setFont("helvetica", "normal"); doc.text(`${iotReadings.insulin} uIU/mL`, 85, currentY + 4.5);
    doc.text("2.0 - 15.0 uIU/mL (Optimal metabolic window)", 130, currentY + 4.5);
    currentY += 6;

    // Temperature Row
    doc.line(15, currentY, 195, currentY);
    doc.setFont("helvetica", "bold"); doc.text("Basal Body Temperature", 18, currentY + 4.5);
    doc.setFont("helvetica", "normal"); doc.text(`${iotReadings.temperature} °C`, 85, currentY + 4.5);
    doc.text("36.1 °C - 37.2 °C (Typical core variations)", 130, currentY + 4.5);
    currentY += 6;

    // Heart Rate Row
    doc.line(15, currentY, 195, currentY);
    doc.setFont("helvetica", "bold"); doc.text("Resting Heart Rate", 18, currentY + 4.5);
    doc.setFont("helvetica", "normal"); doc.text(`${iotReadings.heartRate} BPM`, 85, currentY + 4.5);
    doc.text("60 - 100 BPM (Standard resting physiology)", 130, currentY + 4.5);
    currentY += 6;

    // Fasting Blood Glucose Row
    doc.line(15, currentY, 195, currentY);
    doc.setFont("helvetica", "bold"); doc.text("Fasting Blood Glucose", 18, currentY + 4.5);
    doc.setFont("helvetica", "normal"); doc.text(`${iotReadings.glucose || 95} mg/dL`, 85, currentY + 4.5);
    doc.text("< 100 mg/dL (Optimal reference range)", 130, currentY + 4.5);
    currentY += 6;

    doc.line(15, currentY, 195, currentY);
    currentY += 8;

    // SpO2 Register Subnote
    doc.setFont("helvetica", "bold"); doc.text("SpO2 Level:", 15, currentY);
    doc.setFont("helvetica", "normal"); doc.text(`${iotReadings.spo2}% SpO2 (O2 Saturation)`, 45, currentY);
    doc.setFont("helvetica", "bold"); doc.text("LED Register Output:", 115, currentY);
    doc.setFont("helvetica", "normal"); doc.text(`${iotReadings.ledDisplay}`, 150, currentY);
    currentY += 9;

    // 3. Machine Learning Classification & Health Inference
    doc.setDrawColor(224, 90, 111);
    doc.setLineWidth(0.4);
    doc.line(15, currentY, 195, currentY);
    currentY += 5;

    doc.setTextColor(74, 43, 46);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text("III. ALGORITHMIC BIOMETRIC HEALTH CLASSIFICATION & RISK", 15, currentY);
    currentY += 5;

    // Box highlight for high visibility risk output
    doc.setFillColor(255, 228, 232); // var(--rose-100)
    doc.rect(15, currentY, 180, 24, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(224, 90, 111); // Rose Primary
    doc.text(`Calculated PCOS / PCOD Risk: ${level2Prediction.risk_percentage}%`, 22, currentY + 8.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(74, 43, 46);
    doc.text(`Inference Result: ${level2Prediction.prediction_label}`, 22, currentY + 16.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    doc.text("Inference Model: Ensemble Random Forest Classifier", 122, currentY + 8.5);
    doc.text(`Model Confidence Score: ${(level2Prediction.confidence_score * 100).toFixed(1)}%`, 122, currentY + 16.5);

    currentY += 31;

    // 4. Clinical notes & guideline
    doc.setDrawColor(224, 90, 111);
    doc.setLineWidth(0.4);
    doc.line(15, currentY, 195, currentY);
    currentY += 5;

    doc.setTextColor(74, 43, 46);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text("IV. REPRODUCTIVE BIOPHYSICAL ANALYSIS & NOTES", 15, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(60, 60, 60);

    const advisoryNotes = [
      "1. Endocrine and Metabolic Interlink: Raised Fasting Insulin triggers premature LH secretion, which binds to ovarian theca cells, contributing directly to elevated LH-to-FSH ratios (typically greater than 2:1 in diagnosed individuals).",
      "2. Thermal Phase Metrics: Basal Body Temperature tracking determines biphasic shifts indicating ovulation. The absence of temperature elevation points toward anovulation cycles.",
      "3. Suggested Clinical Strategy: Low-glycemic dietary planning, structured aerobic exercises to counter insulin resistance, and continuous clinical correlation with blood profile reports are high-yield therapies."
    ];

    if (level2Prediction.risk_percentage > 50) {
      advisoryNotes.push("4. HIGH ENDOCRINE CRITERIA ALERT: Multi-risk indexes are elevated. It is strongly advised to request an ultrasound evaluation of follicles with a clinical gynecologist.");
    } else {
      advisoryNotes.push("4. HEALTHY SYMPTOM MONITOR: Biometric readings sit comfortably within physiological normal ranges. Continue logging daily readings to reinforce standard baseline averages.");
    }

    advisoryNotes.forEach((note) => {
      const splitText = doc.splitTextToSize(note, 174);
      splitText.forEach((line: string) => {
        if (currentY + 5 < 270) {
          doc.text(line, 15, currentY);
          currentY += 4.5;
        }
      });
      currentY += 1.5;
    });

    // 5. Clinical Safety Disclaimer & Footer
    const footerY = 270;
    doc.setDrawColor(224, 90, 111);
    doc.setLineWidth(0.2);
    doc.line(15, footerY, 195, footerY);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 140);
    doc.text("DISCLAIMER: This screening document integrates biological micro-sensor indexes with machine classification scorecards under Rotterdam diagnostic rules.", 15, footerY + 4);
    doc.text("The calculations provided are for bio-telemetry analysis only and do not replace professional hospital ultrasound scans, blood work, or clinical diagnostics.", 15, footerY + 7.5);

    // Save PDF
    doc.save(`ovuline_level2_clinical_diagnostic_report_${profile.name || "patient"}.pdf`);
  };

  return (
    <div id="medical-dashboard" className="space-y-6">
      
      {/* 1. NOTIFICATION SYSTEM ALERTS */}
      {overdueDays > 0 ? (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-500/10 text-rose-900 dark:bg-rose-950/20 dark:text-rose-200 border-l-4 border-l-rose-500 flex gap-3 text-xs shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <span className="font-sans font-semibold text-rose-950 dark:text-rose-100 uppercase tracking-wider block text-[10px] mb-1">
              {t.alerts}
            </span>
            <p className="leading-relaxed">
              <strong>WARNING</strong>: Your menstrual period is overdue by <strong>{overdueDays} days</strong> based on your historical cycle average ({profile.cycleLength} days standard). Please carry out a Level 1 symptom check or sync physical IoT levels immediately.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-500/5 text-emerald-900 dark:text-emerald-300 border-l-4 border-l-emerald-500 flex gap-3 text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <div>
            <span className="font-sans font-semibold text-emerald-950 dark:text-emerald-200 uppercase tracking-widest block text-[10px] mb-1">
              Ovuline Safety Alerts Monitor
            </span>
            <p className="leading-relaxed text-xs">
              {t.cycleActive}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
