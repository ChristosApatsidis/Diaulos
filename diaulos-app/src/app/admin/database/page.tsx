// admin/database/page.tsx
"use client";

import { useTranslations } from "next-intl";
import UsersTable from "@/components/ui/tables/Users";
import { useEffect, useState } from "react";
import TreeView, { type TreeNodeData } from "@/components/ui/treeView";
import useSWR from "swr";

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

export default function AdminDatabasePage() {
  const generalTranslations = useTranslations("general");

  const {
    data: info,
    error: infoError,
    isLoading: infoLoading,
  } = useSWR<ReplicationTarget[]>("/api/admin/database", fetcher);
  const {
    data: targets,
    error: targetsError,
    isLoading: targetsLoading,
  } = useSWR<ReplicationTarget[]>(
    "/api/admin/database/replication/targets",
    fetcher,
  );

  useEffect(() => {
    if (info) console.log(info);
  }, [info]);

  return <main className="px-4 py-4 pb-4 flex flex-col gap-2"></main>;
}
