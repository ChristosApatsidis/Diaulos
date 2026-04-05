// componetnents/ui/tables/Users.tsx
"use client";

import { useState } from "react";
import {
  Button,
  EmptyState,
  ListBox,
  Pagination,
  Select,
  Skeleton,
  Table,
  toast,
} from "@heroui/react";
import { Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import useSWR from "swr";
import EditUserDetailsModal from "@/components/ui/modals/EditUserDetails";
import ViewUserDetailsModal from "@/components/ui/modals/ViewUserDetails";
import { authClient } from "@/lib/better-auth/auth-client";
import type { User } from "@/types";

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

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * UsersTable is a component that displays a paginated table of users for admin management. It fetches user data from the server, handles loading and error states, and provides actions for each user such as viewing details, editing, and deleting. The table is built using the Table component from HeroUI and is designed to be responsive and user-friendly.
 * @returns A React component that renders a table of users with pagination and action buttons.
 */
export default function UsersTable() {
  const locale = useLocale();
  const generalTranslations = useTranslations("general");
  const usersTableTranslations = useTranslations("component_ui_tables_users");

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const {
    data: usersData,
    error: usersError,
    isValidating: usersValidating,
    isLoading: usersLoading,
    mutate: fetchUsers,
  } = useSWR<UsersResponse>(
    `/api/admin/users-management/users?page=${page}&limit=${limit}`,
    fetcher,
    { revalidateOnFocus: true, loadingTimeout: 10000, keepPreviousData: true },
  );

  // Handle change in rows per page selection
  const handleLimitChange = (value: unknown) => {
    const num = Number(value);
    setLimit(Number.isInteger(num) && num > 0 ? num : 10);
    setPage(1);
  };

  // Define the columns for the users table
  const columns = [
    {
      id: "name",
      name: usersTableTranslations("columns.name"),
      align: "start",
    },
    {
      id: "username",
      name: usersTableTranslations("columns.username"),
      align: "start",
    },
    {
      id: "email",
      name: usersTableTranslations("columns.email"),
      align: "start",
    },
    {
      id: "role",
      name: usersTableTranslations("columns.role"),
      align: "start",
    },
    {
      id: "branch",
      name: usersTableTranslations("columns.branch"),
      align: "start",
    },
    {
      id: "rank",
      name: usersTableTranslations("columns.rank"),
      align: "start",
    },
    {
      id: "actions",
      name: usersTableTranslations("columns.actions"),
      align: "start",
    },
    { id: "viewUser", name: "", align: "start" },
  ];

  if (usersError) {
    return (
      <div className="container mx-auto px-4 py-4">
        <p className="text-red-500">
          {generalTranslations("errors.fetchingData")}
        </p>
      </div>
    );
  }

  return (
    <Table key={locale} className="min-w-full">
      <Table.ScrollContainer className="max-h-[680px] overflow-y-auto">
        <Table.Content aria-label="Users table">
          {/* Table Header */}
          <Table.Header columns={columns} className="sticky top-0 z-10">
            {(column) => (
              <Table.Column
                isRowHeader={column.id === "name"}
                key={column.id}
                className="text-foreground"
              >
                {column.name}
              </Table.Column>
            )}
          </Table.Header>
          {/* Table Body */}
          <Table.Body
            items={usersData?.users || []}
            renderEmptyState={() =>
              usersValidating ? (
                <div className="flex flex-col w-full py-0">
                  {[...Array(limit)].map((_, i) => (
                    <div
                      key={i}
                      className="border-b border-default-100 last:border-none"
                    >
                      <Skeleton
                        animationType="shimmer"
                        className={`h-14 bg-overlay w-full ${
                          i === 0
                            ? "rounded-t-2xl"
                            : i === limit - 1
                              ? "rounded-b-2xl"
                              : ""
                        }`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                  <span className="text-sm text-muted">
                    {usersTableTranslations("emptyState.title")}
                  </span>
                  <p className="text-sm text-muted">
                    {usersTableTranslations("emptyState.description")}
                  </p>
                </EmptyState>
              )
            }
          >
            {usersLoading
              ? null
              : (user: User) => (
                  <Table.Row key={user.id}>
                    <Table.Cell>{user.name}</Table.Cell>
                    <Table.Cell>{user.username || "-"}</Table.Cell>
                    <Table.Cell>{user.email || "-"}</Table.Cell>
                    <Table.Cell>
                      {generalTranslations(`roles.${user.role}`) || user.role}
                    </Table.Cell>
                    <Table.Cell>
                      {generalTranslations(`branches.${user.branch}`) ||
                        user.branch}
                    </Table.Cell>
                    <Table.Cell>
                      {" "}
                      {generalTranslations(
                        `ranks.${user?.branch}.${user?.rank}`,
                      ) || user?.rank}
                    </Table.Cell>
                    <Table.Cell>
                      <UserActions
                        user={user}
                        onUserDeleted={fetchUsers}
                        onUserUpdated={fetchUsers}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <ViewUserDetailsModal user={user} />
                    </Table.Cell>
                  </Table.Row>
                )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
      {/* Table Footer with Pagination */}
      <Table.Footer>
        <Pagination size="sm">
          {/* Pagination Summary */}
          <Pagination.Summary>
            {usersData
              ? usersTableTranslations("pagination.results", {
                  start: (usersData.page - 1) * usersData.limit + 1,
                  end: Math.min(
                    usersData.page * usersData.limit,
                    usersData.stats.total,
                  ),
                  total: usersData.stats.total,
                })
              : null}
          </Pagination.Summary>
          {/* Pagination Controls */}
          <Pagination.Content>
            {/* Rows per page selection */}
            <Pagination.Item>
              <Pagination.Content>
                <Select
                  value={limit}
                  onChange={(value) => handleLimitChange(Number(value))}
                  className="w-22"
                  aria-label="Rows per page"
                >
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {[5, 10, 25, 50, 100].map((n: number) => (
                        <ListBox.Item id={n} textValue={n.toString()} key={n}>
                          {n}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </Pagination.Content>
            </Pagination.Item>
            {/* Page selection */}
            <Pagination.Item>
              <Pagination.Previous
                isDisabled={page === 1}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
              >
                <Pagination.PreviousIcon />
                {usersTableTranslations("pagination.previous")}
              </Pagination.Previous>
            </Pagination.Item>
            {usersData &&
              Array.from({ length: usersData.totalPages }, (_, i) => i + 1).map(
                (p: number) => (
                  <Pagination.Item key={p}>
                    <Pagination.Link
                      isActive={p === page}
                      onPress={() => setPage(p)}
                    >
                      {p}
                    </Pagination.Link>
                  </Pagination.Item>
                ),
              )}
            <Pagination.Item>
              <Pagination.Next
                isDisabled={page === usersData?.totalPages}
                onPress={() =>
                  setPage((p) => Math.min(usersData?.totalPages || 1, p + 1))
                }
              >
                {usersTableTranslations("pagination.next")}
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      </Table.Footer>
    </Table>
  );
}

/**
 * UserActions is a component that renders action buttons for each user in the users table, including options to view details, edit, and delete the user. It conditionally renders the delete and edit buttons based on whether the user is the currently logged-in user to prevent self-deletion or self-editing. The component also handles the logic for deleting a user and updating the users list after an action is performed.
 * @param user - The user object representing the user for whom the actions are being rendered.
 * @param onUserDeleted - A callback function that is called after a user has been successfully deleted, typically to refresh the users list.
 * @param onUserUpdated - A callback function that is called after a user's details have been successfully updated, typically to refresh the users list.
 * @returns A React component that renders action buttons for the user, or null if the buttons should not be displayed (e.g., for the currently logged-in user).
 */
function UserActions({
  user,
  onUserDeleted,
  onUserUpdated,
}: {
  user: User;
  onUserDeleted: () => void;
  onUserUpdated: () => void;
}) {
  const { data: session } = authClient.useSession();

  if (session?.user.id === user.id) return null;

  return (
    <div className="flex gap-2">
      {/* Delete User Button */}
      <UserActionDelete user={user} onUserDeleted={onUserDeleted} />
      {/* Edit User Details Button */}
      <EditUserDetailsModal user={user} onUserUpdated={onUserUpdated} />
    </div>
  );
}

/**
 * UserActionDelete is a component that renders a delete button for a user in the users table. It handles the deletion of a user by making a DELETE request to the server and provides feedback to the admin through toast notifications. The button is disabled while the deletion is in progress and is not rendered for the currently logged-in user to prevent self-deletion.
 * @param user - The user object representing the user to be deleted.
 * @param onUserDeleted - A callback function that is called after the user has been successfully deleted, typically to refresh the users list.
 * @returns A React component that renders a delete button for the user, or null if the button should not be displayed.
 */
function UserActionDelete({
  user,
  onUserDeleted,
}: {
  user: User;
  onUserDeleted: () => void;
}) {
  const usersTableTranslations = useTranslations("component_ui_tables_users");

  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Handle delete user action — called after modal confirmation
  const handleDeleteUser = async () => {
    setIsDeleting(true);

    const response = await fetch(
      `/api/admin/users-management/users/${user.id}`,
      { method: "DELETE" },
    );

    // Handle error response
    if (!response.ok) {
      toast.danger(usersTableTranslations("toast.deleteError.title"), {
        description: usersTableTranslations("toast.deleteError.description"),
      });
      setIsDeleting(false);
      return;
    }

    // Success - show success toast and refresh users list
    toast.success(usersTableTranslations("toast.deleteSuccess.title"), {
      description: usersTableTranslations("toast.deleteSuccess.description"),
    });
    onUserDeleted();
    setIsDeleting(false);
  };

  return (
    <Button
      size="sm"
      variant="danger-soft"
      onPress={handleDeleteUser}
      isDisabled={isDeleting}
      className="font-normal"
    >
      <Trash2 size={16} />
      {isDeleting
        ? usersTableTranslations("buttons.isDeleting")
        : usersTableTranslations("buttons.delete")}
    </Button>
  );
}
