import { notFound } from "next/navigation";
import { db } from "@acme/database";
import { PageHeader } from "@/features/shared/components/PageHeader";
import { SaveFreelancerButton } from "@/features/saved/components/SaveFreelancerButton";
import { getServerTranslator } from "@/lib/i18n/server-translator";

type PageProps = {
  params: Promise<{ username: string }>;
};

export default async function FreelancerPublicProfilePage({ params }: PageProps) {
  const { t } = await getServerTranslator();
  const { username: raw } = await params;
  const username = raw?.trim() ?? "";
  if (!username) notFound();

  const profile = await db.freelancerProfile.findFirst({
    where: { username, deletedAt: null },
    select: {
      id: true,
      username: true,
      fullName: true,
      headline: true,
      workMode: true,
      city: true,
      country: true
    }
  });

  if (!profile) notFound();

  const meta = [profile.workMode, profile.city, profile.country].filter(Boolean).join(" · ");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title={`@${profile.username}`}
        description={profile.headline ?? profile.fullName}
        actions={<SaveFreelancerButton freelancerProfileId={profile.id} />}
      />

      <p className="text-muted-foreground text-sm">{meta || t("public.freelancers.profileFallback")}</p>
    </div>
  );
}
