// components/ui/cards/DatabaseInfo.tsx
"use client";

import { Chip, Skeleton, Tooltip } from "@heroui/react";
import { useLocale, useTranslations } from "next-intl";
import { InfoCard } from "@/components/ui/cards/InfoCard";
import { formatDateTime } from "@/utils/formatDateTime";
import useSWR from "swr";
import { useEffect } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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

export default function DatabaseInfoCard({
  databaseInfoData,
  databaseInfoLoading,
  databaseInfoError,
}: {
  databaseInfoData?: DatabaseInfo;
  databaseInfoLoading?: boolean;
  databaseInfoError?: any;
}) {
  const locale = useLocale();
  const generalTranslations = useTranslations("general");

  useEffect(() => {
    if (databaseInfoData) {
      console.log(databaseInfoData);
    }
  }, [databaseInfoData]);

  return (
    <InfoCard>
      <InfoCard.Header>
        <InfoCard.Header.Title>Database info</InfoCard.Header.Title>
      </InfoCard.Header>
      <InfoCard.Body>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex flex-col gap-2">
            <InfoRow
              label="Host"
              value={databaseInfoData?.host}
              skeleton={databaseInfoLoading}
            />
            <InfoRow
              label="Version"
              value={databaseInfoData?.version}
              skeleton={databaseInfoLoading}
            />
            <InfoRow
              label="Vendor"
              value={databaseInfoData?.vendor}
              skeleton={databaseInfoLoading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <InfoRow
              label="Databases"
              value={databaseInfoData?.databases.length.toString()}
              skeleton={databaseInfoLoading}
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
