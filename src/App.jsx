import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AuthProvider } from './context/AuthContext';

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
import EditEmployee from './pages/Employees/EditEmployee.jsx';
import Permissions from './pages/User/Permissions.jsx';
import PermissionGroupManager from './pages/User/UserPermission.jsx';
import PermissionRoute from './PermissionRoute.jsx'; // ✅ replaces SecurePage
import Error403 from './pages/error/403.jsx';
import Error404 from './pages/error/404.jsx'; // ✅ fixed: was importing 403 for both


// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, checking } = useAuth();

  if (checking) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Login Route Component
const LoginRoute = () => {
  const { isAuthenticated, checking } = useAuth();

  if (checking) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginRoute />} />
      </Route>

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout /> {/* ✅ MainLayout renders <Outlet /> inside it */}
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* No permission needed */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/test" element={<Test />} />
        <Route path="/test2" element={<Test2 />} />

        {/* Attendance */}
        <Route path="/attendance" element={
          <PermissionRoute permission="attendance_correction.read">
            <Attendance />
          </PermissionRoute>
        } />
        <Route path="/attendance/manual" element={
          <PermissionRoute permission="attendance_correction.update">
            <ManualAttendanceCorrection />
          </PermissionRoute>
        } />

        {/* Users & Permissions */}
        <Route path="/permissions" element={
          <PermissionRoute permission="user.read">
            <Permissions />
          </PermissionRoute>
        } />
        <Route path="/settings/:id/fetch-permissions" element={
          <PermissionRoute permission="permission.update">
            <PermissionGroupManager />
          </PermissionRoute>
        } />
        <Route path="/users" element={
          <PermissionRoute permission="user.read">
            <User />
          </PermissionRoute>
        } />

        {/* Employees */}
        <Route path="/employees" element={
          <PermissionRoute permission="staff_directory.read">
            <Employees />
          </PermissionRoute>
        } />
        <Route path="/employees/add" element={
          <PermissionRoute permission="staff_directory.create">
            <AddEmployee />
          </PermissionRoute>
        } />
        <Route path="/employees/edit/:id" element={
          <PermissionRoute permission="user.update">
            <EditEmployee />
          </PermissionRoute>
        } />
        <Route path="/employees/payroll-summary" element={
          <PermissionRoute permission="payroll.read">
            <PayrollSummary />
          </PermissionRoute>
        } />
        <Route path="/employees/payroll-history" element={
          <PermissionRoute permission="employee_payroll_history.read">
            <EmployeePayrollHistory />
          </PermissionRoute>
        } />
        <Route path="/employees/shift-roster" element={
          <PermissionRoute permission="shift_roster.read">
            <ShiftRoster />
          </PermissionRoute>
        } />
        <Route path="/employees/exit" element={
          <PermissionRoute permission="user.delete">
            <EmployeeExit />
          </PermissionRoute>
        } />
        <Route path="/employees/full-final-settlement" element={
          <PermissionRoute permission="settlement.read">
            <EmployeeFinalSettlement />
          </PermissionRoute>
        } />

        {/* Payroll */}
        <Route path="/payroll/process" element={
          <PermissionRoute permission="payroll_processing.read">
            <Payroll />
          </PermissionRoute>
        } />
        <Route path="/payroll/payroll-history" element={
          <PermissionRoute permission="payroll.read">
            <PayrollHistory />
          </PermissionRoute>
        } />
        <Route path="/payroll/slips" element={
          <PermissionRoute permission="payslip.read">
            <SalarySlipDistribution />
          </PermissionRoute>
        } />
        <Route path="/payroll/employee-payslip" element={
          <PermissionRoute permission="payslip.read">
            <Payslip />
          </PermissionRoute>
        } />
        <Route path="/payroll/statutory" element={
          <PermissionRoute permission="statutory.read">
            <StatutoryCompliance />
          </PermissionRoute>
        } />
        <Route path="/payroll/statutory-benefits" element={
          <PermissionRoute permission="statutory.read">
            <StatutoryBenefits />
          </PermissionRoute>
        } />
        <Route path="/payroll/finalization" element={
          <PermissionRoute permission="payroll_finalization.read">
            <PayrollFinalization />
          </PermissionRoute>
        } />
        <Route path="/payroll/salary-structure" element={
          <PermissionRoute permission="salary_structure_revision.read">
            <SalaryStructure />
          </PermissionRoute>
        } />
        <Route path="/payroll/overtime" element={
          <PermissionRoute permission="overtime.read">
            <OvertimeRules />
          </PermissionRoute>
        } />
        <Route path="/payroll/templates" element={
          <PermissionRoute permission="document_template.read">
            <DocumentTemplates />
          </PermissionRoute>
        } />

        {/* Other */}
        <Route path="/reports" element={
          <PermissionRoute permission="report.read">
            <Report />
          </PermissionRoute>
        } />
        <Route path="/leave" element={
          <PermissionRoute permission="leave.read">
            <LeaveManagement />
          </PermissionRoute>
        } />
        <Route path="/settings" element={
          <PermissionRoute permission="setting.read">
            <Setting />
          </PermissionRoute>
        } />
        <Route path="/archived-users" element={
          <PermissionRoute >
            <Archive />
          </PermissionRoute>
        } />
      </Route>

      {/* Error Pages */}
      <Route path="/403" element={<Error403 />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;