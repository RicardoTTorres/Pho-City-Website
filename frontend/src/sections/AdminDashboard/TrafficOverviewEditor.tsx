import { useEffect, useState } from "react";
import { getTraffic } from "@/api/traffic";
import type { TrafficData } from "@/api/traffic";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  DefaultTooltipContent,
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

  //mock data until backend exists
  // useEffect(() => {
  //   setTimeout(() => {
  //     setData({
  //       total: {
  //         totalViews: 1248,
  //         uniqueVisitors: 367,
  //       },
  //       daily: [
  //         { day: "2025-11-10", views: 75 },
  //         { day: "2025-11-11", views: 120 },
  //         { day: "2025-11-12", views: 95 },
  //         { day: "2025-11-13", views: 180 },
  //         { day: "2025-11-14", views: 160 },
  //         { day: "2025-11-16", views: 130 },
  //       ].map(item => ({day: Date.parse(item.day), views: item.views})),
  //       topPages: [
  //         { path: "/menu", views: 500 },
  //         { path: "/", views: 420 },
  //         { path: "/about", views: 180 },
  //         { path: "/contact", views: 110 },
  //         { path: "/stats", views: 38 },
  //       ],
  //     });
  //   }, 300);
  // }, []);

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

      <div className="grid grid-cols-2 gap-6">
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
              content={
                <DefaultTooltipContent
                  accessibilityLayer={false}
                  labelFormatter={timestampToDate}
                  formatter={formatViews}
                />
              }
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
          {data.topPages.map((page: any) => (
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

function formatViews(views: number): string[] {
  return [`Views: ${views}`];
}
