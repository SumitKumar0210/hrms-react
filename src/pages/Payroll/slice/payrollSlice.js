import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";
import { successMessage, errorMessage, getErrorMessage } from "../../../toast";

/* ================= THUNKS ================= */

export const fetchPayroll = createAsyncThunk(
  "payroll/fetchPayroll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/payroll");
      return res.data.data;
    } catch (error) {
      const errMsg = getErrorMessage(error);
      errorMessage(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

export const processMonthlyPayroll = createAsyncThunk(
  "payroll/processMonthlyPayroll",
  async (month, { rejectWithValue }) => {
    try {
      const res = await api.post("/payroll/process", { month });
      successMessage("Payroll processed successfully");
      return res.data.data;
    } catch (error) {
      const errMsg = getErrorMessage(error);
      errorMessage(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

// Fetches employees + their attendance for a given month
export const getEmployeeWithAttendanceMonthly = createAsyncThunk(
  "payroll/getEmployeeWithAttendanceMonthly",
  async (month, { rejectWithValue }) => {
    try {
      const res = await api.post("/payroll/process/attendance", { month });
      return res.data; // { attendace, employees }
    } catch (error) {
      const errMsg = getErrorMessage(error);
      errorMessage(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

export const getHistoryWithEmpId = createAsyncThunk(
  "payroll/getHistoryWithEmpId",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.post("/payroll/history", { id });
      return res.data; // { attendace, employees }
    } catch (error) {
      const errMsg = getErrorMessage(error);
      errorMessage(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);



/* ================= SLICE ================= */

const payrollSlice = createSlice({
  name: "payroll",
  initialState: {
    data: [],
    history: [],
    loading: false,

    // Attendance preview for selected month
    attendanceData: [],
    employeeData: [],
    attendanceLoading: false,

    processing: false,
    error: null,
  },
  reducers: {
    clearAttendance(state) {
      state.attendanceData = [];
      state.employeeData = [];
      state.error = null;
    },
    clearHistory(state) {
      state.history = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* fetchPayroll */
      .addCase(fetchPayroll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayroll.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchPayroll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getHistoryWithEmpId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHistoryWithEmpId.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.data;
      })
      .addCase(getHistoryWithEmpId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* getEmployeeWithAttendanceMonthly */
      .addCase(getEmployeeWithAttendanceMonthly.pending, (state) => {
        state.attendanceLoading = true;
        state.error = null;
      })
      .addCase(getEmployeeWithAttendanceMonthly.fulfilled, (state, action) => {
        state.attendanceLoading = false;
        state.attendanceData = action.payload.attendace ?? []; // backend typo preserved
        state.employeeData = action.payload.employees ?? [];
      })
      .addCase(getEmployeeWithAttendanceMonthly.rejected, (state, action) => {
        state.attendanceLoading = false;
        state.error = action.payload;
      })

      /* processMonthlyPayroll */
      .addCase(processMonthlyPayroll.pending, (state) => {
        state.processing = true;
        state.error = null;
      })
      .addCase(processMonthlyPayroll.fulfilled, (state, action) => {
        state.processing = false;
        if (action.payload) {
          state.data = [action.payload, ...state.data];
        }
      })
      .addCase(processMonthlyPayroll.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload;
      });
  },
});

export const { clearAttendance, clearHistory } = payrollSlice.actions;
export default payrollSlice.reducer;