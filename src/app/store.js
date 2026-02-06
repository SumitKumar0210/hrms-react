import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../pages/Auth/authSlice';
import employeeReducer from '../pages/Employees/slice/employeeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employee: employeeReducer,
  },
});

export default store;