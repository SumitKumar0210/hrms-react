import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";
import { successMessage, errorMessage, getErrorMessage } from "../../../toast";

/* ================= FETCH ================= */
export const fetchDesignation = createAsyncThunk(
  "designation/fetchDesignation",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/designation");
      return res.data.data;
    } catch (error) {
      const errMsg = getErrorMessage(error);
      errorMessage(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

/* ================= STORE ================= */
export const storeDesignation = createAsyncThunk(
  "designation/storeDesignation",
  async (values, { rejectWithValue }) => {
    try {
      const res = await api.post("/designation", values);
      successMessage("Designation added successfully!");
      return res.data.data;
    } catch (error) {
      const errMsg = getErrorMessage(error);
      errorMessage(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

/* ================= UPDATE ================= */
export const updateDesignation = createAsyncThunk(
  "designation/updateDesignation",
  async ({ id, ...values }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/designation/${id}`, values);
      successMessage("Designation updated successfully!");
      return res.data.data;
    } catch (error) {
      const errMsg = getErrorMessage(error);
      errorMessage(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

/* ================= DELETE ================= */
export const deleteDesignation = createAsyncThunk(
  "designation/deleteDesignation",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/designation/${id}`);
      successMessage("Designation deleted successfully!");
      return id;
    } catch (error) {
      const errMsg = getErrorMessage(error);
      errorMessage(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

/* ================= SLICE ================= */
const designationSlice = createSlice({
  name: "designation",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetDesignationState: (state) => {
      state.data = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ===== FETCH ===== */
      .addCase(fetchDesignation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDesignation.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDesignation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== STORE ===== */
      .addCase(storeDesignation.pending, (state) => {
        state.loading = true;
      })
      .addCase(storeDesignation.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload);
      })
      .addCase(storeDesignation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== UPDATE ===== */
      .addCase(updateDesignation.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDesignation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(updateDesignation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== DELETE ===== */
      .addCase(deleteDesignation.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteDesignation.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter(
          (item) => item.id !== action.payload
        );
      })
      .addCase(deleteDesignation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetDesignationState } = designationSlice.actions;
export default designationSlice.reducer;
