// lib/better-auth/database/db.ts
import nano from "nano";
import { couchdbAdapter } from "@/lib/better-auth/database/adapters/couchDB-adaptert";

/**
 * Global variable that extends the global object to include an optional Nano database instance.
 * This pattern allows for singleton-like access to the database connection across the application
 */

const globalForCouch = global as typeof global & {
  _nano?: ReturnType<typeof nano>;
};

const couch = globalForCouch._nano ?? nano(process.env.COUCHDB_URL!);

if (process.env.NODE_ENV !== "production") globalForCouch._nano = couch;

// Create the BetterAuth database adapter using the CouchDB connection
const database = couchdbAdapter(
  {
    usePlural: true,
    debugLogs: false,
  },
  couch,
);

export default database;
