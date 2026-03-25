// components/ui/cards/AccountInformation.tsx
"use client";

import { Skeleton, Tooltip, Chip } from "@heroui/react";
import { InfoCard } from "@/components/ui/cards/InfoCard";
import { useTranslations, useLocale } from "next-intl";
import { authClient } from "@/lib/better-auth/auth-client";
import { formatDateTime } from "@/utils/formatDateTime";

export default function AccountInformationCard() {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const locale = useLocale();
  const generalTranslations = useTranslations("general");
  const accountInformationTranslations = useTranslations(
    "component_ui_cards_accountInformation",
  );

  return (
    <InfoCard>
      <InfoCard.Header>
        <InfoCard.Header.Title>
          {accountInformationTranslations("title")}
        </InfoCard.Header.Title>
      </InfoCard.Header>
      <InfoCard.Body>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* User ID, Member Since, Last Updated */}
          <div className="flex flex-col gap-2">
            <InfoRow
              label={accountInformationTranslations("infoRows.userId")}
              value={session?.user?.id}
              skeleton={isSessionPending}
            />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
              <InfoRow
                label={accountInformationTranslations("infoRows.memberSince")}
                value={
                  session?.user?.createdAt
                    ? formatDateTime({
                        date: session.user.createdAt,
                        timeZone: "Europe/Athens",
                        locale: locale,
                        showDST: true,
                      })
                    : null
                }
                skeleton={isSessionPending}
              />
              <InfoRow
                label={accountInformationTranslations("infoRows.lastUpdated")}
                value={
                  session?.user?.updatedAt
                    ? formatDateTime({
                        date: session.user.updatedAt,
                        timeZone: "Europe/Athens",
                        locale: locale,
                        showDST: true,
                      })
                    : null
                }
                skeleton={isSessionPending}
              />
            </div>
          </div>
          {/* Permissions */}
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              {accountInformationTranslations("infoRows.permissions")}
            </span>
            <div className="flex flex-wrap gap-1">
              {isSessionPending ? (
                <Skeleton className="h-5 w-32" />
              ) : session?.user?.permissions?.length ? (
                session.user.permissions.map((perm: string) => (
                  <Tooltip delay={0} key={perm}>
                    <Tooltip.Trigger>
                      <Chip size="sm" color="accent" className="cursor-default">
                        {generalTranslations(`userPermissions.${perm}.title`)}
                      </Chip>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      <p>
                        {generalTranslations(
                          `userPermissions.${perm}.description`,
                        )}
                      </p>
                    </Tooltip.Content>
                  </Tooltip>
                ))
              ) : (
                "—"
              )}
            </div>
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
