import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";
import { successMessage, errorMessage, getErrorMessage } from "../../../toast";

// Fetch all employees
export const fetchEmployees = createAsyncThunk(
    "employee/fetchEmployees",
    async (params = {}, { rejectWithValue }) => {
        try {
            const { page = 1, limit = 10, search = "", status = "" } = params;
            const queryParams = new URLSearchParams({
                page,
                limit,
                ...(search && { search }),
                ...(status && { status }),
            });

            const res = await api.get(`/employees?${queryParams}`);
            return res.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

// Fetch single employee by ID
export const fetchEmployeeById = createAsyncThunk(
    "employee/fetchEmployeeById",
    async (id, { rejectWithValue }) => {
        try {
            const res = await api.get(`/employees/${id}`);
            return res.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

// Create new employee
export const createEmployee = createAsyncThunk(
    "employee/createEmployee",
    async (employeeData, { rejectWithValue }) => {
        try {
            const res = await api.post("/employees/onboarding", employeeData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });
            successMessage(res.data.message || "Employee created successfully");
            return res.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

// Update employee
export const updateEmployee = createAsyncThunk(
    "employee/updateEmployee",
    async ({ id, employeeData }, { rejectWithValue }) => {
        try {
            const res = await api.put(`/employees/${id}`, employeeData);
            successMessage(res.data.message || "Employee updated successfully");
            return res.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

// Delete employee
export const deleteEmployee = createAsyncThunk(
    "employee/deleteEmployee",
    async (id, { rejectWithValue }) => {
        try {
            const res = await api.delete(`/employees/${id}`);
            successMessage(res.data.message || "Employee deleted successfully");
            return { id, data: res.data };
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

// Toggle employee active status
export const toggleEmployeeStatus = createAsyncThunk(
    "employee/toggleEmployeeStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const res = await api.patch(`/employees/${id}/status`, { status });
            successMessage(
                res.data.message || `Employee ${status ? "activated" : "deactivated"} successfully`
            );
            return res.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

// Search employees
export const searchEmployees = createAsyncThunk(
    "employee/searchEmployees",
    async (searchTerm, { rejectWithValue }) => {
        try {
            const res = await api.get(`/employees/search?q=${searchTerm}`);
            return res.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

const employeeSlice = createSlice({
    name: "employee",
    initialState: {
        employees: [],
        currentEmployee: null,
        searchResults: [],
        loading: false,
        searchLoading: false,
        error: null,
        success: false,
        pagination: {
            currentPage: 1,
            totalPages: 1,
            totalEmployees: 0,
            limit: 10,
        },
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        clearCurrentEmployee: (state) => {
            state.currentEmployee = null;
        },
        clearSearchResults: (state) => {
            state.searchResults = [];
        },
        setCurrentPage: (state, action) => {
            state.pagination.currentPage = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch employees
            .addCase(fetchEmployees.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEmployees.fulfilled, (state, action) => {
                state.loading = false;
                state.employees = action.payload.data || action.payload.employees || [];
                state.pagination = {
                    currentPage: action.payload.currentPage || action.payload.page || 1,
                    totalPages: action.payload.totalPages || 1,
                    totalEmployees: action.payload.total || action.payload.totalEmployees || 0,
                    limit: action.payload.limit || 10,
                };
            })
            .addCase(fetchEmployees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch employee by ID
            .addCase(fetchEmployeeById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEmployeeById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentEmployee = action.payload.data || action.payload;
            })
            .addCase(fetchEmployeeById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create employee
            .addCase(createEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createEmployee.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                // Add new employee to the list
                const newEmployee = action.payload.data || action.payload.employee;
                if (newEmployee) {
                    state.employees.unshift(newEmployee);
                    state.pagination.totalEmployees += 1;
                }
            })
            .addCase(createEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })

            // Update employee
            .addCase(updateEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateEmployee.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                // Update employee in the list
                const updatedEmployee = action.payload.data || action.payload.employee;
                if (updatedEmployee) {
                    const index = state.employees.findIndex(
                        (emp) => emp.id === updatedEmployee.id
                    );
                    if (index !== -1) {
                        state.employees[index] = updatedEmployee;
                    }
                    // Update current employee if it's the same
                    if (state.currentEmployee?.id === updatedEmployee.id) {
                        state.currentEmployee = updatedEmployee;
                    }
                }
            })
            .addCase(updateEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })

            // Delete employee
            .addCase(deleteEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteEmployee.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                // Remove employee from the list
                state.employees = state.employees.filter(
                    (emp) => emp.id !== action.payload.id
                );
                state.pagination.totalEmployees -= 1;
            })
            .addCase(deleteEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Toggle employee status
            .addCase(toggleEmployeeStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(toggleEmployeeStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                // Update employee status in the list
                const updatedEmployee = action.payload.data || action.payload.employee;
                if (updatedEmployee) {
                    const index = state.employees.findIndex(
                        (emp) => emp.id === updatedEmployee.id
                    );
                    if (index !== -1) {
                        state.employees[index] = updatedEmployee;
                    }
                }
            })
            .addCase(toggleEmployeeStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Search employees
            .addCase(searchEmployees.pending, (state) => {
                state.searchLoading = true;
                state.error = null;
            })
            .addCase(searchEmployees.fulfilled, (state, action) => {
                state.searchLoading = false;
                state.searchResults = action.payload.data || action.payload.employees || [];
            })
            .addCase(searchEmployees.rejected, (state, action) => {
                state.searchLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearError,
    clearSuccess,
    clearCurrentEmployee,
    clearSearchResults,
    setCurrentPage,
} = employeeSlice.actions;

export default employeeSlice.reducer;