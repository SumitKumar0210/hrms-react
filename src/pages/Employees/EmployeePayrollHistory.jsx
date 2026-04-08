import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
    Card, Form, Button, Badge, Container,
    Row, Col, InputGroup, ListGroup, Spinner
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import { IoSearchOutline, IoEyeOutline } from "react-icons/io5";
import { BsCreditCard } from "react-icons/bs";
import { RxDownload, RxEnvelopeClosed } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";

import { fetchAllEmployees } from "./slice/employeeSlice";
import { getHistoryWithEmpId, clearHistory, downloadPayslip, viewPayslip } from "../Payroll/slice/payrollSlice";
import { sendPayrollMail } from "./slice/mailSlice";
import PaymentModal from "../../components/PaymentModal/PaymentModal";

/* ─── Stable constant — defined outside to avoid re-creation on every render ─── */
const MONTH_NAMES = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
];

const EmployeePayrollHistory = () => {

    const dispatch = useDispatch();

    const { employees = [] }                     = useSelector((s) => s.employee);
    const { history = [], loading, downloading } = useSelector((s) => s.payroll);

    const [searchTerm,        setSearchTerm]        = useState("");
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [selectedEmployee,  setSelectedEmployee]  = useState(null);
    const [showDropdown,      setShowDropdown]      = useState(false);

    /* Single object tracks which row ID is busy per action type.
       Replaces the old separate downloadingId + isMaillSending states,
       and fixes the bug where isMaillSending never reset to null. */
    const [busyId, setBusyId] = useState({ download: null, view: null, mail: null });

    const [payModal, setPayModal] = useState({ show: false, row: null });

    const dropdownRef = useRef(null);

    /* ── Fetch employees once ── */
    useEffect(() => {
        dispatch(fetchAllEmployees());
    }, [dispatch]);

    /* ── Filter dropdown ── */
    useEffect(() => {
        if (!searchTerm.trim() || selectedEmployee) {
            setFilteredEmployees([]);
            setShowDropdown(false);
            return;
        }
        const q = searchTerm.toLowerCase();
        setFilteredEmployees(
            employees.filter((emp) =>
                `${emp.first_name} ${emp.middle_name ?? ""} ${emp.last_name}`.toLowerCase().includes(q) ||
                emp.employee_code?.toLowerCase().includes(q)
            )
        );
        setShowDropdown(true);
    }, [searchTerm, employees, selectedEmployee]);

    /* ── Close dropdown on outside click ── */
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    /* ── Handlers — wrapped in useCallback to keep columns memo stable ── */
    const handleEmployeeSelect = useCallback((emp) => {
        setSelectedEmployee(emp);
        setSearchTerm(`${emp.first_name} ${emp.middle_name ?? ""} ${emp.last_name}`);
        setShowDropdown(false);
        dispatch(getHistoryWithEmpId(emp.id));
    }, [dispatch]);

    const clearSelection = useCallback(() => {
        setSelectedEmployee(null);
        setSearchTerm("");
        dispatch(clearHistory());
    }, [dispatch]);

    const handleDownloadPayslip = useCallback(async (id) => {
        setBusyId((p) => ({ ...p, download: id }));
        try   { await dispatch(downloadPayslip(id)).unwrap(); }
        catch (e) { console.error("Download failed:", e); }
        finally   { setBusyId((p) => ({ ...p, download: null })); }
    }, [dispatch]);

    const handleViewPayslip = useCallback(async (id) => {
        setBusyId((p) => ({ ...p, view: id }));
        try   { await dispatch(viewPayslip(id)).unwrap(); }
        catch (e) { console.error("View failed:", e); }
        finally   { setBusyId((p) => ({ ...p, view: null })); }
    }, [dispatch]);

    const handleSendPayrollMail = useCallback(async (row) => {
        setBusyId((p) => ({ ...p, mail: row.id }));
        try {
            await dispatch(sendPayrollMail({
                templateId: 2,
                empId: row.employee_id,
                id: row.id,
            })).unwrap();
        } catch (e) {
            console.error("Mail failed:", e);
        } finally {
            // ✅ Fixed: was mistakenly resetting downloadingId instead of mail
            setBusyId((p) => ({ ...p, mail: null }));
        }
    }, [dispatch]);

    const handleOpenPayment = useCallback((row) => {
        setPayModal({
            show: true,
            row: {
                id:            row.id,
                employee_name: selectedEmployee
                    ? `${selectedEmployee.first_name} ${selectedEmployee.middle_name ?? ""} ${selectedEmployee.last_name}`
                    : "",
                employee_code: selectedEmployee?.employee_code ?? "",
                month:         row.month,
                year:          row.year,
                net_salary:    row.net_salary,
            },
        });
    }, [selectedEmployee]);

    const handlePayModalHide = useCallback(() => {
        setPayModal({ show: false, row: null });
    }, []);

    const handlePaySuccess = useCallback(() => {
        if (selectedEmployee) dispatch(getHistoryWithEmpId(selectedEmployee.id));
    }, [dispatch, selectedEmployee]);

    /* ── Table columns ── */
    const columns = useMemo(() => [
        {
            name: "Payroll Month",
            cell: (row) => `${MONTH_NAMES[row.month - 1] ?? "Unknown"} ${row.year}`,
        },
        {
            name: "Gross Salary",
            cell: (row) => `₹${Number(row.gross_salary || 0).toLocaleString()}`,
        },
        {
            name: "Deductions",
            cell: (row) => `₹${Number(row.total_deduction || 0).toLocaleString()}`,
        },
        {
            name: "Net Pay",
            cell: (row) => `₹${Number(row.net_salary || 0).toLocaleString()}`,
        },
        {
            name: "Status",
            cell: (row) => (
                <Badge
                    bg={row.is_paid == 1 ? "success-subtle" : "warning-subtle"}
                    text={row.is_paid == 1 ? "success" : "warning"}
                    className="fw-semibold rounded-4 px-3 py-1"
                >
                    {row.is_paid == 1 ? "Paid" : row.status}
                </Badge>
            ),
        },
        {
            name: "Actions",
            center: true,
            cell: (row) => (
                <div className="d-flex gap-2">

                    <Button size="sm" variant="outline-primary" title="View Payslip"
                        disabled={busyId.view === row.id}
                        onClick={() => handleViewPayslip(row.id)}
                    >
                        {busyId.view === row.id
                            ? <Spinner animation="border" size="sm" />
                            : <IoEyeOutline />}
                    </Button>

                    <Button size="sm" variant="outline-secondary" title="Download Payslip"
                        disabled={busyId.download === row.id || downloading}
                        onClick={() => handleDownloadPayslip(row.id)}
                    >
                        {busyId.download === row.id
                            ? <Spinner animation="border" size="sm" />
                            : <RxDownload />}
                    </Button>

                    <Button size="sm" variant="outline-primary" title="Send Payslip Mail"
                        disabled={busyId.mail === row.id}
                        onClick={() => handleSendPayrollMail(row)}
                    >
                        {busyId.mail === row.id
                            ? <Spinner animation="border" size="sm" />
                            : <RxEnvelopeClosed />}
                    </Button>

                    {row.is_paid == 0 && (
                        <Button size="sm" variant="outline-success" title="Make Payment"
                            onClick={() => handleOpenPayment(row)}
                        >
                            <BsCreditCard />
                        </Button>
                    )}

                </div>
            ),
        },
    ], [busyId, downloading, handleViewPayslip, handleDownloadPayslip, handleSendPayrollMail, handleOpenPayment]);

    /* ── Render ── */
    return (
        <Container fluid className="my-3">

            <div className="mt-3">
                <h5 className="mb-0">Employee Payroll History</h5>
                <small>Finalized &amp; Locked Payroll Records</small>
            </div>

            {/* Search */}
            <Card className="border-0 shadow-sm my-3">
                <Card.Body>
                    <Row>
                        <Col md={5}>
                            <Form.Label className="fw-semibold">
                                EMPLOYEE <span className="text-danger">*</span>
                            </Form.Label>

                            <div ref={dropdownRef} style={{ position: "relative" }}>
                                <InputGroup>
                                    <Form.Control
                                        placeholder="Enter Employee Name or ID"
                                        value={searchTerm}
                                        autoComplete="off"
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setSelectedEmployee(null);
                                        }}
                                    />
                                    <InputGroup.Text><IoSearchOutline /></InputGroup.Text>
                                </InputGroup>

                                {showDropdown && (
                                    <ListGroup
                                        className="position-absolute w-100 shadow-lg"
                                        style={{ zIndex: 1000, maxHeight: 250, overflowY: "auto", top: "100%", marginTop: 2 }}
                                    >
                                        {filteredEmployees.length > 0
                                            ? filteredEmployees.map((emp) => (
                                                <ListGroup.Item key={emp.id} action onClick={() => handleEmployeeSelect(emp)}>
                                                    <div className="fw-semibold">{emp.first_name} {emp.middle_name ?? ""} {emp.last_name}</div>
                                                    <small className="text-muted">
                                                        {emp.employee_code} | {emp.designation?.name} | {emp.department?.name}
                                                    </small>
                                                </ListGroup.Item>
                                            ))
                                            : <ListGroup.Item className="text-muted">No employees found</ListGroup.Item>
                                        }
                                    </ListGroup>
                                )}
                            </div>

                            {selectedEmployee && (
                                <div className="mt-2 p-2 bg-light rounded small d-flex justify-content-between align-items-center">
                                    <div>
                                        <span className="fw-semibold">
                                            {selectedEmployee.first_name} {selectedEmployee.middle_name?? ""} {selectedEmployee.last_name}
                                        </span>
                                        <span className="text-muted ms-2">({selectedEmployee.employee_code})</span>
                                    </div>
                                    <Button size="sm" variant="outline-danger" onClick={clearSelection}>Clear</Button>
                                </div>
                            )}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Table */}
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

                    {loading
                        ? <div className="text-center py-4"><Spinner animation="border" /></div>
                        : selectedEmployee && history.length > 0 && (
                            <DataTable
                                columns={columns}
                                data={history}
                                highlightOnHover
                                responsive
                                pagination
                                noHeader
                            />
                        )
                    }
                </Card.Body>
            </Card>

            <PaymentModal
                show={payModal.show}
                onHide={handlePayModalHide}
                payrollRow={payModal.row}
                onSuccess={handlePaySuccess}
            />

        </Container>
    );
};

export default EmployeePayrollHistory;