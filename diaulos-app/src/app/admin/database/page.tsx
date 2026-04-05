// admin/database/page.tsx
"use client";

import { toast } from "@heroui/react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import AdminDatabaseInfoCard from "@/components/ui/cards/AdminDatabaseInfoCard";
import AdminDatabaseReplicationTargetsCard from "@/components/ui/cards/AdminDatabaseReplicationTargetsCard";
import AdminDatabaseStatsCacheCard from "@/components/ui/cards/AdminDatabaseStatsCacheCard";
import AdminDatabaseStatsDatabasesCard from "@/components/ui/cards/AdminDatabaseStatsDatabasesCard";
import AdminDatabaseStatsDocumentsCard from "@/components/ui/cards/AdminDatabaseStatsDocumentsCard";
import AdminDatabaseStatsHTTPDCard from "@/components/ui/cards/AdminDatabaseStatsHTTPDCard";
import AdminDatabaseStatsMangoCard from "@/components/ui/cards/AdminDatabaseStatsMangoCard";
import AdminDatabaseStatsReplicationCard from "@/components/ui/cards/AdminDatabaseStatsReplicationCard";
import type {
  AdminDatabaseStats,
  ReplicationTarget,
} from "@/types/admin/database";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * This is the main page component for the admin database dashboard. It fetches various statistics about the CouchDB server and displays them using different cards.
 * It uses SWR for data fetching and caching, and displays loading states and error messages as needed.
 * The page is organized into a grid layout, with different cards showing database info, list of databases, replication targets, document stats, HTTPD stats, Mango query stats, and cache stats.
 * Each card is responsible for displaying its own loading and error states based on the data passed down from this main page component.
 * @returns The rendered admin database dashboard page.
 */
export default function AdminDatabasePage() {
  const adminDatabaseTranslations = useTranslations("page_admin_database");

  const {
    data: databaseInfoData,
    error: databaseInfoError,
    isLoading: databaseInfoLoading,
    mutate: refreshDatabaseInfo,
  } = useSWR<AdminDatabaseStats>("/api/admin/database", fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 0,
    refreshInterval: 5000,
  });

  const {
    data: databaseReplicationTargets,
    error: databaseReplicationTargetsError,
    isLoading: databaseReplicationTargetsLoading,
    isValidating: databaseReplicationTargetsValidating,
    mutate: refreshDatabaseReplicationTargets,
  } = useSWR<ReplicationTarget[]>(
    "/api/admin/database/replication/targets",
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 0,
      refreshInterval: 5000,
    },
  );

  if (databaseInfoError) {
    toast.danger(
      adminDatabaseTranslations("toast.errorLoadingDBStats.title", {
        message: adminDatabaseTranslations(
          "toast.errorLoadingDBStats.description",
        ),
      }),
    );
  }

  return (
    <main className="px-4 py-4 pb-4 flex flex-col gap-2">
      <div className="space-y-2">
        {/* Database info and databases */}
        <div className="grid grid-cols-12 gap-2">
          {/* Database info */}
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 2xl:col-span-4">
            <AdminDatabaseInfoCard
              dbInfo={{
                host: databaseInfoData?.host ?? "",
                version: databaseInfoData?.version ?? "",
                vendor: databaseInfoData?.vendor ?? "",
                databases: databaseInfoData?.databases ?? [],
              }}
              dbInfoLoading={databaseInfoLoading}
              dbInfoError={databaseInfoError}
            />
          </div>
          {/* Databases */}
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-6 2xl:col-span-4">
            <AdminDatabaseStatsDatabasesCard
              databases={databaseInfoData?.databases}
              databasesLoading={databaseInfoLoading}
              databasesError={databaseInfoError}
            />
          </div>
          {/* Replication */}
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-6 2xl:col-span-4">
            <AdminDatabaseStatsReplicationCard
              replication={databaseInfoData?.replication}
              replicationLoading={databaseInfoLoading}
              replicationError={databaseInfoError}
            />
          </div>
        </div>
        {/* Documents and HTTPD */}
        <div className="grid grid-cols-12 gap-2">
          {/* HTTPD */}
          <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6 2xl:col-span-3">
            <AdminDatabaseStatsHTTPDCard
              httpd={databaseInfoData?.httpd}
              httpdLoading={databaseInfoLoading}
              httpdError={databaseInfoError}
            />
          </div>
          {/* Documents */}
          <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6 2xl:col-span-3">
            <AdminDatabaseStatsDocumentsCard
              documents={databaseInfoData?.documents}
              documentsLoading={databaseInfoLoading}
              documentsError={databaseInfoError}
            />
          </div>
          {/* Mango */}
          <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6 2xl:col-span-3">
            <AdminDatabaseStatsMangoCard
              mango={databaseInfoData?.mango}
              mangoLoading={databaseInfoLoading}
              mangoError={databaseInfoError}
            />
          </div>
          {/* Cache */}
          <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6 2xl:col-span-3">
            <AdminDatabaseStatsCacheCard
              cache={databaseInfoData?.cache}
              cacheLoading={databaseInfoLoading}
              cacheError={databaseInfoError}
            />
          </div>
        </div>
        {/* Replication targets */}
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-12">
            <AdminDatabaseReplicationTargetsCard
              databaseReplicationTargets={databaseReplicationTargets}
              databaseReplicationTargetsLoading={
                databaseReplicationTargetsLoading
              }
              databaseReplicationTargetsValidating={
                databaseReplicationTargetsValidating
              }
              databaseReplicationTargetsError={databaseReplicationTargetsError}
              onRefresh={() => {
                refreshDatabaseReplicationTargets();
                refreshDatabaseInfo();
              }}
              databases={databaseInfoData?.databases}
              sourceDatabase={{
                host: databaseInfoData?.host.split(":")[0] ?? "",
                port: databaseInfoData?.host.split(":")[1] ?? "5984",
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
