// src/utils/database-auth-url.ts
export type ReplicationEndpoint = {
  protocol?: "http" | "https" | string;
  host: string;
  port?: number | string;
  username?: string;
  password?: string;
  database: string;
  params?: Record<string, string | number | boolean>;
};

export function buildDatabaseAuthUrl(endpoint: ReplicationEndpoint): string {
  const protocol = endpoint.protocol?.replace(/:$/, "") ?? "http";
  const host = endpoint.host;
  const port = endpoint.port ? `:${endpoint.port}` : "";
  const auth =
    endpoint.username && endpoint.password !== undefined
      ? `${encodeURIComponent(endpoint.username)}:${encodeURIComponent(
          endpoint.password,
        )}@`
      : endpoint.username
        ? `${encodeURIComponent(endpoint.username)}@`
        : "";

  const db = encodeURIComponent(endpoint.database);

  const query =
    endpoint.params && Object.keys(endpoint.params).length > 0
      ? `?${Object.entries(endpoint.params)
          .map(
            ([k, v]) =>
              `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
          )
          .join("&")}`
      : "";

  return `${protocol}://${auth}${host}${port}/${db}${query}`;
}
