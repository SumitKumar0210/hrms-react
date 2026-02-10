import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../pages/Auth/authSlice';
import employeeReducer from '../pages/Employees/slice/employeeSlice';
import attendanceReducer from '../pages/Attendance/slice/attendanceSlice';
import salaryStructureReducer from '../pages/Payroll/slice/salaryStructureSlice';
import departmentReducer from '../pages/Setting/slice/departmentSlice';
import shiftReducer from '../pages/Setting/slice/shiftSlice';
import settingReducer from '../pages/Setting/slice/settingSlice';
import designationReducer from '../pages/Setting/slice/designationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employee: employeeReducer,
    attendance: attendanceReducer,
    salaryStructure: salaryStructureReducer,
    department: departmentReducer,
    shift: shiftReducer,
    setting: settingReducer,
    designation: designationReducer,
  },
});

export default store;