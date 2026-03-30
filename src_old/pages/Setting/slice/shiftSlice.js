import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";
import { successMessage, errorMessage, getErrorMessage } from "../../../toast";

/* ================= GET SHIFTS ================= */
export const getShift = createAsyncThunk(
    "shift/get",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/shifts");
            return res.data.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

export const fetchAllActiveShift = createAsyncThunk(
    "shift/fetchAllActiveShift",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/shifts/active");
            return res.data.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

/* ================= STORE SHIFT ================= */
export const storeShift = createAsyncThunk(
    "shift/store",
    async (values, { rejectWithValue }) => {
        try {
            const res = await api.post("/shifts", values);
            successMessage("Shift created successfully!");
            return res.data.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

/* ================= UPDATE SHIFT ================= */
export const updateShift = createAsyncThunk(
    "shift/update",
    async (values, { rejectWithValue }) => {
        try {
            const res = await api.post(`/shifts/${values.id}`, values);
            successMessage("Shift updated successfully!");
            return res.data.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

/* ================= DELETE SHIFT ================= */
export const deleteShift = createAsyncThunk(
    "shift/delete",
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/shifts/${id}`);
            successMessage("Shift deleted successfully!");
            return id;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

/* ================= SLICE ================= */
const shiftSlice = createSlice({
    name: "shift",
    initialState: {
        data: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearShiftError: (state) => {
            state.error = null;
        },
        resetShiftState: (state) => {
            state.data = [];
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            /* ===== GET ===== */
            .addCase(getShift.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getShift.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(getShift.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchAllActiveShift.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllActiveShift.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchAllActiveShift.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            /* ===== STORE ===== */
            .addCase(storeShift.pending, (state) => {
                state.loading = true;
            })
            .addCase(storeShift.fulfilled, (state, action) => {
                state.loading = false;
                state.data.push(action.payload);
            })
            .addCase(storeShift.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            /* ===== UPDATE ===== */
            .addCase(updateShift.fulfilled, (state, action) => {
                const index = state.data.findIndex(
                    (item) => item.id === action.payload.id
                );
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })

            /* ===== DELETE ===== */
            .addCase(deleteShift.fulfilled, (state, action) => {
                state.data = state.data.filter(
                    (item) => item.id !== action.payload
                );
            });
    },
});

/* ================= EXPORTS ================= */
export const {
    clearShiftError,
    resetShiftState,
} = shiftSlice.actions;

export default shiftSlice.reducer;
