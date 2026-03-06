import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";
import { successMessage, errorMessage, getErrorMessage } from "../../../toast";

export const makePayment = createAsyncThunk(
  "payment/makePayment",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/payroll/payment", data);

      successMessage("Payment successful!");
      return res.data;

    } catch (error) {
      const errMsg = getErrorMessage(error);
      errorMessage(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

export const paymentSlice = createSlice({
    name: "payment",
    initialState: {
        data: [],
        error: null,
        loading: false
    },
    reducers: {
        clearState: (state) => {
            state.data = [];
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(makePayment.pending, (state) =>{
            state.loading = true;
            state.error = null
        })
        .addCase(makePayment.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload.data;
            state.error = null;
        })
        .addCase(makePayment.rejected, (state, action) =>{
            state.loading = false;
            state.error = action.payload
        });
    }
});

export const { clearState } = paymentSlice.actions;
export default paymentSlice.reducer;