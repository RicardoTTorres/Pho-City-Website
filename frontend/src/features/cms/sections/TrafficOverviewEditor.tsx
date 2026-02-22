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

export function TrafficOverviewEditor() {
  const emptyData: TrafficData = {
    total: {
      totalViews: 0,
      uniqueVisitors: 0,
    },
    daily: [],
    topPages: [],
  };
  const [data, setData] = useState<TrafficData>(emptyData);

  useEffect(() => {
    const fetchData = async () => {
      const fetchedData = await getTraffic();
      setData(fetchedData);
    };

    fetchData();
  }, []);

  if (!data) {
    return (
      <div className="bg-white/70 p-6 rounded-2xl shadow border">
        <p className="text-gray-500">Loading traffic data…</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Traffic Overview
      </h3>

      {/*Summary Cards*/}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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

      {/*Line Chart*/}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.daily}>
            <XAxis
              dataKey="day"
              type="number"
              scale="time"
              domain={["auto", "auto"]}
              tickFormatter={timestampToDate}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(label) => timestampToDate(Number(label))}
            />
            <Line
              type="monotone"
              dataKey="views"
              stroke="#A62626"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/*Top Pages*/}
      <div>
        <h3 className="font-semibold text-lg">Top Pages</h3>
        <ul className="mt-2 space-y-1">
          {data.topPages.map((page) => (
            <li key={page.path} className="text-sm">
              <span className="font-medium">{page.path}</span> —{" "}
              <span className="text-gray-600">{page.views} views</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function timestampToDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
}
