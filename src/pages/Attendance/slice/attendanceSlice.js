import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";
import { successMessage, errorMessage, getErrorMessage } from "../../../toast";

export const uploadAttendance = createAsyncThunk(
    "attendance/uploadAttendance",
    async (rows, { rejectWithValue }) => {
        try {
            const res = await api.post("/attendance/upload-csv", {
                rows,
            });

            successMessage("Attendance upload processed");
            return res.data.data; // row-wise result
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

export const getAttendance = createAsyncThunk(
    "attendance/getAttendance",
    async (rows, { rejectWithValue }) => {
        try {
            const res = await api.post("/attendance");
            // console.log(res.data.data);
            successMessage("Attendance retrieved");
            return res.data.data; 
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

const attendanceSlice = createSlice({
    name: "attendance",
    initialState: {
        loading: false,
        error: null,
        uploadResult: [],
        data: [],
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(uploadAttendance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.uploadResult = action.payload;
            })
            .addCase(uploadAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(getAttendance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
            })
            .addCase(getAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default attendanceSlice.reducer;
