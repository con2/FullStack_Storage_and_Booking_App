import { Injectable, BadRequestException } from "@nestjs/common";
import * as dayjs from "dayjs"; // Keep this as a named import to avoid issues.
import { SupabaseService } from "../supabase/supabase.service";
import { Translations } from "../booking/types/translations.types";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@common/supabase.types";

/**
 * Shape consumed by all booking‑related React e‑mail templates.
 */
export interface BookingEmailPayload {
  recipient: string;
  userName: string;
  location: string;
  pickupDate: string;
  today: string;
  items: {
    item_id: string;
    quantity: number;
    start_date: string;
    end_date: string;
    translations: {
      fi: { name: string };
      en: { name: string };
    };
  }[];
}

/**
 * Composes a rich e‑mail payload for booking notifications in **one** query
 * round‑trip (thanks to Supabase's nested selects).
 *
 * Usage:
 * ```ts
 * const payload = await assembler.buildPayload(bookingId);
 * const template = BookingCreationEmail(payload);
 * await mailService.sendMail({ to: payload.recipient, template, subject });
 * ```
 */
@Injectable()
export class BookingEmailAssembler {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Build a fully‑hydrated {@link BookingEmailPayload} from an `bookingId`.
   *
   * Queries:
   * 1. `bookings` with nested `booking_items → storage_items → storage_locations`
   * 2. `user_profiles` for the booking owner
   *
   * Also formats dates (DD.MM.YYYY) and maps translations.
   *
   * @throws BadRequestException when either the booking or user is not found.
   */
  async buildPayload(bookingId: string): Promise<BookingEmailPayload> {
    const supabase =
      this.supabaseService.getServiceClient() as SupabaseClient<Database>;

    // 1. Load booking with nested relations (items → storage → location)
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
          id,
          user_id,
          booking_items (
            quantity,
            start_date,
            end_date,
            item_id,
            storage_items (
              translations,
              storage_locations (
                name
              )
            )
          )
        `,
      )
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new BadRequestException("Could not load booking for email payload");
    }

    // 2. Load user
    const { data: user, error: userError } = await supabase
      .from("user_profiles")
      .select("full_name, email")
      .eq("id", booking.user_id)
      .single();

    if (userError || !user) {
      throw new BadRequestException("User profile not found for email payload");
    }

    // 3. Enrich items once
    const enrichedItems =
      booking.booking_items?.map((item) => {
        const translations = item.storage_items
          ?.translations as Translations | null;

        return {
          item_id: item.item_id,
          quantity: item.quantity ?? 0,
          start_date: item.start_date,
          end_date: item.end_date,
          translations: {
            fi: { name: translations?.fi?.item_name ?? "Unknown" },
            en: { name: translations?.en?.item_name ?? "Unknown" },
          },
        };
      }) ?? [];

    // 4. Derive date & location
    const pickupDate = dayjs(booking.booking_items?.[0]?.start_date).format(
      "DD.MM.YYYY",
    );

    const locationName =
      booking.booking_items?.[0]?.storage_items?.storage_locations?.name ??
      "Unknown";

    return {
      recipient: user.email ?? "unknown@incognito.fi",
      userName: user.full_name ?? "Unknown",
      location: locationName,
      pickupDate,
      today: dayjs().format("DD.MM.YYYY"),
      items: enrichedItems,
    };
  }
}
