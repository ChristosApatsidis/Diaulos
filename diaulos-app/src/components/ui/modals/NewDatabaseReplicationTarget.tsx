// components/ui/modals/NewDatabaseReplicationTarget.tsx
"use client";

import { useState, useEffect } from "react";
import type { Key } from "@heroui/react";
import {
  Button,
  Skeleton,
  Modal,
  useOverlayState,
  TextField,
  Label,
  Separator,
  Input,
  Checkbox,
  Select,
  ListBox,
  FieldError,
  toast,
} from "@heroui/react";
import { Eye } from "lucide-react";

type ReplicationEndpoint = {
  host: string;
  port: string;
  username: string;
  password: string;
  database: Key | string | null;
};

type ReplicationTargetOptions = {
  continuous: boolean;
  create_target: boolean;
};

type FormErrors = {
  source?: Partial<ReplicationEndpoint>;
  target?: Partial<ReplicationEndpoint>;
  target_name?: string;
  geeneral?: string;
};

/**
 * This component renders a modal dialog for creating a new CouchDB replication target in the admin dashboard.
 * It includes form fields for entering the source and target database connection details, as well as replication options.
 * The component handles form submission by sending a POST request to the API route responsible for creating the replication job.
 * It also displays validation errors and shows a success toast upon successful creation of the replication.
 * @param sourceDatabaseHost Optional default host value for the source database, pre-filled in the form.
 * @param sourceDatabasePort Optional default port value for the source database, pre-filled in the form.
 * @param databases Optional list of available databases to choose from in the form.
 * @param onReplicationCreated Optional callback function that is called after a replication is successfully created, used to refresh the replication targets list.
 * @returns The rendered modal component for creating a new database replication target.
 */
export default function NewDatabaseReplicationTarget({
  sourceDatabaseHost,
  sourceDatabasePort,
  databases,
  onReplicationCreated,
}: {
  sourceDatabaseHost?: string;
  sourceDatabasePort?: string;
  databases?: string[];
  onReplicationCreated?: () => void;
}) {
  const state = useOverlayState();

  const [source, setSource] = useState<ReplicationEndpoint>({
    host: sourceDatabaseHost ?? "",
    port: sourceDatabasePort ?? "5984",
    username: "",
    password: "",
    database: "",
  });
  const [target, setTarget] = useState<ReplicationEndpoint>({
    host: "",
    port: "5984",
    username: "",
    password: "",
    database: "",
  });
  const [options, setOptions] = useState<ReplicationTargetOptions>({
    continuous: true,
    create_target: false,
  });
  const [targetName, setTargetName] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset form state when modal is opened
  useEffect(() => {
    if (state.isOpen) {
      // Reset form state when modal is opened
      setSource((prev) => ({
        ...prev,
        host: sourceDatabaseHost ?? "",
        port: sourceDatabasePort ?? "5984",
        username: "",
        password: "",
        database: "",
      }));
      setTarget({
        host: "",
        port: "5984",
        username: "",
        password: "",
        database: "",
      });
      setOptions({
        continuous: true,
        create_target: false,
      });
      setTargetName("");
      setErrors({});
      setIsSubmitting(false);
    }
  }, [state.isOpen, sourceDatabaseHost, sourceDatabasePort]);

  // Reset errors when form values change
  useEffect(() => {
    if (Object.keys(errors).length) {
      setErrors({});
    }
  }, [source, target, options, targetName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/database/replication/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: {
            ...source,
            port: Number(source.port),
          },
          target: {
            ...target,
            port: Number(target.port),
          },
          target_name: targetName,
          continuous: options.continuous,
          create_target: options.create_target,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ geeneral: data.error ?? "Failed to create replication" });
        return;
      }

      // Wait 5 seconds before showing success toast to allow replication to be created in CouchDB
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Show success toast
      toast.success(`Replication created`, {
        description: `Replication "${data.id}" has been created successfully.`,
      });

      // Close the modal
      state.setOpen(false);

      // Call the callback to refresh the replication targets list
      onReplicationCreated?.();
    } catch (err: any) {
      setErrors({ geeneral: err.message ?? "Network error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectDatabase = (db: string) => {
    setSource({ ...source, database: db });
    setTarget({ ...target, database: db });
  };

  return (
    <Modal>
      <Button variant="tertiary" size="sm" onPress={state.open}>
        Create New Target
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
            <Modal.Body className="p-1">
              <form id="replication-form" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  {errors.geeneral && (
                    <div className="p-2 bg-red-50 text-red-700 rounded">
                      <p className="text-sm font-medium">{errors.geeneral}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Source endpoint fields */}
                    <EndpointFields values={source} onChange={setSource} />
                    {/* Target endpoint fields */}
                    <EndpointFields values={target} onChange={setTarget} />
                  </div>
                  <Separator className="my-2" />
                  {/* Target database selection and replication options */}
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row items-center gap-4">
                      <Select
                        variant="secondary"
                        className="w-full"
                        placeholder="Select a database"
                        value={target.database}
                        onChange={(value) =>
                          handleSelectDatabase(value?.toString() || "")
                        }
                      >
                        <Label>Database</Label>
                        <Select.Trigger>
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            {databases?.map((db) =>
                              db.startsWith("_") ? null : (
                                <ListBox.Item key={db} id={db} textValue={db}>
                                  {db}
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                              ),
                            )}
                          </ListBox>
                        </Select.Popover>
                        <FieldError>{errors.target?.database}</FieldError>
                      </Select>
                    </div>
                    {/* Replication options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Target name field */}
                      <TextField
                        variant="secondary"
                        className="w-full"
                        name="host"
                        type="text"
                        value={targetName}
                        onChange={setTargetName}
                      >
                        <Label>Target Name</Label>
                        <Input placeholder="Enter the target name" />
                        <FieldError>{errors?.target_name}</FieldError>
                      </TextField>
                      {/* Options checkboxes */}
                      <div className="flex flex-col items-start gap-2">
                        <Checkbox
                          variant="secondary"
                          id="continuous-replication"
                          isSelected={options.continuous}
                          onChange={(checked) =>
                            setOptions({ ...options, continuous: checked })
                          }
                        >
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                          <Checkbox.Content>
                            <Label htmlFor="continuous-replication">
                              Continuous Replication
                            </Label>
                          </Checkbox.Content>
                        </Checkbox>
                        <Checkbox
                          variant="secondary"
                          id="create-target-db"
                          isSelected={options.create_target}
                          onChange={(checked) =>
                            setOptions({ ...options, create_target: checked })
                          }
                        >
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                          <Checkbox.Content>
                            <Label htmlFor="create-target-db">
                              Create target database if it doesn't exist
                            </Label>
                          </Checkbox.Content>
                        </Checkbox>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                type="submit"
                form="replication-form"
                variant="primary"
                isDisabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Replication"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

/**
 * Reusable form fields for entering CouchDB endpoint details (host, port, username, password, database).
 * @param values The current values of the endpoint form fields.
 * @param onChange Callback function to update the form values.
 * @param errors Optional object containing validation errors for each field.
 */
function EndpointFields({
  values,
  onChange,
}: {
  values: ReplicationEndpoint;
  onChange: (v: ReplicationEndpoint) => void;
}) {
  const set =
    (field: keyof ReplicationEndpoint) => (val: string | Key | null) => {
      onChange({ ...values, [field]: val });
    };

  return (
    <div className="flex flex-col gap-2 w-full">
      <TextField
        variant="secondary"
        className="w-full"
        name="host"
        type="text"
        value={values.host}
        onChange={set("host")}
      >
        <Label>Host</Label>
        <Input placeholder="Enter the host" />
      </TextField>

      <TextField
        variant="secondary"
        className="w-full"
        name="port"
        type="number"
        value={values.port}
        onChange={set("port")}
      >
        <Label>Port</Label>
        <Input placeholder="Enter the port" />
      </TextField>

      <TextField
        variant="secondary"
        className="w-full"
        name="username"
        type="text"
        value={values.username}
        onChange={set("username")}
      >
        <Label>Username</Label>
        <Input placeholder="Enter the username" />
      </TextField>

      <TextField
        variant="secondary"
        className="w-full"
        name="password"
        type="password"
        value={values.password}
        onChange={set("password")}
      >
        <Label>Password</Label>
        <Input placeholder="Enter the password" />
      </TextField>
    </div>
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
