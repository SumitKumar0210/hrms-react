import { createSlice, createAsyncThunk, isRejectedWithValue } from "@reduxjs/toolkit";
import api from "../../../api";
import { successMessage, errorMessage, getErrorMessage } from "../../../toast";

export const fetchPayroll = createAsyncThunk(
    "payroll/fetchPayroll",
    async (_, { rejectedWithValue }) => {
        try{
            const res = await api.post('/payroll');
            successMessage('payroll');
            return res.data.data
        } catch(error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectedWithValue(errMsg);
        }
    }
)

const payrollSlice = createSlice({
    name:'payroll',
    initialState: {
        data : null,
        error: null,
        loading: false
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchPayroll.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchPayroll.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload.data;
            state.error = null;
        })
        .addCase(fetchPayroll.rejected, (state, action) =>{
            state.loading = false;
            state.error = action.payload
        })
    }
});


export default payrollSlice.reducer;