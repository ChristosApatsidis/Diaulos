// components/ui/cards/AdminDatabaseReplicationTargetsCard.tsx
"use client";

import { Skeleton, Button, Separator, toast } from "@heroui/react";
import { useTranslations } from "next-intl";
import { InfoCard } from "@/components/ui/cards/InfoCard";
import { ReplicationTarget } from "@/types/admin/database";
import DatabaseReplicationTargetsTable from "@/components/ui/tables/DatabaseReplicationTargetsTable";
import NewDatabaseReplicationTarget from "@/components/ui/modals/NewDatabaseReplicationTarget";

/**
 * This component displays replication statistics for the CouchDB server in the admin dashboard.
 * It shows the number of replication targets and the number of active replications.
 * If there is an error loading the data, it shows an error message instead.
 * The component uses the InfoCard layout and includes skeleton loaders while the data is being fetched.
 * @param replication - The replication statistics data to display.
 * @param replicationLoading - A boolean indicating whether the replication data is currently loading.
 * @param replicationError - An error object if there was an error loading the replication data.
 */
export default function AdminDatabaseReplicationTargetsCard({
  databaseReplicationTargets,
  databaseReplicationTargetsError,
  databaseReplicationTargetsLoading,
  databaseReplicationTargetsValidating,
  databases,
  sourceDatabase,
  onRefresh,
}: {
  databaseReplicationTargets: ReplicationTarget[] | undefined;
  databaseReplicationTargetsError: Error | undefined;
  databaseReplicationTargetsLoading: boolean;
  databaseReplicationTargetsValidating: boolean;
  databases?: string[];
  sourceDatabase?: {
    host: string;
    port: string;
  };
  onRefresh: () => void;
}) {
  const generalTranslations = useTranslations("general");

  if (databaseReplicationTargetsError) {
    return (
      <InfoCard className="h-full">
        <InfoCard.Header>
          <InfoCard.Header.Title>Replication Targets</InfoCard.Header.Title>
        </InfoCard.Header>
        <InfoCard.Body>
          <div className="text-sm text-red-500">
            Failed to load replication targets stats.
          </div>
        </InfoCard.Body>
      </InfoCard>
    );
  }

  // Calculate total replication targets and active replications
  const targets = Array.isArray(databaseReplicationTargets)
    ? databaseReplicationTargets
    : [];

  // Count active replications by summing the length of the replications array for each target
  const activeReplications = targets.reduce(
    (acc, target) => acc + target.replications.length,
    0,
  );

  const totalReplicationTargets = targets.length;

  return (
    <InfoCard className="h-full">
      <InfoCard.Header>
        <InfoCard.Header.Title>Replication Targets</InfoCard.Header.Title>
      </InfoCard.Header>
      <InfoCard.Body>
        <div className="grid grid-cols-12 gap-2">
          {/* Replication targets summary */}
          <div className="col-span-12 2xl:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-row gap-4">
                <InfoRow
                  label="Total Replication Targets"
                  value={totalReplicationTargets.toString()}
                  skeleton={databaseReplicationTargetsLoading}
                />
              </div>
              <div className="flex flex-col gap-2">
                <InfoRow
                  label="Active Replications"
                  value={activeReplications.toString()}
                  skeleton={databaseReplicationTargetsLoading}
                />
              </div>
            </div>
            <Separator className="my-2" />
            {!databaseReplicationTargetsLoading ? (
              <div className="flex flex-row gap-2">
                <NewDatabaseReplicationTarget
                  sourceDatabaseHost={sourceDatabase?.host.split(":")[0]}
                  sourceDatabasePort={sourceDatabase?.port.split(":")[0]}
                  databases={databases}
                  onReplicationCreated={() => onRefresh()}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => onRefresh()}
                  isDisabled={databaseReplicationTargetsValidating}
                >
                  {databaseReplicationTargetsValidating
                    ? "Refreshing..."
                    : "Refresh"}
                </Button>
              </div>
            ) : (
              <div className="flex flex-row gap-2">
                <Skeleton className="h-8 w-32 rounded-2xl" />
                <Skeleton className="h-8 w-32 rounded-2xl" />
              </div>
            )}
          </div>
          {/* Replication targets table */}
          <div className="col-span-12 2xl:col-span-9">
            <DatabaseReplicationTargetsTable
              databaseReplicationTargets={databaseReplicationTargets}
              databaseReplicationTargetsError={databaseReplicationTargetsError}
              databaseReplicationTargetsLoading={
                databaseReplicationTargetsLoading
              }
              onReplicationJobDelete={onRefresh}
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
