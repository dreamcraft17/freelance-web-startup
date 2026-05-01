"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function isModifiedClick(event: MouseEvent): boolean {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function isInternalNavigationTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  const anchor = target.closest("a");
  if (!(anchor instanceof HTMLAnchorElement)) return false;
  if (anchor.hasAttribute("download")) return false;
  if (anchor.getAttribute("target") === "_blank") return false;
  if (anchor.getAttribute("rel")?.includes("external")) return false;
  const href = anchor.getAttribute("href");
  if (!href) return false;
  if (href.startsWith("#")) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;

  try {
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    return true;
  } catch {
    return false;
  }
}

export function GlobalPageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = useMemo(() => `${pathname ?? ""}?${searchParams?.toString() ?? ""}`, [pathname, searchParams]);

  const [isNavigating, setIsNavigating] = useState(false);
  const [barVisible, setBarVisible] = useState(false);
  const [barWidth, setBarWidth] = useState(0);

  const progressTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const routeRef = useRef(routeKey);
  const navStartedAtRef = useRef(0);
  const mountedRef = useRef(false);

  const clearTimers = () => {
    if (progressTimerRef.current != null) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (hideTimerRef.current != null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const startNavigation = () => {
    if (isNavigating) return;
    clearTimers();
    navStartedAtRef.current = Date.now();
    setIsNavigating(true);
    setBarVisible(true);
    setBarWidth(12);

    progressTimerRef.current = window.setInterval(() => {
      setBarWidth((prev) => {
        if (prev >= 86) return prev;
        return Math.min(86, prev + (prev < 45 ? 10 : 4));
      });
    }, 120);
  };

  const completeNavigation = () => {
    const elapsed = Date.now() - navStartedAtRef.current;
    const minVisible = 180;
    const wait = Math.max(0, minVisible - elapsed);

    window.setTimeout(() => {
      if (progressTimerRef.current != null) {
        window.clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      setBarWidth(100);
      hideTimerRef.current = window.setTimeout(() => {
        setIsNavigating(false);
        setBarVisible(false);
        setBarWidth(0);
      }, 170);
    }, wait);
  };

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (isModifiedClick(event)) return;
      if (!isInternalNavigationTarget(event.target)) return;
      startNavigation();
    };

    const onPopState = () => {
      startNavigation();
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, [isNavigating]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      routeRef.current = routeKey;
      return;
    }
    if (routeRef.current === routeKey) return;
    routeRef.current = routeKey;
    if (!isNavigating) startNavigation();
    completeNavigation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div
        aria-hidden
        className={[
          "fixed inset-x-0 top-0 z-[100] h-[3px] bg-transparent transition-opacity duration-150",
          barVisible ? "opacity-100" : "opacity-0"
        ].join(" ")}
      >
        <div
          className="h-full bg-[#4f35e8] transition-[width] duration-200 ease-in-out"
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <div
        className={[
          "min-h-screen transition-opacity duration-200 ease-in-out",
          isNavigating ? "opacity-90" : "opacity-100"
        ].join(" ")}
      >
        {children}
      </div>
    </>
  );
}
