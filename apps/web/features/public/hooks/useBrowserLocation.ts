"use client";

import { useCallback, useState } from "react";

export type BrowserLocationState = "idle" | "requesting" | "granted" | "denied";

export function useBrowserLocation() {
  const [state, setState] = useState<BrowserLocationState>("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setState("denied");
      setError("Geolocation is not supported in this browser.");
      return;
    }

    setState("requesting");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setState("granted");
      },
      (err) => {
        setState("denied");
        if (err.code === err.PERMISSION_DENIED) {
          setError("Location permission denied. You can still search by city.");
        } else {
          setError("Could not determine your location. Try again or use city search.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 120000 }
    );
  }, []);

  const clear = useCallback(() => {
    setCoords(null);
    setError(null);
    setState("idle");
  }, []);

  return { state, coords, error, request, clear, setCoords, setState };
}

