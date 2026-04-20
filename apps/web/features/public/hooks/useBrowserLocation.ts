"use client";

import { useCallback, useState } from "react";

export type BrowserLocationState = "idle" | "requesting" | "granted" | "denied";
export type BrowserLocationErrorCode = "unsupported" | "permission_denied" | "lookup_failed";

export function useBrowserLocation() {
  const [state, setState] = useState<BrowserLocationState>("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [errorCode, setErrorCode] = useState<BrowserLocationErrorCode | null>(null);

  const request = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setState("denied");
      setErrorCode("unsupported");
      return;
    }

    setState("requesting");
    setErrorCode(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setState("granted");
      },
      (err) => {
        setState("denied");
        if (err.code === err.PERMISSION_DENIED) {
          setErrorCode("permission_denied");
        } else {
          setErrorCode("lookup_failed");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 120000 }
    );
  }, []);

  const clear = useCallback(() => {
    setCoords(null);
    setErrorCode(null);
    setState("idle");
  }, []);

  return { state, coords, errorCode, request, clear, setCoords, setState };
}

