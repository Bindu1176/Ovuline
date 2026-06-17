/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { Cpu, Thermometer, Activity, Layers, Shield, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import { IotReadings, LanguageCode, PredictionResult } from "../types";

interface SimulatorProps {
  iotReadings: IotReadings;
  onUpdateIotReadings: (readings: Partial<IotReadings>) => void;
  riskPrediction?: PredictionResult | null;
  lang: LanguageCode;
}

export default function IotHardwareSimulator({
  iotReadings,
  onUpdateIotReadings,
  riskPrediction,
  lang,
}: SimulatorProps) {
  const [temperature, setTemperature] = useState<string>(iotReadings.temperature.toString());
  const [heartRate, setHeartRate] = useState<string>(iotReadings.heartRate.toString());
  const [insulin, setInsulin] = useState<string>(iotReadings.insulin.toString());
  const [glucose, setGlucose] = useState<string>(iotReadings.glucose.toString());
  const [spo2, setSpo2] = useState<string>(iotReadings.spo2.toString());

  useEffect(() => {
    setTemperature(iotReadings.temperature.toString());
    setHeartRate(iotReadings.heartRate.toString());
    setInsulin(iotReadings.insulin.toString());
    setGlucose(iotReadings.glucose.toString());
    setSpo2(iotReadings.spo2.toString());
  }, [iotReadings]);

  const handleUpdateReadings = () => {
    onUpdateIotReadings({
      temperature: Number(temperature) || 0,
      heartRate: Number(heartRate) || 0,
      insulin: Number(insulin) || 0,
      glucose: Number(glucose) || 0,
      spo2: Number(spo2) || 0,
      ledDisplay: "Manual Entry",
      timestamp: new Date().toISOString(),
    });
  };

  const exportManualReport = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const now = new Date().toLocaleString();

    doc.setFontSize(14);
    doc.setTextColor(224, 90, 111);
    doc.text("Ovuline Manual IoT Reading Analysis", 20, 20);

    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(`Generated: ${now}`, 20, 30);
    doc.text("Manual physical entry report and PCOD/PCOS risk analysis.", 20, 36);

    doc.setFontSize(10);
    doc.setTextColor(74, 43, 46);
    doc.text("Manual IoT Biometrics:", 20, 48);
    doc.setFontSize(9);
    doc.text(`Body Temperature: ${temperature} °C`, 20, 56);
    doc.text(`Heart Rate: ${heartRate} BPM`, 20, 62);
    doc.text(`Fasting Insulin: ${insulin} µIU/mL`, 20, 68);
    doc.text(`Fasting Glucose: ${glucose} mg/dL`, 20, 74);
    doc.text(`SpO2: ${spo2}%`, 20, 80);

    if (riskPrediction) {
      doc.setFontSize(10);
      doc.setTextColor(224, 90, 111);
      doc.text("Predicted PCOD/PCOS Risk:", 20, 92);
      doc.setFontSize(12);
      doc.setTextColor(74, 43, 46);
      doc.text(`${riskPrediction.risk_percentage}% — ${riskPrediction.prediction_label}`, 20, 100);
      doc.setFontSize(9);
      doc.setTextColor(92, 92, 92);
      doc.text(`Model status: ${riskPrediction.status || "Manual IoT classifier"}`, 20, 106);
    }

    doc.save("ovuline_manual_iot_risk_report.pdf");
  };

  return (
    <div id="iot-hardware-simulator" className="p-6 bg-rose-50/10 dark:bg-rose-950/5 border border-rose-100/50 dark:border-rose-950/10 rounded-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-rose-100/30">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-rose-500" />
          <div>
            <h3 className="text-base font-sans font-bold text-rose-950 dark:text-rose-100">
              Manual Level 2 Reading Entry Panel
            </h3>
            <p className="text-[10px] text-rose-500 font-mono uppercase tracking-wider">
              Enter physical readings directly for PCOD risk analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 text-[11px] font-mono">
            Manual Only
          </div>
        </div>
      </div>

      <p className="text-xs text-rose-500/90 leading-relaxed mb-6">
        Enter your Level 2 biomarker values below. Click <strong>Analyse Result</strong> to calculate your PCOD/PCOS risk percentage using machine learning, then export the report as PDF.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <label className="space-y-2 text-xs text-rose-600 dark:text-rose-300 font-sans">
          <span className="font-bold text-rose-900 dark:text-rose-100">Body Temperature (°C)</span>
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-rose-500" />
            <input
              value={temperature}
              onChange={(event) => setTemperature(event.target.value)}
              type="number"
              step="0.1"
              className="w-full rounded-xl border border-rose-200 bg-white dark:bg-[#120709] px-3 py-2 text-sm text-rose-950 dark:text-rose-100 outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
        </label>

        <label className="space-y-2 text-xs text-rose-600 dark:text-rose-300 font-sans">
          <span className="font-bold text-rose-900 dark:text-rose-100">Heart Rate (BPM)</span>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-500" />
            <input
              value={heartRate}
              onChange={(event) => setHeartRate(event.target.value)}
              type="number"
              step="1"
              className="w-full rounded-xl border border-rose-200 bg-white dark:bg-[#120709] px-3 py-2 text-sm text-rose-950 dark:text-rose-100 outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
        </label>

        <label className="space-y-2 text-xs text-rose-600 dark:text-rose-300 font-sans">
          <span className="font-bold text-rose-900 dark:text-rose-100">Fasting Insulin (µIU/mL)</span>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-rose-500" />
            <input
              value={insulin}
              onChange={(event) => setInsulin(event.target.value)}
              type="number"
              step="0.1"
              className="w-full rounded-xl border border-rose-200 bg-white dark:bg-[#120709] px-3 py-2 text-sm text-rose-950 dark:text-rose-100 outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
        </label>

        <label className="space-y-2 text-xs text-rose-600 dark:text-rose-300 font-sans">
          <span className="font-bold text-rose-900 dark:text-rose-100">Fasting Glucose (mg/dL)</span>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-500" />
            <input
              value={glucose}
              onChange={(event) => setGlucose(event.target.value)}
              type="number"
              step="1"
              className="w-full rounded-xl border border-rose-200 bg-white dark:bg-[#120709] px-3 py-2 text-sm text-rose-950 dark:text-rose-100 outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
        </label>

        <label className="space-y-2 text-xs text-rose-600 dark:text-rose-300 font-sans md:col-span-2">
          <span className="font-bold text-rose-900 dark:text-rose-100">SpO2 (%)</span>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-500" />
            <input
              value={spo2}
              onChange={(event) => setSpo2(event.target.value)}
              type="number"
              step="1"
              className="w-full rounded-xl border border-rose-200 bg-white dark:bg-[#120709] px-3 py-2 text-sm text-rose-950 dark:text-rose-100 outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
        </label>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleUpdateReadings}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-600 transition-all active:scale-95"
          >
            Analyse Result
          </button>
          <button
            onClick={exportManualReport}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-100 bg-white px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm hover:bg-rose-50 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>

        <div className="text-xs text-rose-500 dark:text-rose-400 font-mono">
          Last updated manually at {new Date(iotReadings.timestamp).toLocaleTimeString()}.
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-rose-100/60 bg-white dark:bg-[#120709] p-4 text-sm text-rose-700 dark:text-rose-200 shadow-sm">
        <div className="font-bold text-rose-900 dark:text-rose-100 mb-2">Current manual readings</div>
        <div className="grid grid-cols-2 gap-3 text-xs font-mono text-rose-600 dark:text-rose-300">
          <div>Temperature: {iotReadings.temperature}°C</div>
          <div>Heart Rate: {iotReadings.heartRate} BPM</div>
          <div>Insulin: {iotReadings.insulin} µIU/mL</div>
          <div>Glucose: {iotReadings.glucose} mg/dL</div>
          <div>SpO2: {iotReadings.spo2}%</div>
          <div>Source: Manual Entry</div>
        </div>
      </div>

      {riskPrediction && (
        <div className="mt-4 rounded-2xl border border-rose-100/60 bg-rose-50/70 dark:bg-rose-950/10 p-4 text-sm text-rose-700 dark:text-rose-200 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-rose-500 font-semibold">PCOD/PCOS Risk Analysis</div>
              <div className="mt-2 text-base font-bold text-rose-950 dark:text-rose-100">{riskPrediction.prediction_label}</div>
            </div>
            <div className="rounded-full bg-white dark:bg-rose-950/30 px-3 py-1 text-xs font-mono font-semibold text-rose-700 dark:text-rose-100 border border-rose-100 dark:border-rose-800/60">
              {riskPrediction.risk_percentage}%
            </div>
          </div>

          {/* Risk Scale Visualization */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-[10px] font-mono text-rose-600 dark:text-rose-400 mb-2">
              <span>Unlikely</span>
              <span>Moderate</span>
              <span>High Risk</span>
            </div>
            <div className="relative w-full h-2 bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-500 rounded-full overflow-hidden">
              <div
                className="absolute h-full w-1 bg-rose-950 dark:bg-white rounded transition-all"
                style={{ left: `${riskPrediction.risk_percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-rose-500 dark:text-rose-400 mt-2">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="text-xs text-rose-600 dark:text-rose-300 leading-relaxed">
            {riskPrediction.status}
          </div>
        </div>
      )}
    </div>
  );
}

