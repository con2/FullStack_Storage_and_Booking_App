import React from "react";
import { useAppSelector } from "../store/hooks";
import {
  selectCurrentBooking,
  selectBookingLoading,
} from "../store/slices/bookingsSlice";
import { selectSelectedUser } from "../store/slices/usersSlice";
import { selectItemImagesById } from "../store/slices/itemImagesSlice";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { CheckCircle, LoaderCircle, Calendar, Package } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { BookingWithDetails } from "@/types";
import { BookingItemWithDetails } from "@/types/booking";

interface BookingItemDisplayProps {
  item: BookingItemWithDetails;
}

const BookingItemDisplay: React.FC<BookingItemDisplayProps> = ({ item }) => {
  const { lang } = useLanguage();

  // Get images for this item from the Redux store
  const itemImages = useAppSelector((state) =>
    selectItemImagesById(state, item.item_id),
  );

  // Get the first image URL, if available
  const firstImageUrl =
    itemImages?.length > 0 ? itemImages[0].image_url : undefined;

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-md ring-1 ring-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
          {firstImageUrl ? (
            <img
              src={firstImageUrl}
              alt={
                item.storage_items?.translations?.[lang]?.item_name || "Item"
              }
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs font-medium text-gray-600">
              {item.storage_items?.translations?.[lang]?.item_name
                ?.slice(0, 2)
                ?.toUpperCase() || "IT"}
            </span>
          )}
        </div>
        <div>
          <p className="font-medium text-sm">
            {item.storage_items?.translations?.[lang]?.item_name || "Item"}
          </p>
          <p className="text-xs text-gray-500">
            {t.bookingConfirmation.quantity[lang]}: {item.quantity} •{" "}
            {item.total_days} {t.bookingConfirmation.days[lang]}
          </p>
        </div>
      </div>
    </div>
  );
};

const BookingConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const booking = useAppSelector(
    selectCurrentBooking,
  ) as BookingWithDetails | null;
  const isLoading = useAppSelector(selectBookingLoading);
  const userProfile = useAppSelector(selectSelectedUser);

  // Add language support
  const { lang } = useLanguage();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      lang === "fi" ? "fi-FI" : "en-US",
    );
  };

  // Function to get translated status
  const getTranslatedStatus = (status: string) => {
    const statusMap: { [key: string]: { fi: string; en: string } } = {
      pending: t.bookingConfirmation.statuses.pending,
      confirmed: t.bookingConfirmation.statuses.confirmed,
      cancelled: t.bookingConfirmation.statuses.cancelled,
      "cancelled by admin": t.bookingConfirmation.statuses.cancelledByAdmin,
      rejected: t.bookingConfirmation.statuses.rejected,
      completed: t.bookingConfirmation.statuses.completed,
      deleted: t.bookingConfirmation.statuses.deleted,
    };

    return statusMap[status]?.[lang] || status;
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card className="overflow-hidden">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">
            {t.bookingConfirmation.title[lang]}
          </CardTitle>
          <p className="text-gray-600">{t.bookingConfirmation.message[lang]}</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="bg-slate-50 p-4 rounded-md flex justify-center items-center mb-6 h-12">
              <LoaderCircle className="animate-spin h-5 w-5 mr-2" />
              <span className="text-sm text-gray-600">
                {t.bookingConfirmation.loading[lang]}
              </span>
            </div>
          ) : booking ? (
            <div className="space-y-6">
              {/* Booking Summary */}
              <div className="bg-slate-50 p-4 rounded-md border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      {t.bookingConfirmation.bookingNumber[lang]}
                    </p>
                    <p className="font-semibold text-lg">
                      {booking.booking_number}
                    </p>
                  </div>
                  {userProfile && (
                    <div>
                      {/* Booked By */}
                      <p className="text-sm text-gray-600 mb-1">
                        {t.bookingConfirmation.bookedBy[lang]}
                      </p>
                      <p className="font-semibold">
                        {userProfile.full_name ||
                          userProfile.visible_name ||
                          "User"}
                      </p>
                      {userProfile.email && (
                        <p className="text-sm text-gray-500">
                          {userProfile.email}
                        </p>
                      )}
                    </div>
                  )}
                  <div>
                    {/* Status */}
                    <p className="text-sm text-gray-600 mb-1">
                      {t.bookingConfirmation.status[lang]}
                    </p>
                    <Badge
                      variant="outline"
                      className="capitalize bg-yellow-100 text-yellow-800 border-yellow-300"
                    >
                      {getTranslatedStatus(booking.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      {/* Created Date */}
                      <p className="text-sm text-gray-600">
                        {t.bookingConfirmation.created[lang]}
                      </p>
                      <p className="font-medium">
                        {booking.created_at
                          ? formatDate(booking.created_at)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Items */}
              {booking.booking_items && booking.booking_items.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {/* Booked Items Count */}
                      {t.bookingConfirmation.bookedItems[lang]} (
                      {booking.booking_items.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {booking.booking_items.map(
                      (item: BookingItemWithDetails, index: number) => (
                        <BookingItemDisplay key={index} item={item} />
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {booking.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t.bookingConfirmation.notes[lang]}
                  </h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md border">
                    {booking.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 p-4 rounded-md text-left mb-6 text-amber-600 border">
              <p>{t.bookingConfirmation.notAvailable[lang]}</p>
            </div>
          )}

          <Separator className="my-6" />

          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate("/profile?tab=bookings")}
              className="flex-1 bg-background text-secondary border-secondary border hover:bg-secondary hover:text-white"
            >
              {t.bookingConfirmation.buttons.viewBookings[lang]}
            </Button>
            <Button
              onClick={() => navigate("/storage")}
              className="flex-1 bg-background text-primary border-primary border hover:bg-primary hover:text-white"
            >
              {t.bookingConfirmation.buttons.continueBrowsing[lang]}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingConfirmation;
