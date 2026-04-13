import Link from "next/link";
import type { Route } from "next";

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
  return (
    <Link
      href={href}
      className={`inline-flex items-center outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#3525cd] ${className}`.trim()}
      aria-label="NearWork home"
    >
      <img src="/logo/logo.svg" alt={alt} className={imageClassName} />
    </Link>
  );
}

