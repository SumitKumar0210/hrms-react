import { useEffect, useState, useCallback, useRef } from "react";
import {
    Container, Row, Col, Card, Form, Button,
    Badge, Alert, Spinner, InputGroup, ListGroup,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import { FiClock, FiAlertCircle } from "react-icons/fi";
import { IoSearchOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import {
    searchAttendance,
    correctAttendance,
    clearCurrentRecord,
    clearSuccess,
} from "./slice/manualAttendanceSlice";
import { fetchAllEmployees } from "../Employees/slice/employeeSlice";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeStrToDate = (timeStr) => {
    if (!timeStr) return null;
    const [h, m, s = 0] = timeStr.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, s, 0);
    return d;
};

const dateToTimeStr = (date) => {
    if (!date) return "";
    return [date.getHours(), date.getMinutes(), date.getSeconds()]
        .map((n) => String(n).padStart(2, "0"))
        .join(":");
};

const formatDate = (date) => {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const fmtDateTime = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
};

const EMPTY_FORM = { checkIn: null, checkOut: null, status: "", reason: "" };

// ─── Component ────────────────────────────────────────────────────────────────

const ManualAttendanceCorrection = () => {
    const dispatch = useDispatch();
    const dropdownRef = useRef(null);

    // ── Redux ────────────────────────────────────────────────────────────────
    const { employees = [], searchLoading } = useSelector((s) => s.employee);
    const { currentRecord, history, searching, saving, error, success } =
        useSelector((s) => s.manualAttendance);

    // ── Search state ─────────────────────────────────────────────────────────
    const [searchTerm, setSearchTerm]             = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [showDropdown, setShowDropdown]         = useState(false);
    const [searchDate, setSearchDate]             = useState(new Date());

    // ── Correction form ──────────────────────────────────────────────────────
    const [form, setForm] = useState(EMPTY_FORM);

    // ── Bootstrap ────────────────────────────────────────────────────────────
    useEffect(() => { dispatch(fetchAllEmployees()); }, [dispatch]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Filter employees — mirrors SalaryStructure behaviour exactly
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

    // Sync correction form when record loads
    useEffect(() => {
        if (currentRecord) {
            setForm({
                checkIn:  timeStrToDate(currentRecord.sign_in),
                checkOut: timeStrToDate(currentRecord.sign_out),
                status:   currentRecord.status || "",
                reason:   "",
            });
        } else {
            setForm(EMPTY_FORM);
        }
    }, [currentRecord]);

    // Auto-clear success flash
    useEffect(() => {
        if (!success) return;
        const t = setTimeout(() => dispatch(clearSuccess()), 3000);
        return () => clearTimeout(t);
    }, [success, dispatch]);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleEmployeeSelect = useCallback((emp) => {
        setSelectedEmployee(emp);
        setSearchTerm(`${emp.first_name} ${emp.last_name} (${emp.employee_code})`);
        setShowDropdown(false);
    }, []);

    const handleSearchTermChange = useCallback((e) => {
        setSearchTerm(e.target.value);
        if (selectedEmployee) setSelectedEmployee(null);
    }, [selectedEmployee]);

    const handleSearch = () => {
        if (!selectedEmployee) {
            alert("Please select an employee.");
            return;
        }
        dispatch(searchAttendance({
            employee_id: selectedEmployee.id,
            date: formatDate(searchDate),
        }));
    };

    const handleFormChange = (field) => (valueOrEvent) => {
        const value = valueOrEvent?.target ? valueOrEvent.target.value : valueOrEvent;
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!currentRecord) return;
        if (!form.status)        { alert("Status is required.");               return; }
        if (!form.reason.trim()) { alert("Please provide a correction reason."); return; }

        dispatch(correctAttendance({
            id: currentRecord.id,
            correctionData: {
                sign_in:  dateToTimeStr(form.checkIn),
                sign_out: dateToTimeStr(form.checkOut),
                status:   form.status.toLowerCase(),
                reason:   form.reason.trim(),
            },
        }));
    };

    const handleCancel = () => {
        dispatch(clearCurrentRecord());
        setSelectedEmployee(null);
        setSearchTerm("");
        setSearchDate(new Date());
        setForm(EMPTY_FORM);
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <Container fluid className="py-3">
            {/* Header */}
            <div className="mb-3">
                <h5 className="fw-semibold mb-0">Manual Attendance Correction</h5>
                <small className="text-muted">
                    Update and correct employee attendance records with full audit trail
                </small>
            </div>

            {error && (
                <Alert variant="danger" className="py-2 mb-3" dismissible>
                    <FiAlertCircle className="me-1" />{error}
                </Alert>
            )}

            {success && (
                <Alert variant="success" className="py-2 mb-3">
                    Attendance record corrected successfully.
                </Alert>
            )}

            <Row className="g-3">
                {/* ── Left: Search + Correction Form ── */}
                <Col md={5}>
                    <Card className="border-0 shadow-sm bg-primary-subtle">
                        <Card.Body>
                            <h6 className="fw-semibold mb-3">Search Attendance Record</h6>

                            <Form onSubmit={(e) => e.preventDefault()}>
                                <Row className="align-items-end mb-3 g-3">
                                    {/* Employee search — same pattern as SalaryStructure */}
                                    <Col md={5}>
                                        <Form.Label className="fw-semibold">
                                            EMPLOYEE <span className="text-danger">*</span>
                                        </Form.Label>
                                        <div ref={dropdownRef} style={{ position: "relative" }}>
                                            <InputGroup>
                                                <Form.Control
                                                    placeholder="Enter Employee Name or ID"
                                                    value={searchTerm}
                                                    onChange={handleSearchTermChange}
                                                    onFocus={() => {
                                                        if (searchTerm && !selectedEmployee) setShowDropdown(true);
                                                    }}
                                                    autoComplete="off"
                                                />
                                                <InputGroup.Text>
                                                    {searchLoading
                                                        ? <Spinner animation="border" size="sm" />
                                                        : <IoSearchOutline />}
                                                </InputGroup.Text>
                                            </InputGroup>

                                            {/* Results dropdown */}
                                            {showDropdown && filteredEmployees.length > 0 && (
                                                <ListGroup
                                                    className="position-absolute w-100 shadow-lg"
                                                    style={{ zIndex: 1000, maxHeight: "250px", overflowY: "auto", top: "100%", marginTop: "2px" }}
                                                >
                                                    {filteredEmployees.map((emp) => (
                                                        <ListGroup.Item
                                                            key={emp.id}
                                                            action
                                                            onClick={() => handleEmployeeSelect(emp)}
                                                            className="cursor-pointer"
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

                                            {/* No results */}
                                            {showDropdown && searchTerm && filteredEmployees.length === 0 && !selectedEmployee && (
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

                                        {/* Selected employee info pill */}
                                        {selectedEmployee && (
                                            <div className="mt-2 p-2 bg-light rounded small">
                                                <span className="fw-semibold">
                                                    {selectedEmployee.first_name} {selectedEmployee.last_name}
                                                </span>
                                                <span className="text-muted ms-1">
                                                    ({selectedEmployee.employee_code})
                                                </span>
                                                <span className="text-muted ms-2">
                                                    {selectedEmployee.designation?.name} · {selectedEmployee.department?.name}
                                                </span>
                                            </div>
                                        )}
                                    </Col>

                                    {/* Date */}
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold">
                                                DATE <span className="text-danger">*</span>
                                            </Form.Label>
                                            <DatePicker
                                                selected={searchDate}
                                                onChange={setSearchDate}
                                                dateFormat="dd/MM/yyyy"
                                                maxDate={new Date()}
                                                className="form-control"
                                                disabled={searching}
                                            />
                                        </Form.Group>
                                    </Col>

                                    {/* Search button */}
                                    <Col md={3}>
                                        <Button
                                            className="w-100"
                                            onClick={handleSearch}
                                            disabled={searching || !selectedEmployee}
                                        >
                                            {searching ? <Spinner animation="border" size="sm" /> : "Search"}
                                        </Button>
                                    </Col>
                                </Row>

                                {/* No record warning */}
                                {!searching && !currentRecord && selectedEmployee && (
                                    <Alert variant="warning" className="py-2 mb-3">
                                        <FiAlertCircle className="me-1" />
                                        No attendance record found for this employee on {formatDate(searchDate)}.
                                    </Alert>
                                )}

                                {/* ── Correction Form ── */}
                                {currentRecord && (
                                    <>
                                        <Card className="border rounded-3">
                                            <Card.Body>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="fw-semibold">Correction Form</span>
                                                    <Badge bg="info" pill>ID: {currentRecord.id}</Badge>
                                                </div>

                                                {[
                                                    { label: "CHECK-IN TIME",  field: "checkIn",  value: form.checkIn,  setter: handleFormChange("checkIn") },
                                                    { label: "CHECK-OUT TIME", field: "checkOut", value: form.checkOut, setter: handleFormChange("checkOut") },
                                                ].map(({ label, field, value, setter }) => (
                                                    <Form.Group key={field} className="py-2 border-bottom">
                                                        <Row className="align-items-center">
                                                            <Col xs={7}>
                                                                <Form.Label className="mb-0 text-muted fw-semibold">{label}</Form.Label>
                                                            </Col>
                                                            <Col xs={5} className="text-end">
                                                                <DatePicker
                                                                    selected={value}
                                                                    onChange={setter}
                                                                    showTimeSelect
                                                                    showTimeSelectOnly
                                                                    timeIntervals={15}
                                                                    timeCaption="Time"
                                                                    dateFormat="hh:mm aa"
                                                                    className="form-control form-control-sm"
                                                                    placeholderText="HH:MM"
                                                                />
                                                            </Col>
                                                        </Row>
                                                    </Form.Group>
                                                ))}

                                                <Form.Group className="py-2 border-bottom">
                                                    <Row className="align-items-center">
                                                        <Col xs={7}>
                                                            <Form.Label className="mb-0 text-muted fw-semibold">
                                                                STATUS <span className="text-danger">*</span>
                                                            </Form.Label>
                                                        </Col>
                                                        <Col xs={5} className="text-end">
                                                            <Form.Select
                                                                size="sm"
                                                                value={form.status}
                                                                onChange={handleFormChange("status")}
                                                            >
                                                                <option value="">Select</option>
                                                                {["present", "absent", "late", "halfday"].map((s) => (
                                                                    <option key={s} value={s}>
                                                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>
                                                        </Col>
                                                    </Row>
                                                </Form.Group>

                                                <Form.Group className="mt-3">
                                                    <Form.Label className="fw-semibold">
                                                        CORRECTION REASON <span className="text-danger">*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={3}
                                                        value={form.reason}
                                                        onChange={handleFormChange("reason")}
                                                        placeholder="Enter reason for correction (required)"
                                                    />
                                                </Form.Group>
                                            </Card.Body>
                                        </Card>

                                        <div className="d-flex justify-content-between mt-3">
                                            <Button variant="outline-secondary" onClick={handleCancel}>
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="warning"
                                                onClick={handleSave}
                                                disabled={saving || !form.status || !form.reason.trim()}
                                            >
                                                {saving
                                                    ? <><Spinner animation="border" size="sm" className="me-1" />Saving…</>
                                                    : "Save Correction"}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* ── Right: History ── */}
                <Col md={7}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="d-flex flex-column">
                            <h6 className="fw-semibold mb-3">
                                Correction History
                                {history.length > 0 && (
                                    <Badge bg="secondary" className="ms-2">{history.length}</Badge>
                                )}
                            </h6>

                            {history.length === 0 ? (
                                <div className="flex-grow-1 d-flex align-items-center justify-content-center text-muted text-center">
                                    <div>
                                        <FiClock size={28} className="mb-2 opacity-50" />
                                        <p className="mb-0 fw-semibold">No correction history available</p>
                                        <small>Search for a record to view history</small>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ maxHeight: 450, overflowY: "auto" }}>
                                    {history.map((entry, idx) => (
                                        <Card key={entry.id ?? idx} className="mb-2 border">
                                            <Card.Body className="py-2">
                                                <div className="d-flex justify-content-between align-items-start mb-1">
                                                    <small className="text-muted fw-semibold">
                                                        {fmtDateTime(entry.created_at)}
                                                    </small>
                                                    <Badge bg="warning" text="dark" pill>
                                                        Correction #{history.length - idx}
                                                    </Badge>
                                                </div>
                                                <div className="small">
                                                    <strong>Reason:</strong> {entry.reason || "—"}
                                                </div>
                                                <div className="small text-muted mt-1">
                                                    <strong>Changes:</strong> {entry.changes_summary || "—"}
                                                </div>
                                                {entry.corrected_by && (
                                                    <div className="small text-muted mt-1">
                                                        <strong>By:</strong> {entry.corrected_by}
                                                    </div>
                                                )}
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ManualAttendanceCorrection;