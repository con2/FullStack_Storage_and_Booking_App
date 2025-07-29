import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllOrganizations,
  fetchOrganizationById,
  selectOrganizations,
  selectOrganizationLoading,
  updateOrganization,
  createOrganization,
  setSelectedOrganization,
} from "@/store/slices/organizationSlice";
import { OrganizationDetails } from "@/types/organization";
import { Edit, Eye, LoaderCircle } from "lucide-react";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { ColumnDef } from "@tanstack/react-table";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import OrganizationDelete from "@/components/Admin/Organizations/OrganizationDelete";
import OrganizationModal, {
  OrganizationFormValues,
} from "@/components/Admin/Organizations/OrganizationModal";

const OrganizationList = () => {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();

  // global Redux state
  const organizations = useAppSelector(selectOrganizations);
  const loading = useAppSelector(selectOrganizationLoading);
  // const error = useAppSelector(selectOrganizationError);
  const totalPages = useAppSelector((state) => state.organizations.totalPages);

  // local state
  const [currentPage, setCurrentPage] = useState(1);
  const selectedOrg = useAppSelector(
    (state) => state.organizations.selectedOrganization,
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create">(
    "view",
  );
  const limit = 10;

  // Fetch organizations on mount & page change
  useEffect(() => {
    void dispatch(fetchAllOrganizations({ page: currentPage, limit }));
  }, [dispatch, currentPage]);

  // Open modal in "view" mode
  const openDetailsModal = async (org: OrganizationDetails) => {
    // Optional: fetch fresh data for this org
    const resultAction = await dispatch(fetchOrganizationById(org.id));
    if (fetchOrganizationById.fulfilled.match(resultAction)) {
      dispatch(setSelectedOrganization(resultAction.payload));
      setModalMode("view");
      setModalOpen(true);
    } else {
      toast.error(
        t.organizationList.toasts.creationFailed[lang] ||
          "Something went wrong.",
      );
    }
  };

  // Open modal in "edit" mode
  const openEditModal = async (org: OrganizationDetails) => {
    const resultAction = await dispatch(fetchOrganizationById(org.id));
    if (fetchOrganizationById.fulfilled.match(resultAction)) {
      dispatch(setSelectedOrganization(resultAction.payload));
      setModalMode("edit");
      setModalOpen(true);
    } else {
      toast.error(
        t.organizationList.toasts.creationFailed[lang] ||
          "Something went wrong.",
      );
    }
  };

  // Open modal in "create" mode
  const openCreateModal = () => {
    dispatch(setSelectedOrganization(null));
    setModalMode("create");
    setModalOpen(true);
  };

  // Handle toggle active/inactive
  const handleToggle = async (id: string, checked: boolean) => {
    try {
      await dispatch(
        updateOrganization({ id, data: { is_active: checked } }),
      ).unwrap();
      toast.success(
        checked
          ? t.adminItemsTable.messages.toast.activateSuccess[lang]
          : t.adminItemsTable.messages.toast.deactivateSuccess[lang],
      );
    } catch {
      toast.error(t.adminItemsTable.messages.toast.statusUpdateFail[lang]);
    }
  };

  // Handle modal form submit (create or update)
  const onSubmit = async (data: OrganizationFormValues) => {
    try {
      if (modalMode === "create") {
        await dispatch(createOrganization(data)).unwrap();
        toast.success(t.organizationList.toasts.created[lang]);
      } else if (modalMode === "edit" && selectedOrg) {
        await dispatch(
          updateOrganization({ id: selectedOrg.id, data }),
        ).unwrap();
        toast.success(
          t.organizationList.toasts.updated[lang] || "Organization updated!",
        );
      }
      setModalOpen(false);
      dispatch(setSelectedOrganization(null));
      // Reload list after changes
      void dispatch(fetchAllOrganizations({ page: currentPage, limit }));
    } catch {
      toast.error(
        t.organizationList.toasts.creationFailed[lang] ||
          "Something went wrong.",
      );
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    setCurrentPage(newPage);
  };

  // Table columns
  const columns: ColumnDef<OrganizationDetails>[] = [
    {
      header: t.organizationList.columns.name[lang],
      accessorKey: "name",
      cell: ({ row }) => (
        <button
          className="text-primary underline"
          onClick={() => openDetailsModal(row.original)}
        >
          {row.original.name}
        </button>
      ),
    },
    {
      header: t.organizationList.columns.slug[lang],
      accessorKey: "slug",
    },
    {
      header: t.organizationList.columns.description[lang],
      accessorKey: "description",
    },
    {
      header: t.organizationList.columns.isActive[lang],
      accessorKey: "is_active",
      cell: ({ row }) => (
        <Switch
          checked={row.original.is_active}
          onCheckedChange={(checked) => handleToggle(row.original.id, checked)}
        />
      ),
    },
    {
      header: t.organizationList.columns.createdAt[lang],
      accessorKey: "created_at",
      cell: ({ row }) =>
        row.original.created_at
          ? new Date(row.original.created_at).toLocaleDateString()
          : "—",
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">
        {t.organizationList.title[lang]}
      </h1>

      {/* Add New Org button */}
      <div className="flex gap-4 justify-end">
        <Button onClick={openCreateModal} variant="outline" size="sm">
          {t.organizationList.createButton[lang]}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <LoaderCircle className="animate-spin text-muted" />
        </div>
      ) : (
        <PaginatedDataTable
          columns={[
            ...columns,
            {
              id: "actions",
              cell: ({ row }) => {
                const org = row.original;
                return (
                  <div className="flex gap-2">
                    {/* view */}
                    <Button
                      size="sm"
                      onClick={() => openDetailsModal(org)}
                      title={t.organizationList.view[lang]}
                      className="text-gray-500 hover:text-primary hover:bg-primary/10"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {/* edit */}
                    <Button
                      size="sm"
                      onClick={() => openEditModal(org)}
                      title={t.tagList.buttons.edit[lang]}
                      className="text-highlight2/80 hover:text-highlight2 hover:bg-highlight2/20"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    {/* delete */}
                    <OrganizationDelete
                      id={org.id}
                      onDeleted={() => {
                        void dispatch(
                          fetchAllOrganizations({ page: currentPage, limit }),
                        );
                      }}
                    />
                  </div>
                );
              },
            },
          ]}
          data={organizations}
          pageIndex={currentPage - 1}
          pageCount={totalPages}
          onPageChange={(page) => handlePageChange(page + 1)}
          originalSorting="created_at"
        />
      )}

      {/* Modal */}
      <OrganizationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={onSubmit}
        mode={modalMode}
        organization={selectedOrg}
      />
    </div>
  );
};

export default OrganizationList;
