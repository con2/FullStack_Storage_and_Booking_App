import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { extractErrorMessage } from "@/store/utils/errorHandlers";
import { userBanningApi } from "../../api/services/userBanning";
import {
  BanForRoleRequest,
  BanForOrgRequest,
  BanForAppRequest,
  UnbanRequest,
  UserBanningState,
} from "@/types/userBanning";

const initialState: UserBanningState = {
  loading: false,
  error: null,
  banHistory: [],
  banStatuses: [],
  userBanStatuses: {},
  lastOperation: null,
};

// Async thunks
export const banUserForRole = createAsyncThunk(
  "userBanning/banForRole",
  async (data: BanForRoleRequest, { rejectWithValue }) => {
    try {
      return await userBanningApi.banForRole(data);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to ban user for role"),
      );
    }
  },
);

export const banUserForOrg = createAsyncThunk(
  "userBanning/banForOrg",
  async (data: BanForOrgRequest, { rejectWithValue }) => {
    try {
      return await userBanningApi.banForOrg(data);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to ban user for organization"),
      );
    }
  },
);

export const banUserForApp = createAsyncThunk(
  "userBanning/banForApp",
  async (data: BanForAppRequest, { rejectWithValue }) => {
    try {
      return await userBanningApi.banForApp(data);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to ban user from application"),
      );
    }
  },
);

export const unbanUser = createAsyncThunk(
  "userBanning/unban",
  async (data: UnbanRequest, { rejectWithValue }) => {
    try {
      return await userBanningApi.unbanUser(data);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to unban user"),
      );
    }
  },
);

export const fetchUserBanHistory = createAsyncThunk(
  "userBanning/fetchHistory",
  async (userId: string, { rejectWithValue }) => {
    try {
      return await userBanningApi.getUserBanHistory(userId);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch user ban history"),
      );
    }
  },
);

export const fetchAllUserBanStatuses = createAsyncThunk(
  "userBanning/fetchAllStatuses",
  async (_, { rejectWithValue }) => {
    try {
      return await userBanningApi.getAllUserBanStatuses();
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch ban statuses"),
      );
    }
  },
);

export const checkUserBanStatus = createAsyncThunk(
  "userBanning/checkStatus",
  async (userId: string, { rejectWithValue }) => {
    try {
      const result = await userBanningApi.checkUserBanStatus(userId);
      // Ensure result has userId (in case backend doesn't return it)
      return { ...result, userId };
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to check user ban status"),
      );
    }
  },
);

const userBanningSlice = createSlice({
  name: "userBanning",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLastOperation: (state) => {
      state.lastOperation = null;
    },
  },
  extraReducers: (builder) => {
    // Ban user for role
    builder
      .addCase(banUserForRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(banUserForRole.fulfilled, (state, action) => {
        state.loading = false;
        state.lastOperation = action.payload;
      })
      .addCase(banUserForRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Ban user for organization
      .addCase(banUserForOrg.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(banUserForOrg.fulfilled, (state, action) => {
        state.loading = false;
        state.lastOperation = action.payload;
      })
      .addCase(banUserForOrg.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Ban user for application
      .addCase(banUserForApp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(banUserForApp.fulfilled, (state, action) => {
        state.loading = false;
        state.lastOperation = action.payload;
      })
      .addCase(banUserForApp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Unban user
      .addCase(unbanUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unbanUser.fulfilled, (state, action) => {
        state.loading = false;
        state.lastOperation = action.payload;
      })
      .addCase(unbanUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch user ban history
      .addCase(fetchUserBanHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBanHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.banHistory = action.payload;
      })
      .addCase(fetchUserBanHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch all ban statuses
      .addCase(fetchAllUserBanStatuses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUserBanStatuses.fulfilled, (state, action) => {
        state.loading = false;
        state.banStatuses = action.payload;
      })
      .addCase(fetchAllUserBanStatuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Check user ban status
      .addCase(checkUserBanStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkUserBanStatus.fulfilled, (state, action) => {
        state.loading = false;
        const banStatus = action.payload;
        state.userBanStatuses[banStatus.userId] = banStatus;
      })
      .addCase(checkUserBanStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearLastOperation } = userBanningSlice.actions;

// Selectors
export const selectUserBanningState = (state: RootState) => state.userBanning;
export const selectUserBanningLoading = (state: RootState) =>
  state.userBanning.loading;
export const selectUserBanningError = (state: RootState) =>
  state.userBanning.error;
export const selectBanHistory = (state: RootState) =>
  state.userBanning.banHistory;
export const selectBanStatuses = (state: RootState) =>
  state.userBanning.banStatuses;
export const selectUserBanStatuses = (state: RootState) =>
  state.userBanning.userBanStatuses;
export const selectLastOperation = (state: RootState) =>
  state.userBanning.lastOperation;

export default userBanningSlice.reducer;
