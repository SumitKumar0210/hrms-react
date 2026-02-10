import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";
import { successMessage, errorMessage, getErrorMessage } from "../../../toast";

/* ================= GET SETTINGS ================= */
export const getSettingData = createAsyncThunk(
    "setting/get",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/setting");
            return res.data.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

/* ================= UPDATE SETTINGS ================= */
export const updateSetting = createAsyncThunk(
    "setting/update",
    async (values, { rejectWithValue }) => {
        try {
            const res = await api.post("/setting", values);
            successMessage("Settings updated successfully!");
            return res.data.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

export const uploadLog = createAsyncThunk(
    "setting/uploadLog",
    async (values, { rejectWithValue }) => {
        try {
            const res = await api.post(
                "/setting/upload-logo",
                values,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            successMessage("Logo updated successfully!");
            return res.data.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);


const settingSlice = createSlice({
    name: "setting",
    initialState: {
        data: {},
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getSettingData.pending, (state) => {
                state.loading = true;
            })
            .addCase(getSettingData.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(getSettingData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(updateSetting.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateSetting.fulfilled, (state, action) => {
                state.loading = false;
                state.data = {
                    ...state.data,
                    ...action.payload,
                };
            })
            .addCase(updateSetting.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default settingSlice.reducer;
