import { ChangeEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectBookingLoading,
  selectBookingError,
  selectAllBookings,
  getOrderedBookings,
  selectBookingPagination,
} from "@/store/slices/bookingsSlice";
import { Eye, LoaderCircle } from "lucide-react";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { BookingStatus } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { useAuth } from "@/hooks/useAuth";
import { StatusBadge } from "@/components/StatusBadge";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { BookingPreview } from "@common/bookings/booking.types";
import { selectActiveOrganizationId } from "@/store/slices/rolesSlice";
import { useNavigate } from "react-router-dom";

const BookingList = () => {
  const dispatch = useAppDispatch();
  const bookings = useAppSelector(selectAllBookings);
  const loading = useAppSelector(selectBookingLoading);
  const error = useAppSelector(selectBookingError);
  const navigate = useNavigate();
  const { authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus>("all");
  // Always request backend order: created_at desc
  const ORDER_BY = "created_at" as const;
  const ASCENDING = false;
  const { totalPages, page } = useAppSelector(selectBookingPagination);
  const { lang } = useLanguage();
  const { formatDate } = useFormattedDate();
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearchQuery = useDebouncedValue(searchQuery);
  const activeOrgId = useAppSelector(selectActiveOrganizationId);

  /*----------------------handlers----------------------------------*/
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  const handleSearchQuery = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  /*----------------------side-effects----------------------------------*/
  useEffect(() => {
    void dispatch(
      getOrderedBookings({
        ordered_by: ORDER_BY,
        ascending: ASCENDING,
        page: currentPage,
        limit: 10,
        searchquery: debouncedSearchQuery,
        status_filter: statusFilter !== "all" ? statusFilter : undefined,
      }),
    );
  }, [
    debouncedSearchQuery,
    statusFilter,
    page,
    ORDER_BY,
    dispatch,
    currentPage,
    ASCENDING,
    activeOrgId,
  ]);

  const columns: ColumnDef<BookingPreview>[] = [
    {
      id: "actions",
      size: 5,
      cell: () => {
        return (
          <div className="flex space-x-1">
            <Button
              variant={"ghost"}
              size="sm"
              title={t.bookingList.buttons.viewDetails[lang]}
              className="hover:text-slate-900 hover:bg-slate-300"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "booking_number",
      header: t.bookingList.columns.bookingNumber[lang],
      enableSorting: true,
    },
    {
      accessorKey: "full_name",
      header: t.bookingList.columns.customer[lang],
      enableSorting: true,
      cell: ({ row }) => (
        <div>
          <div>
            {row.original.full_name || t.bookingList.status.unknown[lang]}
          </div>
          <div className="text-xs text-gray-500">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: t.bookingList.columns.customer[lang],
      cell: ({ row }) => row.original.email,
    },
    {
      id: "org_status",
      header: t.bookingList.columns.status[lang],
      enableSorting: false,
      cell: ({ row }) => {
        // backend attaches org_status_for_active_org; prefer that when present
        const maybe = row.original as BookingPreview & {
          org_status_for_active_org?: string;
        };
        const status =
          maybe.org_status_for_active_org ??
          (maybe.status as string | undefined);
        return <StatusBadge status={status ?? "unknown"} />;
      },
    },
    {
      accessorKey: "created_at",
      header: t.bookingList.columns.bookingDate[lang],
      enableSorting: true,
      cell: ({ row }) =>
        formatDate(new Date(row.original.created_at || ""), "d MMM yyyy"),
    },
  ];

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoaderCircle className="animate-spin h-8 w-8 mr-2" />
        <span>{t.bookingList.loading[lang]}</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl">{t.bookingList.title[lang]}</h1>
          <Button
            onClick={() =>
              dispatch(
                getOrderedBookings({
                  ordered_by: ORDER_BY,
                  ascending: ASCENDING,
                  page: currentPage,
                  limit: 10,
                  searchquery: debouncedSearchQuery,
                  status_filter:
                    statusFilter !== "all" ? statusFilter : undefined,
                }),
              )
            }
            className="bg-background rounded-2xl text-primary/80 border-primary/80 border-1 hover:text-white hover:bg-primary/90"
          >
            {t.bookingList.buttons.refresh[lang]}
          </Button>
        </div>
        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder={t.bookingList.filters.search[lang]}
              value={searchQuery}
              size={50}
              onChange={(e) => handleSearchQuery(e)}
              className="w-full text-sm p-2 bg-white rounded-md sm:max-w-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus)}
              className="select bg-white text-sm p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
            >
              <option value="all">
                {t.bookingList.filters.status.all[lang]}
              </option>
              <option value="pending">
                {t.bookingList.filters.status.pending[lang]}
              </option>
              <option value="confirmed">
                {t.bookingList.filters.status.confirmed[lang]}
              </option>
              <option value="rejected">
                {t.bookingList.filters.status.rejected[lang]}
              </option>
              <option value="cancelled">
                {t.bookingList.filters.status.cancelled[lang]}
              </option>
            </select>
            {(searchQuery || statusFilter !== "all") && (
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                size={"sm"}
                className="px-2 py-0 bg-white text-secondary border-1 border-secondary hover:bg-secondary hover:text-white rounded-2xl"
              >
                {t.bookingList.filters.clear[lang]}
              </Button>
            )}
          </div>
        </div>
        {/* Table of Bookings */}
        <PaginatedDataTable
          columns={columns}
          data={bookings}
          pageIndex={currentPage - 1}
          pageCount={totalPages}
          onPageChange={(page) => handlePageChange(page + 1)}
          rowProps={(row) => ({
            style: { cursor: "pointer" },
            onClick: () => navigate(`/admin/bookings/${row.original.id}`),
          })}
        />
      </div>
    </>
  );
};

export default BookingList;
