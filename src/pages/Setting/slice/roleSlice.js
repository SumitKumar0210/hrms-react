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


export const getactiveRoles = createAsyncThunk(
  "role/getactiveRoles",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("roles?statue=1");
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
      const res = await api.post("roles", values);
      successMessage("Role created successfully");
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
      const res = await api.put(`roles/${id}`, values);
      successMessage("Role updated successfully");
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
      await api.delete(`roles/${id}`);
      successMessage("Role deleted successfully");
      return id;
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
      .addCase(getRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data ?? action.payload;
      })
      .addCase(getRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getactiveRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getactiveRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data ?? action.payload;
      })
      .addCase(getactiveRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* STORE ROLE */
      .addCase(storeRole.fulfilled, (state, action) => {
        state.data.push(action.payload.data ?? action.payload);
      })

      /* UPDATE ROLE */
      .addCase(updateRole.fulfilled, (state, action) => {
        const updated = action.payload.data ?? action.payload;

        const index = state.data.findIndex((item) => item.id === updated.id);
        if (index !== -1) {
          state.data[index] = updated;
        }
      })

      /* DELETE ROLE */
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.data = state.data.filter((item) => item.id !== action.payload);
      });
  },
});

export const { clearRoleData } = roleSlice.actions;
export default roleSlice.reducer;