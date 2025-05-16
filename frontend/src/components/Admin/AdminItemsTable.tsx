import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  checkItemDeletability,
  deleteItem,
  fetchAllItems,
  selectAllItems,
  selectItemsError,
  selectItemsLoading,
  updateItem,
} from "@/store/slices/itemsSlice";
import { PaginatedDataTable } from "../ui/data-table-paginated";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import AddItemModal from "./AddItemModal";
import { toast } from "sonner";
import UpdateItemModal from "./UpdateItemModal";
import { Switch } from "@/components/ui/switch";
import { selectAllTags } from "@/store/slices/tagSlice";
import { Item } from "@/types/item";
import AssignTagsModal from "./AssignTagsModal";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandGroup, CommandItem } from "../ui/command";
import { Checkbox } from "../ui/checkbox";
import { selectIsAdmin, selectIsSuperVera } from "@/store/slices/usersSlice";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MapPin } from "lucide-react";
import { toastConfirm } from "../ui/toastConfirm";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const AdminItemsTable = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectAllItems);
  const loading = useAppSelector(selectItemsLoading);
  const error = useAppSelector(selectItemsError);
  const tags = useAppSelector(selectAllTags);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isSuperVera = useAppSelector(selectIsSuperVera);
  // Translation
  const { lang } = useLanguage();

  const [assignTagsModalOpen, setAssignTagsModalOpen] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  // filtering states:
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCloseAssignTagsModal = () => {
    setAssignTagsModalOpen(false);
    setCurrentItemId(null);
  };

  const itemsColumns: ColumnDef<Item>[] = [
    {
      header: t.adminItemsTable.columns.namefi[lang],
      size: 120,
      accessorFn: (row) => row.translations.fi.item_name,
      sortingFn: "alphanumeric",
      enableSorting: true,
      cell: ({ row }) => {
        const name = row.original.translations.fi.item_name || "";
        return name.charAt(0).toUpperCase() + name.slice(1);
      },
    },
    {
      header: t.adminItemsTable.columns.typefi[lang],
      size: 120,
      accessorFn: (row) => row.translations.fi.item_type,
      sortingFn: "alphanumeric",
      enableSorting: true,
      cell: ({ row }) => {
        const type = row.original.translations.fi.item_type || "";
        return type.charAt(0).toUpperCase() + type.slice(1);
      },
    },
    {
      header: t.adminItemsTable.columns.location[lang],
      size: 70,
      accessorFn: (row) => row.location_details?.name || "N/A", // For sorting
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="h-4 w-4" />
          {row.original.location_details?.name || "N/A"}
        </div>
      ),
    },
    {
      header: t.adminItemsTable.columns.price[lang],
      accessorKey: "price",
      size: 30,
      cell: ({ row }) => `€${row.original.price.toLocaleString()}`,
    },
    {
      header: t.adminItemsTable.columns.quantity[lang],
      size: 30,
      accessorFn: (row) => row.items_number_available,
      cell: ({ row }) =>
        `${row.original.items_number_available} ${t.adminItemsTable.messages.units[lang]}`,
    },
    {
      id: "status",
      header: t.adminItemsTable.columns.active[lang],
      size: 30,
      cell: ({ row }) => {
        const item = row.original;

        const handleToggle = async (checked: boolean) => {
          try {
            await dispatch(
              updateItem({
                id: item.id,
                data: {
                  is_active: checked,
                },
              }),
            ).unwrap();
            dispatch(fetchAllItems());
            toast.success(
              checked
                ? t.adminItemsTable.messages.toast.activateSuccess[lang]
                : t.adminItemsTable.messages.toast.deactivateSuccess[lang],
            );
          } catch {
            toast.error(
              t.adminItemsTable.messages.toast.statusUpdateFail[lang],
            );
          }
        };

        return (
          <Switch checked={item.is_active} onCheckedChange={handleToggle} />
        );
      },
    },
    {
      id: "actions",
      size: 30,
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ row }) => {
        const targetUser = row.original;
        const canEdit = isSuperVera || isAdmin;
        const canDelete = isSuperVera || isAdmin;
        const isDeletable = useAppSelector(
          (state) => state.items.deletableItems[targetUser.id] !== false,
        );

        return (
          <div className="flex gap-2">
            {canEdit && (
              <Button
                size="sm"
                onClick={() => handleEdit(targetUser)}
                className="text-highlight2/80 hover:text-highlight2 hover:bg-highlight2/20"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {canDelete && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-800 hover:bg-red-100"
                        onClick={() => handleDelete(targetUser.id)}
                        disabled={!isDeletable}
                        aria-label={`Delete ${targetUser.translations.fi.item_name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!isDeletable && (
                    <TooltipContent
                      side="top"
                      className="90 text-white border-0 p-2"
                    >
                      <p>{t.adminItemsTable.tooltips.cantDelete[lang]}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchAllItems());
    }
  }, [dispatch, items.length]);

  const handleEdit = (item: Item) => {
    setSelectedItem(item); // Set the selected item
    setShowModal(true); // Show the modal
  };

  const deletableItems = useAppSelector((state) => state.items.deletableItems);

  useEffect(() => {
    const newItemIds = items
      .filter(
        (item) =>
          !Object.prototype.hasOwnProperty.call(deletableItems, item.id),
      )
      .map((item) => item.id);

    if (newItemIds.length > 0) {
      newItemIds.forEach((id) => dispatch(checkItemDeletability(id)));
    }
  }, [dispatch, items, deletableItems]);

  const handleDelete = async (id: string) => {
    toastConfirm({
      title: t.adminItemsTable.messages.deletion.title[lang],
      description: t.adminItemsTable.messages.deletion.description[lang],
      confirmText: t.adminItemsTable.messages.deletion.confirm[lang],
      cancelText: t.adminItemsTable.messages.deletion.cancel[lang],
      onConfirm: async () => {
        try {
          await toast.promise(dispatch(deleteItem(id)).unwrap(), {
            loading: t.adminItemsTable.messages.toast.deleting[lang],
            success: t.adminItemsTable.messages.toast.deleteSuccess[lang],
            error: t.adminItemsTable.messages.toast.deleteFail[lang],
          });
          dispatch(fetchAllItems());
        } catch {
          toast.error(t.adminItemsTable.messages.toast.deleteError[lang]);
        }
      },
      onCancel: () => {
        // Optional: handle cancel if needed
      },
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null); // Reset selected item
  };

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchAllItems());
    }
  }, [dispatch, items.length]);

  useEffect(() => {
    if (selectedItem) {
      dispatch(fetchAllItems());
    }
  }, [selectedItem, dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-destructive">{error}</div>;
  }

  const filteredItems = items
    .filter((item) => {
      if (statusFilter === "active") return item.is_active;
      if (statusFilter === "inactive") return !item.is_active;
      return true;
    })
    .filter((item) => {
      const name = item.translations.fi.item_name.toLowerCase();
      const type = item.translations.fi.item_type.toLowerCase();
      return (
        name.includes(searchTerm.toLowerCase()) ||
        type.includes(searchTerm.toLowerCase())
      );
    })
    .filter((item) => {
      if (tagFilter.length === 0) return true;
      const itemTagIds = (item.storage_item_tags ?? []).map((t) => t.id);
      return tagFilter.every((tag) => itemTagIds.includes(tag));
    });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl">{t.adminItemsTable.title[lang]}</h1>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div className="flex gap-4 items-center">
          {/* Search by item name/type */}
          <input
            type="text"
            size={50}
            className="w-full text-sm p-2 bg-white rounded-md sm:max-w-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
            placeholder={t.adminItemsTable.filters.searchPlaceholder[lang]}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Filter by active status */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "active" | "inactive")
            }
            className="select bg-white text-sm p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
          >
            <option value="all">
              {t.adminItemsTable.filters.status.all[lang]}
            </option>
            <option value="active">
              {t.adminItemsTable.filters.status.active[lang]}
            </option>
            <option value="inactive">
              {t.adminItemsTable.filters.status.inactive[lang]}
            </option>
          </select>

          {/* Filter by tags */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="px-3 py-1 bg-white text-secondary border-1 border-secondary hover:bg-secondary hover:text-white rounded-2xl"
                size={"sm"}
              >
                {tagFilter.length > 0
                  ? t.adminItemsTable.filters.tags.filtered[lang].replace(
                      "{count}",
                      tagFilter.length.toString(),
                    )
                  : t.adminItemsTable.filters.tags.filter[lang]}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
              <Command>
                <CommandGroup>
                  {tags.map((tag) => {
                    const label =
                      tag.translations?.fi?.name?.toLowerCase() ||
                      tag.translations?.en?.name?.toLowerCase() ||
                      "Unnamed";
                    function cn(...classes: (string | undefined)[]): string {
                      return classes.filter(Boolean).join(" ");
                    }
                    return (
                      <CommandItem
                        key={tag.id}
                        onSelect={() =>
                          setTagFilter((prev) =>
                            prev.includes(tag.id)
                              ? prev.filter((t) => t !== tag.id)
                              : [...prev, tag.id],
                          )
                        }
                        className="cursor-pointer"
                      >
                        <Checkbox
                          checked={tagFilter.includes(tag.id)}
                          onCheckedChange={() =>
                            setTagFilter((prev) =>
                              prev.includes(tag.id)
                                ? prev.filter((t) => t !== tag.id)
                                : [...prev, tag.id],
                            )
                          }
                          className={cn(
                            "mr-2 h-4 w-4 border border-secondary bg-white text-white",
                            "data-[state=checked]:bg-secondary",
                            "data-[state=checked]:text-white",
                          )}
                        />
                        <span>{label}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Clear filters button */}
          {(searchTerm || statusFilter !== "all" || tagFilter.length > 0) && (
            <Button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setTagFilter([]);
              }}
              size={"sm"}
              className="px-2 py-1 bg-white text-secondary border-1 border-secondary hover:bg-secondary hover:text-white rounded-2xl"
            >
              {t.adminItemsTable.filters.clear[lang]}
            </Button>
          )}
        </div>
        {/* Add New Item button */}
        <div className="flex gap-4 justify-end">
          <AddItemModal>
            <Button className="addBtn" size={"sm"}>
              {t.adminItemsTable.buttons.addNew[lang]}
            </Button>
          </AddItemModal>
        </div>
      </div>

      <PaginatedDataTable columns={itemsColumns} data={filteredItems} />

      {/* Show UpdateItemModal when showModal is true */}
      {showModal && selectedItem && (
        <UpdateItemModal
          onClose={handleCloseModal}
          initialData={selectedItem} // Pass the selected item data to the modal
        />
      )}
      {assignTagsModalOpen && currentItemId && (
        <AssignTagsModal
          open={assignTagsModalOpen}
          itemId={currentItemId}
          onClose={handleCloseAssignTagsModal}
        />
      )}
    </div>
  );
};

export default AdminItemsTable;
