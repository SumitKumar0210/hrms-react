import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../api";
import { successMessage, errorMessage, getErrorMessage } from "../../../toast";

// ─── Shared error handler ─────────────────────────────────────────────
const handleError = (error, rejectWithValue) => {
    const errMsg = getErrorMessage(error);
    errorMessage(errMsg);
    return rejectWithValue(errMsg);
};

// ─── Thunks ────────────────────────────────────────────────────────────
export const fetchDocumentTemplates = createAsyncThunk(
    "documentTemplate/fetchDocumentTemplates",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/templates");
            return res.data.data;
        } catch (error) {
            return handleError(error, rejectWithValue);
        }
    }
);

export const storeTemplate = createAsyncThunk(
    "documentTemplate/storeTemplate",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await api.post("/templates", payload);
            successMessage("Document template created successfully!");
            return res.data.data;
        } catch (error) {
            return handleError(error, rejectWithValue);
        }
    }
);

export const destroyTemplate = createAsyncThunk(
    "documentTemplate/destroyTemplate",
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/templates/${id}`);
            successMessage("Document template deleted successfully!");
            return id;
        } catch (error) {
            return handleError(error, rejectWithValue);
        }
    }
);

// ─── Initial State ─────────────────────────────────────────────────────
const initialState = {
    data: [],
    loading: false,
    saving: false,
    error: null,
};

// ─── Slice ─────────────────────────────────────────────────────────────
const documentTemplateSlice = createSlice({
    name: "documentTemplate",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearData: (state) => {
            state.data = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchDocumentTemplates.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDocumentTemplates.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchDocumentTemplates.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Store
            .addCase(storeTemplate.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(storeTemplate.fulfilled, (state, action) => {
                state.saving = false;
                state.data.push(action.payload);
            })
            .addCase(storeTemplate.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            })

            // Destroy
            .addCase(destroyTemplate.fulfilled, (state, action) => {
                state.data = state.data.filter(
                    (item) => item.id !== action.payload
                );
            });
    },
});

export const { clearError, clearData } = documentTemplateSlice.actions;
export default documentTemplateSlice.reducer;