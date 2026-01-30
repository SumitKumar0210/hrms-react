import { useEffect, useMemo, useState, forwardRef } from 'react';
import { Card, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import { BsCalendar3 } from 'react-icons/bs';
import { IoEyeOutline } from "react-icons/io5";
import { BsSend } from "react-icons/bs";
import { RxDownload } from "react-icons/rx";
import { VscCalendar } from "react-icons/vsc";
import { ImDownload3 } from "react-icons/im";



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
        status: 'Locked',
        payrollMonth: 'January 2026',
        payrollId: 'PR-2026-01',
        cycle: 'Monthly',
        employeesPaid: '200',
        emailID: 'sarah.johnson@company.com',
        totalPayout: 18500,
        pfAmount: 1800,
        esicAmount: 500,
        salarySlipGenerated: true,
        finalizedBy: 'Rajesh Kumar',
        statusTime: '2026-01-15 09:00 AM',

    },
    {
        id: 2,
        status: 'Locked',
        payrollMonth: 'December 2025',
        payrollId: 'PR-2025-12',
        cycle: 'Monthly',
        employeesPaid: '250',
        emailID: 'priya.singh@company.com',
        totalPayout: 12000,
        pfAmount: 1200,
        esicAmount: 400,
        salarySlipGenerated: true,
        finalizedBy: 'Rajesh Kumar',
        statusTime: '2026-01-15 09:30 AM',
    },
    {
        id: 3,
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
        statusTime:'2026-01-15 10:00 AM',
    },
];

/* ================= STATS ================= */

const stats = [
    {
        title: 'Total Employees Paid',
        value: 350,
        color: 'primary',
    },
    {
        title: 'Total Salary Disbursed',
        value: '₹28,00,000',
        color: 'success',
    },
    {
        title: 'PF Contributions',
        value: '₹50,000',
        color: 'info',
    },
    {
        title: 'ESIC Contributions',
        value: '₹20,000',
        color: 'secondary',
    },
];

/* ================= COMPONENT ================= */

const PayrollHistory = () => {
    const [data, setData] = useState(complianceData);
    const [filteredData, setFilteredData] = useState(complianceData);
    const [search, setSearch] = useState('');
    const [loading] = useState(false);
    // const [selectedRows, setSelectedRows] = useState([]);
    /* ================= SEARCH ================= */

    useEffect(() => {
        const result = data.filter(row =>
            row.payrollMonth.toLowerCase().includes(search.toLowerCase()) ||
            row.payrollId.toLowerCase().includes(search.toLowerCase()) ||
            row.finalizedBy.toLowerCase().includes(search.toLowerCase()) ||
            row.cycle.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredData(result);
    }, [search, data]);


    /* ================= COLUMNS ================= */

    const columns = useMemo(() => [
        {
            name: 'Payroll Month',
            selector: row => row.payrollMonth,
            sortable: true,
            cell: row => (
                <div>
                    <div className="fw-semibold">{row.payrollMonth}</div>
                    <small className="text-muted">{row.payrollId}</small>
                </div>
            ),
        },
        {
            name: 'Cycle',
            selector: row => row.cycle,
            wrap: true,
        },
        {
            name: 'Employees Paid',
            selector: row => row.employeesPaid,
            wrap: true,
        },
        {
            name: 'Total Payout',
            selector: row => row.totalPayout,
            sortable: true,
            cell: row => `₹${row.totalPayout.toLocaleString()}`,
        },
        {
            name: 'PF Amount',
            selector: row => row.pfAmount,
            sortable: true,
            cell: row => `₹${row.pfAmount.toLocaleString()}`,
        },
        {
            name: 'ESIC Amount',
            selector: row => row.esicAmount,
            sortable: true,
            cell: row => `₹${row.esicAmount.toLocaleString()}`,
        },
        
       
         {
            name: 'Finalized By',
            selector: row => row.finalizedBy,
            sortable: true,
        },
         {
            name: 'Finalized On',
            selector: row => row.statusTime,
            sortable: true,
        },
         {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
        },

        {
            name: 'Actions',
            cell: row => (
                <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-primary">
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
    //Selected rows
    // const handleSelectedRows = ({ selectedRows }) => {
    //     setSelectedRows(selectedRows);
    // };
    /* ================= UI ================= */

    return (
        <div className="container-fluid g-0">
            {/* Header */}
            <div className="mt-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                    <h5 className="mb-0">Payroll History</h5>
                    <small>View Finalized Payroll Records and Locked</small>
                </div>

                <div className="d-flex align-items-center gap-1">
                    <p className='mb-0 fs-14'>Payroll Month:</p>
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
                        <h5 className="mb-0">Pre Finalized Payroll Records</h5>
                        <div className='d-flex align-items-center justify-content-end gap-3 w-50'>
                            <Form.Control
                                style={{ maxWidth: 350 }}
                                placeholder="Search by Payroll Month or Id, Cycle, Finalized by"
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
                        // selectableRows
                        // onSelectedRowsChange={handleSelectedRows}
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
      
    <p className='mb-0 text-center fs-13'><strong>Compliance Notice:</strong> Payroll records for Statutory and audit purposes are locked and cannot be modified.</p>
      
    </Alert>
  </div>
</div>

        </div>
    );
};

export default PayrollHistory;
