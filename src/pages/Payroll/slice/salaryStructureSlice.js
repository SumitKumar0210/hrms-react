import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";
import { successMessage, errorMessage, getErrorMessage } from "../../../toast";

// Create salary structure
export const createSalaryStructure = createAsyncThunk(
    "salaryStructure/createSalaryStructure",
    async (values, { rejectWithValue }) => {
        try {
            const res = await api.post(`/salary`, values); // Changed from GET to POST
            successMessage(res.data.message || "Salary structure created successfully");
            return res.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

// Update salary structure
export const updateSalary = createAsyncThunk(
    "salaryStructure/updateSalary",
    async ({ id, values }, { rejectWithValue }) => {
        try {
            const res = await api.put(`/salary/${id}`, values);
            successMessage(res.data.message || "Salary structure updated successfully");
            return res.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

// Fetch salary structure by employee ID
export const fetchSalaryByEmployee = createAsyncThunk(
    "salaryStructure/fetchSalaryByEmployee",
    async (employeeId, { rejectWithValue }) => {
        try {
            const res = await api.get(`/salary/employee/${employeeId}`);
            return res.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

// Fetch all salary structures
export const fetchAllSalaries = createAsyncThunk(
    "salaryStructure/fetchAllSalaries",
    async (params = {}, { rejectWithValue }) => {
        try {
            const { page = 1, limit = 10, search = "" } = params;
            const queryParams = new URLSearchParams({
                page,
                limit,
                ...(search && { search }),
            });

            const res = await api.get(`/salary?${queryParams}`);
            return res.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

// Delete salary structure
export const deleteSalary = createAsyncThunk(
    "salaryStructure/deleteSalary",
    async (id, { rejectWithValue }) => {
        try {
            const res = await api.delete(`/salary/${id}`);
            successMessage(res.data.message || "Salary structure deleted successfully");
            return { id, data: res.data };
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

const salaryStructureSlice = createSlice({
    name: 'salaryStructure',
    initialState: {
        salaries: [],
        currentSalary: null,
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
        clearCurrentSalary: (state) => {
            state.currentSalary = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create salary structure
            .addCase(createSalaryStructure.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createSalaryStructure.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.data = action.payload.data || action.payload;
                // Add to salaries list if it exists
                if (action.payload.data) {
                    state.salaries.unshift(action.payload.data);
                }
            })
            .addCase(createSalaryStructure.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })

            // Update salary structure
            .addCase(updateSalary.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateSalary.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.data = action.payload.data || action.payload;
                
                // Update in salaries list
                const updatedSalary = action.payload.data || action.payload;
                if (updatedSalary) {
                    const index = state.salaries.findIndex(
                        (salary) => salary.id === updatedSalary.id
                    );
                    if (index !== -1) {
                        state.salaries[index] = updatedSalary;
                    }
                }
            })
            .addCase(updateSalary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })

            // Fetch salary by employee
            .addCase(fetchSalaryByEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSalaryByEmployee.fulfilled, (state, action) => {
                state.loading = false;
                state.currentSalary = action.payload.data || action.payload;
            })
            .addCase(fetchSalaryByEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.currentSalary = null;
            })

            // Fetch all salaries
            .addCase(fetchAllSalaries.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllSalaries.fulfilled, (state, action) => {
                state.loading = false;
                state.salaries = action.payload.data || action.payload.salaries || [];
                state.pagination = {
                    currentPage: action.payload.currentPage || action.payload.page || 1,
                    totalPages: action.payload.totalPages || 1,
                    total: action.payload.total || 0,
                    limit: action.payload.limit || 10,
                };
            })
            .addCase(fetchAllSalaries.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete salary structure
            .addCase(deleteSalary.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteSalary.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                // Remove from salaries list
                state.salaries = state.salaries.filter(
                    (salary) => salary.id !== action.payload.id
                );
            })
            .addCase(deleteSalary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearSuccess, clearError, clearCurrentSalary } = salaryStructureSlice.actions;
export default salaryStructureSlice.reducer;