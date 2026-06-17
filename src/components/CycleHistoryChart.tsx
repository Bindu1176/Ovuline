import { useEffect, useRef } from "react";
import { Chart, ChartConfiguration, registerables } from "chart.js";
import { PeriodCycle, LanguageCode } from "../types";
import { translations } from "../data/translations";

Chart.register(...registerables);

interface CycleHistoryChartProps {
  pastCycles: PeriodCycle[];
  lang: LanguageCode;
}

export default function CycleHistoryChart({ pastCycles, lang }: CycleHistoryChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const t = translations[lang] || translations.en;

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy any existing chart instance to prevent duplicate renderings & cursor-hover crashes
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    // Prepare data sorted by start date ascending (chronological)
    const sortedCycles = [...pastCycles]
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(-6); // Limit strictly to the past 6 cycles

    const labels = sortedCycles.map((cycle, idx) => {
      const dateParts = cycle.startDate.split("-");
      const shortDate = dateParts.length === 3 ? `${dateParts[1]}/${dateParts[2]}` : cycle.startDate;
      return `Cycle #${idx + 1} (${shortDate})`;
    });

    const cycleLengths = sortedCycles.map(c => c.cycleLength);
    const periodDurations = sortedCycles.map(c => c.periodDuration);

    const textColor = "#4A2B2E";
    const gridColor = "rgba(255, 138, 138, 0.15)";

    const config: ChartConfiguration = {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Cycle Interval (Days)",
            data: cycleLengths,
            backgroundColor: "rgba(251, 113, 133, 0.45)", // soft rose/secondary
            borderColor: "#FB7185", // var(--secondary)
            borderWidth: 1.5,
            borderRadius: 4,
            barPercentage: 0.5,
            yAxisID: "yCycle",
          },
          {
            label: "Period Duration (Days)",
            data: periodDurations,
            backgroundColor: "rgba(255, 138, 138, 0.75)", // primary red/pink highlight
            borderColor: "#FF8A8A", // var(--primary)
            borderWidth: 1.5,
            borderRadius: 4,
            barPercentage: 0.3,
            yAxisID: "yPeriod",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: textColor,
              font: {
                family: "'Helvetica Neue', Arial, sans-serif",
                size: 11,
                weight: "normal",
              },
            },
          },
          tooltip: {
            backgroundColor: "#FFFFFF",
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: "#FFE4E8",
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            titleFont: {
              weight: "bold",
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: textColor,
              font: {
                family: "monospace",
                size: 9,
              },
            },
            grid: {
              display: false,
            },
          },
          yCycle: {
            type: "linear",
            position: "left",
            suggestedMin: 20,
            suggestedMax: 35,
            ticks: {
              color: textColor,
              font: {
                family: "monospace",
                size: 10,
              },
            },
            grid: {
              color: gridColor,
            },
            title: {
              display: true,
              text: "Cycle Length (Days)",
              color: textColor,
              font: {
                size: 10,
                weight: "bold",
              },
            },
          },
          yPeriod: {
            type: "linear",
            position: "right",
            suggestedMin: 1,
            suggestedMax: 10,
            ticks: {
              color: textColor,
              font: {
                family: "monospace",
                size: 10,
              },
            },
            grid: {
              drawOnChartArea: false, // avoid overlapping primary details
            },
            title: {
              display: true,
              text: "Period Duration (Days)",
              color: textColor,
              font: {
                size: 10,
                weight: "bold",
              },
            },
          },
        },
      },
    };

    const chart = new Chart(canvasRef.current, config);
    chartInstanceRef.current = chart;

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [pastCycles, lang]);

  return (
    <div id="cycle-history-chart-wrapper" className="w-full h-64 flex flex-col justify-end">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">
          Chart.js: Past 6 Cycle Comparison
        </span>
        <span className="text-[10px] font-mono opacity-50">
          Double Y-Axes Active
        </span>
      </div>
      <div className="relative w-full h-56 bg-rose-50/20 dark:bg-[#1a0f11]/40 border border-rose-100/50 dark:border-rose-950/20 rounded-xl p-3">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}
