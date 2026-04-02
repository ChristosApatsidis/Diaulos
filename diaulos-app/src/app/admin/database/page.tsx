// admin/database/page.tsx
"use client";

import { useTranslations } from "next-intl";
import UsersTable from "@/components/ui/tables/Users";
import { useEffect, useState } from "react";
import TreeView, { type TreeNodeData } from "@/components/ui/treeView";
import useSWR from "swr";
import DatabaseInfoCard from "@/components/ui/cards/DatabaseInfo";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type ReplicationInfo = {
  docs_read?: number;
  docs_written?: number;
  doc_write_failures?: number;
  changes_pending?: number;
  [key: string]: unknown;
};

type ReplicationJob = {
  doc_id: string;
  node: string;
  source: string;
  target: string;
  state: string;
  info: ReplicationInfo;
  error_count: number;
  start_time: string;
  last_updated: string;
  [key: string]: unknown;
};

type ReplicationTarget = {
  target_name: string;
  target_url: string;
  target_host: string;
  replications: ReplicationJob[];
};

type DatabaseInfo = {
  host: string;
  version: string;
  vendor: string;
  databases: string[];
  storage: {
    openDatabases: number;
    openFiles: number;
    commits: number;
    fsyncCount: number;
  };
  documents: {
    reads: number;
    writes: number;
    inserts: number;
    localWrites: number;
    dbChanges: number;
    purges: number;
  };
  httpd: {
    totalRequests: number;
    bulkRequests: number;
    viewReads: number;
    clientsChanges: number;
    abortedRequests: number;
    methods: Record<string, number>;
    statusCodes: Record<string, number>;
  };
  mango: {
    docsExamined: number;
    resultsReturned: number;
    unindexedQueries: number;
    tooManyDocsScanned: number;
  };
  replication: {
    requests: number;
    workersStarted: number;
    failedStarts: number;
    runningJobs: number;
    pendingJobs: number;
    crashedJobs: number;
    retries_per_request: number | null;
    max_retry_timeout_msec: number | null;
    min_retry_timeout_msec: number | null;
  };
  cache: {
    ddocHits: number;
    ddocMisses: number;
    authCacheHits: number;
    authCacheMisses: number;
  };
};

export default function AdminDatabasePage() {
  const generalTranslations = useTranslations("general");

  const {
    data: databaseInfoData,
    error: databaseInfoError,
    isLoading: databaseInfoLoading,
  } = useSWR<DatabaseInfo>("/api/admin/database", fetcher);

  const {
    data: targets,
    error: targetsError,
    isLoading: targetsLoading,
  } = useSWR<ReplicationTarget[]>(
    "/api/admin/database/replication/targets",
    fetcher,
  );

  return (
    <main className="px-4 py-4 pb-4 flex flex-col gap-2">
      <DatabaseInfoCard
        databaseInfoData={databaseInfoData}
        databaseInfoLoading={databaseInfoLoading}
        databaseInfoError={databaseInfoError}
      />
    </main>
  );
}
