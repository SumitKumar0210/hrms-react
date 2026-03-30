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
            return res.data; // ✅ return so action.payload is available in fulfilled
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
            .addCase(getUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.error = null;
            })
            .addCase(getUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            // .addCase(updateStatus.fulfilled, (state, action) => {
            //     state.loading = false;
            //     const updatedUser = action.payload?.data;
            //     if (updatedUser) {
            //         const index = state.data.findIndex( // ✅ was state.user (bug)
            //             (user) => user.id === updatedUser.id
            //         );
            //         if (index !== -1) {
            //             state.data[index] = updatedUser;
            //         }
            //     }
            // })
            .addCase(updateStatus.fulfilled, (state, action) => {
                state.loading = false;
                const { id, status } = action.meta.arg;
                const index = state.data.findIndex((u) => u.id === id);
                if (index !== -1) {
                    state.data[index].status = status;
                }
            })
            .addCase(updateStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearUsersData } = userSlice.actions;
export default userSlice.reducer;