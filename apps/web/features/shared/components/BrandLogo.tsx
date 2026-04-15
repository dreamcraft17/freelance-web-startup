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
  alt = "NearWork"
}: BrandLogoProps) {
  const [failed, setFailed] = useState(false);

  return (
    <Link
      href={href}
      className={`inline-flex items-center outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#3525cd] ${className}`.trim()}
      aria-label="NearWork home"
    >
      {failed ? (
        <span className="text-sm font-semibold tracking-tight text-[#3525cd]">NearWork</span>
      ) : (
        <img src="/logo/logo3.png" alt={alt} className={imageClassName} onError={() => setFailed(true)} />
      )}
    </Link>
  );
}

