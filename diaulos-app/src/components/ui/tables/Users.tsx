// componetnents/ui/tables/Users.tsx
"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  toast,
  Button,
  Table,
  Pagination,
  EmptyState,
  Skeleton,
  Label,
  ListBox,
  Select,
} from "@heroui/react";
import { useState } from "react";
import useSWR from "swr";
import { authClient } from "@/lib/better-auth/auth-client";
import ViewUserDetailsModal from "@/components/ui/modals/ViewUserDetails";
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
        <Table.Content>
          {/* Table Header */}
          <Table.Header
            columns={columns}
            className="sticky top-0 z-10 bg-surface-secondary"
          >
            {(column) => (
              <Table.Column isRowHeader={column.id === "name"} key={column.id}>
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
                            ? "rounded-t-lg"
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
                    <Table.Cell>{user.role}</Table.Cell>
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
                  placeholder="Select one"
                  value={limit}
                  onChange={(value) => handleLimitChange(Number(value))}
                  className="w-22"
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

function UserActions({
  user,
  onUserDeleted,
  onUserUpdated,
}: {
  user: User;
  onUserDeleted: () => void;
  onUserUpdated: () => void;
}) {
  const usersTableTranslations = useTranslations("component_ui_tables_users");
  const { data: session } = authClient.useSession();

  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Handle delete user action — called after modal confirmation
  const handleDeleteUser = () => {
    setIsDeleting(true);

    fetch(`/api/admin/users-management/users/${user.id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete user");
        toast.success(usersTableTranslations("toast.deleteSuccess.title"), {
          description: usersTableTranslations(
            "toast.deleteSuccess.description",
          ),
        });
        onUserDeleted();
      })
      .catch((err) =>
        toast.danger(usersTableTranslations("toast.deleteError.title"), {
          description: usersTableTranslations("toast.deleteError.description"),
        }),
      )
      .finally(() => setIsDeleting(false));
  };

  return (
    <div className="flex gap-2">
      {/* Delete User Button */}
      {session?.user?.id !== user.id && (
        <Button
          size="sm"
          variant="danger"
          onPress={handleDeleteUser}
          isDisabled={isDeleting}
        >
          {usersTableTranslations("buttons.delete")}
        </Button>
      )}

      {/* Update User Button */}
      {session?.user?.id !== user.id && (
        <Button size="sm" variant="primary" onPress={() => onUserUpdated()}>
          Edit
        </Button>
      )}
    </div>
  );
}
