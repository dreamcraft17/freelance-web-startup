import { Check, Star } from "lucide-react";

const bullets = [
  "Profiles and portfolios in context",
  "Bids and messages tied to each job",
  "Discovery for nearby and remote work"
] as const;

export function LandingSpotlight() {
  return (
    <section className="mx-auto max-w-7xl overflow-hidden px-4 py-20 sm:px-6 sm:py-28">
      <div className="flex flex-col items-center gap-14 md:flex-row md:gap-16">
        <div className="relative w-full md:w-1/2">
          <div className="absolute -left-8 -top-8 -z-10 h-64 w-64 rounded-full bg-[#3525cd]/10 blur-3xl" aria-hidden />
          <div className="relative rounded-[2.5rem] border border-slate-200/80 bg-white p-8 shadow-[0_40px_60px_-20px_rgba(53,37,205,0.1)] sm:p-10">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-orange-50 text-xl font-bold text-[#3525cd]">
              ER
            </div>
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xl font-bold text-slate-900">Example freelancer</p>
                <p className="font-medium text-[#3525cd]">Brand & editorial design</p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-900">
                <Star className="h-3.5 w-3.5 fill-orange-400 text-orange-500" aria-hidden />
                4.9
              </div>
            </div>
            <blockquote className="mb-8 text-sm italic leading-relaxed text-slate-600">
              “When clients are local, shoots and revisions are faster. When they are remote, the same thread keeps
              deliverables organized.”
            </blockquote>
            <div className="flex flex-wrap gap-2">
              {["Brand identity", "Editorial", "Packaging"].map((t) => (
                <span key={t} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <h2 className="mb-5 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            Expertise around the corner—or across time zones
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-slate-600">
            NearWork is for teams and solos who want real people, clear scopes, and hiring that does not feel anonymous.
            Use local when presence matters; use remote when it does not.
          </p>
          <ul className="space-y-4">
            {bullets.map((text) => (
              <li key={text} className="flex items-center gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-[#3525cd]">
                  <Check className="h-4 w-4" aria-hidden />
                </span>
                <span className="font-medium text-slate-800">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
