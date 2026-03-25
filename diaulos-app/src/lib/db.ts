// lib/db.ts
import Nano from "nano";

if (!process.env.COUCHDB_URL) {
  throw new Error("COUCHDB_URL is not set");
}

// Singleton pattern: reuse the connection across hot-reloads in dev
const globalForNano = globalThis as unknown as { nano: Nano.ServerScope };

const nano = globalForNano.nano ?? Nano(process.env.COUCHDB_URL);

if (process.env.NODE_ENV !== "production") {
  globalForNano.nano = nano;
}

export default nano;
