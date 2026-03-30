import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../pages/Auth/authSlice';
import employeeReducer from '../pages/Employees/slice/employeeSlice';
import attendanceReducer from '../pages/Attendance/slice/attendanceSlice';
import salaryStructureReducer from '../pages/Payroll/slice/salaryStructureSlice';
import departmentReducer from '../pages/Setting/slice/departmentSlice';
import shiftReducer from '../pages/Setting/slice/shiftSlice';
import settingReducer from '../pages/Setting/slice/settingSlice';
import designationReducer from '../pages/Setting/slice/designationSlice';
import overtimeReducer from '../pages/Payroll/slice/overtimeSlice';
import payrollReducer from '../pages/Payroll/slice/payrollSlice';
import manualAttendanceReducer from '../pages/Attendance/slice/manualAttendanceSlice';
import templateVariableReducer from '../pages/Payroll/slice/templateVariableSlice';
import documentTemplateReducer from '../pages/Payroll/slice/documentTemplateSlice';
import finalizePayrollReducer from '../pages/Payroll/slice/finalizePayrollSlice';
import payrollHistoryReducer from '../pages/Payroll/slice/payrollHistorySlice';
import paymentReducer from '../pages/Payroll/slice/paymentSlice';
import mailReducer from '../pages/Employees/slice/mailSlice';
import userReducer from '../pages/user/slice/userSlice';
import userPermissionsReducer from '../pages/User/slice/userPermissionsSlice';
import roleReducer from '../pages/Setting/slice/roleSlice';

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
    overtime: overtimeReducer,
    payroll: payrollReducer,
    manualAttendance: manualAttendanceReducer,
    templateVariable: templateVariableReducer,
    documentTemplate: documentTemplateReducer,
    finalizePayroll: finalizePayrollReducer,
    payrollHistory: payrollHistoryReducer,
    payment: paymentReducer,
    mail: mailReducer,
    user: userReducer,
    userPermissions: userPermissionsReducer,
    role: roleReducer,
  },
});

export default store;