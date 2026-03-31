// components/ui/cards/ProfilePersonalInfo.tsx
"use client";

import { Skeleton } from "@heroui/react";
import { useTranslations } from "next-intl";
import { InfoCard } from "@/components/ui/cards/InfoCard";
import { authClient } from "@/lib/better-auth/auth-client";
import type { User } from "@/types";

export default function PersonalInfoCard({ user }: { user?: User }) {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const personalInfoTranslations = useTranslations(
    "component_ui_cards_personalInfo",
  );

  user = user ?? (session?.user as User | undefined);

  return (
    <InfoCard className="h-full">
      <InfoCard.Header>
        <InfoCard.Header.Title>
          {personalInfoTranslations("title")}
        </InfoCard.Header.Title>
      </InfoCard.Header>
      <InfoCard.Body>
        <div className="space-y-2">
          <InfoRow
            label={personalInfoTranslations("infoRows.name")}
            value={user?.name}
            skeleton={isSessionPending}
          />
          <InfoRow
            label={personalInfoTranslations("infoRows.username")}
            value={user?.username}
            skeleton={isSessionPending}
          />
          <InfoRow
            label={personalInfoTranslations("infoRows.email")}
            value={user?.email}
            skeleton={isSessionPending}
          />
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
