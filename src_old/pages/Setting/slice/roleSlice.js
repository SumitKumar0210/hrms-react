import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";
import { successMessage, errorMessage, getErrorMessage } from "../../../toast";

/* ================= GET ROLES ================= */
export const getRoles = createAsyncThunk(
  "role/getRoles",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("roles");
      return res.data;
    } catch (error) {
      const errMsg = getErrorMessage(error);
      errorMessage(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

/* ================= GET ACTIVE ROLES ================= */
export const getactiveRoles = createAsyncThunk(
  "role/getactiveRoles",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("roles?status=1");
      return res.data;
    } catch (error) {
      const errMsg = getErrorMessage(error);
      errorMessage(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

/* ================= STORE ROLE ================= */
export const storeRole = createAsyncThunk(
  "role/storeRole",
  async (values, { rejectWithValue }) => {
    try {
      // ✅ Always inject guard_name if not already provided
      const payload = { guard_name: "api", ...values };
      const res = await api.post("/roles", payload);
      successMessage(res.data.message);
      return res.data;
    } catch (error) {
      const errMsg = getErrorMessage(error);
      errorMessage(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

/* ================= UPDATE ROLE ================= */
export const updateRole = createAsyncThunk(
  "role/updateRole",
  async ({ id, ...values }, { rejectWithValue }) => {
    try {
      // ✅ Always inject guard_name if not already provided
      const payload = { guard_name: "api", ...values };
      const res = await api.put(`/roles/${id}`, payload);
      successMessage(res.data.message);
      return res.data;
    } catch (error) {
      const errMsg = getErrorMessage(error);
      errorMessage(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

/* ================= DELETE ROLE ================= */
export const deleteRole = createAsyncThunk(
  "role/deleteRole",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/roles/${id}`);
      successMessage(res.data.message);
      return id;
    } catch (error) {
      const errMsg = getErrorMessage(error);
      errorMessage(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

/* ================= ASSIGN PERMISSION ================= */
export const assignPermission = createAsyncThunk(
  "role/assignPermission",
  async (values, { rejectWithValue }) => {
    try {
      const res = await api.post(`/roles/assign-permissions`, values);
      successMessage(res.data.message);
      return res.data;
    } catch (error) {
      const errMsg = getErrorMessage(error);
      errorMessage(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

/* ================= SLICE ================= */
const roleSlice = createSlice({
  name: "role",
  initialState: {
    data: [],
    error: null,
    loading: false,
  },

  reducers: {
    clearRoleData: (state) => {
      state.data = [];
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* GET ROLES */
      .addCase(getRoles.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data ?? action.payload;
      })
      .addCase(getRoles.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      /* GET ACTIVE ROLES */
      .addCase(getactiveRoles.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getactiveRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data ?? action.payload;
      })
      .addCase(getactiveRoles.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      /* STORE ROLE */
      .addCase(storeRole.pending, (state) => { state.loading = true; })
      .addCase(storeRole.fulfilled, (state, action) => {
        state.loading = false;
        const newRole = action.payload.data ?? action.payload;
        state.data.push(newRole);
      })
      .addCase(storeRole.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      /* UPDATE ROLE */
      .addCase(updateRole.pending, (state) => { state.loading = true; })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data ?? action.payload;
        const index = state.data.findIndex((item) => item.id === updated.id);
        if (index !== -1) state.data[index] = updated;
      })
      .addCase(updateRole.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      /* DELETE ROLE */
      .addCase(deleteRole.pending, (state) => { state.loading = true; })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteRole.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      /* ASSIGN PERMISSION */
      .addCase(assignPermission.pending, (state) => { state.loading = true; })
      .addCase(assignPermission.fulfilled, (state) => { state.loading = false; })
      .addCase(assignPermission.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearRoleData } = roleSlice.actions;
export default roleSlice.reducer;