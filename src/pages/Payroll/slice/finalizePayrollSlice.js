import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";
import { successMessage, errorMessage, getErrorMessage } from "../../../toast";

/* =====================================================
   FETCH FINALIZED PAYROLL HISTORY
===================================================== */
export const finalizePayrollByMonth = createAsyncThunk(
    "finalizePayroll/finalizePayrollByMonth",
    async (month, { rejectWithValue }) => {
        try {
            const res = await api.post("/finalize-payroll", { month });
            return res.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            return rejectWithValue(errMsg);
        }
    }
);

/* =====================================================
   STORE FINALIZED PAYROLL
===================================================== */
export const storeFinalizedPayroll = createAsyncThunk(
    "finalizePayroll/store",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await api.post("/finalize-payroll/store", payload);
            successMessage("Payroll finalized successfully.");
            return res.data.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

/* =====================================================
   SLICE
===================================================== */
const finalizePayrollSlice = createSlice({
    name: "finalizePayroll",
    initialState: {
        data: [],
        payroll: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearFinalizePayroll: (state) => {
            state.data = [];
            state.payroll = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder

            /* ===== FETCH ===== */
            .addCase(finalizePayrollByMonth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(finalizePayrollByMonth.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.payroll = action.payload.payroll;
            })
            .addCase(finalizePayrollByMonth.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.data;
                errorMessage(action.payload);
            })

            /* ===== STORE ===== */
            .addCase(storeFinalizedPayroll.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(storeFinalizedPayroll.fulfilled, (state, action) => {
                state.loading = false;

                // Push new finalized record on top
                state.data.unshift(action.payload);
            })
            .addCase(storeFinalizedPayroll.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearFinalizePayroll } = finalizePayrollSlice.actions;

export default finalizePayrollSlice.reducer;