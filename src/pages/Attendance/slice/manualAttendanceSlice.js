import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";
import { successMessage, errorMessage, getErrorMessage } from "../../../toast";

// ─────────────────────────────────────────────────────────────────────────────
// Thunks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /attendance/:id
 * Fetch a single attendance record with its correction history.
 * Returns: { data: { record, history: [...] } }
 */
export const fetchAttendanceWithHistory = createAsyncThunk(
    "manualAttendance/fetchWithHistory",
    async (values, { rejectWithValue }) => {
        try {
            const res = await api.post(`/attendance/employee/${values.employee_id}`, values);
            return res.data; // { record, history }
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

/**
 * POST /attendance/search
 * Search for an attendance record by employee_id + date.
 * Payload: { employee_id, date: "YYYY-MM-DD" }
 * Returns: { data: { record, history: [...] } }
 */
export const searchAttendance = createAsyncThunk(
    "manualAttendance/search",
    async ({ employee_id, date }, { rejectWithValue }) => {
        try {
            const res = await api.post("/attendance/search", { employee_id, date });
            return res.data.data; // { record, history }
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

/**
 * PUT /attendance/:id/correct
 * Apply a manual correction to an attendance record.
 * Payload: { id, sign_in, sign_out, status, reason }
 * Returns: { data: { updatedRecord, newHistoryEntry } }
 */
export const correctAttendance = createAsyncThunk(
    "manualAttendance/correct",
    async ({correctionData }, { rejectWithValue }) => {
        try {
            const res = await api.post(`/attendance/correct`, correctionData);
            successMessage(res.data.message || "Attendance corrected successfully");
            return res.data.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────

const manualAttendanceSlice = createSlice({
    name: "manualAttendance",
    initialState: {
        currentRecord:   null,    // the attendance record being edited
        history:         [],      // correction history for currentRecord
        loading:         false,
        searching:       false,   // separate flag for search operation
        saving:          false,   // separate flag for save operation
        error:           null,
        success:         false,
    },
    reducers: {
        clearError(state) {
            state.error = null;
        },
        clearSuccess(state) {
            state.success = false;
        },
        clearCurrentRecord(state) {
            state.currentRecord = null;
            state.history       = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // ── fetchAttendanceWithHistory ─────────────────────────────────
            .addCase(fetchAttendanceWithHistory.pending, (state) => {
                state.loading = true;
                state.error   = null;
            })
            .addCase(fetchAttendanceWithHistory.fulfilled, (state, action) => {
                state.loading       = false;
                // ✅ Fixed: thunk returns res.data.data (not double .data)
                state.currentRecord = action.payload?.data ?? null;
                state.history       = Array.isArray(action.payload?.histories)
                    ? action.payload.histories
                    : [];
            })
            .addCase(fetchAttendanceWithHistory.rejected, (state, action) => {
                state.loading = false;
                state.error   = action.payload;
            })

            // ── searchAttendance ───────────────────────────────────────────
            .addCase(searchAttendance.pending, (state) => {
                state.searching = true;
                state.error     = null;
            })
            .addCase(searchAttendance.fulfilled, (state, action) => {
                state.searching     = false;
                state.currentRecord = action.payload?.record ?? null;
                state.history       = Array.isArray(action.payload?.history)
                    ? action.payload.history
                    : [];
            })
            .addCase(searchAttendance.rejected, (state, action) => {
                state.searching     = false;
                state.error         = action.payload;
                state.currentRecord = null;
                state.history       = [];
            })

            // ── correctAttendance ──────────────────────────────────────────
            .addCase(correctAttendance.pending, (state) => {
                state.saving  = true;
                state.error   = null;
                state.success = false;
            })
            .addCase(correctAttendance.fulfilled, (state, action) => {
                state.saving  = false;
                state.success = true;
                // Server returns { updatedRecord, newHistoryEntry }
                const { updatedRecord, newHistoryEntry } = action.payload ?? {};
                if (updatedRecord) {
                    state.currentRecord = updatedRecord;
                }
                if (newHistoryEntry) {
                    state.history.unshift(newHistoryEntry); // prepend latest correction
                }
            })
            .addCase(correctAttendance.rejected, (state, action) => {
                state.saving  = false;
                state.error   = action.payload;
                state.success = false;
            });
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Selectors
// ─────────────────────────────────────────────────────────────────────────────

export const selectCurrentRecord   = (state) => state.manualAttendance.currentRecord;
export const selectHistory         = (state) => state.manualAttendance.history;
export const selectLoading         = (state) => state.manualAttendance.loading;
export const selectSearching       = (state) => state.manualAttendance.searching;
export const selectSaving          = (state) => state.manualAttendance.saving;
export const selectError           = (state) => state.manualAttendance.error;
export const selectSuccess         = (state) => state.manualAttendance.success;

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const { clearError, clearSuccess, clearCurrentRecord } = manualAttendanceSlice.actions;

export default manualAttendanceSlice.reducer;