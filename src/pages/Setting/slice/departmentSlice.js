import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";
import { successMessage, errorMessage, getErrorMessage } from "../../../toast";

/* ================= ASYNC THUNKS ================= */

/* GET */
export const getDepartment = createAsyncThunk(
    "department/get",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/departments");
            return res.data.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

/* STORE */
export const storeDepartment = createAsyncThunk(
    "department/store",
    async (values, { rejectWithValue }) => {
        try {
            const res = await api.post("/departments", values);
            successMessage("Department added successfully!");
            return res.data.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

/* UPDATE */
export const updateDepartment = createAsyncThunk(
    "department/update",
    async (values, { rejectWithValue }) => {
        try {
            const res = await api.post(`/departments/${values.id}`, values);
            successMessage("Department updated successfully!");
            return res.data.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

/* DELETE */
export const deleteDepartment = createAsyncThunk(
    "department/delete",
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/departments/${id}`);
            successMessage("Department deleted successfully!");
            return id;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

/* ================= SLICE ================= */

const departmentSlice = createSlice({
    name: "department",
    initialState: {
        data: [],
        loading: false,
        error: null,
    },

    /* ===== LOCAL REDUCERS ===== */
    reducers: {
        clearDepartmentError: (state) => {
            state.error = null;
        },

        resetDepartmentState: (state) => {
            state.data = [];
            state.loading = false;
            state.error = null;
        },

        setDepartments: (state, action) => {
            state.data = action.payload;
        },

        addDepartmentLocal: (state, action) => {
            state.data.push(action.payload);
        },

        updateDepartmentLocal: (state, action) => {
            const index = state.data.findIndex(
                (item) => item.id === action.payload.id
            );
            if (index !== -1) {
                state.data[index] = action.payload;
            }
        },

        deleteDepartmentLocal: (state, action) => {
            state.data = state.data.filter(
                (item) => item.id !== action.payload
            );
        },
    },

    /* ===== ASYNC REDUCERS ===== */
    extraReducers: (builder) => {
        builder
            /* GET */
            .addCase(getDepartment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDepartment.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(getDepartment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            /* STORE */
            .addCase(storeDepartment.pending, (state) => {
                state.loading = true;
            })
            .addCase(storeDepartment.fulfilled, (state, action) => {
                state.loading = false;
                state.data.push(action.payload);
            })
            .addCase(storeDepartment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            /* UPDATE */
            .addCase(updateDepartment.fulfilled, (state, action) => {
                const index = state.data.findIndex(
                    (item) => item.id === action.payload.id
                );
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })

            /* DELETE */
            .addCase(deleteDepartment.fulfilled, (state, action) => {
                state.data = state.data.filter(
                    (item) => item.id !== action.payload
                );
            });
    },
});

/* ================= EXPORTS ================= */

export const {
    clearDepartmentError,
    resetDepartmentState,
    setDepartments,
    addDepartmentLocal,
    updateDepartmentLocal,
    deleteDepartmentLocal,
} = departmentSlice.actions;

export default departmentSlice.reducer;
