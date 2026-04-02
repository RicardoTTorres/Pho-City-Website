// src/features/cms/sections/TrafficOverviewEditor.tsx
import { useEffect, useState } from "react";
import { getTraffic } from "@/shared/api/traffic";
import type { TrafficData } from "@/shared/api/traffic";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type View = "7days" | "month" | "year";

type ChartPoint = { day: number; views: number };

function filterByView(daily: ChartPoint[], view: View): ChartPoint[] {
  const now = new Date();

  if (view === "7days") {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return daily.filter((d) => d.day >= cutoff);
  }

  if (view === "month") {
    return daily.filter((d) => {
      const date = new Date(d.day);
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    });
  }

  // year — aggregate daily into monthly buckets
  const buckets: Record<string, ChartPoint> = {};
  daily.forEach((d) => {
    const date = new Date(d.day);
    if (date.getFullYear() !== now.getFullYear()) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!buckets[key]) {
      // Use the 1st of the month as the representative timestamp
      buckets[key] = {
        day: new Date(date.getFullYear(), date.getMonth(), 1).getTime(),
        views: 0,
      };
    }
    buckets[key].views += d.views;
  });
  return Object.values(buckets).sort((a, b) => a.day - b.day);
}

function formatTick(timestamp: number, view: View): string {
  const date = new Date(timestamp);
  if (view === "year") {
    return date.toLocaleString("en-US", { month: "short" });
  }
  return date.toLocaleString("en-US", { month: "short", day: "numeric" });
}

function formatTooltipLabel(timestamp: number, view: View): string {
  const date = new Date(timestamp);
  if (view === "year") {
    return date.toLocaleString("en-US", { month: "long", year: "numeric" });
  }
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const VIEW_LABELS: { key: View; label: string }[] = [
  { key: "7days", label: "7 Days" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

export function TrafficOverviewEditor() {
  const emptyData: TrafficData = {
    total: { totalViews: 0, uniqueVisitors: 0 },
    daily: [],
  };
  const [data, setData] = useState<TrafficData>(emptyData);
  const [view, setView] = useState<View>("month");

  useEffect(() => {
    getTraffic()
      .then(setData)
      .catch(() => {});
  }, []);

  const chartData = filterByView(data.daily, view);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-gray-800">Traffic Overview</h3>

        {/* View toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
          {VIEW_LABELS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`px-3 py-1.5 transition-colors ${
                view === key
                  ? "bg-brand-red text-white font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <div className="bg-white p-2 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Total Views</p>
          <p className="text-3xl font-bold text-brand-red">
            {data.total.totalViews}
          </p>
        </div>
        <div className="bg-white p-2 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Unique Visitors</p>
          <p className="text-3xl font-bold text-brand-red">
            {data.total.uniqueVisitors}
          </p>
        </div>
      </div>

      {/* Line Chart */}
      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-gray-400">
          No data for this period.
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="day"
                type="number"
                scale="time"
                domain={["auto", "auto"]}
                tickFormatter={(v: number) => formatTick(Number(v), view)}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                labelFormatter={(v: number) => formatTooltipLabel(Number(v), view)}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#A62626"
                strokeWidth={2}
                dot={view === "year"}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
