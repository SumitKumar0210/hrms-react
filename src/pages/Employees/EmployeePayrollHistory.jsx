import { useEffect, useMemo, useState } from "react";
import {
    Card,
    Form,
    Button,
    Badge,
    Container,
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import { IoEyeOutline } from "react-icons/io5";
import { RxDownload } from "react-icons/rx";

const payrollHistoryData = [
    {
        id: 1,
        name: 'Rohit Verma',
        empId: 'EMP004',
        payrollMonth: 'January 2026',
        grossSalary: 18500,
        deductions: 1200,
        netPay: 18500,
        status: 'Paid',
    },
    {
        id: 2,
        name: 'Rohit Verma',
        empId: 'EMP004',
        payrollMonth: 'December 2025',
        grossSalary: 12000,
        deductions: 1200,
        netPay: 12000,
        status: 'Paid',
    },
    {
        id: 3,
        name: 'Nikhil Pandey',
        empId: 'EMP005',
        payrollMonth: 'November 2025',
        grossSalary: 12000,
        deductions: 1200,
        netPay: 12000,
        status: 'Paid',
    },
    {
        id: 4,
        name: 'Nikhil Pandey',
        empId: 'EMP005',
        payrollMonth: 'November 2025',
        grossSalary: 12000,
        deductions: 1200,
        netPay: 12000,
        status: 'Paid',
    },
    {
        id: 5,
        name: 'Nikhil Pandey',
        empId: 'EMP005',
        payrollMonth: 'November 2025',
        grossSalary: 12000,
        deductions: 1200,
        netPay: 12000,
        status: 'Paid',
    },
];


const EmployeePayrollHistory = () => {
    const [data] = useState(payrollHistoryData);
    const [filteredData, setFilteredData] = useState(payrollHistoryData);
    const [search, setSearch] = useState("");

    /* ================= SEARCH ================= */

    useEffect(() => {
        const result = data.filter(row =>
            row.payrollMonth.toLowerCase().includes(search.toLowerCase()) ||
            row.name.toLowerCase().includes(search.toLowerCase()) ||
            row.empId.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredData(result);
    }, [search, data]);

    /* ================= TABLE COLUMNS ================= */

    const columns = useMemo(() => [
        {
            name: "Payroll Month",
            selector: row => row.payrollMonth,
        },
        {
            name: "Gross Salary",
            cell: row => `₹${row.grossSalary.toLocaleString()}`,
        },
        {
            name: "Deductions",
            cell: row => `₹${row.deductions.toLocaleString()}`,
        },
        {
            name: "Net Pay",
            cell: row => `₹${row.netPay.toLocaleString()}`,
        },
        {
            name: "Status",
            cell: row => (
                <Badge bg="success-subtle" text="success" className="fw-semibold border-success rounded-4 px-3 py-1">
                    {row.status}
                </Badge>
            ),
        },
        {
            name: "Actions",
            center: true,
            cell: () => (
                <div className="d-flex gap-3">
                    <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => handleView(row)}
                    >
                        <IoEyeOutline />
                    </Button>

                    <Button size="sm" variant="outline-secondary">
                        <RxDownload />
                    </Button>
                </div>

            ),
        },
    ], []);

    /* ================= UI ================= */

    return (
        <Container fluid className="my-3">
            {/* HEADER */}
            <div className="mt-3">
                <h5 className="mb-0">Employee Payroll History</h5>
                <small>Finalized & Locked Payroll Records</small>
            </div>
            {/* SEARCH BAR */}
            <Card className="border-0 shadow-sm my-3">
                <Card.Body>
                    <div className="d-flex align-items-center gap-3">
                        <span className="text-muted fw-semibold">Select Employee:</span>
                        <Form.Control
                            placeholder="Search by Employee name or ID"
                            style={{ maxWidth: 320 }}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {/* <Button variant="outline-primary">Search</Button> */}
                    </div>

                    {/* TABLE */}

                </Card.Body>
            </Card>
            {/* TABLE */}
            {/* TABLE / MESSAGE */}
<Card className="py-2 border-0 shadow-sm custom-data-table">
    <Card.Body>
        {/* No search */}
        {!search && (
            <div className="text-center text-muted py-5 fs-5">
                🔍 Search employee name or ID to view payroll history
            </div>
        )}

        {/* Search but no results */}
        {search && filteredData.length === 0 && (
            <div className="text-center text-muted py-5 fs-5">
                ❌ No payroll records found for <strong>"{search}"</strong>
            </div>
        )}

        {/* Search with results */}
        {search && filteredData.length > 0 && (
            <>
                <div className="mb-2">
                    <p className="mb-3 fw-semibold fs-6">
                        Employee: {filteredData[0].name} ({filteredData[0].empId})
                    </p>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredData}
                    highlightOnHover
                    responsive
                    pagination
                    noHeader
                />
            </>
        )}
    </Card.Body>
</Card>

        </Container>

    );
};

export default EmployeePayrollHistory;
