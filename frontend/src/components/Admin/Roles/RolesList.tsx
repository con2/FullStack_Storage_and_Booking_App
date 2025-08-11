import React, { useEffect, useMemo, useState } from "react";
import { useRoles } from "@/hooks/useRoles";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllUsers, selectAllUsers } from "@/store/slices/usersSlice";
import {
  fetchAllOrganizations,
  selectOrganizations,
} from "@/store/slices/organizationSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ColumnDef } from "@tanstack/react-table";
import { ViewUserRolesWithDetails } from "@common/role.types";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircle, Shield, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { toastConfirm } from "@/components/ui/toastConfirm";

type RolesListProps = {
  pageSize?: number;
  onRolesChanged?: () => void;
};

type RowType = ViewUserRolesWithDetails & { __isNew?: boolean };

export const RolesList: React.FC<RolesListProps> = ({ pageSize = 15 }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const currentUserId = user?.id;
  const {
    allUserRoles,
    adminLoading,
    adminError,
    refreshAllUserRoles,
    availableRoles,
    refreshAvailableRoles,
    createRole,
    updateRole,
    permanentDeleteRole,
  } = useRoles();

  const organizations = useAppSelector(selectOrganizations);
  const users = useAppSelector(selectAllUsers);

  // Fetch once if empty (relies on hook caching/deduping)
  useEffect(() => {
    if (!allUserRoles || allUserRoles.length === 0) {
      void refreshAllUserRoles(false);
    }
    if (!availableRoles || availableRoles.length === 0) {
      void refreshAvailableRoles(false);
    }
  }, [
    allUserRoles,
    availableRoles,
    refreshAllUserRoles,
    refreshAvailableRoles,
  ]);

  // Filters
  const [filterUser, setFilterUser] = useState("");
  const [filterOrg, setFilterOrg] = useState("");
  const [filterRoleText, setFilterRoleText] = useState(""); // Text filter for roles
  const [filterRoleDropdown, setFilterRoleDropdown] = useState(""); // Dropdown filter for roles
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Pagination
  const [pageIndex, setPageIndex] = useState(0);

  // Inline creation row state
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newRole, setNewRole] = useState<{
    user_id: string;
    organization_id: string;
    role_id: string;
  }>({
    user_id: "",
    organization_id: "",
    role_id: "",
  });

  // Ensure dropdown data are available only when starting creation
  const ensureCreateDeps = async () => {
    const promises: Promise<unknown>[] = [];
    if (!users.length) promises.push(dispatch(fetchAllUsers()).unwrap());
    if (!organizations.length)
      promises.push(dispatch(fetchAllOrganizations({ limit: 100 })).unwrap());
    if (!availableRoles.length) promises.push(refreshAvailableRoles(false));
    if (promises.length) {
      await Promise.all(promises).catch(() => {
        // Non-fatal; errors are handled by thunks
      });
    }
  };

  const startAdd = async () => {
    await ensureCreateDeps();
    setNewRole({ user_id: "", organization_id: "", role_id: "" });
    setAdding(true);
    setPageIndex(0);
  };

  const cancelAdd = () => {
    setAdding(false);
    setSaving(false);
    setNewRole({ user_id: "", organization_id: "", role_id: "" });
  };

  const handleSaveNew = async () => {
    if (!newRole.user_id || !newRole.organization_id || !newRole.role_id) {
      toast.error("Please select user, organization and role");
      return;
    }
    try {
      setSaving(true);
      await createRole(newRole);
      toast.success("Role created");
      setAdding(false);
      setNewRole({ user_id: "", organization_id: "", role_id: "" });
      // No hard refresh needed; slice updates allUserRoles on fulfilled
    } catch {
      toast.error("Failed to create role");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (
    row: ViewUserRolesWithDetails,
    checked: boolean,
  ) => {
    try {
      await updateRole(row.id as string, { is_active: checked });
      toast.success(checked ? "Role activated" : "Role deactivated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleHardDelete = (row: ViewUserRolesWithDetails) => {
    toastConfirm({
      title: "Delete role permanently?",
      description: `This will permanently remove role "${row.role_name}" for ${row.user_email}.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await permanentDeleteRole(row.id as string);
          toast.success("Role permanently deleted");
        } catch {
          toast.error("Failed to delete role");
        }
      },
      onCancel: () => {},
    });
  };

  // Filter
  const filtered = useMemo(() => {
    const qUser = filterUser.toLowerCase();
    const qOrg = filterOrg.toLowerCase();
    const qRoleText = filterRoleText.toLowerCase();
    const qRoleDropdown = filterRoleDropdown.toLowerCase();

    return (allUserRoles || []).filter((r) => {
      const okUser =
        !qUser ||
        (r.user_email && r.user_email.toLowerCase().includes(qUser)) ||
        (r.user_full_name && r.user_full_name.toLowerCase().includes(qUser));
      const okOrg =
        !qOrg ||
        (r.organization_name &&
          r.organization_name.toLowerCase().includes(qOrg));
      const okRole =
        (!qRoleText ||
          (r.role_name && r.role_name.toLowerCase().includes(qRoleText))) &&
        (!qRoleDropdown ||
          (r.role_name && r.role_name.toLowerCase() === qRoleDropdown));
      const okStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? !!r.is_active
            : !r.is_active;

      return okUser && okOrg && okRole && okStatus;
    });
  }, [
    allUserRoles,
    filterUser,
    filterOrg,
    filterRoleText,
    filterRoleDropdown,
    statusFilter,
  ]);

  // Sort: current user roles first (default), then by assigned_at (newest first)
  const sorted = useMemo(() => {
    const isMine = (r: ViewUserRolesWithDetails) =>
      currentUserId && r.user_id === currentUserId ? 1 : 0;
    const ts = (r: ViewUserRolesWithDetails) =>
      r.assigned_at ? new Date(r.assigned_at).getTime() : 0;

    return [...filtered].sort((a, b) => {
      const mineDiff = isMine(b) - isMine(a);
      if (mineDiff !== 0) return mineDiff;
      return ts(b) - ts(a);
    });
  }, [filtered, currentUserId]);

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = pageIndex * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, pageIndex, pageSize]);

  // Compose rows (inject "new" row at the top when adding)
  const rows: RowType[] = useMemo(() => {
    return adding ? [{ __isNew: true } as RowType, ...paginated] : paginated;
  }, [adding, paginated]);

  // Columns
  const columns: ColumnDef<RowType>[] = [
    {
      accessorKey: "user_email",
      header: "User",
      size: 260,
      cell: ({ row }) => {
        const r = row.original;
        if (r.__isNew) {
          return (
            <Select
              value={newRole.user_id}
              onValueChange={(v) =>
                setNewRole((prev) => ({ ...prev, user_id: v }))
              }
            >
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {users
                  .slice()
                  .sort((a, b) => (a.email || "").localeCompare(b.email || ""))
                  .map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.email} {u.full_name ? `(${u.full_name})` : ""}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          );
        }
        const isCurrent = currentUserId && r.user_id === currentUserId;
        return (
          <span className="flex items-center gap-2">
            <span className={isCurrent ? "font-semibold text-blue-700" : ""}>
              {r.user_email}
              {r.user_full_name ? ` (${r.user_full_name})` : ""}
            </span>
            {isCurrent && (
              <Badge
                variant="outline"
                className="border-blue-300 text-blue-700"
                data-cy="roles-list-you-badge"
              >
                You
              </Badge>
            )}
          </span>
        );
      },
    },
    {
      accessorKey: "role_name",
      header: "Role",
      size: 160,
      cell: ({ row }) => {
        const r = row.original;
        if (r.__isNew) {
          return (
            <Select
              value={newRole.role_id}
              onValueChange={(v) =>
                setNewRole((prev) => ({ ...prev, role_id: v }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((ar) => (
                  <SelectItem key={ar.id} value={ar.id}>
                    {ar.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        return <span className="font-medium">{r.role_name}</span>;
      },
    },
    {
      accessorKey: "organization_name",
      header: "Organization",
      size: 220,
      cell: ({ row }) => {
        const r = row.original;
        if (r.__isNew) {
          return (
            <Select
              value={newRole.organization_id}
              onValueChange={(v) =>
                setNewRole((prev) => ({ ...prev, organization_id: v }))
              }
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          );
        }
        return <span>{r.organization_name}</span>;
      },
    },
    {
      id: "is_active",
      header: "Active",
      size: 120,
      cell: ({ row }) => {
        const r = row.original;
        if (r.__isNew) {
          return (
            <Badge variant="secondary" className="text-xs">
              Will be active
            </Badge>
          );
        }
        return (
          <Switch
            checked={!!r.is_active}
            onCheckedChange={(checked) => void handleToggleActive(r, checked)}
          />
        );
      },
    },
    {
      id: "actions",
      size: 140,
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ row }) => {
        const r = row.original;
        if (r.__isNew) {
          const disabled =
            saving ||
            !newRole.user_id ||
            !newRole.role_id ||
            !newRole.organization_id;
          return (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="px-3 py-1 bg-white text-secondary border-1 border-secondary hover:bg-secondary hover:text-white rounded-2xl"
                onClick={() => void handleSaveNew()}
                disabled={disabled}
                data-cy="roles-save-new"
              >
                {saving ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelAdd}
                data-cy="roles-cancel-new"
              >
                Cancel
              </Button>
            </div>
          );
        }
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-800 hover:bg-red-100"
              onClick={() => handleHardDelete(r)}
              aria-label="Delete permanently"
              data-cy="roles-hard-delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <Card data-cy="role-management-admin-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            All Users Roles ({allUserRoles?.length || 0})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="addBtn"
              onClick={() => void startAdd()}
              disabled={adding}
              data-cy="roles-add-new"
            >
              <Plus className="h-4 w-4 mr-1" /> Create New Role
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {adminLoading ? (
          <div
            className="flex justify-center items-center h-32"
            data-cy="role-management-admin-loading-row"
          >
            <LoaderCircle className="animate-spin w-6 h-6" />
            <span className="ml-2">Loading admin data...</span>
          </div>
        ) : adminError ? (
          <Alert
            variant="destructive"
            data-cy="role-management-admin-error-alert"
          >
            <AlertDescription>{adminError}</AlertDescription>
          </Alert>
        ) : !allUserRoles || allUserRoles.length === 0 ? (
          <p
            className="text-muted-foreground"
            data-cy="role-management-admin-no-roles"
          >
            No role assignments found.
          </p>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Input
                placeholder="Filter by user (email or name)"
                value={filterUser}
                onChange={(e) => {
                  setFilterUser(e.target.value);
                  setPageIndex(0);
                }}
                className="w-52"
              />
              <Input
                placeholder="Filter by organization"
                value={filterOrg}
                onChange={(e) => {
                  setFilterOrg(e.target.value);
                  setPageIndex(0);
                }}
                className="w-52"
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Search roles"
                  value={filterRoleText}
                  onChange={(e) => {
                    setFilterRoleText(e.target.value);
                    setPageIndex(0);
                  }}
                  className="w-40"
                />
                <Select
                  value={filterRoleDropdown}
                  onValueChange={(value) => {
                    setFilterRoleDropdown(value === "all" ? "" : value); // Map "all" to an empty string for filtering logic
                    setPageIndex(0);
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.id} value={role.role}>
                        {role.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as typeof statusFilter);
                  setPageIndex(0);
                }}
                className="select bg-white text-sm p-2 rounded-md border"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {(filterUser ||
                filterOrg ||
                filterRoleText ||
                filterRoleDropdown ||
                statusFilter !== "all") && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFilterUser("");
                    setFilterOrg("");
                    setFilterRoleText("");
                    setFilterRoleDropdown("");
                    setStatusFilter("all");
                    setPageIndex(0);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Table */}
            <PaginatedDataTable
              columns={columns}
              data={rows}
              pageIndex={pageIndex}
              pageCount={totalPages}
              onPageChange={setPageIndex}
              data-cy="role-management-admin-roles-list"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RolesList;
