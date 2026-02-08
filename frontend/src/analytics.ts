import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { postTraffic } from "@/api/traffic";

export function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/cms") || location.pathname.startsWith("/adminLogin")) return;
    postTraffic(location.pathname);
  }, [location.pathname]);

  return null;
}