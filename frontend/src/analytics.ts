import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { postTraffic } from "@/api/traffic";

export function PageViewTracker() {
  const location = useLocation();
  const lastPath = useRef<string>(null);

  useEffect(() => {
    //console.log("switch", location.pathname);

    // avoid issue where logging runs twice in dev
    if (lastPath.current === location.pathname) return;
    lastPath.current = location.pathname;

    const send = async () => {
        if (location.pathname.startsWith("/cms") || location.pathname.startsWith("/adminLogin")) return;
        await postTraffic(location.pathname);
    };
    send();
  }, [location.pathname]);

  return null;
}