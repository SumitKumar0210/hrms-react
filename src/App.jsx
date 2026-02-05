import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import AuthLayout from './layouts/AuthLayout.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import Attendance from './pages/Attendance/Attendance.jsx';
import Employees from './pages/Employees/Employees.jsx';
import User from './pages/user/User.jsx';
import Report from './pages/Report/Report.jsx';
import LeaveManagement from './pages/Leave/Leave.jsx';
import Payroll from './pages/Payroll/Payroll.jsx';
import Setting from './pages/Setting/Setting.jsx';
import Archive from './pages/Archive/Archive.jsx';
import Test from './pages/Test/test.jsx';
import Test2 from './pages/Test/test2.jsx';
import Login from './pages/Auth/Login/Login.jsx';
import MainLayout from './Layouts/MainLayout.jsx';
import AddEmployee from './pages/Employees/AddEmployee.jsx';
import PayrollSummary from './pages/Payroll/PayrollSummary.jsx';
import SalarySlipDistribution from './pages/SalarySlip/SalarySlipDistribution.jsx/';
import PayrollHistory from './pages/Payroll/PayrollHistory.jsx';
import EmployeeExit from './pages/Employees/EmployeeExit.jsx';
import EmployeeFinalSettlement from './pages/Employees/EmployeeFinalSettlement.jsx';
import StatutoryCompliance from './pages/Statutory/StatutoryCompliance.jsx';
import StatutoryBenefits from './pages/Statutory/StatutoryBenefits.jsx';
import Payslip from './pages/SalarySlip/PaySlip.jsx';
import PayrollFinalization from './pages/Payroll/PayrollFinalization.jsx';
import EmployeePayrollHistory from './pages/Employees/EmployeePayrollHistory.jsx';
import ManualAttendanceCorrection from './pages/Attendance/ManualAttendance.jsx';
import ShiftRoster from './pages/Employees/ShiftRoster.jsx';
import SalaryStructure from './pages/Payroll/SalaryStructure.jsx';
import DocumentTemplates from './pages/Payroll/DocumentTemplates.jsx';
import OvertimeRules from './pages/Payroll/OvertimeRules.jsx';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
       
          <Route path="/login" element={<Login />} />
        </Route>
        {/* Protected Routes with Sidebar */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/attendance/manual" element={<ManualAttendanceCorrection />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/employees/add" element={<AddEmployee />} />
          <Route path="/employees/payroll-summary" element={<PayrollSummary />} />
          <Route path="/employees/payroll-history" element={<EmployeePayrollHistory />} />
          <Route path="/employees/shift-roster" element={<ShiftRoster />} />
          <Route path="/payroll/payroll-history" element={<PayrollHistory />} />
          <Route path="/payroll/slips" element={<SalarySlipDistribution />} />
          <Route path="/payroll/employee-payslip" element={<Payslip />} />
          <Route path="/payroll/statutory" element={<StatutoryCompliance />} />
          <Route path="/payroll/statutory-benefits" element={<StatutoryBenefits />} />
          <Route path="/payroll/finalization" element={<PayrollFinalization />} />
          <Route path="/payroll/salary-structure" element={<SalaryStructure />} />
          <Route path="/payroll/overtime" element={<OvertimeRules />} />
          <Route path="/employees/full-final-settlement" element={<EmployeeFinalSettlement />} />
          <Route path="/payroll/templates" element={<DocumentTemplates />} />
          <Route path="/employees/exit" element={<EmployeeExit />} />
          <Route path="/users" element={<User />} />
          <Route path="/reports" element={<Report />} />
          <Route path="/leave" element={<LeaveManagement />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/settings" element={<Setting />} />
          <Route path="/archived-users" element={<Archive />} />
          <Route path="/test" element={<Test />} />
          <Route path="/test2" element={<Test2 />} />
         
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;