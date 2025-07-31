import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { bookingsApi } from "../../api/services/bookings";
import { RootState } from "../store";
import {
  BookingsState,
  CreateBookingDto,
  PaymentStatus,
  BookingStatus,
  BookingPreview,
  BookingWithDetails,
  ValidBookingOrder,
} from "@/types";
import { extractErrorMessage } from "@/store/utils/errorHandlers";
import { BookingItemUpdate } from "@common/bookings/booking-items.types";
import { Booking } from "@common/bookings/booking.types";

// Create initial state
const initialState: BookingsState = {
  bookings: [],
  userBookings: [],
  loading: false,
  error: null,
  errorContext: null,
  currentBooking: null,
  currentBookingLoading: false,
  bookings_pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  booking_items_pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  bookingsCount: 0,
};

// Create booking thunk
export const createBooking = createAsyncThunk<BookingPreview, CreateBookingDto>(
  "bookings/createBooking",
  async (bookingData, { rejectWithValue }) => {
    try {
      return await bookingsApi.createBooking(bookingData);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to create booking"),
      );
    }
  },
);

// Get user bookings thunk
export const getUserBookings = createAsyncThunk(
  "bookings/getUserBookings",
  async (
    { user_id, page, limit }: { user_id: string; page: number; limit: number },
    { rejectWithValue },
  ) => {
    try {
      return await bookingsApi.getUserBookings(user_id, page, limit);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch user bookings"),
      );
    }
  },
);

// get booking by ID
export const getBookingByID = createAsyncThunk(
  "bookings/getBookingByID",
  async (booking_id: string, { rejectWithValue }) => {
    try {
      return await bookingsApi.getBookingByID(booking_id);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch user bookings"),
      );
    }
  },
);

// get booking count (all bookings, active and inactive)
export const getBookingsCount = createAsyncThunk(
  "bookings/getBookingsCount",
  async (_, { rejectWithValue }) => {
    try {
      return await bookingsApi.getBookingsCount();
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch bookings count"),
      );
    }
  },
);

// get items for a booking
export const getBookingItems = createAsyncThunk(
  "bookings/getBookingItems",
  async (booking_id: string, { rejectWithValue }) => {
    try {
      return await bookingsApi.getBookingItems(booking_id);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch user bookings"),
      );
    }
  },
);

// Get user bookings thunk
export const getOrderedBookings = createAsyncThunk(
  "bookings/getOrderedBookings",
  async (
    {
      ordered_by = "booking_number",
      ascending = true,
      page = 1,
      limit = 10,
      searchquery,
      status_filter,
    }: {
      ordered_by: ValidBookingOrder;
      page: number;
      limit: number;
      searchquery?: string;
      ascending?: boolean;
      status_filter?: BookingStatus;
    },
    { rejectWithValue },
  ) => {
    try {
      return await bookingsApi.getOrderedBookings(
        ordered_by,
        ascending,
        page,
        limit,
        searchquery,
        status_filter,
      );
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch ordered bookings"),
      );
    }
  },
);

// Get all bookings thunk
export const getAllBookings = createAsyncThunk(
  "bookings/getAllBookings",
  async (
    { page = 1, limit = 10 }: { page?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      return await bookingsApi.getAllBookings(page, limit);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch all bookings"),
      );
    }
  },
);

// Confirm booking thunk
export const confirmBooking = createAsyncThunk<
  { message: string; bookingId: string },
  string,
  { rejectValue: string }
>("bookings/confirmBooking", async (bookingId, { rejectWithValue }) => {
  try {
    // The backend returns { message: "Booking confirmed" }
    const response = await bookingsApi.confirmBooking(bookingId);

    // Make sure we return the expected type
    return {
      ...response, // This contains the message from backend
      bookingId: bookingId, // add the bookingId
    };
  } catch (error: unknown) {
    return rejectWithValue(
      extractErrorMessage(error, "Failed to confirm booking"),
    );
  }
});

// Update booking thunk
export const updateBooking = createAsyncThunk<
  Booking,
  { bookingId: string; items: BookingItemUpdate[] }
>(
  "bookings/updateBooking",
  async ({ bookingId, items }, { rejectWithValue }) => {
    try {
      return await bookingsApi.updateBooking(bookingId, items);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to update booking"),
      );
    }
  },
);

// Reject booking thunk
export const rejectBooking = createAsyncThunk<
  { message: string; bookingId: string },
  string,
  { rejectValue: string }
>("bookings/rejectBooking", async (bookingId, { rejectWithValue }) => {
  try {
    // The backend returns { message: "Booking rejected" }
    const response = await bookingsApi.rejectBooking(bookingId);

    // Make sure we return the expected type
    return {
      ...response, // This contains the message from backend
      bookingId: bookingId, // We add the bookingId ourselves
    };
  } catch (error: unknown) {
    return rejectWithValue(
      extractErrorMessage(error, "Failed to reject booking"),
    );
  }
});

// Cancel booking thunk
export const cancelBooking = createAsyncThunk<
  { message?: string; bookingId: string },
  string,
  { rejectValue: string }
>("bookings/cancelBooking", async (bookingId, { rejectWithValue }) => {
  try {
    const response = await bookingsApi.cancelBooking(bookingId);

    // Always add the bookingId to the response
    return {
      message: response.message || "Booking cancelled successfully",
      bookingId: bookingId, // add the bookingId
    };
  } catch (error: unknown) {
    return rejectWithValue(
      extractErrorMessage(error, "Failed to cancel booking"),
    );
  }
});

// Delete booking thunk
export const deleteBooking = createAsyncThunk<string, string>(
  "bookings/deleteBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      return await bookingsApi.deleteBooking(bookingId);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to delete booking"),
      );
    }
  },
);

// Return items thunk
export const returnItems = createAsyncThunk<
  { bookingId: string },
  string,
  { rejectValue: string }
>("bookings/returnItems", async (bookingId, { rejectWithValue }) => {
  try {
    await bookingsApi.returnItems(bookingId); // Just fire and forget
    return { bookingId };
  } catch (error: unknown) {
    return rejectWithValue(
      extractErrorMessage(error, "Failed to process returns"),
    );
  }
});

// update Payment Status thunk
export const updatePaymentStatus = createAsyncThunk<
  { bookingId: string; status: PaymentStatus },
  { bookingId: string; status: PaymentStatus }
>(
  "bookings/payment-status",
  async ({ bookingId, status }, { rejectWithValue }) => {
    try {
      const response = await bookingsApi.updatePaymentStatus(bookingId, status);
      // Ensure the returned status is of type PaymentStatus
      return {
        bookingId,
        status: response.status as PaymentStatus,
      };
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to update the payment status"),
      );
    }
  },
);

export const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
      state.error = null;
      state.errorContext = null;
    },
    clearCurrentBookingItems: (state) => {
      if (state.currentBooking) state.currentBooking.booking_items = null;
      state.error = null;
      state.errorContext = null;
    },
    selectBooking: (state, action) => {
      state.currentBooking = action.payload;
      if (state.currentBooking && "booking_items" in state.currentBooking)
        state.currentBooking.booking_items = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBookingsCount.fulfilled, (state, action) => {
        state.bookingsCount = action.payload.data!;
      })
      .addCase(getBookingsCount.rejected, (state, action) => {
        state.error = action.payload as string;
        state.errorContext = "fetch";
        state.loading = false;
      })
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.error = null;
        state.errorContext = null;
        state.loading = true;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.currentBooking = action.payload;
        state.bookings.push(action.payload);
        state.loading = false;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.error = action.payload as string;
        state.errorContext = "create";
        state.loading = false;
      })
      // Get user bookings
      .addCase(getUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(getUserBookings.fulfilled, (state, action) => {
        state.userBookings = action.payload.data as unknown as BookingPreview[];
        state.bookings_pagination = action.payload.metadata;
        state.loading = false;
      })
      .addCase(getUserBookings.rejected, (state, action) => {
        state.error = action.payload as string;
        state.errorContext = "fetch";
        state.loading = false;
      })
      // Get booking by ID
      .addCase(getBookingByID.pending, (state) => {
        state.currentBookingLoading = true;
        state.currentBooking = null;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(getBookingByID.fulfilled, (state, action) => {
        if (action.payload && "data" in action.payload && action.payload.data) {
          state.currentBooking = action.payload.data as BookingWithDetails;
          state.booking_items_pagination = action.payload.metadata;
        } else {
          state.currentBooking = null;
        }
        state.currentBookingLoading = false;
      })
      .addCase(getBookingByID.rejected, (state, action) => {
        state.error = action.payload as string;
        state.currentBookingLoading = false;
      })
      .addCase(getBookingItems.pending, (state) => {
        state.currentBookingLoading = true;
        if (state.currentBooking && "booking_items" in state.currentBooking)
          state.currentBooking.booking_items = null;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(getBookingItems.fulfilled, (state, action) => {
        if (state.currentBooking) {
          state.currentBooking.booking_items = action.payload.data;
          if (action.payload.data && action.payload.data.length === 0)
            state.currentBooking.booking_items = null;
        }
        state.booking_items_pagination = action.payload.metadata;
        state.currentBookingLoading = false;
      })
      .addCase(getBookingItems.rejected, (state, action) => {
        state.error = action.payload as string;
        state.currentBookingLoading = false;
      })
      // Get ordered bookings
      .addCase(getOrderedBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(getOrderedBookings.fulfilled, (state, action) => {
        state.bookings = action.payload.data ?? [];
        state.bookings_pagination = action.payload.metadata;
        state.loading = false;
      })
      .addCase(getOrderedBookings.rejected, (state, action) => {
        state.error = action.payload as string;
        state.errorContext = "fetch";
        state.loading = false;
      })
      // Get all booking
      .addCase(getAllBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(getAllBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings_pagination = action.payload.metadata;
      })
      .addCase(getAllBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "fetch";
      })
      // Confirm booking
      .addCase(confirmBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(confirmBooking.fulfilled, (state, action) => {
        state.loading = false;
        // Use the bookingId from payload
        const bookingId = action.payload.bookingId;

        // Also update in the bookings array
        state.bookings.forEach((booking) => {
          if (booking.id === bookingId) {
            booking.status = "confirmed";
          }
        });
        state.userBookings.forEach((booking) => {
          if (booking.id === bookingId) {
            booking.status = "confirmed";
          }
        });
      })
      .addCase(confirmBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "confirm";
      })
      // Update booking
      .addCase(updateBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.loading = false;

        state.bookings.forEach((booking) => {
          if (booking.id === action.payload.id) {
            Object.assign(booking, action.payload);
          }
        });
        state.userBookings.forEach((booking) => {
          if (booking.id === action.payload.id) {
            Object.assign(booking, action.payload);
          }
        });
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "update";
      })
      // Reject booking
      .addCase(rejectBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(rejectBooking.fulfilled, (state, action) => {
        state.loading = false;
        // Use the bookingId from payload
        const bookingId = action.payload.bookingId;

        // Also update in the user bookings array
        state.bookings.forEach((booking) => {
          if (booking.id === bookingId) {
            booking.status = "rejected";
          }
        });
        state.userBookings.forEach((booking) => {
          if (booking.id === bookingId) {
            booking.status = "rejected";
          }
        });
      })
      .addCase(rejectBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "reject";
      })
      // Cancel booking
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;

        // Use the bookingId we added to the payload
        const bookingId = action.payload.bookingId;

        // Also update in the user bookings array
        state.userBookings.forEach((booking) => {
          if (booking.id === bookingId) {
            booking.status = "cancelled by user";
          }
        });
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "cancel";
      })
      // Delete booking
      .addCase(deleteBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.userBookings = state.userBookings.filter(
          (booking: Booking | BookingPreview) => booking.id !== action.payload,
        );
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "delete";
      })
      // Return items
      .addCase(returnItems.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(returnItems.fulfilled, (state, action) => {
        state.loading = false;
        const { bookingId } = action.payload;

        state.bookings.forEach((booking) => {
          if (booking.id === bookingId) {
            booking.status = "completed";
          }
        });
        state.userBookings.forEach((booking) => {
          if (booking.id === bookingId) {
            booking.status = "completed";
          }
        });
      })
      .addCase(returnItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "return";
      })
      // Update payment status
      .addCase(updatePaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { bookingId, status } = action.payload;

        // Update the booking in the normalized state
        state.bookings = state.bookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, payment_status: status! }
            : booking,
        );
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "update-payment-status";
      });
  },
});

// Export actions
export const { clearCurrentBooking, selectBooking, clearCurrentBookingItems } =
  bookingsSlice.actions;

// // Export selectors
export const selectAllBookings = (state: RootState) => state.bookings.bookings;
export const selectCurrentBooking = (state: RootState) =>
  state.bookings.currentBooking;
export const selectCurrentBookingLoading = (state: RootState) =>
  state.bookings.currentBookingLoading;
export const selectBookingLoading = (state: RootState) =>
  state.bookings.loading;
export const selectBookingError = (state: RootState) => state.bookings.error;
export const selectBookingErrorContext = (state: RootState) =>
  state.bookings.errorContext;
export const selectbookingErrorWithContext = (state: RootState) => ({
  message: state.bookings.error,
  context: state.bookings.errorContext,
});
export const selectUserBookings = (state: RootState) =>
  state.bookings.userBookings;

// Pagination data
export const selectBookingPagination = (state: RootState) =>
  state.bookings.bookings_pagination;
export const selectBookingItemsPagination = (state: RootState) =>
  state.bookings.booking_items_pagination;
export const selectTotalBookingsCount = (state: RootState) =>
  state.bookings.bookingsCount;

// Export reducer
export default bookingsSlice.reducer;
