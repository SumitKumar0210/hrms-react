import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";
import { successMessage, errorMessage, getErrorMessage } from "../../../toast";

/* =====================================================
   FETCH FINALIZED PAYROLL HISTORY
===================================================== */
export const fetchPayrollHistoryByMonth = createAsyncThunk(
    "payrollHistory/fetchPayrollHistoryByMonth",
    async (month, { rejectWithValue }) => {
        try {
            const res = await api.get("/payrolls/history-by-month");
            return res.data.data;
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
    "payrollHistory/store",
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
const payrollHistorySlice = createSlice({
    name: "payrollHistory",
    initialState: {
        data: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearPayrollHistory: (state) => {
            state.data = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder

            /* ===== FETCH ===== */
            .addCase(fetchPayrollHistoryByMonth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPayrollHistoryByMonth.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchPayrollHistoryByMonth.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
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

export const { clearPayrollHistory } = payrollHistorySlice.actions;

export default payrollHistorySlice.reducer;