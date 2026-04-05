// components/ui/cards/AdminDatabaseStatsDatabases.tsx
"use client";

import { Chip, Skeleton } from "@heroui/react";
import { useLocale, useTranslations } from "next-intl";
import { InfoCard } from "@/components/ui/cards/InfoCard";
import type { AdminDatabaseStatsDatabases } from "@/types/admin/database";

/**
 * This component displays a list of databases in the CouchDB server in the admin dashboard.
 * It shows the names of the databases as chips, and distinguishes between system databases (starting with "_") and user databases with different colors.
 * If there is an error loading the data, it shows an error message instead.
 * The component uses the InfoCard layout and includes skeleton loaders while the data is being fetched.
 * @param databases - An array of database names to display.
 * @param databasesLoading - A boolean indicating whether the database list is currently loading.
 * @param databasesError - An error object if there was an error loading the database list.
 */
export default function AdminDatabaseStatsDatabasesCard({
  databases,
  databasesLoading,
  databasesError,
}: {
  databases?: AdminDatabaseStatsDatabases;
  databasesLoading?: boolean;
  databasesError?: any;
}) {
  const _locale = useLocale();
  const _generalTranslations = useTranslations("general");

  if (databasesError) {
    return (
      <InfoCard className="h-full">
        <InfoCard.Header>
          <InfoCard.Header.Title>Databases</InfoCard.Header.Title>
        </InfoCard.Header>
        <InfoCard.Body>
          <div className="text-sm text-red-500">
            Failed to load databases stats.
          </div>
        </InfoCard.Body>
      </InfoCard>
    );
  }

  return (
    <InfoCard className="h-full">
      <InfoCard.Header>
        <InfoCard.Header.Title>Databases</InfoCard.Header.Title>
      </InfoCard.Header>
      <InfoCard.Body>
        <div className="flex flex-row gap-2 flex-wrap">
          {databasesLoading &&
            [...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-26 rounded-xl" />
            ))}
          {!databasesLoading &&
            databases?.map((db) => (
              <Chip
                key={db}
                variant="secondary"
                color={db.startsWith("_") ? "default" : "accent"}
              >
                {db}
              </Chip>
            ))}
        </div>
      </InfoCard.Body>
    </InfoCard>
  );
}
