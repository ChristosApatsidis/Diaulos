// components/ui/cards/AdminDatabaseStatsDocumentsCard.tsx
"use client";

import { Skeleton } from "@heroui/react";
import { useLocale, useTranslations } from "next-intl";
import { InfoCard } from "@/components/ui/cards/InfoCard";
import type { AdminDatabaseStatsDocuments } from "@/types/admin/database";

/**
 * This component displays document statistics for the CouchDB server in the admin dashboard.
 * It shows reads, writes, inserts, local writes, db changes, and purges.
 * If there is an error loading the data, it shows an error message instead.
 * The component uses the InfoCard layout and includes skeleton loaders while the data is being fetched.
 * @param documents - The document statistics data to display.
 * @param documentsLoading - A boolean indicating whether the document statistics data is currently loading.
 * @param documentsError - An error object if there was an error loading the document statistics data.
 */
export default function AdminDatabaseStatsDocumentsCard({
  documents,
  documentsLoading,
  documentsError,
}: {
  documents?: AdminDatabaseStatsDocuments;
  documentsLoading?: boolean;
  documentsError?: any;
}) {
  const _locale = useLocale();
  const _generalTranslations = useTranslations("general");

  if (documentsError) {
    return (
      <InfoCard className="h-full">
        <InfoCard.Header>
          <InfoCard.Header.Title>Documents</InfoCard.Header.Title>
        </InfoCard.Header>
        <InfoCard.Body>
          <div className="text-sm text-red-500">
            Failed to load document stats.
          </div>
        </InfoCard.Body>
      </InfoCard>
    );
  }

  return (
    <InfoCard className="h-full">
      <InfoCard.Header>
        <InfoCard.Header.Title>Documents</InfoCard.Header.Title>
      </InfoCard.Header>
      <InfoCard.Body>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <InfoRow
              label="Reads"
              value={documents?.reads.toString()}
              skeleton={documentsLoading}
            />
            <InfoRow
              label="Writes"
              value={documents?.writes.toString()}
              skeleton={documentsLoading}
            />
            <InfoRow
              label="Inserts"
              value={documents?.inserts.toString()}
              skeleton={documentsLoading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <InfoRow
              label="Local Writes"
              value={documents?.localWrites.toString()}
              skeleton={documentsLoading}
            />
            <InfoRow
              label="DB Changes"
              value={documents?.dbChanges.toString()}
              skeleton={documentsLoading}
            />
            <InfoRow
              label="Purges"
              value={documents?.purges.toString()}
              skeleton={documentsLoading}
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
