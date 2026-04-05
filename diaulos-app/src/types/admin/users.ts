// types/admin/users.ts
import type { User } from "@/types";

/** 
 * This type represents the structure of the data returned by the /api/admin/users endpoint, which includes an array of user objects and some statistics about the users. It is used to type the props of the UsersTable component that displays this information in the admin dashboard.
 */
export type UsersResponse = {
  users: User[];
  stats: {
    total: number;
    admins: number;
    viewers: number;
    users: number;
  };
  page: number;
  totalPages: number;
  limit: number;
};