// components/ui/cards/DatabaseInfo.tsx
"use client";

import { Skeleton } from "@heroui/react";
import { useLocale, useTranslations } from "next-intl";
import { InfoCard } from "@/components/ui/cards/InfoCard";
import type {
  AdminDatabaseStats,
  AdminDatabaseStatsDatabases,
} from "@/types/admin/database";

/**
 * This component displays general information about the CouchDB server in the admin dashboard.
 * It shows the host, version, vendor, and number of databases.
 * If there is an error loading the data, it shows an error message instead.
 * The component uses the InfoCard layout and includes skeleton loaders while the data is being fetched.
 * @param dbInfo - An object containing the database information to display.
 * @param dbInfoLoading - A boolean indicating whether the database information is currently loading.
 * @param dbInfoError - An error object if there was an error loading the database information.
 */
export default function AdminDatabaseInfoCard({
  dbInfo,
  dbInfoLoading,
  dbInfoError,
}: {
  dbInfo?: {
    host: AdminDatabaseStats["host"];
    version: AdminDatabaseStats["version"];
    vendor: AdminDatabaseStats["vendor"];
    databases: AdminDatabaseStatsDatabases;
  };
  dbInfoLoading?: boolean;
  dbInfoError?: any;
}) {
  const _locale = useLocale();
  const _generalTranslations = useTranslations("general");

  if (dbInfoError) {
    return (
      <InfoCard className="h-full">
        <InfoCard.Header>
          <InfoCard.Header.Title>Database info</InfoCard.Header.Title>
        </InfoCard.Header>
        <InfoCard.Body>
          <div className="text-sm text-red-500">
            Failed to load database info.
          </div>
        </InfoCard.Body>
      </InfoCard>
    );
  }

  return (
    <InfoCard className="h-full">
      <InfoCard.Header>
        <InfoCard.Header.Title>Database info</InfoCard.Header.Title>
      </InfoCard.Header>
      <InfoCard.Body>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex flex-col gap-2">
            <InfoRow
              label="Host"
              value={dbInfo?.host}
              skeleton={dbInfoLoading}
            />
            <InfoRow
              label="Version"
              value={dbInfo?.version}
              skeleton={dbInfoLoading}
            />
            <InfoRow
              label="Vendor"
              value={dbInfo?.vendor}
              skeleton={dbInfoLoading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <InfoRow
              label="Databases"
              value={dbInfo?.databases.length.toString()}
              skeleton={dbInfoLoading}
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
