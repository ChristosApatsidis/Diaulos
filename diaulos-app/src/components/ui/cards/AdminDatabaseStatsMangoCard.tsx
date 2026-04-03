// components/ui/cards/AdminDatabaseStatsMangoCard.tsx
"use client";

import { Chip, Skeleton, Separator, ProgressBar } from "@heroui/react";
import { useLocale, useTranslations } from "next-intl";
import { InfoCard } from "@/components/ui/cards/InfoCard";
import { TriangleAlert } from "lucide-react";
import { AdminDatabaseStatsMango } from "@/types/admin/database";

/**
 * This component displays cache statistics for the CouchDB server in the admin dashboard.
 * It shows the number of documents examined, results returned, unindexed queries, and queries that scanned too many documents.
 * It calculates the efficiency of Mango queries as the percentage of results returned out of the total documents examined, and displays it as a progress bar.
 * If there is an error loading the data, it shows an error message instead.
 * The component uses the InfoCard layout and includes skeleton loaders while the data is being fetched.
 * @param mango - The Mango query statistics data to display.
 * @param mangoLoading - A boolean indicating whether the Mango query statistics data is currently loading.
 * @param mangoError - An error object if there was an error loading the Mango query statistics data.
 */
export default function AdminDatabaseStatsMangoCard({
  mango,
  mangoLoading,
  mangoError,
}: {
  mango?: AdminDatabaseStatsMango;
  mangoLoading?: boolean;
  mangoError?: any;
}) {
  const locale = useLocale();
  const generalTranslations = useTranslations("general");

  // The efficiency of Mango queries is calculated as the percentage of results returned out of the total documents examined. It is rounded to the nearest whole number for display.
  const mangoEfficiency =
    mango && mango?.docsExamined > 0
      ? Math.round((mango.resultsReturned / mango.docsExamined) * 100)
      : null;

  if (mangoError) {
    return (
      <InfoCard className="h-full">
        <InfoCard.Header>
          <InfoCard.Header.Title>Mango Queries</InfoCard.Header.Title>
        </InfoCard.Header>
        <InfoCard.Body>
          <div className="text-sm text-red-500">
            Failed to load Mango queries stats.
          </div>
        </InfoCard.Body>
      </InfoCard>
    );
  }

  return (
    <InfoCard className="h-full">
      <InfoCard.Header>
        <InfoCard.Header.Title>Mango Queries</InfoCard.Header.Title>
      </InfoCard.Header>
      <InfoCard.Body>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <InfoRow
              label="Documents Examined"
              value={mango?.docsExamined.toString()}
              skeleton={mangoLoading}
            />
            <InfoRow
              label="Results Returned"
              value={mango?.resultsReturned.toString()}
              skeleton={mangoLoading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <InfoRow
              label="Unindexed Queries"
              value={mango?.unindexedQueries.toString()}
              skeleton={mangoLoading}
            />
            <InfoRow
              label="Too Many Docs Scanned"
              value={mango?.tooManyDocsScanned.toString()}
              skeleton={mangoLoading}
            />
          </div>
        </div>

        <Separator className="my-2" />

        <div>
          <ProgressBar
            aria-label={`${mangoEfficiency}% efficiency`}
            value={mangoEfficiency ?? 0}
            color={
              mangoEfficiency && mangoEfficiency > 50
                ? "success"
                : mangoEfficiency && mangoEfficiency > 20
                  ? "warning"
                  : "danger"
            }
          >
            <span className="text-xs text-gray-500 uppercase tracking-wider mt-0">
              Efficiency
            </span>
            <ProgressBar.Output />
            <ProgressBar.Track>
              <ProgressBar.Fill />
            </ProgressBar.Track>
          </ProgressBar>
          {(mango?.unindexedQueries ?? 0) > 0 && (
            <Chip
              color="warning"
              size="sm"
              variant="soft"
              className="mt-2 justify-center"
            >
              <TriangleAlert className="mr-1" size={14} />
              {mango?.unindexedQueries} unindexed queries
            </Chip>
          )}
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
