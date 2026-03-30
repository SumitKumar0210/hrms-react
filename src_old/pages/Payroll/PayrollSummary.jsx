import { useEffect, useMemo, useState, forwardRef } from 'react';
import { Card, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import { BsCalendar3 } from 'react-icons/bs';

/* ================= DATE INPUT ================= */

const DateInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <InputGroup onClick={onClick} className="w-100">
    <Form.Control ref={ref} value={value} readOnly placeholder={placeholder} />
    <InputGroup.Text>
      <BsCalendar3 />
    </InputGroup.Text>
  </InputGroup>
));

/* ================= VALIDATION ================= */

const filterSchema = Yup.object({
  startDate: Yup.date().nullable(),
  endDate: Yup.date()
    .nullable()
    .min(Yup.ref('startDate'), 'End date must be after start date'),
  department: Yup.string(),
  staff: Yup.string(),
  status: Yup.string(),
});

/* ================= TABLE DATA (SCREENSHOT) ================= */

const complianceData = [
  {
    id: 1,
    status: 'PF & ESIC Thresholds Applied',
    employeeName: 'Sarah Johnson',
    employeeId: 'EMP001',
    department: 'Housekeeping',
    grossWages: 18500,
    pfEmployee: 1800,
    pfEmployer: 1800,
    esicEmployee: 139,
    esicEmployer: 601,
    totalDeduction: 4340,
  },
  {
    id: 2,
    status: 'PF & ESIC Thresholds Applied',
    employeeName: 'Priya Singh',
    employeeId: 'EMP002',
    department: 'Front Desk',
    grossWages: 12000,
    pfEmployee: 1440,
    pfEmployer: 1440,
    esicEmployee: 90,
    esicEmployer: 390,
    totalDeduction: 3360,
  },
  {
    id: 3,
    status: 'PF & ESIC Thresholds Applied',
    employeeName: 'Amit Sharma',
    employeeId: 'EMP004',
    department: 'Food & Beverage',
    grossWages: 5000,
    pfEmployee: 10000,
    pfEmployer: 200,
    esicEmployee: 4440,
    esicEmployer: 550,
    totalDeduction: 770,
  },
];

/* ================= STATS ================= */

const stats = [
  {
    title: 'Total Staff',
    value: 350,
    color: 'primary',
    bg: 'rgba(13,110,253,0.08)',
  },
  {
    title: 'Total PF (Emp + Employer)',
    value: '₹19,272',
    color: 'success',
    bg: 'rgba(25,135,84,0.08)',
  },
  {
    title: 'Total ESIC (Emp + Employer)',
    value: '₹2,760',
    color: 'warning',
    bg: 'rgba(255, 253, 230, 0.8)',
  },
];

/* ================= COMPONENT ================= */

const PayrollSummary = () => {
  const [data, setData] = useState(complianceData);
  const [filteredData, setFilteredData] = useState(complianceData);
  const [search, setSearch] = useState('');
  const [loading] = useState(false);

  /* ================= SEARCH ================= */

  useEffect(() => {
    const result = data.filter(row =>
      row.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      row.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      row.department.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredData(result);
  }, [search, data]);


  /* ================= COLUMNS ================= */

  const columns = useMemo(() => [
    {
      name: 'Status',
      selector: row => row.status,
      wrap: true,
    },
    {
      name: 'Employee Name',
      selector: row => row.employeeName,
      sortable: true,
      cell: row => (
        <div>
          <div className="fw-semibold">{row.employeeName}</div>
          <small className="text-muted">{row.employeeId}</small>
        </div>
      ),
    },
    {
      name: 'Department',
      selector: row => row.department,
      wrap: true,
    },
    {
      name: 'Gross Wages',
      selector: row => row.grossWages,
      sortable: true,
      cell: row =>
        row.grossWages ? `₹${row.grossWages.toLocaleString()}` : '-',
    },
    {
      name: 'PF Employee',
      selector: row => row.pfEmployee,
      cell: row => `₹${row.pfEmployee.toLocaleString()}`,
    },
    {
      name: 'PF Employer',
      selector: row => row.pfEmployer,
      cell: row => `₹${row.pfEmployer.toLocaleString()}`,
    },
    {
      name: 'ESIC Employee',
      selector: row => row.esicEmployee,
      cell: row => `₹${row.esicEmployee.toLocaleString()}`,
    },
    {
      name: 'ESIC Employer',
      selector: row => row.esicEmployer,
      cell: row => `₹${row.esicEmployer.toLocaleString()}`,
    },
    {
      name: 'Total Deduction',
      selector: row => row.totalDeduction,
      sortable: true,
      cell: row => (
        <span className="text-danger">
          ₹{row.totalDeduction.toLocaleString()}
        </span>
      ),
    },
  ], []);

  /* ================= UI ================= */

  return (
    <div className="container-fluid g-0">
      {/* Header */}
      <div className="mt-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h5 className="mb-0">Payroll Summary</h5>
          <small>Monitor and manage hotel staff compliance</small>
        </div>

        <div className="d-flex gap-3">
          <Button variant="outline-secondary" size="sm">
            Export
          </Button>
          <Button variant="success" size="sm">
            January 2026
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="d-flex gap-3 mt-3 flex-wrap">
        {stats.map((item, i) => (
          <Card
            key={i}
            className={`flex-fill border-${item.color}`}
            style={{ backgroundColor: item.bg, minWidth: 220 }}
          >
            <Card.Body>
              <h6 className={`mb-1 text-${item.color}`}>{item.title}</h6>
              <h4 className={`mb-0 text-${item.color}`}>{item.value}</h4>
            </Card.Body>
          </Card>
        ))}
      </div>
      {/* Table */}
      <Card className="shadow-sm border-0 mt-4 custom-data-table">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Employees</h5>
            <Form.Control
              style={{ maxWidth: 250 }}
              placeholder="Search by Department, Name or ID"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            highlightOnHover
            responsive
            persistTableHead
            progressPending={loading}
          />
        </Card.Body>
      </Card>
      <div className="position-fixed bottom-0 start-0 w-100 mb-2" style={{ zIndex: 1050, paddingLeft:'65px' }}>
  <div className="container-fluid">
    <Alert
      variant="warning"
      className="mb-0 py-2 border rounded-3 shadow-sm"
      style={{ backgroundColor: '#fffde6' }}
    >
      <div className="fw-semibold mb-1 fs-14">
        Statutory Limits (2025)
      </div>

      <div className="d-flex flex-wrap gap-4 text-muted fs-13">
        <span>PF Wage Ceiling (₹15,000)</span>
        <span>ESIC Wage Ceiling (₹21,000)</span>
        <span>PF Contribution (Each) (12%)</span>
        <span>ESIC Employee (0.75%)</span>
        <span>ESIC Employer (3.25%)</span>
      </div>
    </Alert>
  </div>
</div>


    </div>
  );
};

export default PayrollSummary;
