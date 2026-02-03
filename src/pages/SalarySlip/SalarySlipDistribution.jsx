import { useEffect, useMemo, useState, forwardRef } from 'react';
import { Card, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import { BsCalendar3 } from 'react-icons/bs';
import { IoEyeOutline } from "react-icons/io5";
import { BsSend } from "react-icons/bs";
import { SlRefresh } from "react-icons/sl";
import { useNavigate } from 'react-router-dom';


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
        emailStatus: 'Sent',
        employeeName: 'Sarah Johnson',
        employeeId: 'EMP001',
        department: 'Housekeeping',
        employmentType: 'Full-Time',
        emailID: 'sarah.johnson@company.com',
        netSalary: 18500,
        salarySlipGenerated: true,
        emailSendTime: '2026-01-15 09:00 AM',

    },
    {
        id: 2,
        emailStatus: 'Pending',
        employeeName: 'Priya Singh',
        employeeId: 'EMP002',
        department: 'Front Desk',
        employmentType: 'Part-Time',
        emailID: 'priya.singh@company.com',
        netSalary: 12000,
        salarySlipGenerated: true,
        emailSendTime: '2026-01-15 09:30 AM',
    },
    {
        id: 3,
        emailStatus: 'Failed',
        employeeName: 'Amit Sharma',
        employeeId: 'EMP004',
        department: 'Food & Beverage',
        employmentType: 'Contract',
        emailID: 'amit.sharma@company.com',
        netSalary: 5000,
        salarySlipGenerated: false,
        emailSendTime:'2026-01-15 10:00 AM',
    },
];

/* ================= STATS ================= */

const stats = [
    {
        title: 'Total Employees',
        value: 350,
        color: 'primary',
    },
    {
        title: 'Salary Slips Generated',
        value: '280',
        color: 'success',
    },
    {
        title: 'Emails Sent',
        value: '50',
        color: 'info',
    },
    {
        title: 'Pending Emails',
        value: '20',
        color: 'warning',
    },
];

/* ================= COMPONENT ================= */

const SalarySlipDistribution = () => {
    const [data, setData] = useState(complianceData);
    const [filteredData, setFilteredData] = useState(complianceData);
    const [search, setSearch] = useState('');
    const [loading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const navigate = useNavigate();
    /* ================= SEARCH ================= */

    useEffect(() => {
        const result = data.filter(row =>
            row.employeeName.toLowerCase().includes(search.toLowerCase()) ||
            row.employeeId.toLowerCase().includes(search.toLowerCase()) ||
            row.employmentType.toLowerCase().includes(search.toLowerCase()) ||
            row.department.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredData(result);
    }, [search, data]);


    /* ================= COLUMNS ================= */

    const columns = useMemo(() => [
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
            name: 'Employment Type',
            selector: row => row.employmentType,
            wrap: true,
        },
        {
            name: 'Email ID',
            selector: row => row.emailID,
            sortable: true,
        },
        {
            name: 'Net Salary',
            selector: row => row.netSalary,
            sortable: true,
            cell: row => `₹${row.netSalary.toLocaleString()}`,
        },
        {
            name: 'Salary Slip',
            selector: row => row.salarySlipGenerated,
            sortable: true,
            cell: row => (
                row.salarySlipGenerated ? (
                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-4 fw-semibold" style={{ minWidth: 90 }}>
                    Generated
                </span>
                ) : (
                <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-4 fw-semibold" style={{ minWidth: 90 }}>
                    Not Generated
                </span>
                )
            )
        },

       {
            name: 'Email Status',
            selector: row => row.emailStatus,
            sortable: true,
            cell: row => {
                const statusMap = {
                Sent: 'success',
                Pending: 'warning',
                Failed: 'danger',
                };

                const color = statusMap[row.emailStatus] || 'secondary';

                return (
                <span className={`badge bg-${color}-subtle text-${color} border border-${color}-subtle rounded-4 fw-semibold`} style={{ minWidth: 60 }}>
                    {row.emailStatus}
                </span>
                );
            },
        },
         {
            name: 'Email Status Time',
            selector: row => row.emailSendTime,
            sortable: true,
        },

       {
  name: 'Actions',
  cell: row => (
    <div className="d-flex gap-2">
      <Button
        size="sm"
        variant="outline-primary"
        onClick={() => navigate('/payroll/employee-payslip')}
      >
        <IoEyeOutline />
      </Button>

      <Button size="sm" variant="outline-info">
        <BsSend />
      </Button>

      <Button size="sm" variant="outline-warning">
        <SlRefresh />
      </Button>
    </div>
  ),
}
    ], []);
    //Selected rows
    const handleSelectedRows = ({ selectedRows }) => {
        setSelectedRows(selectedRows);
    };
    /* ================= UI ================= */

    return (
        <div className="container-fluid g-0">
            {/* Header */}
            <div className="mt-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                    <h5 className="mb-0">Salary Slip Distribution</h5>
                    <small>Last Updated: 15th January 2026 at 10:30 AM</small>
                </div>

                <div className="d-flex gap-3">
                    <Button variant="success" size="sm">
                        January 2026
                    </Button>
                    <Button variant="primary" size="sm">
                        Generate Salary Slips
                    </Button>
                    <Button variant="secondary" size="sm">
                        Download Zip
                    </Button>

                </div>
            </div>

            {/* Stats */}
            <div className="d-flex gap-3 mt-3 flex-wrap">
                {stats.map((item, i) => (
                    <Card
                        key={i}
                        className={`flex-fill border-${item.color} bg-${item.color}-subtle `}
                        style={{ minWidth: 220 }}
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
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="mb-0">Employees</h5>
                        <div className='d-flex align-items-center justify-content-end gap-3 w-50'>
                            <Button variant="warning" size="sm" className='text-nowrap'>
                                Send Via Bulk Email
                            </Button>

                            <Form.Control
                                style={{ maxWidth: 350 }}
                                placeholder="Search by Department, Name or ID, Employment Type"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                    </div>

                    <DataTable
                        columns={columns}
                        data={filteredData}
                        pagination
                        highlightOnHover
                        responsive
                        selectableRows
                        onSelectedRowsChange={handleSelectedRows}
                        persistTableHead
                        progressPending={loading}
                    />
                </Card.Body>
            </Card>


        </div>
    );
};

export default SalarySlipDistribution;
