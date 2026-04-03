// components/ui/cards/AdminDatabaseStatsHTTPDCard.tsx
"use client";

import { Skeleton, Separator, ProgressBar } from "@heroui/react";
import { useLocale, useTranslations } from "next-intl";
import { InfoCard } from "@/components/ui/cards/InfoCard";
import { AdminDatabaseStatsHttpd } from "@/types/admin/database";

/**
 * This component displays HTTPD statistics for the CouchDB server in the admin dashboard.
 * It shows total requests, bulk requests, view reads, clients changes, and aborted requests.
 * It also calculates and displays the error rate based on the status codes of the requests.
 * If there is an error loading the data, it shows an error message instead.
 * The component uses the InfoCard layout and includes skeleton loaders while the data is being fetched.
 * @param httpd - The HTTPD statistics data to display.
 * @param httpdLoading - A boolean indicating whether the HTTPD data is currently loading.
 * @param httpdError - An error object if there was an error loading the HTTPD data.
 */
export default function AdminDatabaseStatsHTTPDCard({
  httpd,
  httpdLoading,
  httpdError,
}: {
  httpd?: AdminDatabaseStatsHttpd;
  httpdLoading?: boolean;
  httpdError?: any;
}) {
  const locale = useLocale();
  const generalTranslations = useTranslations("general");

  // The error rate is calculated as the percentage of requests that resulted in 4xx or 5xx status codes out of the total requests. It is rounded to the nearest whole number for display.
  const errorRate =
    httpd && httpd?.totalRequests > 0
      ? Math.round(
          (((httpd.statusCodes["500"] ?? 0) +
            (httpd.statusCodes["400"] ?? 0) +
            (httpd.statusCodes["401"] ?? 0) +
            (httpd.statusCodes["404"] ?? 0)) /
            httpd.totalRequests) *
            100,
        )
      : 0;

  if (httpdError) {
    return (
      <InfoCard className="h-full">
        <InfoCard.Header>
          <InfoCard.Header.Title>HTTPD</InfoCard.Header.Title>
        </InfoCard.Header>
        <InfoCard.Body>
          <div className="text-sm text-red-500">
            Failed to load HTTPD stats.
          </div>
        </InfoCard.Body>
      </InfoCard>
    );
  }

  return (
    <InfoCard className="h-full">
      <InfoCard.Header>
        <InfoCard.Header.Title>HTTPD</InfoCard.Header.Title>
      </InfoCard.Header>
      <InfoCard.Body>
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <InfoRow
                label="Total Requests"
                value={httpd?.totalRequests.toString()}
                skeleton={httpdLoading}
              />
              <InfoRow
                label="Bulk Requests"
                value={httpd?.bulkRequests.toString()}
                skeleton={httpdLoading}
              />
              <InfoRow
                label="View Reads"
                value={httpd?.viewReads.toString()}
                skeleton={httpdLoading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <InfoRow
                label="Clients Changes"
                value={httpd?.clientsChanges.toString()}
                skeleton={httpdLoading}
              />
              <InfoRow
                label="Aborted Requests"
                value={httpd?.abortedRequests.toString()}
                skeleton={httpdLoading}
              />
            </div>
          </div>

          <Separator />

          <div>
            <ProgressBar
              aria-label={`${errorRate}% errors`}
              value={errorRate}
              color={
                errorRate > 5 ? "danger" : errorRate > 1 ? "warning" : "success"
              }
            >
              <span className="text-xs text-gray-500 uppercase tracking-wider mt-0">
                Error Rate
              </span>
              <ProgressBar.Output />
              <ProgressBar.Track>
                <ProgressBar.Fill />
              </ProgressBar.Track>
            </ProgressBar>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-success">
                2xx:{" "}
                {(httpd?.statusCodes["200"] ?? 0) +
                  (httpd?.statusCodes["201"] ?? 0)}
              </span>
              <span className="text-xs text-warning">
                4xx:{" "}
                {(httpd?.statusCodes["400"] ?? 0) +
                  (httpd?.statusCodes["401"] ?? 0) +
                  (httpd?.statusCodes["404"] ?? 0)}
              </span>
              <span className="text-xs text-danger">
                5xx: {httpd?.statusCodes["500"] ?? 0}
              </span>
            </div>
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
