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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, checking } = useAuth();

  // Show loading while checking authentication
  if (checking) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected component
  return children;
};

// Login Route Component (redirect if already logged in)
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

      {/* Protected Routes with Sidebar */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/attendance/manual" element={<ManualAttendanceCorrection />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/add" element={<AddEmployee />} />
        <Route path="/employees/edit/:id" element={<EditEmployee />} />
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

      {/* Catch all - redirect to dashboard if authenticated, login if not */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
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