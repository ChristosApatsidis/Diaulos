// lib/better-auth/auth.ts
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { hashPassword, verifyPassword } from "@/lib/better-auth/auth-password";
import database from "@/lib/better-auth/database/db";

export const auth = betterAuth({
  basePath: "/api/auth",
  // Rate limit all auth routes to 100 requests per 10 seconds (per IP)
  rateLimit: {
    enabled: true,
    window: 10, // time window in seconds
    max: 100, // max requests in the window
  },
  // Enable email and password authentication with custom hashing and verification functions
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false,
    // Use custom functions to hash and verify passwords
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
  },
  // User model configuration
  user: {
    // Enable changing email without requiring verification (not recommended for production)
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
    },
    // Additional custom fields for the user model
    additionalFields: {
      emailVerified: {
        type: "boolean" as const,
        returned: false,
        input: false,
        required: false,
      },
      branch: {
        type: "string" as const,
        required: true,
        input: true, // allow user to set branch
      },
      combatArmsSupportBranch: {
        type: "string" as const,
        required: false,
        input: true, // allow user to set combat arms support branch
      },
      rank: {
        type: "string" as const,
        required: true,
        input: true, // allow user to set rank
      },
      specialization: {
        type: "string" as const,
        required: false,
        input: true, // allow user to set specialization
      },
      unitOfService: {
        type: "string" as const,
        required: false,
        input: true, // allow user to set unit of service
      },
      role: {
        type: "string" as const,
        required: true,
        input: true, // allow user to set role
      },
      permissions: {
        type: [
          "View content",
          "Create content",
          "Edit content",
          "Edit own content",
          "Delete content",
          "Delete own content",
        ],
        required: true,
        input: true, // allow user to set permissions
      },
    },
  },
  // Plugins
  plugins: [
    nextCookies(),
    username({
      minUsernameLength: 4,
      maxUsernameLength: 20,
      usernameValidator: (username) => {
        // Allow only alphanumeric characters, underscores, and hyphens
        return /^[a-zA-Z0-9_-]+$/.test(username);
      },
      displayUsernameValidator: (displayUsername) => {
        // Allow only alphanumeric characters, underscores, and hyphens
        return /^[a-zA-Z0-9_-]+$/.test(displayUsername);
      },
    }),
  ],
  // Database
  database: database,
  // Hooks
  hooks: {
    // Validate new email format before allowing email change
    before: createAuthMiddleware(async (ctx) => {
      // Validate new email format before allowing email change
      if (ctx.path === "/change-email") {
        const newEmail = ctx.body?.newEmail;

        if (newEmail) {
          const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail);

          if (!isValid) {
            throw new APIError("UNPROCESSABLE_ENTITY", {
              message: "Please provide a valid email address",
              code: "INVALID_EMAIL",
            });
          }
        }
      }
    }),
  },
  // Database hooks
  databaseHooks: {
    // User database hooks
    user: {
      // Before creating a new user, check if the requester is authenticated and set createdBy field
      create: {
        before: async (
          user: any,
          context: any,
        ): Promise<{ data: typeof user } | undefined> => {
          // Get the session of the requester to check if they are authenticated
          const session = await auth.api.getSession({
            headers: context?.headers ?? new Headers(),
          });

          // If there is no session, the requester is not authenticated and cannot create a new user
          if (!session) {
            throw new APIError("FORBIDDEN", {
              code: "FORBIDDEN",
              message: "You must be signed in to create a new account",
            });
          }

          return {
            data: {
              ...user,
              createdBy: session.user.id,
              emailVerified: false,
            },
          };
        },
      },
      // Before updating a user, check if the requester is authenticated and prevent updating certain fields
      update: {
        before: async (
          user: any,
          context: any,
        ): Promise<{ data: typeof user } | undefined> => {
          // Get the session of the requester to check if they are authenticated
          const session = await auth.api.getSession({
            headers: context?.headers ?? new Headers(),
          });

          // If there is no session, the requester is not authenticated and cannot update the user
          if (!session) {
            throw new APIError("FORBIDDEN", {
              code: "FORBIDDEN",
              message: "You must be signed in to update your account",
            });
          }

          // Dont allow the user to update the branch and combatArmsSupportBranch fields
          if (user.branch || user.combatArmsSupportBranch) {
            throw new APIError("FORBIDDEN", {
              code: "FORBIDDEN",
              message:
                "You cannot update the branch or combatArmsSupportBranch fields",
            });
          }

          // If specialization or unitOfService are empty strings, set them to null
          if (user.specialization === "") user.specialization = null;
          if (user.unitOfService === "") user.unitOfService = null;

          return { data: user };
        },
      },
    },
  },
});
