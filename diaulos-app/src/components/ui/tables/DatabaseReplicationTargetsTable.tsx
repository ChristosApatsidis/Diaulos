// components/ui/tables/DatabaseReplicationTargetsTable.tsx
"use client";

import { ReplicationTarget } from "@/types/admin/database";
import { useState } from "react";
import {
  Chip,
  EmptyState,
  Spinner,
  Table,
  Tooltip,
  toast,
} from "@heroui/react";
import { useLocale } from "next-intl";
import ViewDatabaseReplicationTarget from "@/components/ui/modals/ViewDatabaseReplicationTrget";

/**
 * This component renders a table of database replication targets for the CouchDB admin dashboard. It displays the target name, target URL, number of replication jobs, and error status for each replication target.
 * It also includes actions for viewing details of each replication target. The table shows a loading state while data is being fetched and an empty state if there are no replication targets.
 * @param databaseReplicationTargets - An array of replication target objects to display in the table.
 * @param databaseReplicationTargetsError - An error object if there was an error loading the replication targets.
 * @param databaseReplicationTargetsLoading - A boolean indicating whether the replication targets data is currently loading.
 * @returns The rendered table component for displaying database replication targets.
 */
export default function DatabaseReplicationTargetsTable({
  databaseReplicationTargets,
  databaseReplicationTargetsError,
  databaseReplicationTargetsLoading,
  onReplicationJobDelete,
}: {
  databaseReplicationTargets: ReplicationTarget[] | undefined;
  databaseReplicationTargetsError: Error | undefined;
  databaseReplicationTargetsLoading: boolean;
  onReplicationJobDelete: () => void;
}) {
  const locale = useLocale();

  // Define the columns for the users table
  const columns = [
    {
      id: "target_name",
      name: "Target Name",
      align: "start",
    },
    {
      id: "target_url",
      name: "Target URL",
      align: "start",
    },
    {
      id: "replication_jobs",
      name: "Replication Jobs",
      align: "start",
    },
    {
      id: "errors",
      name: "Error Status",
      align: "start",
    },
    {
      id: "actions",
      name: "Actions",
      align: "start",
    },
  ];

  if (databaseReplicationTargetsError) {
    toast.danger("Error loading replication targets.");
    return;
  }

  return (
    <div className="h-full flex flex-col">
      <Table
        variant="primary"
        key={locale}
        className="min-w-full"
        aria-label="Database Replication Targets"
      >
        <Table.ScrollContainer className="max-h-[680px] overflow-y-auto">
          <Table.Content aria-label="Database Replication Targets">
            {/* Table Header */}
            <Table.Header columns={columns} className="sticky top-0 z-10">
              {(column) => (
                <Table.Column
                  isRowHeader={column.id === "target_name"}
                  key={column.id}
                  className="text-foreground"
                >
                  {column.name}
                </Table.Column>
              )}
            </Table.Header>
            {/* Table Body */}
            <Table.Body
              items={databaseReplicationTargets || []}
              renderEmptyState={() =>
                databaseReplicationTargetsLoading ? (
                  <div className="flex flex-col items-center gap-2 pt-4 pb-4">
                    <Spinner color="current" />
                    <span className="text-xs text-muted">
                      Loading replication targets...
                    </span>
                  </div>
                ) : (
                  <EmptyState className="flex h-full w-full flex-col items-center justify-center text-center">
                    <span className="text-sm text-muted">
                      No replication targets found.
                    </span>
                    <p className="text-sm text-muted">
                      Replication targets will appear here when you have active
                      replication jobs configured in CouchDB.
                    </p>
                  </EmptyState>
                )
              }
            >
              {(item) => {
                const failedJobs = item.replications.filter(
                  (job) => job.error_count > 0,
                ).length;

                const errorMessages = item.replications
                  .filter((job) => job.error_count > 0)
                  .map(
                    (job) =>
                      `Job ${job.doc_id || ""}: ${job.state || "Unknown error"}`,
                  );

                const errorsChip =
                  failedJobs > 0 ? (
                    <Tooltip delay={0}>
                      <Tooltip.Trigger>
                        <Chip
                          variant="soft"
                          color="danger"
                          size="sm"
                          className="glow-error"
                        >
                          {`${failedJobs} job error${failedJobs > 1 ? "s" : ""} detected`}
                        </Chip>
                      </Tooltip.Trigger>
                      <Tooltip.Content showArrow placement="top">
                        <Tooltip.Arrow />
                        <span className="text-sm text-muted whitespace-pre-line">
                          {errorMessages.join("\n") ||
                            "Error details not available"}
                        </span>
                      </Tooltip.Content>
                    </Tooltip>
                  ) : (
                    <Chip variant="soft" color="success" size="sm">
                      No errors detected
                    </Chip>
                  );
                return (
                  <Table.Row key={item.target_url} id={item.target_url}>
                    <Table.Cell>{item.target_name || "N/A"}</Table.Cell>
                    <Table.Cell>{item.target_url}</Table.Cell>
                    <Table.Cell>
                      {item.replications.length} replication job
                      {item.replications.length !== 1 && "s"}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex">{errorsChip}</div>
                    </Table.Cell>
                    <Table.Cell>
                      <TrgetActions
                        target={item}
                        onReplicationJobDelete={onReplicationJobDelete}
                      />
                    </Table.Cell>
                  </Table.Row>
                );
              }}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </div>
  );
}

function TrgetActions({
  target,
  onReplicationJobDelete,
}: {
  target: ReplicationTarget;
  onReplicationJobDelete: () => void;
}) {
  return (
    <div className="flex flex-row items-center gap-2">
      <ViewDatabaseReplicationTarget
        target={target}
        onReplicationJobDelete={onReplicationJobDelete}
      />
    </div>
  );
}
