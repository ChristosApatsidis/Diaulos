// components/ui/cards/MilitaryInformation.tsx
"use client";

import { Skeleton } from "@heroui/react";
import { InfoCard } from "@/components/ui/cards/InfoCard";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/better-auth/auth-client";
import type { User } from "@/types";

export default function MilitaryInformationCard({ user }: { user?: User }) {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const generalTranslations = useTranslations("general");
  const militaryInformationTranslations = useTranslations(
    "component_ui_cards_militaryInformation",
  );

  user = user ?? (session?.user as User | undefined);

  return (
    <InfoCard className="h-full">
      <InfoCard.Header>
        <InfoCard.Header.Title>
          {militaryInformationTranslations("title")}
        </InfoCard.Header.Title>
      </InfoCard.Header>
      <InfoCard.Body>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-2">
            <InfoRow
              label={militaryInformationTranslations("infoRows.branch")}
              value={
                generalTranslations(`branches.${session?.user?.branch}`) ||
                session?.user?.branch
              }
              skeleton={isSessionPending}
            />
            <InfoRow
              label={militaryInformationTranslations(
                "infoRows.combatArmsSupportBranch",
              )}
              value={session?.user?.combatArmsSupportBranch}
              skeleton={isSessionPending}
            />
            <InfoRow
              label={militaryInformationTranslations("infoRows.rank")}
              value={
                generalTranslations(
                  `ranks.${session?.user?.branch}.${session?.user?.rank}`,
                ) || session?.user?.rank
              }
              skeleton={isSessionPending}
            />
          </div>
          <div className="space-y-2">
            <InfoRow
              label={militaryInformationTranslations("infoRows.specialization")}
              value={session?.user?.specialization}
              skeleton={isSessionPending}
            />
            <InfoRow
              label={militaryInformationTranslations("infoRows.unitOfService")}
              value={session?.user?.unitOfService}
              skeleton={isSessionPending}
            />
          </div>
        </div>
      </InfoCard.Body>
    </InfoCard>
  );
}

const InfoRow = ({
  label,
  value,
  skeleton,
}: {
  label: string;
  value?: string | null | undefined;
  skeleton?: boolean;
}) => (
  <div className="flex flex-col">
    <span className="text-xs text-gray-500 uppercase tracking-wider">
      {label}
    </span>
    <span className="text-sm font-medium">
      {skeleton ? <Skeleton className="h-5 w-32" /> : (value ?? "—")}
    </span>
  </div>
);
