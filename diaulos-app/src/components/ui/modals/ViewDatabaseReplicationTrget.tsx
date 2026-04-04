// components/ui/modals/ViewDatabaseReplicationTrget.tsx
"use client";

import { ReplicationJob, ReplicationTarget } from "@/types/admin/database";
import {
  Button,
  Skeleton,
  Modal,
  useOverlayState,
  Separator,
} from "@heroui/react";
import { Eye } from "lucide-react";
import AdminDatabaseReplicationTargetJobCard from "../cards/AdminDatabaseReplicationTargetJobCard";

/**
 * This component is a modal that displays detailed information about a specific replication target in the CouchDB admin dashboard.
 * It shows the target name, URL, host, and a list of replication jobs associated with that target.
 * The modal is triggered by a button with an eye icon, and it uses the useOverlayState hook to manage its open/close state.
 * The replication jobs are displayed using the AdminDatabaseReplicationTargetJobCard component, which shows details about each replication job.
 * If there are no replication jobs for the target, it displays a message indicating that no jobs were found.
 * @param target - The replication target object containing details about the target and its associated replication jobs.
 * @returns The rendered modal component for viewing replication target details.
 */
export default function ViewDatabaseReplicationTarget({
  target,
}: {
  target: ReplicationTarget;
}) {
  const state = useOverlayState();

  return (
    <Modal>
      <Button
        variant="tertiary"
        isIconOnly
        className="bg-warning-soft border-warning/50 hover:bg-warning/20 focus:ring-warning/50 font-normal"
        size="sm"
        onPress={state.open}
      >
        <Eye size={12} />
      </Button>
      <Modal.Backdrop isOpen={state.isOpen} onOpenChange={state.setOpen}>
        <Modal.Container size="lg">
          <Modal.Dialog className="md:min-w-[700px] lg:min-w-[800px]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon className="bg-warning-soft text-warning-soft-foreground font-normal">
                <Eye size={20} />
              </Modal.Icon>
            </Modal.Header>
            <Modal.Body className="p-1 space-y-2">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InfoRow label="Target Name" value={target.target_name} />
                  <InfoRow label="Target URL" value={target.target_url} />
                  <InfoRow label="Target Host" value={target.target_host} />
                </div>
                <Separator />
                <div className="flex flex-col gap-2">
                  {target.replications.length > 0 ? (
                    <>
                      <span className="text-xs text-gray-500 uppercase tracking-wider">
                        Replication Jobs
                      </span>
                      <div className="flex flex-col gap-4">
                        {target.replications.map((job: ReplicationJob) => (
                          <div key={job.doc_id}>
                            <AdminDatabaseReplicationTargetJobCard
                              databaseReplicationTargetJob={job}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">
                      No replication jobs found.
                    </span>
                  )}
                </div>
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

const InfoRow = ({
  label,
  value,
  skeleton,
}: {
  label: string;
  value?: string | null | undefined;
  skeleton?: boolean;
}) => (
  <div className="flex flex-col">
    <span className="text-xs text-gray-500 uppercase tracking-wider">
      {label}
    </span>
    <span className="text-sm font-medium">
      {skeleton ? <Skeleton className="h-5 w-32" /> : (value ?? "—")}
    </span>
  </div>
);
