import { redirect } from "next/navigation";
import { db } from "@acme/database";
import { getSessionFromCookies } from "@src/lib/auth";
import {
  FreelancerProfileEditor,
  type FreelancerProfileEditorInitial,
  type FreelancerProfileEditorSkill
} from "@/components/freelancer/FreelancerProfileEditor";
import { AvailabilityStatus, WorkMode } from "@acme/types";

export default async function FreelancerProfilePage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login?returnUrl=/freelancer/profile");
  }

  const profile = await db.freelancerProfile.findFirst({
    where: { userId: session.userId, deletedAt: null },
    include: {
      skills: {
        include: {
          skill: {
            include: {
              category: { select: { name: true } }
            }
          }
        }
      },
      _count: {
        select: {
          portfolioItems: true
        }
      }
    }
  });

  const skills: FreelancerProfileEditorSkill[] =
    profile?.skills.map((fs) => ({
      name: fs.skill.name,
      categoryName: fs.skill.category?.name ?? null
    })) ?? [];

  const initial: FreelancerProfileEditorInitial | null = profile
    ? {
        username: profile.username,
        fullName: profile.fullName,
        headline: profile.headline ?? "",
        bio: profile.bio ?? "",
        workMode: profile.workMode as WorkMode,
        availabilityStatus: profile.availabilityStatus as AvailabilityStatus,
        profileCompleteness: profile.profileCompleteness
      }
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24">
      <header className="border-b border-slate-200/80 pb-5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Freelancer</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 md:text-[1.65rem]">
          Profile & availability
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
          Update how you show up to clients. Changes here sync to your public profile and proposals.
        </p>
      </header>

      <FreelancerProfileEditor
        key={profile?.id ?? "create"}
        mode={profile ? "edit" : "create"}
        initial={initial}
        skills={skills}
        location={{
          city: profile?.city ?? null,
          region: profile?.region ?? null,
          country: profile?.country ?? null
        }}
        portfolioCount={profile?._count.portfolioItems ?? 0}
      />
    </div>
  );
}
