"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";

type BrandLogoProps = {
  href?: Route;
  className?: string;
  imageClassName?: string;
  alt?: string;
};

export function BrandLogo({
  href = "/",
  className = "",
  imageClassName = "h-8 w-auto",
  alt = "NextWork"
}: BrandLogoProps) {
  const [failed, setFailed] = useState(false);

  return (
    <Link
      href={href}
      className={`inline-flex items-center outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-nw-brand ${className}`.trim()}
      aria-label="NextWork home"
    >
      {failed ? (
        <span className="text-sm font-semibold tracking-tight text-nw-brand">NextWork</span>
      ) : (
        <img src="/logo/logo_EN.png" alt={alt} className={imageClassName} onError={() => setFailed(true)} />
      )}
    </Link>
  );
}

