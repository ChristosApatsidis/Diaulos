// types/admin/database.ts

/**
 * This types represent couchdb replication targets and jobs, which are used to type the data returned by the /api/admin/database/replication/targets endpoint. They are also used to type the props of the AdminDatabaseStatsReplicationCard component that displays this information in the admin dashboard.
 */
export type ReplicationInfo = {
  docs_read?: number;
  docs_written?: number;
  doc_write_failures?: number;
  changes_pending?: number;
  [key: string]: unknown;
};

export type ReplicationJob = {
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

export type ReplicationTarget = {
  target_name: string;
  target_url: string;
  target_host: string;
  replications: ReplicationJob[];
};

/**
 * These types represent the structure of the data returned by the CouchDB _stats endpoint, specifically for the cache, replication, mango, and httpd sections. They are used to type the props of the corresponding React components that display these statistics in the admin dashboard.
 */
export type AdminDatabaseStatsCache = {
  ddocHits: number;
  ddocMisses: number;
  authCacheHits: number;
  authCacheMisses: number;
};

export type AdminDatabaseStatsReplication = {
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

export type AdminDatabaseStatsMango = {
  docsExamined: number;
  resultsReturned: number;
  unindexedQueries: number;
  tooManyDocsScanned: number;
};

export type AdminDatabaseStatsHttpd = {
  totalRequests: number;
  bulkRequests: number;
  viewReads: number;
  clientsChanges: number;
  abortedRequests: number;
  methods: Record<string, number>;
  statusCodes: Record<string, number>;
};

export type AdminDatabaseStatsDocuments = {
  reads: number;
  writes: number;
  inserts: number;
  localWrites: number;
  dbChanges: number;
  purges: number;
};

export type AdminDatabaseStatsStorage = {
  openDatabases: number;
  openFiles: number;
  commits: number;
  fsyncCount: number;
};

export type AdminDatabaseStatsDatabases =
  | ["_global_changes", "_replicator", "_users", string]
  | [];

export type AdminDatabaseStats = {
  host: string;
  version: string;
  vendor: string;
  databases: AdminDatabaseStatsDatabases;
  storage: AdminDatabaseStatsStorage;
  documents: AdminDatabaseStatsDocuments;
  httpd: AdminDatabaseStatsHttpd;
  mango: AdminDatabaseStatsMango;
  replication: AdminDatabaseStatsReplication;
  cache: AdminDatabaseStatsCache;
};
