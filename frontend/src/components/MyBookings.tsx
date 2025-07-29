import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  cancelBooking,
  getUserBookings,
  selectUserBookings,
  selectBookingError,
  selectBookingLoading,
  updateBooking,
  selectBooking,
  selectCurrentBooking,
  selectBookingItemsPagination,
  selectBookingPagination,
  selectCurrentBookingLoading,
  getBookingItems,
  clearCurrentBookingItems,
} from "@/store/slices/bookingsSlice";
import { selectSelectedUser } from "@/store/slices/usersSlice";
import {
  BookingWithDetails,
  BookingPreview,
  BookingItemWithDetails,
} from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import BookingDetailsButton from "@/components/Admin/Bookings/BookingDetailsButton";
import BookingCancelButton from "@/components/BookingCancelButton";
import BookingEditButton from "@/components/BookingEditButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/context/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { t } from "@/translations";
import { DataTable } from "./ui/data-table";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { StatusBadge } from "./StatusBadge";
import InlineTimeframePicker from "./InlineTimeframeSelector";
import { itemsApi } from "@/api/services/items";
import Spinner from "./Spinner";

const MyBookings = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectSelectedUser);
  const bookings = useAppSelector(selectUserBookings);
  const loading = useAppSelector(selectBookingLoading);
  const error = useAppSelector(selectBookingError);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editFormItems, setEditFormItems] = useState<BookingItemWithDetails[]>(
    [],
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [globalStartDate, setGlobalStartDate] = useState<string | null>(null);
  const [globalEndDate, setGlobalEndDate] = useState<string | null>(null);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(
    {},
  );
  const [availability, setAvailability] = useState<{
    [itemId: string]: number;
  }>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const selectedBooking = useAppSelector(selectCurrentBooking);
  const { page: itemPage, totalPages: itemTotalPages } = useAppSelector(
    selectBookingItemsPagination,
  );
  const [currentItemPage, setCurrentItemPage] = useState(1);

  const { totalPages } = useAppSelector(selectBookingPagination);
  const isMobile = useIsMobile();
  const itemsLoading = useAppSelector(selectCurrentBookingLoading);

  // Translation
  const { lang } = useLanguage();
  const { formatDate: formatDateLocalized } = useFormattedDate();

  const handleEditBooking = async (booking: BookingPreview) => {
    setLoadingAvailability(true);
    setShowEditModal(true);
    if (selectedBooking && selectedBooking.id === booking.id)
      return setLoadingAvailability(false);
    dispatch(selectBooking(booking));
    dispatch(clearCurrentBookingItems());
    await dispatch(getBookingItems(booking.id));
  };

  useEffect(() => {
    if (
      selectedBooking &&
      !itemsLoading &&
      selectedBooking.booking_items === null
    ) {
      dispatch(clearCurrentBookingItems());
      setEditFormItems([]);
      setLoadingAvailability(false);
    } else if (selectedBooking && selectedBooking.booking_items) {
      setItemQuantities(
        Object.fromEntries(
          selectedBooking.booking_items.map((item) => [
            String(item.id),
            item.quantity,
          ]),
        ),
      );
      setGlobalStartDate(
        selectedBooking.booking_items?.[0]?.start_date ?? null,
      );
      setGlobalEndDate(selectedBooking.booking_items?.[0]?.end_date ?? null);
      setEditFormItems(selectedBooking.booking_items || []);
    }
  }, [selectedBooking, dispatch, itemsLoading]);

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      toast.error(t.myBookings.error.loginRequired[lang]);
      void navigate("/login");
      return;
    }

    if (user && bookings.length === 0)
      void dispatch(getUserBookings({ user_id: user.id, page: 1, limit: 10 }));
  }, [dispatch, navigate, user, lang, bookings]); // Apply filters to bookings

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, statusFilter]);

  // Handle page change
  const handlePageChange = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    return formatDateLocalized(new Date(dateString), "d MMM yyyy");
  };

  const handleViewDetails = (booking: BookingPreview) => {
    if (selectedBooking && selectedBooking.id === booking.id)
      return setShowDetailsModal(true);
    dispatch(selectBooking(booking));
    void dispatch(getBookingItems(booking.id));
    setShowDetailsModal(true);
  };

  const handleItemPageChange = (newPage: number) => setCurrentItemPage(newPage);

  const handleSubmitEdit = async () => {
    if (!selectedBooking || !showEditModal) return;

    const updatedItems = editFormItems
      .map((item) => ({
        ...item,
        quantity:
          item.id !== undefined
            ? (itemQuantities[item.id] ?? item.quantity)
            : item.quantity,
        start_date: globalStartDate || item.start_date,
        end_date: globalEndDate || item.end_date,
      }))
      .filter((item) => item.quantity > 0);

    if (updatedItems.length === 0) {
      try {
        void dispatch(
          updateBooking({
            bookingId: selectedBooking.id!,
            items: updatedItems,
          }),
        );
        void dispatch(cancelBooking(selectedBooking.id!));
        toast.warning(t.myBookings.edit.toast.emptyCancelled[lang]);
        if (user?.id) {
          void dispatch(
            getUserBookings({
              user_id: user.id,
              page: currentPage,
              limit: 10,
            }),
          );
        }
      } catch {
        toast.error(t.myBookings.edit.toast.cancelFailed[lang]);
      } finally {
        setShowEditModal(false);
      }
      return;
    }

    try {
      await dispatch(
        updateBooking({
          bookingId: selectedBooking.id!,
          items: updatedItems,
        }),
      ).unwrap();

      toast.success(t.myBookings.edit.toast.bookingUpdated[lang]);
      setShowEditModal(false);
      if (user?.id) {
        void dispatch(
          getUserBookings({
            user_id: user.id,
            page: currentPage,
            limit: 10,
          }),
        );
      }
    } catch {
      toast.error(t.myBookings.edit.toast.updateFailed[lang]);
    }
  };

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!globalStartDate || !globalEndDate) return;

      const availabilityPromises = editFormItems.map(async (item) => {
        const itemId = item.item_id;
        const currentBookingQty = item.quantity ?? 0;

        try {
          const data = await itemsApi.checkAvailability(
            itemId,
            new Date(globalStartDate),
            new Date(globalEndDate),
          );

          const correctedAvailableQuantity =
            data.availableQuantity + currentBookingQty;

          setAvailability((prev) => ({
            ...prev,
            [itemId]: correctedAvailableQuantity,
          }));
        } catch (err) {
          console.error(`Error checking availability for item ${itemId}:`, err);
        }
      });

      await Promise.all(availabilityPromises);
      setLoadingAvailability(false);
    };

    void fetchAvailability();
  }, [globalStartDate, globalEndDate, editFormItems]);

  const isFormValid = editFormItems.every((item) => {
    const inputQty =
      item.id !== undefined
        ? (itemQuantities[item.id] ?? item.quantity)
        : item.quantity;
    const availQty = availability[item.item_id];

    return availQty === undefined || inputQty <= availQty;
  });

  /**
   * Columns of booking
   */
  const columns: ColumnDef<BookingPreview>[] = [
    {
      accessorKey: "booking_number",
      header: t.myBookings.columns.bookingNumber[lang],
    },
    {
      accessorKey: "status",
      header: t.myBookings.columns.status[lang],
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "created_at",
      header: t.myBookings.columns.date[lang],
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const booking = row.original;
        const isPending = booking.status === "pending";

        return (
          <div className="flex space-x-2">
            <BookingDetailsButton
              booking={booking}
              onViewDetails={handleViewDetails}
            />

            {isPending && (
              <>
                <BookingEditButton
                  booking={booking}
                  onEdit={handleEditBooking}
                />
                <BookingCancelButton
                  id={booking.id}
                  closeModal={() => setShowDetailsModal(false)}
                />
              </>
            )}
          </div>
        );
      },
    },
  ];

  /**
   * Columns of booking items
   */
  const bookingColumns: ColumnDef<BookingItemWithDetails>[] = [
    {
      accessorKey: "item_name",
      header: t.myBookings.columns.item[lang],
      cell: ({ row }) => {
        const itemName =
          row.original.storage_items.translations[lang].item_name;
        return itemName.charAt(0).toUpperCase() + itemName.slice(1);
      },
    },
    {
      accessorKey: "quantity",
      header: t.myBookings.columns.quantity[lang],
    },
    {
      accessorKey: "start_date",
      header: t.myBookings.columns.startDate[lang],
      cell: ({ row }) => formatDate(row.original.start_date),
    },
    {
      accessorKey: "end_date",
      header: t.myBookings.columns.endDate[lang],
      cell: ({ row }) => formatDate(row.original.end_date),
    },
    // {
    //   accessorKey: "subtotal",
    //   header: t.myBookings.columns.subtotal[lang],
    //   cell: ({ row }) => `€${row.original.subtotal?.toFixed(2) || "0.00"}`,
    // },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoaderCircle className="animate-spin h-8 w-8 mr-2" />
        <span>{t.myBookings.loading[lang]}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-8">
        <p>{t.myBookings.error.loadingError[lang]}</p>
        <p className="text-sm">{error}</p>
        <Button
          onClick={() => {
            if (!user?.id) {
              toast.error(t.myBookings.error.loginRequired[lang]);
              return;
            }
            void dispatch(
              getUserBookings({
                user_id: user.id,
                page: currentPage,
                limit: 10,
              }),
            );
          }}
          className="mt-4"
        >
          {t.myBookings.buttons.tryAgain[lang]}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 m-10 gap-20 box-shadow-lg rounded-lg">
      <div className="space-y-4">
        {/* Filtering UI */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder={t.myBookings.filter.searchPlaceholder[lang]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm p-2 bg-white rounded-md sm:max-w-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select bg-white text-sm p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
            >
              <option value="all">
                {t.myBookings.filter.allStatuses[lang]}
              </option>
              <option value="pending">
                {t.myBookings.status.pending[lang]}
              </option>
              <option value="confirmed">
                {t.myBookings.status.confirmed[lang]}
              </option>
              <option value="cancelled">
                {t.myBookings.status.cancelled[lang]}
              </option>
              <option value="rejected">
                {t.myBookings.status.rejected[lang]}
              </option>
              <option value="completed">
                {t.myBookings.status.completed[lang]}
              </option>
              <option value="deleted">
                {t.myBookings.status.deleted[lang]}
              </option>
              <option value="cancelled by admin">
                {t.myBookings.status.cancelledByAdmin[lang]}
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
                {t.myBookings.buttons.clearFilters[lang]}
              </Button>
            )}
          </div>
        </div>

        {/* BookingPreview table or empty state */}
        {bookings.length === 0 && (
          <div className="text-center py-8 bg-slate-50 rounded-lg">
            <p className="text-lg mb-2">
              {t.myBookings.emptyState.title[lang]}
            </p>
            <p className="text-muted-foreground mb-4">
              {t.myBookings.emptyState.description[lang]}
            </p>
            <Button
              onClick={() => navigate("/storage")}
              className="bg-background text-secondary border-secondary border hover:bg-secondary hover:text-white"
            >
              {t.myBookings.buttons.browseItems[lang]}
            </Button>
          </div>
        )}
        {isMobile && (
          <Accordion type="multiple" className="w-full space-y-2">
            {bookings.map((booking) => (
              <AccordionItem key={booking.id} value={String(booking.id)}>
                <AccordionTrigger className="text-left">
                  <div className="flex flex-col w-full">
                    <span className="text-sm font-medium">
                      {t.myBookings.columns.bookingNumber[lang]}{" "}
                      {booking.booking_number}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(booking.created_at)} · {booking.status}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1">
                    {/* booking Info */}
                    <div className="text-sm">
                      <p>
                        <strong>{t.myBookings.mobile.status[lang]}</strong>{" "}
                        <StatusBadge status={booking.status} />
                      </p>
                      {/* <p>
                        <strong>{t.myBookings.mobile.start[lang]}</strong>{" "}
                        {formatDate(booking.booking_items?.[0]?.start_date)}
                      </p>
                      <p>
                        <strong>{t.myBookings.mobile.end[lang]}</strong>{" "}
                        {formatDate(booking.booking_items?.[0]?.end_date)}
                      </p> */}
                    </div>

                    {/* booking Items */}
                    {selectedBooking && selectedBooking.booking_items && (
                      <>
                        <div className="bg-slate-50 rounded-md">
                          <p className="text-md font-semibold">
                            {t.myBookings.bookingDetails.items[lang]}:
                          </p>
                          <div className="space-y-2 p-1">
                            {selectedBooking.booking_items.map((item) => (
                              <div
                                key={item.id}
                                className="text-xs space-y-1 border-b pb-2 last:border-b-0 last:pb-0"
                              >
                                <p>
                                  <strong>
                                    {t.myBookings.mobile.item[lang]}
                                  </strong>{" "}
                                  {item.storage_items.translations[lang]
                                    .item_name ?? "Unknown"}
                                </p>
                                <p>
                                  <strong>
                                    {t.myBookings.mobile.quantity[lang]}
                                  </strong>{" "}
                                  {item.quantity}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 mt-3">
                      {booking.status === "pending" && (
                        <>
                          <BookingEditButton
                            booking={booking}
                            onEdit={() => {}}
                          />
                          <BookingCancelButton
                            id={booking.id}
                            closeModal={() => {}}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {totalPages > 1 ? (
          <PaginatedDataTable
            columns={columns}
            data={bookings}
            pageIndex={currentPage}
            pageCount={totalPages}
            onPageChange={handlePageChange}
          />
        ) : (
          <DataTable data={bookings} columns={columns} />
        )}
      </div>

      {/* Editing Booking Modal */}
      {selectedBooking && showEditModal && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-sm overflow-visible">
            <DialogHeader className="items-start">
              <DialogTitle>
                {t.myBookings.edit.title[lang]}
                {selectedBooking.booking_number}
              </DialogTitle>
            </DialogHeader>

            {(itemsLoading || loadingAvailability) && (
              <Spinner padding="py-10" />
            )}
            {!itemsLoading && !loadingAvailability && (
              <div className="space-y-4">
                <InlineTimeframePicker
                  startDate={globalStartDate ? new Date(globalStartDate) : null}
                  endDate={globalEndDate ? new Date(globalEndDate) : null}
                  onChange={(type, date) => {
                    if (type === "start") {
                      setGlobalStartDate(date?.toISOString() ?? null);
                    } else {
                      setGlobalEndDate(date?.toISOString() ?? null);
                    }
                  }}
                />
                {editFormItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-5 gap-4">
                    <div className="col-span-2 items-center">
                      <Label className="block text-xs font-medium">
                        {t.myBookings.edit.item[lang]}
                      </Label>
                      <p className="text-sm">
                        {item.storage_items.translations[lang].item_name ??
                          "Unknown"}
                      </p>
                    </div>
                    <div
                      className="flex flex-col h-full"
                      style={{ zIndex: 50, pointerEvents: "auto" }}
                    >
                      {/* <Label className="block text-sm font-medium">
                      {t.myBookings.edit.quantity[lang]}
                    </Label> */}
                      <div className="flex items-center gap-1 mt-auto">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={
                            item.id !== undefined &&
                            itemQuantities[item.id] <= 1
                          }
                          onClick={() => {
                            if (item.id !== undefined) {
                              const newQty =
                                (itemQuantities[item.id] || item.quantity) - 1;
                              if (newQty >= 0) {
                                setItemQuantities({
                                  ...itemQuantities,
                                  [String(item.id)]: newQty,
                                });
                              }
                            }
                          }}
                        >
                          –
                        </Button>
                        <Input
                          value={
                            item.id !== undefined
                              ? (itemQuantities[item.id] ?? item.quantity)
                              : item.quantity
                          }
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (!isNaN(val) && val >= 0) {
                              setItemQuantities({
                                ...itemQuantities,
                                [String(item.id)]: val,
                              });
                            }
                          }}
                          className="w-[50px] text-center"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={
                            availability[item.item_id] !== undefined &&
                            item.id !== undefined &&
                            itemQuantities[item.id] ===
                              availability[item.item_id]
                          }
                          onClick={() => {
                            if (item.id !== undefined) {
                              const newQty =
                                (itemQuantities[item.id] || item.quantity) + 1;
                              setItemQuantities({
                                ...itemQuantities,
                                [String(item.id)]: newQty,
                              });
                            }
                          }}
                        >
                          +
                        </Button>
                      </div>
                      {availability[item.item_id] && (
                        <p className="text-xs italic text-slate-400 mt-1">
                          Total of {availability[item.item_id]} items bookable
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex justify-between gap-2 mt-4">
                  <Button
                    variant={"secondary"}
                    onClick={() => setShowEditModal(false)}
                  >
                    {t.myBookings.edit.buttons.cancel[lang]}
                  </Button>
                  <Button
                    variant={"outline"}
                    onClick={handleSubmitEdit}
                    disabled={!showEditModal || !isFormValid}
                  >
                    {t.myBookings.edit.buttons.saveChanges[lang]}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-3xl overflow-x-auto">
            <DialogHeader>
              <DialogTitle className="text-left">
                {t.myBookings.bookingDetails.title[lang]}
                {selectedBooking.booking_number}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* booking Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-normal text-sm mb-1">
                    {t.myBookings.bookingDetails.customerInfo[lang]}
                  </h3>
                  <p className="text-xs text-grey-500">{user?.full_name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>

                <div>
                  <h3 className="font-normal text-sm mb-1">
                    {t.myBookings.bookingDetails.bookingInfo[lang]}
                  </h3>
                  <p className="text-xs">
                    {t.myBookings.columns.status[lang]}:{" "}
                    <StatusBadge status={selectedBooking.status} />
                  </p>
                  <p className="text-xs">
                    {t.myBookings.columns.date[lang]}:{" "}
                    {formatDate(selectedBooking.created_at)}
                  </p>
                </div>
              </div>

              {/* Booking Items */}
              {itemsLoading || loadingAvailability ? (
                <Spinner containerClasses="py-8" />
              ) : (
                <div>
                  <h3 className="font-normal text-sm mb-2">
                    {t.myBookings.bookingDetails.items[lang]}
                  </h3>
                  <div className="border rounded-md overflow-hidden">
                    {itemTotalPages > 1 ? (
                      <PaginatedDataTable
                        pageCount={itemPage}
                        onPageChange={handleItemPageChange}
                        pageIndex={currentItemPage - 1}
                        columns={bookingColumns}
                        data={
                          (selectedBooking as BookingWithDetails)
                            .booking_items || []
                        }
                      />
                    ) : itemTotalPages === 1 ? (
                      <DataTable
                        columns={bookingColumns}
                        data={
                          (selectedBooking as BookingWithDetails)
                            .booking_items || []
                        }
                      />
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MyBookings;
