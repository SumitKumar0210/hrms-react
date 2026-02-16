import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";
import { successMessage, errorMessage, getErrorMessage } from "../../../toast";

// Fetch all overtime records
export const fetchAllOvertime = createAsyncThunk(
    'overtime/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { page = 1, limit = 10, search = "", employee_id = "" } = params;
            const queryParams = new URLSearchParams({
                page,
                limit,
                ...(search && { search }),
                ...(employee_id && { employee_id }),
            });

            const res = await api.get(`/overtime?${queryParams}`);
            return res.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

// Fetch single overtime record
export const fetchOvertimeById = createAsyncThunk(
    'overtime/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const res = await api.get(`/overtime/${id}`);
            return res.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

// Create overtime record
export const createOvertime = createAsyncThunk(
    'overtime/create',
    async (overtimeData, { rejectWithValue }) => {
        try {
            const res = await api.post('/overtime/store', overtimeData);
            successMessage(res.data.message || "Overtime record created successfully");
            return res.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

// Update overtime record
export const updateOvertime = createAsyncThunk(
    'overtime/update',
    async ({ id, overtimeData }, { rejectWithValue }) => {
        try {
            const res = await api.put(`/overtime/${id}`, overtimeData);
            successMessage(res.data.message || "Overtime record updated successfully");
            return res.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

// Delete overtime record
export const deleteOvertime = createAsyncThunk(
    'overtime/delete',
    async (id, { rejectWithValue }) => {
        try {
            const res = await api.delete(`/overtime/${id}`);
            successMessage(res.data.message || "Overtime record deleted successfully");
            return { id, data: res.data };
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

// Approve overtime record
export const approveOvertime = createAsyncThunk(
    'overtime/approve',
    async (id, { rejectWithValue }) => {
        try {
            const res = await api.patch(`/overtime/${id}/approve`);
            successMessage(res.data.message || "Overtime approved successfully");
            return res.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

// Reject overtime record
export const rejectOvertime = createAsyncThunk(
    'overtime/reject',
    async ({ id, reason }, { rejectWithValue }) => {
        try {
            const res = await api.patch(`/overtime/${id}/reject`, { reason });
            successMessage(res.data.message || "Overtime rejected");
            return res.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

const overtimeSlice = createSlice({
    name: 'overtime',
    initialState: {
        overtimeRecords: [],
        currentOvertime: null,
        data: null,
        error: null,
        loading: false,
        success: false,
        pagination: {
            currentPage: 1,
            totalPages: 1,
            total: 0,
            limit: 10,
        },
    },
    reducers: {
        clearSuccess: (state) => {
            state.success = false;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentOvertime: (state) => {
            state.currentOvertime = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all overtime
            .addCase(fetchAllOvertime.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllOvertime.fulfilled, (state, action) => {
                state.loading = false;
                state.overtimeRecords = action.payload.data || action.payload.overtime || [];
                state.pagination = {
                    currentPage: action.payload.currentPage || action.payload.page || 1,
                    totalPages: action.payload.totalPages || 1,
                    total: action.payload.total || 0,
                    limit: action.payload.limit || 10,
                };
                state.error = null;
            })
            .addCase(fetchAllOvertime.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch overtime by ID
            .addCase(fetchOvertimeById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOvertimeById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOvertime = action.payload.data || action.payload;
                state.error = null;
            })
            .addCase(fetchOvertimeById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create overtime
            .addCase(createOvertime.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createOvertime.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.data = action.payload.data || action.payload;
                
                // Add to records list
                const newRecord = action.payload.data || action.payload.overtime;
                if (newRecord) {
                    state.overtimeRecords.unshift(newRecord);
                    state.pagination.total += 1;
                }
                state.error = null;
            })
            .addCase(createOvertime.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })

            // Update overtime
            .addCase(updateOvertime.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateOvertime.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.data = action.payload.data || action.payload;
                
                // Update in records list
                const updatedRecord = action.payload.data || action.payload.overtime;
                if (updatedRecord) {
                    const index = state.overtimeRecords.findIndex(
                        (record) => record.id === updatedRecord.id
                    );
                    if (index !== -1) {
                        state.overtimeRecords[index] = updatedRecord;
                    }
                }
                state.error = null;
            })
            .addCase(updateOvertime.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })

            // Delete overtime
            .addCase(deleteOvertime.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteOvertime.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                
                // Remove from records list
                state.overtimeRecords = state.overtimeRecords.filter(
                    (record) => record.id !== action.payload.id
                );
                state.pagination.total -= 1;
                state.error = null;
            })
            .addCase(deleteOvertime.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Approve overtime
            .addCase(approveOvertime.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approveOvertime.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                
                // Update status in records list
                const approvedRecord = action.payload.data || action.payload.overtime;
                if (approvedRecord) {
                    const index = state.overtimeRecords.findIndex(
                        (record) => record.id === approvedRecord.id
                    );
                    if (index !== -1) {
                        state.overtimeRecords[index] = approvedRecord;
                    }
                }
                state.error = null;
            })
            .addCase(approveOvertime.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Reject overtime
            .addCase(rejectOvertime.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectOvertime.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                
                // Update status in records list
                const rejectedRecord = action.payload.data || action.payload.overtime;
                if (rejectedRecord) {
                    const index = state.overtimeRecords.findIndex(
                        (record) => record.id === rejectedRecord.id
                    );
                    if (index !== -1) {
                        state.overtimeRecords[index] = rejectedRecord;
                    }
                }
                state.error = null;
            })
            .addCase(rejectOvertime.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearSuccess, clearError, clearCurrentOvertime } = overtimeSlice.actions;
export default overtimeSlice.reducer;