import { useState, useEffect, useCallback } from "react";
import {
    Container,
    Card,
    Row,
    Col,
    Form,
    Button,
    InputGroup,
    ListGroup,
    Spinner,
    Alert,
} from "react-bootstrap";
import { IoSearchOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllEmployees } from "../Employees/slice/employeeSlice";
import { createSalaryStructure, updateSalary, clearSuccess, clearError } from "./slice/salaryStructureSlice";
import { useAuth } from "../../context/AuthContext";
// ─── Empty form state ─────────────────────────────────────────────────────────
const EMPTY_FORM = {
    basicSalary: "",
    hra: "",
    conveyance: "",
    medical: "",
    special: "",
    overtime: "",
    grossSalary: "",
    pfAmount: "",   // ← manual PF amount
    esicAmount: "",   // ← manual ESIC amount
};

// ─── Map existing salary record → form state ──────────────────────────────────
const mapSalaryToForm = (s) => ({
    basicSalary: s.basic_salary ?? "",
    hra: s.hra ?? "",
    conveyance: s.conveyance_allowance ?? "",
    medical: s.medical_allowance ?? s.medical ?? "",
    special: s.special_allowance ?? s.special ?? "",
    overtime: s.overtime_rate ?? "",
    grossSalary: s.gross_salary ?? "",
    pfAmount: s.pf_amount ?? "",   // ← from server
    esicAmount: s.esic_amount ?? "",   // ← from server
});

// ─── Component ────────────────────────────────────────────────────────────────
const SalaryStructure = () => {
    const dispatch = useDispatch();
    const { hasPermission, hasAnyPermission } = useAuth();

    const { employees = [], searchLoading } = useSelector((state) => state.employee);
    const { loading: salaryLoading, success, error } = useSelector((state) => state.salaryStructure);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);

    // ── Fetch employees on mount ──────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchAllEmployees());
    }, [dispatch]);

    // ── Filter employees for dropdown ─────────────────────────────────────────
    useEffect(() => {
        if (searchTerm.trim() && !selectedEmployee) {
            const lower = searchTerm.toLowerCase();
            const filtered = employees.filter((emp) => {
                const name = `${emp.first_name} ${emp.last_name}`.toLowerCase();
                const code = emp.employee_code?.toLowerCase() ?? "";
                return name.includes(lower) || code.includes(lower);
            });
            setFilteredEmployees(filtered);
            setShowDropdown(true);
        } else {
            setFilteredEmployees([]);
            setShowDropdown(false);
        }
    }, [searchTerm, employees, selectedEmployee]);

    // ── Auto-calculate gross salary from allowances ───────────────────────────
    // Does NOT touch pfAmount / esicAmount — those stay fully manual
    useEffect(() => {
        const basic = parseFloat(formData.basicSalary) || 0;
        const hra = parseFloat(formData.hra) || 0;
        const conveyance = parseFloat(formData.conveyance) || 0;
        const medical = parseFloat(formData.medical) || 0;
        const special = parseFloat(formData.special) || 0;
        const gross = basic + hra + conveyance + medical + special;

        setFormData((prev) => ({
            ...prev,
            grossSalary: gross > 0 ? gross.toFixed(2) : "",
        }));
    }, [
        formData.basicSalary,
        formData.hra,
        formData.conveyance,
        formData.medical,
        formData.special,
    ]);

    // ── Select employee from dropdown ─────────────────────────────────────────
    const handleEmployeeSelect = useCallback((employee) => {
        setSelectedEmployee(employee);
        setSearchTerm(`${employee.first_name} ${employee.last_name} (${employee.employee_code})`);
        setShowDropdown(false);

        const existingSalary =
            employee.salaries && employee.salaries.length > 0
                ? employee.salaries[0]
                : null;

        if (existingSalary) {
            setIsEditMode(true);
            setFormData(mapSalaryToForm(existingSalary));
        } else {
            setIsEditMode(false);
            setFormData(EMPTY_FORM);
        }
    }, []);

    // ── Input change — numeric filter for salary fields ───────────────────────
    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox"
                ? checked
                : value.replace(/[^0-9.]/g, ""),   // allow only numbers + decimal
        }));
    }, []);

    // ── Reset ─────────────────────────────────────────────────────────────────
    const handleReset = useCallback(() => {
        if (
            selectedEmployee &&
            selectedEmployee.salaries &&
            selectedEmployee.salaries.length > 0
        ) {
            // Editing → restore original server values
            setFormData(mapSalaryToForm(selectedEmployee.salaries[0]));
        } else {
            // New → clear everything
            setFormData(EMPTY_FORM);
            setSelectedEmployee(null);
            setSearchTerm("");
            setIsEditMode(false);
        }
    }, [selectedEmployee]);

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedEmployee) {
            alert("Please select an employee first");
            return;
        }

        const salaryData = {
            employee_id: selectedEmployee.id,
            basic_salary: parseFloat(formData.basicSalary) || 0,
            hra: parseFloat(formData.hra) || 0,
            conveyance_allowance: parseFloat(formData.conveyance) || 0,
            medical_allowance: parseFloat(formData.medical) || 0,
            special_allowance: parseFloat(formData.special) || 0,
            overtime_rate: parseFloat(formData.overtime) || 0,
            gross_salary: parseFloat(formData.grossSalary) || 0,
            pf_amount: parseFloat(formData.pfAmount) || 0,   // ← manual
            esic_amount: parseFloat(formData.esicAmount) || 0,   // ← manual
        };

        try {
            if (isEditMode && selectedEmployee.salaries?.length > 0) {
                const salaryId = selectedEmployee.salaries[0].id;
                await dispatch(updateSalary({ id: salaryId, values: salaryData })).unwrap();
            } else {
                await dispatch(createSalaryStructure(salaryData)).unwrap();
            }

            // Reset after success
            setFormData(EMPTY_FORM);
            setSelectedEmployee(null);
            setSearchTerm("");
            setIsEditMode(false);
            dispatch(fetchAllEmployees());
        } catch (err) {
            console.error("Failed to save salary structure:", err);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <Container fluid className="my-3">
            {/* Header */}
            <div className="mb-3">
                <h5 className="fw-semibold mb-0">Salary Structure & Revision</h5>
                <small className="text-muted">
                    Create salary structure for new employees and revise salary for existing employees
                </small>
            </div>

            {/* Alerts */}
            {success && (
                <Alert variant="success" dismissible onClose={() => dispatch(clearSuccess())}>
                    Salary structure {isEditMode ? "updated" : "created"} successfully!
                </Alert>
            )}
            {error && (
                <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>
                    {error}
                </Alert>
            )}

            {/* Employee search */}
            <Card className="mb-4 border-0 shadow-sm">
                <Card.Body>
                    <h6 className="fw-semibold mb-3">Select Employee</h6>
                    {hasPermission('salary_structure_revision.create') && (
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            <div className="text-muted" style={{ minWidth: 130, fontSize: 14 }}>
                                Search by Name
                            </div>
                            <div style={{ maxWidth: 320, width: "100%", position: "relative" }}>
                                <InputGroup>
                                    <Form.Control
                                        placeholder="Enter employee name or ID"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            if (selectedEmployee) {
                                                setSelectedEmployee(null);
                                                setIsEditMode(false);
                                                setFormData(EMPTY_FORM);
                                            }
                                        }}
                                        onFocus={() => {
                                            if (searchTerm && !selectedEmployee) setShowDropdown(true);
                                        }}
                                    />
                                    <InputGroup.Text>
                                        {searchLoading ? (
                                            <Spinner animation="border" size="sm" />
                                        ) : (
                                            <IoSearchOutline />
                                        )}
                                    </InputGroup.Text>
                                </InputGroup>

                                {/* Dropdown results */}
                                {showDropdown && filteredEmployees.length > 0 && (
                                    <ListGroup
                                        className="position-absolute w-100 shadow-lg"
                                        style={{ zIndex: 1000, maxHeight: 250, overflowY: "auto", top: "100%", marginTop: 2 }}
                                    >
                                        {filteredEmployees.map((emp) => (
                                            <ListGroup.Item
                                                key={emp.id}
                                                action
                                                onClick={() => handleEmployeeSelect(emp)}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <div className="fw-semibold">
                                                    {emp.first_name} {emp.last_name}
                                                    {emp.salaries?.length > 0 && (
                                                        <span className="badge bg-info ms-2">Has Salary</span>
                                                    )}
                                                </div>
                                                <small className="text-muted">
                                                    {emp.employee_code} | {emp.designation?.name} | {emp.department?.name}
                                                </small>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}

                                {showDropdown && searchTerm && filteredEmployees.length === 0 && !selectedEmployee && (
                                    <ListGroup
                                        className="position-absolute w-100 shadow-lg"
                                        style={{ zIndex: 1000, top: "100%", marginTop: 2 }}
                                    >
                                        <ListGroup.Item className="text-muted">No employees found</ListGroup.Item>
                                    </ListGroup>
                                )}
                            </div>
                        </div>
                    )}


                    {/* Selected employee info strip */}
                    {selectedEmployee && (
                        <div className="mt-3 p-3 bg-light rounded">
                            <Row>
                                <Col md={3}>
                                    <small className="text-muted">Employee Name</small>
                                    <div className="fw-semibold">
                                        {selectedEmployee.first_name} {selectedEmployee.last_name}
                                    </div>
                                </Col>
                                <Col md={2}>
                                    <small className="text-muted">Employee Code</small>
                                    <div className="fw-semibold">{selectedEmployee.employee_code}</div>
                                </Col>
                                <Col md={2}>
                                    <small className="text-muted">Department</small>
                                    <div className="fw-semibold">{selectedEmployee.department?.name}</div>
                                </Col>
                                <Col md={2}>
                                    <small className="text-muted">Designation</small>
                                    <div className="fw-semibold">{selectedEmployee.designation?.name}</div>
                                </Col>
                                <Col md={3}>
                                    <small className="text-muted">Status</small>
                                    <div>
                                        {isEditMode ? (
                                            <span className="badge bg-warning text-dark">Editing Existing</span>
                                        ) : (
                                            <span className="badge bg-success">Creating New</span>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Salary form */}
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <h6 className="fw-semibold mb-3">
                        Salary Structure{" "}
                        {isEditMode && <span className="text-muted fw-normal">(Editing)</span>}
                    </h6>

                    <Form onSubmit={handleSubmit} noValidate>
                        {/* ── Earnings ───────────────────────────────────── */}
                        <div className="mb-2 p-2 bg-light rounded">
                            <small className="fw-semibold text-secondary text-uppercase" style={{ fontSize: 11 }}>
                                Earnings
                            </small>
                        </div>
                        <Row className="g-3 mb-4">
                            {[
                                { label: "Basic Salary *", name: "basicSalary", required: true },
                                { label: "House Rent Allowance (HRA)", name: "hra" },
                                { label: "Conveyance Allowance", name: "conveyance" },
                                { label: "Medical Allowance", name: "medical" },
                                { label: "Special Allowance", name: "special" },
                                { label: "Overtime Rate (per hour)", name: "overtime" },
                            ].map(({ label, name, required }) => (
                                <Col md={4} key={name}>
                                    <Form.Group>
                                        <Form.Label>{label}</Form.Label>
                                        <Form.Control
                                            name={name}
                                            value={formData[name]}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            required={required}
                                            disabled={!selectedEmployee}
                                        />
                                    </Form.Group>
                                </Col>
                            ))}

                            {/* Gross — read only, auto-calculated */}
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Gross Salary (Monthly)</Form.Label>
                                    <Form.Control
                                        name="grossSalary"
                                        value={formData.grossSalary}
                                        readOnly
                                        placeholder="0.00"
                                        className="bg-success bg-opacity-10 border-success fw-semibold"
                                    />
                                    <Form.Text className="text-muted">
                                        Auto-calculated from allowances
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* ── Deductions (manual) ────────────────────────── */}
                        <div className="mb-2 p-2 bg-light rounded">
                            <small className="fw-semibold text-secondary text-uppercase" style={{ fontSize: 11 }}>
                                Deductions
                            </small>
                        </div>
                        <Row className="g-3 mb-4">
                            {/* PF Amount — fully manual */}
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>PF Amount</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text>₹</InputGroup.Text>
                                        <Form.Control
                                            name="pfAmount"
                                            value={formData.pfAmount}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            disabled={!selectedEmployee}
                                        />
                                    </InputGroup>
                                    <Form.Text className="text-muted">
                                        Enter actual PF deduction amount
                                    </Form.Text>
                                </Form.Group>
                            </Col>

                            {/* ESIC Amount — fully manual */}
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>ESIC Amount</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text>₹</InputGroup.Text>
                                        <Form.Control
                                            name="esicAmount"
                                            value={formData.esicAmount}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            disabled={!selectedEmployee}
                                        />
                                    </InputGroup>
                                    <Form.Text className="text-muted">
                                        Enter actual ESIC deduction amount
                                    </Form.Text>
                                </Form.Group>
                            </Col>

                            {/* Net Salary preview — gross minus deductions */}
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Net Salary (Preview)</Form.Label>
                                    <Form.Control
                                        readOnly
                                        placeholder="0.00"
                                        className="bg-primary bg-opacity-10 border-primary fw-semibold"
                                        value={(() => {
                                            const gross = parseFloat(formData.grossSalary) || 0;
                                            const pf = parseFloat(formData.pfAmount) || 0;
                                            const esic = parseFloat(formData.esicAmount) || 0;
                                            const net = gross - pf - esic;
                                            return net > 0 ? net.toFixed(2) : "";
                                        })()}
                                    />
                                    <Form.Text className="text-muted">
                                        Gross − PF − ESIC
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Action buttons */}
                        <Row className="mt-2">
                            <Col className="text-end">
                                <Button
                                    variant="outline-secondary"
                                    className="me-3 px-4"
                                    onClick={handleReset}
                                    disabled={salaryLoading}
                                >
                                    Reset
                                </Button>
                                {hasPermission('salary_structure_revision.update') && (
                                    <Button
                                        type="submit"
                                        className="px-4"
                                        style={{ background: "#6c6cff", border: "none" }}
                                        disabled={!selectedEmployee || salaryLoading}
                                    >
                                        {salaryLoading ? (
                                            <>
                                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                                                Saving...
                                            </>
                                        ) : (
                                            isEditMode ? "Update Structure" : "Save Structure"
                                        )}
                                    </Button>
                                )}

                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default SalaryStructure;