import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";
import { successMessage, errorMessage, getErrorMessage } from "../../../toast";

export const getUsers = createAsyncThunk(
    "user/getUsers",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("users");
            return res.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

export const updateStatus = createAsyncThunk(
    "user/updateStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const res = await api.post(`users/${id}/status`, { status });
            successMessage(
                res.data.message || `User ${status === "1" ? "activated" : "deactivated"} successfully`
            );
            return res.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

export const updateUser = createAsyncThunk(
    "user/updateUser",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const res = await api.post(`users/${id}`, data);
            successMessage(res.data.message);
            return res.data; // { success, message, data: updatedUser }
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

const userSlice = createSlice({
    name: "user",
    initialState: {
        data: [],
        error: null,
        loading: false,
    },
    reducers: {
        clearUsersData: (state) => {
            state.data = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ── getUsers ──────────────────────────────────────────────────
            .addCase(getUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data; // full array — OK here
                state.error = null;
            })
            .addCase(getUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ── updateUser ────────────────────────────────────────────────
            .addCase(updateUser.pending, (state) => {
                // Don't touch state.loading here — modal has its own saving flag
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.error = null;
                // API returns a single updated user object — patch it in the list
                const updatedUser = action.payload?.data;
                if (updatedUser) {
                    const index = state.data.findIndex((u) => u.id === updatedUser.id);
                    if (index !== -1) {
                        state.data[index] = updatedUser;
                    }
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.error = action.payload;
            })

            // ── updateStatus ──────────────────────────────────────────────
            // Don't touch loading here — optimistic UI in the component handles
            // the visual feedback. Toggling loading causes a full re-render that
            // wipes the list while the request is in flight.
            .addCase(updateStatus.pending, (state) => {
                state.error = null;
            })
            .addCase(updateStatus.fulfilled, (state, action) => {
                const { id, status } = action.meta.arg;
                // status arg is "1"/"0" — normalize to match what getUsers returns
                const index = state.data.findIndex((u) => u.id === id);
                if (index !== -1) {
                    state.data[index].status = status; // "1" or "0" — normalization handles display
                }
            })
            .addCase(updateStatus.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearUsersData } = userSlice.actions;
export default userSlice.reducer;