// components/ui/cards/AdminDatabaseStatsReplicationCard.tsx
"use client";

import { Chip, Separator, Skeleton } from "@heroui/react";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { InfoCard } from "@/components/ui/cards/InfoCard";
import type { AdminDatabaseStatsReplication } from "@/types/admin/database";

/**
 * This component displays replication statistics for the CouchDB server in the admin dashboard.
 * It shows the number of replication requests, workers started, failed starts, running jobs, pending jobs, and crashed jobs.
 * It also checks for any failures in replication (failed starts or crashed jobs) and displays a warning chip if any are detected, or a success chip if no failures are detected.
 * If there is an error loading the data, it shows an error message instead.
 * The component uses the InfoCard layout and includes skeleton loaders while the data is being fetched.
 * @param replication - The replication statistics data to display.
 * @param replicationLoading - A boolean indicating whether the replication statistics data is currently loading.
 * @param replicationError - An error object if there was an error loading the replication statistics data.
 */
export default function AdminDatabaseStatsReplicationCard({
  replication,
  replicationLoading,
  replicationError,
}: {
  replication?: AdminDatabaseStatsReplication;
  replicationLoading?: boolean;
  replicationError?: any;
}) {
  const _locale = useLocale();
  const _generalTranslations = useTranslations("general");

  if (replicationError) {
    return (
      <InfoCard className="h-full">
        <InfoCard.Header>
          <InfoCard.Header.Title>Replication</InfoCard.Header.Title>
        </InfoCard.Header>
        <InfoCard.Body>
          <div className="text-sm text-red-500">
            Failed to load replication stats.
          </div>
        </InfoCard.Body>
      </InfoCard>
    );
  }

  return (
    <InfoCard className="h-full">
      <InfoCard.Header>
        <InfoCard.Header.Title>Replication</InfoCard.Header.Title>
      </InfoCard.Header>
      <InfoCard.Body>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <InfoRow
              label="Requests"
              value={replication?.requests.toString()}
              skeleton={replicationLoading}
            />
            <InfoRow
              label="Workers Started"
              value={replication?.workersStarted.toString()}
              skeleton={replicationLoading}
            />
            <InfoRow
              label="Failed Starts"
              value={replication?.failedStarts.toString()}
              skeleton={replicationLoading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <InfoRow
              label="Running Jobs"
              value={replication?.runningJobs.toString()}
              skeleton={replicationLoading}
            />
            <InfoRow
              label="Pending Jobs"
              value={replication?.pendingJobs.toString()}
              skeleton={replicationLoading}
            />
            <InfoRow
              label="Crashed Jobs"
              value={replication?.crashedJobs.toString()}
              skeleton={replicationLoading}
            />
          </div>
        </div>

        <Separator className="my-2" />

        {!replicationLoading &&
          ((replication?.failedStarts ?? 0) > 0 ||
          (replication?.crashedJobs ?? 0) > 0 ? (
            <div className="flex gap-2 mt-2">
              <Chip
                color="danger"
                size="md"
                variant="primary"
                className="flex items-center gap-2"
              >
                <TriangleAlert size={16} />
                {(replication?.failedStarts ?? 0) +
                  (replication?.crashedJobs ?? 0)}{" "}
                failures detected
              </Chip>
            </div>
          ) : (
            <Chip
              color="success"
              size="md"
              variant="primary"
              className="flex items-center gap-2 mt-2"
            >
              <CircleCheck size={16} />
              No failures detected
            </Chip>
          ))}
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
