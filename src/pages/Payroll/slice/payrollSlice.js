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

// Download payslip thunk - FIXED VERSION
export const downloadPayslip = createAsyncThunk(
  'payroll/downloadPayslip',
  async (id, { rejectWithValue }) => {
    try {

      const response = await api.post(
        `/payroll/downloadPayslip/${id}`,
        {}, // empty body
        {
          responseType: 'blob',   // ✅ MUST BE HERE
          headers: {
            Accept: 'application/pdf',
          },
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;

      // Extract filename
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `Payslip_${id}.pdf`;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match?.[1]) fileName = match[1];
      }

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      successMessage('Payslip downloaded successfully');

      return true;

    } catch (error) {
      errorMessage('Failed to download payslip');
      return rejectWithValue('Failed to download payslip');
    }
  }
);

export const viewPayslip = async (id) => {
  try {
    const response = await api.post(`/payroll/viewPayslip/${id}`);

    const newWindow = window.open('', '_blank');

    if (!newWindow) {
      alert("Popup blocked! Please allow popups.");
      return;
    }

    newWindow.document.open();
    newWindow.document.write(response.data.html);
    newWindow.document.close();

  } catch (error) {
    console.log(error);
  }
};

/* ================= SLICE ================= */

const payrollSlice = createSlice({
  name: "payroll",
  initialState: {
    downloading: false,
    downloadError: null,
    data: [],
    history: [],
    loading: false,

    // Attendance preview for selected month
    attendanceData: [],
    employeeData: [],
    isPayrollFinalized: false,
    attendanceLoading: false,

    processing: false,
    error: null,
  },
  reducers: {
    clearAttendance(state) {
      state.attendanceData = [];
      state.employeeData = [];
      state.isPayrollFinalized = false;
      state.error = null;
    },
    clearHistory(state) {
      state.history = [];
      state.error = null;
    },
    clearDownloadError(state) {
      state.downloadError = null;
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

      /* getHistoryWithEmpId */
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
        state.isPayrollFinalized = action.payload.payrollStatus ?? false;
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
      })

      /* downloadPayslip */
      .addCase(downloadPayslip.pending, (state) => {
        state.downloading = true;
        state.downloadError = null;
      })
      .addCase(downloadPayslip.fulfilled, (state) => {
        state.downloading = false;
        state.downloadError = null;
      })
      .addCase(downloadPayslip.rejected, (state, action) => {
        state.downloading = false;
        state.downloadError = action.payload;
      });
  },
});

export const { clearAttendance, clearHistory, clearDownloadError } = payrollSlice.actions;
export default payrollSlice.reducer;