import { Camera, Clapperboard, Globe, GraduationCap } from "lucide-react";

const cases = [
  {
    title: "Need a photographer for an event?",
    body: "Browse local professionals with portfolios and clear availability.",
    icon: Camera,
    iconWrap: "bg-indigo-100 text-[#3323cc]",
    offset: false
  },
  {
    title: "Looking for a quick video editor?",
    body: "Connect with editors for social clips, interviews, and longer-form cuts.",
    icon: Clapperboard,
    iconWrap: "bg-indigo-100 text-[#3f465c]",
    offset: true
  },
  {
    title: "Need a tutor near your home?",
    body: "Use location-friendly discovery for lessons and skill-building sessions.",
    icon: GraduationCap,
    iconWrap: "bg-orange-100 text-[#7b2f00]",
    offset: false
  },
  {
    title: "Want to hire remote talent?",
    body: "Scale with specialists anywhere—same briefs, bids, and delivery in one place.",
    icon: Globe,
    iconWrap: "bg-indigo-200/80 text-[#3525cd]",
    offset: true
  }
] as const;

export function LandingUseCases() {
  return (
    <section className="mx-auto mt-20 max-w-7xl px-4 sm:mt-28 sm:px-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {cases.map(({ title, body, icon: Icon, iconWrap, offset }) => (
          <div
            key={title}
            className={`rounded-[2rem] bg-[#f2f4f6] p-8 transition-colors hover:bg-[#e6e8ea] sm:p-10 ${offset ? "md:mt-12" : ""}`}
          >
            <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl ${iconWrap}`}>
              <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
            </div>
            <h2 className="mb-4 text-2xl font-semibold leading-tight tracking-tight text-[#191c1e] sm:text-3xl">
              {title}
            </h2>
            <p className="text-lg leading-relaxed text-[#464555]">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
