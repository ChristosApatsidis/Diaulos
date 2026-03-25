// lib/better-auth/database/adapters/couchDB-adaptert.ts
import type { Where } from "better-auth";
import {
  createAdapterFactory,
  type DBAdapterDebugLogOption,
} from "better-auth/adapters";
import type {
  DocumentScope,
  MangoSelector,
  MaybeDocument,
  ServerScope,
} from "nano";

/**
 * CouchDB Adapter for better-auth
 * Implements the required CRUD methods by translating better-auth's calls into CouchDB operations.
 * Supports dynamic database creation and optional pluralization of model names.
 */

/**
 * ----------------------------------------------------------------------------
 * Types for CouchDB documents and adapter configuration
 * - CouchDB documents include _id and _rev fields; we map _id to id for better-auth compatibility.
 * - Adapter configuration allows customizing database naming and debug logging.
 * ----------------------------------------------------------------------------
 */

// Define a CouchDB document type that extends MaybeDocument (which includes _id and _rev)
interface CouchDocument extends MaybeDocument {
  [key: string]: unknown;
}

// Adapter configuration options
interface CouchdbAdapterConfig {
  /**
   * Debug log options for the adapter.
   * Set to true for basic logging, or provide an object to customize which operations to log.
   */
  debugLogs?: DBAdapterDebugLogOption; // Debug log options for the adapter.
  /**
   * Whether collection/table names are plural (e.g., "users" instead of "user").
   * @default false
   */
  usePlural?: boolean;
  /**
   * Map model names to specific CouchDB database names.
   * e.g. { user: "auth_users", session: "auth_sessions" }
   */
  dbNames?: Record<string, string>;
  /**
   * Optional prefix for all database names, e.g. "myapp" → "myapp_user", "myapp_session"
   * Useful for namespacing in shared CouchDB instances.
   */
  dbPrefix?: string;
}

/**
 * ----------------------------------------------------------------------------
 * Helper functions for building Mango selectors and transforming CouchDB documents
 * - buildSelector converts better-auth's Where[] conditions into a Mango selector object for CouchDB queries.
 * - toRecord strips CouchDB-internal fields like _rev and maps _id to id for better-auth compatibility.
 * ----------------------------------------------------------------------------
 */

/**
 * Convert better-auth's Where[] into a CouchDB Mango selector.
 * createAdapterFactory already runs transformWhereClause, so each entry is a
 * plain { field, value, operator } object by the time we receive it.
 * @param where Array of Where conditions from better-auth
 * @returns MangoSelector object for CouchDB queries
 */
function buildSelector(where?: Where[]): MangoSelector {
  if (!where || where.length === 0) return {};

  return Object.fromEntries(
    where.map(({ field, value, operator }) => {
      switch (operator) {
        case "eq":
          return [field, { $eq: value }];
        case "ne":
          return [field, { $ne: value }];
        case "gt":
          return [field, { $gt: value }];
        case "lt":
          return [field, { $lt: value }];
        case "gte":
          return [field, { $gte: value }];
        case "lte":
          return [field, { $lte: value }];
        case "in":
          return [field, { $in: value }];
        case "contains":
          return [field, { $regex: value }];
        default:
          return [field, { $eq: value }];
      }
    }),
  );
}

/**
 * Strip CouchDB-internal fields; _id → id is already handled by mapKeysTransformOutput
 * @param doc CouchDB document
 * @returns Record without CouchDB-internal fields
 */
function toRecord(doc: CouchDocument): Record<string, unknown> {
  const { _rev, ...rest } = doc;
  return rest as Record<string, unknown>;
}

/**
 * ----------------------------------------------------------------------------
 * Adapter Factory
 * - Handles database initialization and connection management
 * - Implements the required CRUD methods by translating better-auth's calls into CouchDB operations
 * ----------------------------------------------------------------------------
 */
export const couchdbAdapter = (
  config: CouchdbAdapterConfig = {},
  couch: ServerScope,
) =>
  createAdapterFactory({
    config: {
      adapterId: "couchdb",
      adapterName: "CouchDB Adapter",
      usePlural: config.usePlural ?? false,
      debugLogs: config.debugLogs ?? false,
      // CouchDB stores JSON natively; no date or boolean coercion needed at
      // the driver level — better-auth handles those via its own transforms.
      supportsJSON: true,
      supportsDates: false, // stored as ISO strings
      supportsBooleans: true,
      supportsNumericIds: false, // CouchDB uses string UUIDs
      // Map id ↔ _id transparently so all better-auth internals keep using "id"
      mapKeysTransformInput: {
        id: "_id",
      },
      mapKeysTransformOutput: {
        _id: "id",
      },
    },
    adapter: () => {
      const dbCache: Record<string, DocumentScope<CouchDocument>> = {};
      const initializedDbs = new Set<string>();

      /**
       * Get a CouchDB document scope for a given model.
       * @param model The name of the model
       * @returns DocumentScope for the specified model
       */
      function db(model: string): DocumentScope<CouchDocument> {
        const name = getDbName(model);
        if (!dbCache[name]) {
          dbCache[name] = couch.db.use<CouchDocument>(name);
        }
        return dbCache[name];
      }

      /**
       * Get the database name for a given model, applying any configured prefix and pluralization rules.
       * @param model The name of the model
       * @returns The database name for the specified model
       */
      function getDbName(model: string): string {
        // Honor explicit name overrides first
        if (config.dbNames?.[model]) {
          const override = config.dbNames[model];
          return config.dbPrefix ? `${config.dbPrefix}_${override}` : override;
        }

        const prefix = config.dbPrefix ?? "";
        const name = config.usePlural
          ? model.endsWith("s")
            ? model
            : `${model}s`
          : model;

        return prefix ? `${prefix}_${name}` : name;
      }

      /**
       * Ensure the database for the given model exists; create it if it doesn't.
       * @param model The name of the model
       * @throws If there's an error other than "database not found"
       */
      async function ensureDb(model: string): Promise<void> {
        const dbName = getDbName(model);

        // 👇 use separate set — not dbCache
        if (initializedDbs.has(dbName)) return;

        try {
          await couch.db.get(dbName);
          console.log(`[couchdb-adapter] Database exists: ${dbName}`);
        } catch (err: any) {
          if (err.statusCode === 404) {
            await couch.db.create(dbName);
            console.log(`[couchdb-adapter] Created database: ${dbName}`);
          } else {
            throw err;
          }
        }

        // 👇 mark as initialized only after successful check/create
        initializedDbs.add(dbName);
      }

      return {
        /**
         * Create a new record in the specified model's database.
         * @param model The name of the model
         * @param data The data to insert (excluding id)
         * @returns The inserted record, including the generated id
         */
        async create<T extends Record<string, any>>({
          model,
          data,
        }: {
          model: string;
          data: T;
          select?: string[];
        }) {
          await ensureDb(model);
          const res = await db(model).insert(data as CouchDocument);
          const inserted = await db(model).get(res.id);
          return toRecord(inserted) as unknown as T; // 👈 cast
        },

        /**
         * Find a single record in the specified model's database that matches the given criteria.
         * @param model The name of the model
         * @param where The conditions to match
         * @param select Optional fields to select
         * @returns The matching record, or null if none found
         */
        async findOne<T>({
          model,
          where,
          select,
        }: {
          model: string;
          where: Required<Where>[];
          select?: string[];
        }) {
          await ensureDb(model);
          const selector = buildSelector(where);
          const res = await db(model).find({ selector, limit: 1 });
          const doc = res.docs[0];
          return (doc ? toRecord(doc) : null) as T | null; // 👈 cast
        },

        /**
         * Find multiple records in the specified model's database that match the given criteria, with optional pagination and sorting.
         * @param model The name of the model
         * @param where The conditions to match
         * @param limit Optional maximum number of records to return
         * @param offset Optional number of records to skip (for pagination)
         * @param sortBy Optional sorting criteria
         * @returns An array of matching records
         */
        async findMany<T>({ model, where, limit, offset, sortBy }: any) {
          await ensureDb(model);
          const selector = buildSelector(where);
          const res = await db(model).find({
            selector,
            limit: limit ?? undefined,
            skip: offset ?? undefined,
            sort: sortBy ? [{ [sortBy.field]: sortBy.direction }] : undefined,
          });
          return res.docs.map(toRecord) as unknown as T[]; // 👈 cast
        },

        /**
         * Update a single record in the specified model's database that matches the given criteria.
         * @param model The name of the model
         * @param where The conditions to match
         * @param update The data to update
         * @returns The updated record, or null if none found
         */
        async update<T>({
          model,
          where,
          update,
        }: {
          model: string;
          where: Required<Where>[];
          update: T;
        }) {
          await ensureDb(model);
          const selector = buildSelector(where);
          const res = await db(model).find({ selector, limit: 1 });
          const doc = res.docs[0];
          if (!doc) return null;
          const updated = { ...doc, ...update };
          await db(model).insert(updated as CouchDocument);
          return toRecord(updated) as unknown as T; // 👈 cast
        },

        /**
         * Update multiple records in the specified model's database that match the given criteria.
         * @param model The name of the model
         * @param where The conditions to match
         * @param update The data to update
         * @returns The number of records updated
         */
        async updateMany({ model, where, update }) {
          await ensureDb(model);
          const selector = buildSelector(where);
          const res = await db(model).find({ selector });
          const docs = res.docs.map((doc) => ({ ...doc, ...update }));
          await db(model).bulk({ docs: docs as CouchDocument[] });
          return docs.length;
        },

        /**
         * Delete a single record in the specified model's database that matches the given criteria.
         * @param model The name of the model
         * @param where The conditions to match
         */
        async delete({ model, where }) {
          await ensureDb(model);
          const selector = buildSelector(where);
          const res = await db(model).find({ selector, limit: 1 });
          const doc = res.docs[0];
          if (doc) await db(model).destroy(doc._id, doc._rev);
          // void — no return
        },

        /**
         * Delete multiple records in the specified model's database that match the given criteria.
         * @param model The name of the model
         * @param where The conditions to match
         * @returns The number of records deleted
         */
        async deleteMany({ model, where }) {
          await ensureDb(model);
          const selector = buildSelector(where);
          // Only fetch _id and _rev — we don't need the rest for deletion
          const res = await db(model).find({
            selector,
            fields: ["_id", "_rev"],
          });
          const docs = res.docs.map((doc) => ({ ...doc, _deleted: true }));
          await db(model).bulk({ docs: docs as CouchDocument[] });
          return docs.length;
        },

        /**
         * Count the number of records in the specified model's database that match the given criteria.
         * @param model The name of the model
         * @param where The conditions to match
         * @returns The number of matching records
         */
        async count({ model, where }) {
          await ensureDb(model);
          const selector = buildSelector(where);
          const res = await db(model).find({ selector, fields: ["_id"] });
          return res.docs.length;
        },
      };
    },
  });
