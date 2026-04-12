const steps = [
  {
    n: "01",
    title: "Post a job",
    body: "Describe the outcome and whether you need someone nearby, remote, or hybrid—plus budget and timeline."
  },
  {
    n: "02",
    title: "Receive bids",
    body: "Freelancers respond with proposals, pricing, and context. Compare in one thread instead of scattered DMs."
  },
  {
    n: "03",
    title: "Hire and collaborate",
    body: "Award work, align on milestones or sessions, and keep files and decisions where the job lives."
  }
] as const;

export function LandingHowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="mb-16 text-center md:mb-20">
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
          A simple, transparent flow
        </h2>
        <p className="mx-auto max-w-xl text-slate-600">
          Built for focus: fewer tabs, clearer next steps, and hiring that respects how you actually work.
        </p>
      </div>
      <ol className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
        {steps.map(({ n, title, body }) => (
          <li key={n} className="flex flex-col items-center text-center">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-100 shadow-[0_24px_48px_-16px_rgba(53,37,205,0.2)]">
              <span className="text-2xl font-bold text-[#3525cd]">{n}</span>
            </div>
            <h3 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">{title}</h3>
            <p className="max-w-sm leading-relaxed text-slate-600">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
