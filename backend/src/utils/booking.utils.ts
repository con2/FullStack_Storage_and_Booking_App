import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@common/supabase.types";
import { UserBooking } from "src/modules/booking/types/booking.interface";

export async function calculateAvailableQuantity(
  supabase: SupabaseClient<Database>,
  itemId: string,
  startDate: string,
  endDate: string,
): Promise<{
  item_id: string;
  alreadyBookedQuantity: number;
  availableQuantity: number;
}> {
  // get overlapping bookings
  const { data: overlapping, error } = await supabase
    .from("booking_items")
    .select("quantity")
    .eq("item_id", itemId)
    .in("status", ["pending", "confirmed"])
    .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`);

  if (error) {
    throw new Error("Error checking the bookings");
  }

  const alreadyBookedQuantity =
    overlapping?.reduce((sum, o) => sum + (o.quantity || 0), 0) ?? 0;

  // get items total quantity
  const { data: item, error: itemError } = await supabase
    .from("storage_items")
    .select("items_number_total")
    .eq("id", itemId)
    .single();

  if (itemError || !item) {
    throw new Error("Error when retrieving/ calling item.total");
  }

  const availableQuantity = item.items_number_total - alreadyBookedQuantity;

  return {
    item_id: itemId,
    alreadyBookedQuantity,
    availableQuantity,
  };
}

export function getUniqueLocationIDs(bookings: UserBooking[]): string[] {
  return Array.from(
    new Set(
      bookings
        .flatMap((booking) => booking.booking_items ?? [])
        .map((item) => item.storage_items?.location_id)
        .filter((id): id is string => !!id),
    ),
  );
}

/**
 * Get the difference in days between a certain date and todays date
 * @param start
 * @returns
 */
export function dayDiffFromToday(start: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize to midnight
  start.setHours(0, 0, 0, 0);
  return Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Return the total difference in days between two dates
 * @param start Start date of period
 * @param end End date of period
 * @returns
 */
export function calculateDuration(start: Date, end: Date): number {
  end.setHours(0, 0, 0, 0); // normalize to midnight
  start.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function generateBookingNumber() {
  return `ORD-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`;
}
