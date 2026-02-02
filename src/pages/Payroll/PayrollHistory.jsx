import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Form,
  Button,
  Alert,
  Offcanvas,
  Badge
} from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { IoEyeOutline, IoLockClosedOutline } from "react-icons/io5";
import { VscCalendar } from "react-icons/vsc";
import { ImDownload3 } from "react-icons/im";
import { RxDownload } from "react-icons/rx";
import { RiFileList3Line } from "react-icons/ri";


/* ================= MOCK DATA ================= */

const complianceData = [
  {
    id: 1,
    status: 'Locked',
    payrollMonth: 'January 2026',
    payrollId: 'PR-2026-01',
    cycle: 'Monthly',
    employeesPaid: 247,
    totalPayout: 18945650,
    pfAmount: 1895420,
    esicAmount: 284318,
    finalizedBy: 'Rajesh Kumar',
    statusTime: '2026-02-03 14:35',
  },
  {
    id: 2,
    status: 'Locked',
    payrollMonth: 'December 2025',
    payrollId: 'PR-2025-12',
    cycle: 'Monthly',
    employeesPaid: 250,
    totalPayout: 12000000,
    pfAmount: 1200000,
    esicAmount: 400000,
    finalizedBy: 'Rajesh Kumar',
    statusTime: '2026-01-15 09:30',
  },
  { id: 3, 
    status: 'Locked', 
    payrollMonth: 'November 2025', 
    payrollId: 'PR-2025-11', 
    cycle: 'Yearly', 
    employeesPaid: '300', 
    emailID: 'amit.sharma@company.com', 
    totalPayout: 5000, 
    pfAmount: 1800, 
    esicAmount: 500, 
    salarySlipGenerated: false, 
    finalizedBy: 'Suresh Kumar', 
    statusTime:'2026-01-15 10:00 AM', },
];

/* ================= STATS ================= */

const stats = [
  {
    title: 'Total Employees Paid',
    value: '497',
    color: 'primary',
  },
  {
    title: 'Total Salary Disbursed',
    value: '₹3,09,45,650',
    color: 'success',
  },
  {
    title: 'PF Contributions',
    value: '₹30,95,420',
    color: 'info',
  },
  {
    title: 'ESIC Contributions',
    value: '₹6,84,318',
    color: 'secondary',
  },
];

/* ================= COMPONENT ================= */

const PayrollHistory = () => {
  const [data] = useState(complianceData);
  const [filteredData, setFilteredData] = useState(complianceData);
  const [search, setSearch] = useState('');

  const [showSummary, setShowSummary] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  /* ================= SEARCH ================= */

  useEffect(() => {
    const result = data.filter(row =>
      row.payrollMonth.toLowerCase().includes(search.toLowerCase()) ||
      row.payrollId.toLowerCase().includes(search.toLowerCase()) ||
      row.finalizedBy.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredData(result);
  }, [search, data]);

  /* ================= VIEW HANDLER ================= */

  const handleView = (row) => {
    setSelectedPayroll(row);
    setShowSummary(true);
  };

  /* ================= TABLE COLUMNS ================= */

  const columns = useMemo(() => [
    {
      name: 'Payroll Month',
      cell: row => (
        <div>
          <div className="fw-semibold">{row.payrollMonth}</div>
          <small className="text-muted">{row.payrollId}</small>
        </div>
      ),
    },
    { name: 'Cycle', selector: row => row.cycle },
    { name: 'Employees Paid', selector: row => row.employeesPaid },
    {
      name: 'Total Payout',
      cell: row => `₹${row.totalPayout.toLocaleString()}`
    },
    {
      name: 'PF Amount',
      cell: row => `₹${row.pfAmount.toLocaleString()}`
    },
    {
      name: 'ESIC Amount',
      cell: row => `₹${row.esicAmount.toLocaleString()}`
    },
    { name: 'Finalized By', selector: row => row.finalizedBy },
    { name: 'Finalized On', selector: row => row.statusTime },
    {
      name: 'Actions',
      cell: row => (
        <div className="d-flex gap-2">
          <Button
            size="sm"
            variant="outline-primary"
            onClick={() => handleView(row)}
          >
            <IoEyeOutline />
          </Button>
          <Button size="sm" variant="outline-secondary">
            <VscCalendar />
          </Button>
          <Button size="sm" variant="outline-warning">
            <ImDownload3 />
          </Button>
        </div>
      ),
    },
  ], []);

  /* ================= UI ================= */

  return (
    <div className="container-fluid g-0">

      {/* HEADER */}
      <div className="mt-3">
        <h5 className="mb-0">Payroll History</h5>
        <small>Finalized & Locked Payroll Records</small>
      </div>

      {/* ================= STATS ================= */}
      <div className="d-flex gap-3 mt-3 flex-wrap">
        {stats.map((item, i) => (
          <Card
            key={i}
            className={`flex-fill border-${item.color} bg-${item.color}-subtle`}
            style={{ minWidth: 220 }}
          >
            <Card.Body>
              <h6 className={`mb-1 text-${item.color}`}>{item.title}</h6>
              <h4 className={`mb-0 text-${item.color}`}>{item.value}</h4>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* TABLE */}
      <Card className="mt-4 border-0 shadow-sm custom-data-table">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Payroll Records</h6>
            <Form.Control
              style={{ maxWidth: 350 }}
              placeholder="Search payroll..."
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
          />
        </Card.Body>
      </Card>

      {/* BOTTOM NOTICE */}
      <div className="position-fixed bottom-0 start-0 w-100 mb-2" style={{paddingLeft:'65px'}}>
        <div className="container-fluid">
          <Alert
            variant="warning"
            className="mb-0 py-2 text-center shadow-sm"
            style={{ backgroundColor: '#fffde6' }}
          >
            <strong>Compliance Notice:</strong> Payroll records are locked and cannot be modified.
          </Alert>
        </div>
      </div>

      {/* ================= OFFCANVAS ================= */}

      <Offcanvas
        show={showSummary}
        onHide={() => setShowSummary(false)}
        placement="end"
        style={{ width: 380, zIndex: 1060 }}
      >
        <Offcanvas.Header closeButton className='border-bottom'>
          <Offcanvas.Title className="fw-semibold">
            Payroll Summary <IoLockClosedOutline className="ms-1 text-muted" />
            <small className="text-muted d-block mt-1">PR-2026-01</small>

          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body>
          {selectedPayroll && (
            <>
              <div className="d-flex gap-2 flex-wrap mb-3">
                <Badge bg="primary-subtle" text="primary" className="px-3 py-2 rounded-pill fw-semibold">
                  {selectedPayroll.payrollMonth}
                </Badge>
                <Badge bg="success-subtle" text="success" className="px-3 py-2 rounded-pill fw-semibold">
                  {selectedPayroll.employeesPaid} Employees Paid
                </Badge>
              </div>

              <div className="border rounded p-3 mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className='fs-14'>Total Payout</span>
                  <strong className='fw-semibold fs-14'>₹{selectedPayroll.totalPayout.toLocaleString()}</strong>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className='fs-14'>PF Liability</span>
                  <strong className='fw-semibold fs-14'>₹{selectedPayroll.pfAmount.toLocaleString()}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className='fs-14'>ESIC Liability</span>
                  <strong className='fw-semibold fs-14'>₹{selectedPayroll.esicAmount.toLocaleString()}</strong>
                </div>
              </div>

      
              <Alert variant="warning-subtle" className="small" style={{ backgroundColor: '#fffde6' }}>
               <ul className="mb-0 list-unstyled small verification-checklist">
                    <li className="mb-2">
                        <Form.Check type="checkbox" label="Attendance verified & approved" defaultChecked />
                    </li>
                    <li className="mb-2">
                        <Form.Check type="checkbox" label="PF contribution calculated" />
                    </li>
                    <li className="mb-2">
                        <Form.Check type="checkbox" label="ESIC contribution calculated" />
                    </li>
                    <li className="mb-2">
                        <Form.Check type="checkbox" label="Salary slips generated" />
                    </li>
                    <li className="mb-2">
                        <Form.Check type="checkbox" label="Compliance Requirement" />
                    </li>
                    <li className="mb-2">
                        <Form.Check type="checkbox" label="Management approval received" />
                    </li>
                </ul>

              </Alert>

              <div className="small text-muted mb-4">
                <div className='mb-1'><strong>Reference ID:</strong> {selectedPayroll.payrollId}</div>
                <div className='mb-1'><strong>Finalized By:</strong> {selectedPayroll.finalizedBy}</div>
                <div className='mb-1'><strong>Finalized On:</strong> {selectedPayroll.statusTime}</div>
              </div>

              <Button variant="success" className="w-100 mb-2 btn-sm">
                <RxDownload className="me-1" /> Download Complete Report
              </Button>
              <Button variant="secondary" className="w-100 btn-sm">
                <RiFileList3Line className="me-1" /> View All Salary Slips
              </Button>
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default PayrollHistory;
