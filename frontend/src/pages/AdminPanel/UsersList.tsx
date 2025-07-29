import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllUsers,
  selectAllUsers,
  selectError,
  selectLoading,
} from "@/store/slices/usersSlice";
import { t } from "@/translations";
import { UserProfile } from "@common/user.types";
import { ColumnDef } from "@tanstack/react-table";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import AddUserModal from "@/components/Admin/UserManagement/AddUserModal";
import DeleteUserButton from "@/components/Admin/UserManagement/UserDeleteButton";
import UserEditModal from "@/components/Admin/UserManagement/UserEditModal";
import UserBanActionsDropdown from "@/components/Admin/UserManagement/Banning/UserBanActionsDropdown";
import UserBanModal from "@/components/Admin/UserManagement/Banning/UserBanModal";
import UserBanHistoryModal from "@/components/Admin/UserManagement/Banning/UserBanHistoryModal";
import UnbanUserModal from "@/components/Admin/UserManagement/Banning/UnbanUserModal";

const UsersList = () => {
  const dispatch = useAppDispatch();
  const { authLoading } = useAuth();
  const users = useAppSelector(selectAllUsers);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const { hasAnyRole } = useRoles();
  const isAuthorized = hasAnyRole([
    "admin",
    "main_admin",
    "superAdmin",
    "superVera",
  ]);
  const isSuperAdmin = hasAnyRole(["superAdmin", "superVera"]); // TODO: replace with hasRole(["superAdmin"]) once superVera is obsolete
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  // Modal state management
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [activeModal, setActiveModal] = useState<
    "ban" | "unban" | "history" | null
  >(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const closeModal = () => setIsModalOpen(false);
  // Translation
  const { lang } = useLanguage();
  const { formatDate } = useFormattedDate();

  // Close modals when user changes
  useEffect(() => {
    if (!activeUser) {
      setActiveModal(null);
    }
  }, [activeUser]);

  // Reset modal state
  const resetModalState = () => {
    setActiveUser(null);
    setActiveModal(null);
  };

  useEffect(() => {
    if (
      !authLoading &&
      isAuthorized &&
      users.length === 0 &&
      isModalOpen === true
    ) {
      void dispatch(fetchAllUsers());
    }
  }, [authLoading, isAuthorized, users.length, isModalOpen, dispatch]);

  const filteredUsers = users
    .filter((u) => {
      const query = searchQuery.toLowerCase();
      return (
        u.full_name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query)
      );
    })
    .filter((u) => {
      if (roleFilter === "all") return true;
      return u.role === roleFilter;
    });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, roleFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  const columns: ColumnDef<UserProfile>[] = [
    {
      accessorKey: "full_name",
      header: t.usersList.columns.name[lang],
      size: 100,
    },
    {
      accessorKey: "phone",
      header: t.usersList.columns.phone[lang],
      size: 100,
    },
    {
      accessorKey: "email",
      header: t.usersList.columns.email[lang],
      size: 350,
      cell: ({ row }) => {
        const email = row.original.email;
        return email ? (
          email
        ) : (
          <span className="text-red-500">
            {t.usersList.status.unverified[lang]}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: t.usersList.columns.userSince[lang],
      size: 100,
      cell: ({ row }) =>
        formatDate(new Date(row.original.created_at ?? ""), "d MMM yyyy"),
    },
    {
      id: "role",
      header: t.usersList.columns.role[lang],
      size: 100,
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => {
        const userRole = row.original.role;
        return userRole ? (
          userRole
        ) : (
          <span className="text-slate-500">{t.usersList.status.na[lang]}</span>
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
        // logic needs to be updated based on who gets to ban whom
        const canEdit = isAuthorized;
        const canDelete =
          isSuperAdmin || (isAuthorized && targetUser.role === "user");
        const canBan =
          (isSuperAdmin && targetUser.role === "admin") ||
          (isAuthorized && targetUser.role === "user");

        const handleBanClick = () => {
          setActiveUser(targetUser);
          setActiveModal("ban");
        };

        const handleUnbanClick = () => {
          setActiveUser(targetUser);
          setActiveModal("unban");
        };

        const handleHistoryClick = () => {
          setActiveUser(targetUser);
          setActiveModal("history");
        };

        return (
          <div className="flex gap-2">
            {canEdit && <UserEditModal user={targetUser} />}
            {canDelete && (
              <DeleteUserButton id={targetUser.id} closeModal={closeModal} />
            )}
            {(canBan || isSuperAdmin || isAuthorized) && (
              <UserBanActionsDropdown
                user={targetUser}
                canBan={canBan}
                isSuperAdmin={isSuperAdmin}
                isAuthorized={isAuthorized}
                onBanClick={handleBanClick}
                onUnbanClick={handleUnbanClick}
                onHistoryClick={handleHistoryClick}
              />
            )}
          </div>
        );
      },
    },
  ];

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoaderCircle className="animate-spin h-8 w-8 mr-2" />
        <span>{t.usersList.loading[lang]}</span>
      </div>
    );
  }

  if (!authLoading && !isAuthorized) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl">{t.usersList.title[lang]}</h1>
      </div>
      {loading && (
        <p>
          <LoaderCircle className="animate-spin" />
        </p>
      )}
      {error && <p className="text-red-500">Error: {error}</p>}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder={t.usersList.filters.search[lang]}
            value={searchQuery}
            size={50}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm p-2 bg-white rounded-md sm:max-w-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="select bg-white text-sm p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
          >
            <option value="all">{t.usersList.filters.roles.all[lang]}</option>
            <option value="user">{t.usersList.filters.roles.user[lang]}</option>
            <option value="admin">
              {t.usersList.filters.roles.admin[lang]}
            </option>
            <option value="superVera">
              {t.usersList.filters.roles.superVera[lang]}
            </option>
          </select>
          {(searchQuery || roleFilter !== "all") && (
            <Button
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("all");
              }}
              size={"sm"}
              className="px-2 py-0 bg-white text-secondary border-1 border-secondary hover:bg-secondary hover:text-white rounded-2xl"
            >
              {t.usersList.filters.clear[lang]}
            </Button>
          )}
        </div>
        <div className="flex gap-4">
          <AddUserModal>
            <Button variant="outline" size={"sm"}>
              {t.usersList.buttons.addNew[lang]}
            </Button>
          </AddUserModal>
        </div>
      </div>

      <PaginatedDataTable
        columns={columns}
        data={paginatedUsers}
        pageIndex={currentPage}
        pageCount={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Ban-related modals - only render the active modal */}
      {activeUser && activeModal === "ban" && (
        <UserBanModal
          key={`ban-${activeUser.id}`}
          user={activeUser}
          initialOpen={true}
          onClose={resetModalState}
        />
      )}
      {activeUser && activeModal === "unban" && (
        <UnbanUserModal
          key={`unban-${activeUser.id}`}
          user={activeUser}
          initialOpen={true}
          onClose={resetModalState}
        />
      )}
      {activeUser && activeModal === "history" && (
        <UserBanHistoryModal
          key={`history-${activeUser.id}`}
          user={activeUser}
          initialOpen={true}
          onClose={resetModalState}
        />
      )}
    </div>
  );
};

export default UsersList;
