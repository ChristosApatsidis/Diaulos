// lib/better-auth/auth-client.ts
import {
  inferAdditionalFields,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export type Session = typeof authClient.$Infer.Session;

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [
    usernameClient(),
    inferAdditionalFields({
      // Map additional fields from the session user object
      user: {
        branch: {
          type: "string",
        },
        combatArmsSupportBranch: {
          type: "string",
          default: null,
        },
        rank: {
          type: "string",
        },
        specialization: {
          type: "string",
        },
        unitOfService: {
          type: "string",
        },
        role: {
          type: "string",
        },
        permissions: {
          type: "string[]",
        },
      },
    }),
  ],
});
