import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";
import { successMessage, errorMessage, getErrorMessage } from "../../../toast";

export const sendPayrollMail = createAsyncThunk(
  "mail/sendPayrollMail",
  async (values, { rejectWithValue }) => {
    try {
      const res = await api.post("mails/payroll-single-mail", values);

      successMessage("Mail sent successfully");
      return res.data;

    } catch (error) {
      const errMsg = getErrorMessage(error);
      errorMessage(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

const mailSlice = createSlice({
  name: "mail",
  initialState: {
    data: [],
    error: null,
    loading: false,
  },
  reducers: {
    clearState: (state) => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendPayrollMail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendPayrollMail.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload?.data || [];
      })
      .addCase(sendPayrollMail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearState } = mailSlice.actions;
export default mailSlice.reducer;