import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../api";
import { successMessage, errorMessage, getErrorMessage } from "../../../toast";

// ─── Shared error handler ─────────────────────────────────────────────────────
const handleError = (error, rejectWithValue) => {
    const errMsg = getErrorMessage(error);
    errorMessage(errMsg);
    return rejectWithValue(errMsg);
};

export const fetchVariables = createAsyncThunk(
    'templateVariable/fetchVariables',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/template-variables');
            successMessage('Template variables fetched successfully!');
            return res.data.data;
        } catch (error) {
            return handleError(error, rejectWithValue);
        }
    }
);

export const fetchTableVariables = createAsyncThunk(
    'templateVariable/fetchTableVariables',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/template-variables/table-variable');
            successMessage('Table variables fetched successfully!');
            return res.data.data;
        } catch (error) {
            return handleError(error, rejectWithValue);
        }
    }
);

export const storeVariable = createAsyncThunk(       
    'templateVariable/store',
    async (payload, { rejectWithValue }) => {       
        try {
            const res = await api.post('/template-variables', payload);
            successMessage('Template variable created successfully!');
            return res.data.data;
        } catch (error) {
            return handleError(error, rejectWithValue);
        }
    }
);
export const destroyVariable = createAsyncThunk(       
    'templateVariable/destroy',
    async (payload, { rejectWithValue }) => {       
        try {
            const res = await api.delete(`/template-variables/${payload.id}`);
            successMessage('Template variable deleted successfully!');
            return res.data.data;
        } catch (error) {
            return handleError(error, rejectWithValue);
        }
    }
);

const initialState = {
    data:        [],
    tableData:   [],  
    loading:     false,
    saving:      false,
    error:       null,
};

// ── Reusable case handlers ────────────────────────────────────────────────────
const pending  = (state)          => { state.loading = true;  state.error = null; };
const rejected = (state, action)  => { state.loading = false; state.error = action.payload; };

const templateVariableSlice = createSlice({
    name: 'templateVariable',
    initialState,
    reducers: {
        clearError:   (state) => { state.error = null; },
        clearData:    (state) => { state.data = []; state.tableData = []; },
    },
    extraReducers: (builder) => {
        builder
            // ── fetchVariables ───────────────────────────────────────────────
            .addCase(fetchVariables.pending,   pending)
            .addCase(fetchVariables.fulfilled, (state, action) => {
                state.loading = false;              
                state.data    = action.payload;    
                state.error   = null;
            })
            .addCase(fetchVariables.rejected,  rejected)

            // ── fetchTableVariables ──────────────────────────────────────────
            .addCase(fetchTableVariables.pending,   pending)
            .addCase(fetchTableVariables.fulfilled, (state, action) => {
                state.loading    = false;
                state.tableData  = action.payload.employees;  
                state.error      = null;
            })
            .addCase(fetchTableVariables.rejected,  rejected)

            // ── storeVariable ────────────────────────────────────────────────
            .addCase(storeVariable.pending,   (state) => { state.saving = true;  state.error = null; })
            .addCase(storeVariable.fulfilled, (state, action) => {
                state.saving = false;
                state.data   = [...state.data, action.payload];
                state.error  = null;
            })
            .addCase(storeVariable.rejected,  (state, action) => {
                state.saving = false;
                state.error  = action.payload;
            })

            // ── destroyVariable ────────────────────────────────────────────────
            .addCase(destroyVariable.pending,   (state) => { state.saving = true;  state.error = null; })
            .addCase(destroyVariable.fulfilled, (state, action) => {
                state.saving = false;
                state.data   = state.data.filter(item => item.id !== action.payload.id);
                state.error  = null;
            })
            .addCase(destroyVariable.rejected,  (state, action) => {
                state.saving = false;
                state.error  = action.payload;
            });
    },
});

export const { clearError, clearData } = templateVariableSlice.actions;
export default templateVariableSlice.reducer;