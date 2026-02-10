import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";
import { successMessage, errorMessage, getErrorMessage } from "../../../toast";

export const updateSalary = createAsyncThunk(
    "salaryStructure/updateSalary",
    async (values, { rejectWithValue }) => {
        try {
            const res = await api.get(`/salary/update`, values);
            return res.data;
        } catch (error) {
            const errMsg = getErrorMessage(error);
            errorMessage(errMsg);
            return rejectWithValue(errMsg);
        }
    }
);

const salaryStructureSlice = createSlice({
 name:'salaryStructure',
 initialState:{
    data:null,
    error:null,
    loading:false
 },
 reducers:{},
 extraReducers:(builder)=>{
    builder
 }
});

export default salaryStructureSlice.reducer;