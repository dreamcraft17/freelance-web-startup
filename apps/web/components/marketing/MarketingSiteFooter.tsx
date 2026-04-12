const footerLabels = ["Privacy policy", "Terms of service", "Contact", "Twitter"] as const;

export function MarketingSiteFooter() {
  return (
    <footer className="mt-16 w-full bg-slate-50 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-8 md:flex-row md:items-center md:gap-8">
        <p className="text-lg font-bold text-slate-900">NearWork</p>
        <nav className="flex flex-wrap justify-center gap-6 sm:gap-8" aria-label="Footer">
          {footerLabels.map((label) => (
            <span
              key={label}
              className="cursor-not-allowed text-xs font-medium uppercase tracking-wider text-slate-400"
              title="Coming soon"
            >
              {label}
            </span>
          ))}
        </nav>
        <p className="text-center text-xs font-medium uppercase tracking-wider text-slate-500 md:text-right">
          © {new Date().getFullYear()} NearWork
        </p>
      </div>
    </footer>
  );
}
