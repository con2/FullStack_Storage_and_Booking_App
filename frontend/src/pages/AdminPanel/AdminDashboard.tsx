import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getUserCount, selectTotalUsersCount } from "@/store/slices/usersSlice";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { DataTable } from "../../components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import {
  Eye,
  LoaderCircle,
  MoveRight,
  ShoppingBag,
  Users,
  Warehouse,
} from "lucide-react";
import {
  getBookingItems,
  getBookingsCount,
  getOrderedBookings,
  selectAllBookings,
  selectBooking,
  selectBookingItemsPagination,
  selectBookingLoading,
  selectCurrentBooking,
  selectCurrentBookingLoading,
  selectTotalBookingsCount,
  updatePaymentStatus,
} from "@/store/slices/bookingsSlice";
import { BookingWithDetails, PaymentStatus } from "@/types";
import {
  fetchAllItems,
  getItemCount,
  selectAllItems,
  selectTotalItemsCount,
} from "@/store/slices/itemsSlice";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Separator } from "../../components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import BookingPickupButton from "@/components/Admin/Bookings/BookingPickupButton";
import BookingConfirmButton from "@/components/Admin/Bookings/BookingConfirmButton";
import BookingRejectButton from "@/components/Admin/Bookings/BookingRejectButton";
import BookingReturnButton from "@/components/Admin/Bookings/BookingReturnButton";
import BookingDeleteButton from "@/components/Admin/Bookings/BookingDeleteButton";
import { StatusBadge } from "@/components/StatusBadge";
import { BookingItem } from "@common/bookings/booking-items.types";
import { StorageItemRow } from "@common/items/storage-items.types";
import Spinner from "@/components/Spinner";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { BookingPreview } from "@common/bookings/booking.types";

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectAllItems);
  const bookings = useAppSelector(selectAllBookings);
  const bookingsLoading = useAppSelector(selectBookingLoading);
  const navigate = useNavigate();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  // Translation
  const { lang } = useLanguage();
  const { formatDate } = useFormattedDate();
  const { page: itemPage, totalPages: itemTotalPages } = useAppSelector(
    selectBookingItemsPagination,
  );
  const [currentItemPage, setCurrentItemPage] = useState(1);
  const itemsLoading = useAppSelector(selectCurrentBookingLoading);
  const selectedBooking = useAppSelector(selectCurrentBooking);
  const itemCount = useAppSelector(selectTotalItemsCount);
  const bookingsCount = useAppSelector(selectTotalBookingsCount);
  const userCount = useAppSelector(selectTotalUsersCount);

  useEffect(() => {
    if (items.length <= 1) void dispatch(fetchAllItems({ page: 1, limit: 10 }));
  }, [dispatch, items.length]);

  useEffect(() => {
    if (itemCount < 1) void dispatch(getItemCount());
    if (userCount < 1) void dispatch(getUserCount());
    if (bookingsCount < 1) void dispatch(getBookingsCount());
  }, [dispatch, itemCount, bookingsCount, userCount]);

  useEffect(() => {
    if (bookings.length <= 1) {
      void dispatch(
        getOrderedBookings({
          ordered_by: "created_at",
          ascending: true,
          page: 1,
          limit: 10,
        }),
      );
    }
  }, [dispatch, bookings.length]);

  const handleViewDetails = (booking: BookingPreview) => {
    dispatch(selectBooking(booking));
    void dispatch(getBookingItems(booking.id));
    setShowDetailsModal(true);
  };

  const handleItemPageChange = (newPage: number) => setCurrentItemPage(newPage);

  // Define columns for the DataTable
  // Bookings table
  const columns: ColumnDef<BookingPreview>[] = [
    {
      accessorKey: "booking_number",
      header: t.bookingList.columns.bookingNumber[lang],
    },
    {
      accessorKey: "user_profile.name",
      header: t.bookingList.columns.customer[lang],
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
      accessorKey: "status",
      header: t.bookingList.columns.status[lang],
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "created_at",
      header: t.bookingList.columns.bookingDate[lang],
      cell: ({ row }) =>
        formatDate(new Date(row.original.created_at || ""), "d MMM yyyy"),
    },
    {
      accessorKey: "final_amount",
      header: t.bookingList.columns.total[lang],
      cell: ({ row }) => `€${row.original.final_amount?.toFixed(2) || "0.00"}`,
    },
    {
      accessorKey: "invoice_status",
      header: t.bookingList.columns.invoice[lang],
      cell: ({ row }) => {
        const paymentStatus = row.original.payment_status ?? "N/A";

        const handleStatusChange = (
          newStatus:
            | "invoice-sent"
            | "paid"
            | "payment-rejected"
            | "overdue"
            | "N/A",
        ) => {
          void dispatch(
            updatePaymentStatus({
              bookingId: row.original.id,
              status: newStatus === "N/A" ? null : (newStatus as PaymentStatus),
            }),
          );
        };

        return (
          <Select onValueChange={handleStatusChange} value={paymentStatus}>
            <SelectTrigger className="w-[120px] text-xs">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {[
                "invoice-sent",
                "paid",
                "payment-rejected",
                "overdue",
                "N/A",
              ].map((status) => {
                const statusKeyMap: Record<
                  string,
                  keyof typeof t.bookingList.columns.invoice.invoiceStatus
                > = {
                  "invoice-sent": "sent",
                  paid: "paid",
                  "payment-rejected": "rejected",
                  overdue: "overdue",
                  "N/A": "NA",
                };
                const statusKey = statusKeyMap[status];
                return (
                  <SelectItem className="text-xs" key={status} value={status}>
                    {t.bookingList.columns.invoice.invoiceStatus?.[statusKey]?.[
                      lang
                    ] || status}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const booking = row.original;
        const isPending = booking.status === "pending";
        const isConfirmed = booking.status === "confirmed";

        return (
          <div className="flex space-x-1">
            <Button
              variant={"ghost"}
              size="sm"
              onClick={() => handleViewDetails(booking)}
              title={t.bookingList.buttons.viewDetails[lang]}
              className="hover:text-slate-900 hover:bg-slate-300"
            >
              <Eye className="h-4 w-4" />
            </Button>

            {isPending && (
              <>
                <BookingConfirmButton
                  id={booking.id}
                  closeModal={() => setShowDetailsModal(false)}
                />
                <BookingRejectButton
                  id={booking.id}
                  closeModal={() => setShowDetailsModal(false)}
                />
              </>
            )}

            {isConfirmed && (
              <BookingReturnButton
                id={booking.id}
                closeModal={() => setShowDetailsModal(false)}
              />
            )}

            {isConfirmed && <BookingPickupButton />}

            <BookingDeleteButton
              id={booking.id}
              closeModal={() => setShowDetailsModal(false)}
            />
          </div>
        );
      },
    },
  ];

  const bookingItemsColumns: ColumnDef<
    BookingItem & { storage_items: Partial<StorageItemRow> }
  >[] = [
    {
      accessorKey: "item_name",
      header: t.bookingList.modal.bookingItems.columns.item[lang],
      cell: (i) => {
        const itemName = i.getValue();
        return (
          String(itemName).charAt(0).toUpperCase() + String(itemName).slice(1)
        );
      },
    },
    {
      accessorKey: "quantity",
      header: t.bookingList.modal.bookingItems.columns.quantity[lang],
    },
    {
      accessorKey: "start_date",
      header: t.bookingList.modal.bookingItems.columns.startDate[lang],
      cell: ({ row }) =>
        formatDate(new Date(row.original.start_date || ""), "d MMM yyyy"),
    },
    {
      accessorKey: "end_date",
      header: t.bookingList.modal.bookingItems.columns.endDate[lang],
      cell: ({ row }) =>
        formatDate(new Date(row.original.end_date || ""), "d MMM yyyy"),
    },
    {
      accessorKey: "subtotal",
      header: t.bookingList.modal.bookingItems.columns.subtotal[lang],
      cell: ({ row }) => `€${row.original.subtotal?.toFixed(2) || "0.00"}`,
    },
  ];

  return (
    <div>
      <div className="w-full flex flex-wrap justify-evenly items-center mb-8 gap-4">
        <div className="flex flex-col items-center justify-center bg-white rounded-lg gap-4 p-4 w-[30%] min-w-[300px]">
          <div className="flex justify-center items-center">
            <p className="text-slate-500">
              {t.adminDashboard.cards.users[lang]}
            </p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Users className="h-10 w-10 text-highlight2 shrink-0" />
            <span className="text-4xl font-normal">{userCount}</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-white rounded-lg gap-4 p-4 w-[30%] min-w-[300px]">
          <div className="flex justify-center items-center">
            <p className="text-slate-500">
              {t.adminDashboard.cards.items[lang]}
            </p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Warehouse className="h-10 w-10 text-highlight2 shrink-0" />
            <span className="text-4xl font-normal">{itemCount}</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-white rounded-lg gap-4 p-4 w-[30%] min-w-[300px]">
          <div className="flex justify-center items-center">
            <p className="text-slate-500">
              {t.adminDashboard.cards.bookings[lang]}
            </p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <ShoppingBag className="h-10 w-10 text-highlight2 shrink-0" />
            <span className="text-4xl font-normal">{bookingsCount}</span>
          </div>
        </div>
      </div>
      {/* Recent bookings Section */}
      <div className="mb-8">
        <h2 className="text-left">
          {t.adminDashboard.sections.recentBookings[lang]}
        </h2>
        {bookingsLoading ? (
          <div className="flex justify-center items-center py-6">
            <LoaderCircle className="animate-spin" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={[...bookings]
              .sort(
                (a, b) =>
                  new Date(b.created_at || "").getTime() -
                  new Date(a.created_at || "").getTime(),
              )
              .slice(0, 8)}
          />
        )}
        <div className="flex items-center justify-center mt-4">
          <Button
            variant={"secondary"}
            className="flex items-center gap-2"
            onClick={() => navigate("/admin/bookings")}
          >
            {t.adminDashboard.sections.manageBookings[lang]}{" "}
            <MoveRight className="inline-block" />
          </Button>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="min-w-[320px]">
          <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
            <DialogContent className="max-w-5xl">
              <DialogHeader>
                <DialogTitle className="text-left">
                  {t.bookingList.columns.bookingNumber[lang]}{" "}
                  {selectedBooking.booking_number}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Booking Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-normal">
                      {t.bookingList.modal.customer[lang]}
                    </h3>
                    <p className="text-sm mb-0">
                      {(selectedBooking as BookingWithDetails).full_name ||
                        t.bookingList.status.unknown[lang]}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(selectedBooking as BookingWithDetails).email}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-normal">
                      {t.bookingList.modal.bookingInfo[lang]}
                    </h3>
                    <p className="text-sm mb-0">
                      {t.bookingList.modal.status[lang]}{" "}
                      <StatusBadge status={selectedBooking.status} />
                    </p>
                    <p className="text-sm">
                      {t.bookingList.modal.date[lang]}{" "}
                      {formatDate(
                        new Date(selectedBooking.created_at || ""),
                        "d MMM yyyy",
                      )}
                    </p>
                  </div>
                </div>

                {/* Booking Items */}
                <div>
                  {itemsLoading && <Spinner containerClasses="py-8" />}
                  {!itemsLoading && itemTotalPages > 1 ? (
                    <PaginatedDataTable
                      pageCount={itemPage}
                      onPageChange={handleItemPageChange}
                      pageIndex={currentItemPage - 1}
                      columns={bookingItemsColumns}
                      data={
                        (selectedBooking as BookingWithDetails).booking_items ||
                        []
                      }
                    />
                  ) : !itemsLoading && itemTotalPages === 1 ? (
                    <DataTable
                      columns={bookingItemsColumns}
                      data={
                        (selectedBooking as BookingWithDetails).booking_items ||
                        []
                      }
                    />
                  ) : null}
                </div>

                {/* booking Modal Actions */}
                <div className="flex flex-col justify-center space-x-4">
                  <Separator />
                  <div className="flex flex-row items-center gap-4 mt-4 justify-center">
                    {selectedBooking.status === "pending" && (
                      <>
                        <div className="flex flex-col items-center text-center">
                          <span className="text-xs text-slate-600">
                            {t.bookingList.modal.buttons.confirm[lang]}
                          </span>
                          <BookingConfirmButton
                            id={selectedBooking.id!}
                            closeModal={() => setShowDetailsModal(false)}
                          />
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <span className="text-xs text-slate-600">
                            {t.bookingList.modal.buttons.reject[lang]}
                          </span>
                          <BookingRejectButton
                            id={selectedBooking.id!}
                            closeModal={() => setShowDetailsModal(false)}
                          />
                        </div>
                      </>
                    )}

                    {selectedBooking.status === "confirmed" && (
                      <div className="flex flex-col items-center text-center">
                        <span className="text-xs text-slate-600">
                          {t.bookingList.modal.buttons.return[lang]}
                        </span>
                        <BookingReturnButton
                          id={selectedBooking.id!}
                          closeModal={() => setShowDetailsModal(false)}
                        />
                      </div>
                    )}
                    {selectedBooking.status === "confirmed" && (
                      <div className="flex flex-col items-center text-center">
                        <span className="text-xs text-slate-600">
                          {t.bookingList.modal.buttons.pickedUp[lang]}
                        </span>
                        <BookingPickupButton />
                      </div>
                    )}
                    <div className="flex flex-col items-center text-center">
                      <span className="text-xs text-slate-600">
                        {t.bookingList.modal.buttons.delete[lang]}
                      </span>
                      <BookingDeleteButton
                        id={selectedBooking.id!}
                        closeModal={() => setShowDetailsModal(false)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
