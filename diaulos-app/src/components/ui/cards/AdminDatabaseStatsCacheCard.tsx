// components/ui/cards/AdminDatabaseStatsMangoCard.tsx
"use client";

import { ProgressBar, Separator, Skeleton } from "@heroui/react";
import { useLocale, useTranslations } from "next-intl";
import { InfoCard } from "@/components/ui/cards/InfoCard";
import type { AdminDatabaseStatsCache } from "@/types/admin/database";

/**
 * This component displays cache statistics for the CouchDB server in the admin dashboard.
 * It shows DDoc hits and misses, auth cache hits and misses, and calculates the cache hit rate.
 * It also calculates and displays the cache hit rate as a progress bar.
 * If there is an error loading the data, it shows an error message instead.
 * The component uses the InfoCard layout and includes skeleton loaders while the data is being fetched.
 * @param cache - The cache statistics data to display.
 * @param cacheLoading - A boolean indicating whether the cache data is currently loading.
 * @param cacheError - An error object if there was an error loading the cache data.
 */
export default function AdminDatabaseStatsCacheCard({
  cache,
  cacheLoading,
  cacheError,
}: {
  cache?: AdminDatabaseStatsCache;
  cacheLoading?: boolean;
  cacheError?: any;
}) {
  const _locale = useLocale();
  const _generalTranslations = useTranslations("general");

  // Calculate derived metrics
  const cacheTotal = (cache?.ddocHits ?? 0) + (cache?.ddocMisses ?? 0);
  const cacheHitRate =
    Math.round(((cache?.ddocHits ?? 0) / cacheTotal) * 100) || 0;

  if (cacheError) {
    return (
      <InfoCard className="h-full">
        <InfoCard.Header>
          <InfoCard.Header.Title>Cache</InfoCard.Header.Title>
        </InfoCard.Header>
        <InfoCard.Body>
          <div className="text-sm text-red-500">
            Failed to load cache stats.
          </div>
        </InfoCard.Body>
      </InfoCard>
    );
  }

  return (
    <InfoCard className="h-full">
      <InfoCard.Header>
        <InfoCard.Header.Title>Cache</InfoCard.Header.Title>
      </InfoCard.Header>
      <InfoCard.Body>
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <InfoRow
                label="DDoc Hits"
                value={cache?.ddocHits.toString()}
                skeleton={cacheLoading}
              />
              <InfoRow
                label="DDoc Misses"
                value={cache?.ddocMisses.toString()}
                skeleton={cacheLoading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <InfoRow
                label="Auth Cache Hits"
                value={cache?.authCacheHits.toString()}
                skeleton={cacheLoading}
              />
              <InfoRow
                label="Auth Cache Misses"
                value={cache?.authCacheMisses.toString()}
                skeleton={cacheLoading}
              />
            </div>
          </div>

          <Separator />

          <ProgressBar
            aria-label={`${cacheHitRate}% hit rate`}
            value={cacheHitRate}
            color={
              cacheHitRate > 80
                ? "success"
                : cacheHitRate > 50
                  ? "warning"
                  : "danger"
            }
          >
            <span className="text-xs text-gray-500 uppercase tracking-wider mt-0">
              Hit rate
            </span>
            <ProgressBar.Output />
            <ProgressBar.Track>
              <ProgressBar.Fill />
            </ProgressBar.Track>
          </ProgressBar>
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
