// components/ui/cards/AdminDatabaseReplicationTargetJobCard.tsx
"use client";

import { useState } from "react";
import { Skeleton, Button, toast } from "@heroui/react";
import { useLocale, useTranslations } from "next-intl";
import { InfoCard } from "@/components/ui/cards/InfoCard";
import { ReplicationJob } from "@/types/admin/database";
import { formatDateTime } from "@/utils/formatDateTime";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * This component displays detailed information about a specific replication job associated with a replication target in the CouchDB admin dashboard.
 * It shows the source, target, status, start time, last updated time, and error count for the replication job.
 * The component uses the InfoCard layout and includes skeleton loaders while the data is being fetched.
 * @param databaseReplicationTargetJob - The replication job data to display.
 * @returns The rendered card component for displaying replication job details.
 */
export default function AdminDatabaseReplicationTargetJobCard({
  databaseReplicationTargetJob,
  onReplicationJobDelete,
}: {
  databaseReplicationTargetJob: ReplicationJob;
  onReplicationJobDelete: () => void;
}) {
  const locale = useLocale();
  const generalTranslations = useTranslations("general");

  return (
    <InfoCard className="h-full" variant="default">
      <InfoCard.Header>
        <InfoCard.Header.Title className="text-sm">
          {databaseReplicationTargetJob?.doc_id}
        </InfoCard.Header.Title>
      </InfoCard.Header>
      <InfoCard.Body>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <InfoRow
                label="Source"
                value={databaseReplicationTargetJob?.source}
              />
              <InfoRow
                label="Target"
                value={databaseReplicationTargetJob?.target}
              />
              <InfoRow
                label="Status"
                value={databaseReplicationTargetJob?.state}
              />
            </div>
            <div className="flex flex-col gap-2">
              <InfoRow
                label="Start time"
                value={formatDateTime({
                  date: databaseReplicationTargetJob?.start_time,
                  timeZone: "Europe/Athens",
                  locale: locale,
                  showDST: true,
                })}
              />
              <InfoRow
                label="Last updated"
                value={formatDateTime({
                  date: databaseReplicationTargetJob?.last_updated,
                  timeZone: "Europe/Athens",
                  locale: locale,
                  showDST: true,
                })}
              />
              <InfoRow
                label="Errors"
                value={
                  databaseReplicationTargetJob?.error_count?.toString() || "0"
                }
              />
            </div>
          </div>
          <div>
            <ReplicationTargetJobActions
              docId={databaseReplicationTargetJob.doc_id}
              onDelete={onReplicationJobDelete}
            />
          </div>
        </div>
      </InfoCard.Body>
    </InfoCard>
  );
}

function ReplicationTargetJobActions({
  docId,
  onDelete,
}: {
  docId: string;
  onDelete: () => void;
}) {
  const [loadingDeleteReplicationJob, setLoadingDeleteReplicationJob] =
    useState<boolean>(false);

  const handleDeleteReplicationJob = async () => {
    try {
      setLoadingDeleteReplicationJob(true);

      const res = await fetch(
        `/api/admin/database/replication/targets/${docId}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete replication job");
      }

      toast.success("Replication job deleted successfully");

      onDelete();
    } catch (err: any) {
      toast.danger(err.message || "Failed to delete replication job");
    } finally {
      setLoadingDeleteReplicationJob(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="danger"
      onClick={handleDeleteReplicationJob}
      isPending={loadingDeleteReplicationJob}
    >
      Delete replication job
    </Button>
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
