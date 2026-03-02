import { useEffect, useMemo, useState, useRef } from "react";
import {
    Card,
    Form,
    Button,
    Badge,
    Container,
    Row,
    Col,
    InputGroup,
    ListGroup,
    Spinner
} from "react-bootstrap";
import { HiDownload } from 'react-icons/hi';
import DataTable from "react-data-table-component";
import { IoSearchOutline, IoEyeOutline } from "react-icons/io5";
import { RxDownload } from "react-icons/rx";
import { fetchAllEmployees } from "./slice/employeeSlice";
import { useDispatch, useSelector } from "react-redux";
import { getHistoryWithEmpId, clearHistory, downloadPayslip, viewPayslip } from "../Payroll/slice/payrollSlice";

const EmployeePayrollHistory = () => {

    const dispatch = useDispatch();

    const { employees = [], searchLoading } = useSelector((s) => s.employee);
    const { history = [], loading, downloading, downloadError } = useSelector((state) => state.payroll);
    console.log(history);

    const [searchTerm, setSearchTerm] = useState("");
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);

    const dropdownRef = useRef(null);

    /* ================= FETCH EMPLOYEES ================= */
    useEffect(() => {
        dispatch(fetchAllEmployees());
    }, [dispatch]);

    /* ================= FILTER DROPDOWN ================= */
    useEffect(() => {
        if (searchTerm.trim() && !selectedEmployee) {
            const q = searchTerm.toLowerCase();

            const filtered = employees.filter((emp) =>
                `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(q) ||
                emp.employee_code?.toLowerCase().includes(q)
            );

            setFilteredEmployees(filtered);
            setShowDropdown(true);
        } else {
            setFilteredEmployees([]);
            setShowDropdown(false);
        }
    }, [searchTerm, employees, selectedEmployee]);

    /* ================= SELECT EMPLOYEE ================= */
    const handleEmployeeSelect = (emp) => {
        setSelectedEmployee(emp);
        setSearchTerm(`${emp.first_name} ${emp.last_name}`);
        setShowDropdown(false);

        dispatch(getHistoryWithEmpId(emp.id));
    };

    /* ================= DOWNLOAD PAYSLIP ================= */
    const handleDownloadPayslip = async (id) => {
        try {
            setDownloadingId(id);
            await dispatch(downloadPayslip(id)).unwrap();
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setDownloadingId(null);
        }
    };

    const handleViewPayslip = async (id) => {
        try {
            setDownloadingId(id);
            await dispatch(viewPayslip(id)).unwrap();
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setDownloadingId(null);
        }
    };

    /* ================= CLEAR SELECTION ================= */
    const clearSelection = () => {
        setSelectedEmployee(null);
        setSearchTerm("");
        dispatch(clearHistory());
    };

    /* ================= TABLE COLUMNS ================= */
    const columns = useMemo(() => [
        {
            name: "Payroll Month",
            cell: (row) => {
                const monthNames = [
                    "January", "February", "March", "April",
                    "May", "June", "July", "August",
                    "September", "October", "November", "December"
                ];

                const monthName = monthNames[row.month - 1] || "Unknown";

                return `${monthName} ${row.year}`;
            },
        },
        {
            name: "Gross Salary",
            cell: row => `₹${Number(row.gross_salary || 0).toLocaleString()}`,
        },
        {
            name: "Deductions",
            cell: row => `₹${Number(row.total_deduction || 0).toLocaleString()}`,
        },
        {
            name: "Net Pay",
            cell: row => `₹${Number(row.net_salary || 0).toLocaleString()}`,
        },
        {
            name: "Status",
            cell: row => (
                <Badge bg="success-subtle" text="success" className="fw-semibold rounded-4 px-3 py-1">
                    {row.status}
                </Badge>
            ),
        },
        {
            name: "Actions",
            center: true,
            cell: (row) => (
                <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-primary"
                    onClick={() => handleViewPayslip(row.id)}
                    >
                        <IoEyeOutline />
                    </Button>
                    
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleDownloadPayslip(row.id)}
                        disabled={downloading && downloadingId === row.id}
                        title="Download Payslip"
                    >
                        {downloading && downloadingId === row.id ? (
                            <Spinner animation="border" size="sm" />
                        ) : (
                            <RxDownload />
                        )}
                    </Button>
                </div>
            ),
        },
    ], [downloading, downloadingId]); // Added dependencies

    return (
        <Container fluid className="my-3">

            {/* HEADER */}
            <div className="mt-3">
                <h5 className="mb-0">Employee Payroll History</h5>
                <small>Finalized & Locked Payroll Records</small>
            </div>

            {/* SEARCH SECTION */}
            <Card className="border-0 shadow-sm my-3">
                <Card.Body>
                    <Row className="align-items-center">
                        <Col md={5}>
                            <Form.Label className="fw-semibold">
                                EMPLOYEE <span className="text-danger">*</span>
                            </Form.Label>

                            <div ref={dropdownRef} style={{ position: "relative" }}>
                                <InputGroup>
                                    <Form.Control
                                        placeholder="Enter Employee Name or ID"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setSelectedEmployee(null);
                                        }}
                                        autoComplete="off"
                                    />
                                    <InputGroup.Text>
                                        <IoSearchOutline />
                                    </InputGroup.Text>
                                </InputGroup>

                                {/* Dropdown */}
                                {showDropdown && filteredEmployees.length > 0 && (
                                    <ListGroup
                                        className="position-absolute w-100 shadow-lg"
                                        style={{
                                            zIndex: 1000,
                                            maxHeight: "250px",
                                            overflowY: "auto",
                                            top: "100%",
                                            marginTop: "2px"
                                        }}
                                    >
                                        {filteredEmployees.map((emp) => (
                                            <ListGroup.Item
                                                key={emp.id}
                                                action
                                                onClick={() => handleEmployeeSelect(emp)}
                                            >
                                                <div className="fw-semibold">
                                                    {emp.first_name} {emp.last_name}
                                                </div>
                                                <small className="text-muted">
                                                    {emp.employee_code} | {emp.designation?.name} | {emp.department?.name}
                                                </small>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}

                                {showDropdown && filteredEmployees.length === 0 && (
                                    <ListGroup
                                        className="position-absolute w-100 shadow-lg"
                                        style={{ zIndex: 1000, top: "100%", marginTop: "2px" }}
                                    >
                                        <ListGroup.Item className="text-muted">
                                            No employees found
                                        </ListGroup.Item>
                                    </ListGroup>
                                )}
                            </div>

                            {/* Selected Pill */}
                            {selectedEmployee && (
                                <div className="mt-2 p-2 bg-light rounded small d-flex justify-content-between align-items-center">
                                    <div>
                                        <span className="fw-semibold">
                                            {selectedEmployee.first_name} {selectedEmployee.last_name}
                                        </span>
                                        <span className="text-muted ms-2">
                                            ({selectedEmployee.employee_code})
                                        </span>
                                    </div>
                                    <Button size="sm" variant="outline-danger" onClick={clearSelection}>
                                        Clear
                                    </Button>
                                </div>
                            )}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* TABLE SECTION */}
            <Card className="py-2 border-0 shadow-sm">
                <Card.Body>

                    {!selectedEmployee && (
                        <div className="text-center text-muted py-5 fs-5">
                            🔍 Search and select an employee to view payroll history
                        </div>
                    )}

                    {selectedEmployee && !loading && history.length === 0 && (
                        <div className="text-center text-muted py-5 fs-5">
                            ❌ No payroll records found for this employee
                        </div>
                    )}

                    {selectedEmployee && history.length > 0 && (
                        <DataTable
                            columns={columns}
                            data={history}
                            highlightOnHover
                            responsive
                            pagination
                            noHeader
                        />
                    )}

                    {loading && (
                        <div className="text-center py-4">
                            <Spinner animation="border" />
                        </div>
                    )}

                </Card.Body>
            </Card>
        </Container>
    );
};

export default EmployeePayrollHistory;