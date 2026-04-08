import { useState, useEffect, useCallback, useRef } from "react";
import {
    Container, Card, Row, Col, Form, Button,
    InputGroup, ListGroup, Spinner, Alert,
} from "react-bootstrap";
import { IoSearchOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllEmployees } from "../Employees/slice/employeeSlice";
import { createSalaryStructure, updateSalary, clearSuccess, clearError } from "./slice/salaryStructureSlice";
import { useAuth } from "../../context/AuthContext";

const EMPTY_FORM = {
    basicSalary: "",
    hra: "",
    conveyance: "",
    medical: "",
    special: "",
    overtime: "",
    grossSalary: "",
    // PF
    pf_applicable: false,
    pfAmount: "",
    uanNumber: "",
    uanCertificate: null,
    // ESIC
    esic_applicable: false,
    esicAmount: "",
    esicNumber: "",
    esicCertificate: null,
};

const mapSalaryToForm = (s) => ({
    basicSalary: s.basic_salary ?? "",
    hra: s.hra ?? "",
    conveyance: s.conveyance_allowance ?? "",
    medical: s.medical_allowance ?? s.medical ?? "",
    special: s.special_allowance ?? s.special ?? "",
    overtime: s.overtime_rate ?? "",
    grossSalary: s.gross_salary ?? "",
    // PF — support both pf_eligible and pf_applicable (API returns pf_applicable)
    pf_applicable: !!(s.pf_eligible || s.pf_applicable == 1 || s.pf_applicable === "1"),
    pfAmount: s.pf_amount ?? "",
    uanNumber: s.uan_number ?? "",
    uanCertificate: null,
    // ESIC — support both esic_eligible and esic_applicable
    esic_applicable: !!(s.esic_eligible || s.esic_applicable == 1 || s.esic_applicable === "1"),
    esicAmount: s.esic_amount ?? "",
    esicNumber: s.esic_number ?? "",
    esicCertificate: null,
});

// Helper: find a document by type from the employee's documents array
const getCertificateDoc = (employee, docType) =>
    employee?.documents?.find((d) => d.document_type === docType) ?? null;

const SalaryStructure = () => {
    const dispatch = useDispatch();
    const { hasPermission } = useAuth();

    const { employees = [], searchLoading } = useSelector((state) => state.employee);
    const { loading: salaryLoading, success, error } = useSelector((state) => state.salaryStructure);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [selectedSalary, setSelectedSalary] = useState(null);

    const mediaUrl = import.meta.env.VITE_MEDIA_URL;

    // Track edit mode at submit time so success message is correct
    // after state has been reset.
    const submittedEditModeRef = useRef(false);

    useEffect(() => { dispatch(fetchAllEmployees()); }, [dispatch]);

    useEffect(() => {
        if (searchTerm.trim() && !selectedEmployee) {
            const lower = searchTerm.toLowerCase();
            const filtered = employees.filter((emp) => {
                const name = `${emp.first_name} ${emp.middle_name} ${emp.last_name}`.toLowerCase();
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

    // Auto-calculate gross
    useEffect(() => {
        const basic = parseFloat(formData.basicSalary) || 0;
        const hra = parseFloat(formData.hra) || 0;
        const conveyance = parseFloat(formData.conveyance) || 0;
        const medical = parseFloat(formData.medical) || 0;
        const special = parseFloat(formData.special) || 0;
        const gross = basic + hra + conveyance + medical + special;
        setFormData((prev) => ({ ...prev, grossSalary: gross > 0 ? gross.toFixed(2) : "" }));
    }, [formData.basicSalary, formData.hra, formData.conveyance, formData.medical, formData.special]);

    const handleEmployeeSelect = useCallback((employee) => {
        setSelectedEmployee(employee);
        setSearchTerm(
            `${employee.first_name} ${employee.middle_name} ${employee.last_name} (${employee.employee_code})`
        );
        setShowDropdown(false);

        // Always pick the latest salary entry
        const existingSalary =
            employee.salaries?.length > 0
                ? employee.salaries[employee.salaries.length - 1]
                : null;

        if (existingSalary) {
            setIsEditMode(true);
            setSelectedSalary(existingSalary);
            setFormData(mapSalaryToForm(existingSalary));
        } else {
            setIsEditMode(false);
            setSelectedSalary(null);
            setFormData(EMPTY_FORM);
        }
    }, []);

    // handleChange strips non-numeric — only use for salary/amount inputs.
    const handleNumericChange = useCallback((e) => {
        const { name, value, type, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "file"
                ? files[0] ?? null
                : value.replace(/[^0-9.]/g, ""),
        }));
    }, []);

    // For text fields like UAN/ESIC numbers — no stripping
    const handleTextChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    // Dedicated file handler — always stores the actual File object
    const handleFileChange = useCallback((e) => {
        const { name, files } = e.target;
        setFormData((prev) => ({ ...prev, [name]: files[0] ?? null }));
    }, []);

    // When eligibility is toggled off, clear related fields
    const handleEligibilityToggle = useCallback((field) => {
        setFormData((prev) => {
            const newValue = !prev[field];

            if (field === "pf_applicable" && !newValue) {
                return {
                    ...prev,
                    pf_applicable: false,
                    pfAmount: "",
                    uanNumber: "",
                    uanCertificate: null,
                };
            }

            if (field === "esic_applicable" && !newValue) {
                return {
                    ...prev,
                    esic_applicable: false,
                    esicAmount: "",
                    esicNumber: "",
                    esicCertificate: null,
                };
            }

            return { ...prev, [field]: newValue };
        });
    }, []);

    const handleReset = useCallback(() => {
        if (selectedSalary) {
            setFormData(mapSalaryToForm(selectedSalary));
            setIsEditMode(true);
        } else {
            setFormData(EMPTY_FORM);
            setSelectedEmployee(null);
            setSelectedSalary(null);
            setSearchTerm("");
            setIsEditMode(false);
        }
    }, [selectedSalary]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedEmployee) {
            alert("Please select an employee first");
            return;
        }

        // Capture edit mode before resetting state
        submittedEditModeRef.current = isEditMode;

        const payload = new FormData();

        payload.append("employee_id", selectedEmployee.id);
        payload.append("basic_salary", parseFloat(formData.basicSalary) || 0);
        payload.append("hra", parseFloat(formData.hra) || 0);
        payload.append("conveyance_allowance", parseFloat(formData.conveyance) || 0);
        payload.append("medical_allowance", parseFloat(formData.medical) || 0);
        payload.append("special_allowance", parseFloat(formData.special) || 0);
        payload.append("overtime_rate", parseFloat(formData.overtime) || 0);
        payload.append("gross_salary", parseFloat(formData.grossSalary) || 0);

        // PF
        payload.append("pf_applicable", formData.pf_applicable ? 1 : 0);
        if (formData.pf_applicable) {
            payload.append("pf_amount", parseFloat(formData.pfAmount) || 0);
            payload.append("uan_number", formData.uanNumber);
            if (formData.uanCertificate instanceof File) {
                payload.append("uan_certificate", formData.uanCertificate);
            } else {
                payload.append("uan_certificate", "");
            }
        }

        // ESIC
        payload.append("esic_applicable", formData.esic_applicable ? 1 : 0);
        if (formData.esic_applicable) {
            payload.append("esic_amount", parseFloat(formData.esicAmount) || 0);
            payload.append("esic_number", formData.esicNumber);
            if (formData.esicCertificate instanceof File) {
                payload.append("esic_certificate", formData.esicCertificate);
            } else {
                payload.append("esic_certificate", "");
            }
        }

        try {
            if (selectedSalary) {
                await dispatch(
                    updateSalary({ id: selectedSalary.id, values: payload })
                ).unwrap();
            } else {
                await dispatch(createSalaryStructure(payload)).unwrap();
            }

            // Reset form after successful save
            setFormData(EMPTY_FORM);
            setSelectedEmployee(null);
            setSelectedSalary(null);
            setSearchTerm("");
            setIsEditMode(false);

            dispatch(fetchAllEmployees());
        } catch (err) {
            console.error("Failed to save salary structure:", err);
        }
    };

    const netSalary = (() => {
        const gross = parseFloat(formData.grossSalary) || 0;
        const pf = formData.pf_applicable ? (parseFloat(formData.pfAmount) || 0) : 0;
        const esic = formData.esic_applicable ? (parseFloat(formData.esicAmount) || 0) : 0;
        const net = gross - pf - esic;
        return net > 0 ? net.toFixed(2) : "";
    })();

    // Derived: certificate documents from the selected employee
    const uanCertDoc = getCertificateDoc(selectedEmployee, "uan_certificate");
    const esicCertDoc = getCertificateDoc(selectedEmployee, "esic_certificate");

    return (
        <Container fluid className="my-3">
            <div className="mb-3">
                <h5 className="fw-semibold mb-0">Salary Structure & Revision</h5>
                <small className="text-muted">
                    Create salary structure for new employees and revise salary for existing employees
                </small>
            </div>

            {success && (
                <Alert variant="success" dismissible onClose={() => dispatch(clearSuccess())}>
                    Salary structure {submittedEditModeRef.current ? "updated" : "created"} successfully!
                </Alert>
            )}
            {error && (
                <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>{error}</Alert>
            )}

            {/* Employee search */}
            <Card className="mb-4 border-0 shadow-sm">
                <Card.Body>
                    <h6 className="fw-semibold mb-3">Select Employee</h6>
                    {hasPermission('salary_structure_revision.create') && (
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            <div className="text-muted" style={{ minWidth: 130, fontSize: 14 }}>Search by Name</div>
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
                                                setSelectedSalary(null);
                                                setFormData(EMPTY_FORM);
                                            }
                                        }}
                                        onFocus={() => { if (searchTerm && !selectedEmployee) setShowDropdown(true); }}
                                    />
                                    <InputGroup.Text>
                                        {searchLoading ? <Spinner animation="border" size="sm" /> : <IoSearchOutline />}
                                    </InputGroup.Text>
                                </InputGroup>

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
                                                    {emp.first_name} {emp.middle_name?? ""} {emp.last_name}
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

                    {selectedEmployee && (
                        <div className="mt-3 p-3 bg-light rounded">
                            <Row>
                                <Col md={3}>
                                    <small className="text-muted">Employee Name</small>
                                    <div className="fw-semibold">
                                        {selectedEmployee.first_name} {selectedEmployee.middle_name} {selectedEmployee.last_name}
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
                                        {isEditMode
                                            ? <span className="badge bg-warning text-dark">Editing Existing</span>
                                            : <span className="badge bg-success">Creating New</span>}
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

                        {/* Earnings */}
                        <div className="mb-2 p-2 bg-light rounded">
                            <small className="fw-semibold text-secondary text-uppercase" style={{ fontSize: 11 }}>Earnings</small>
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
                                            onChange={handleNumericChange}
                                            placeholder="0.00"
                                            required={required}
                                            disabled={!selectedEmployee}
                                        />
                                    </Form.Group>
                                </Col>
                            ))}
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
                                    <Form.Text className="text-muted">Auto-calculated from allowances</Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Deductions */}
                        <div className="mb-2 p-2 bg-light rounded">
                            <small className="fw-semibold text-secondary text-uppercase" style={{ fontSize: 11 }}>Deductions</small>
                        </div>
                        <Row className="g-3 mb-4">

                            {/* PF Section */}
                            <Col md={12}>
                                <div className="border rounded p-3">
                                    <Form.Check
                                        type="switch"
                                        id="pf-eligible"
                                        label={<span className="fw-semibold">Eligible for PF (Provident Fund)</span>}
                                        checked={formData.pf_applicable}
                                        onChange={() => handleEligibilityToggle("pf_applicable")}
                                        disabled={!selectedEmployee}
                                    />
                                    {formData.pf_applicable && (
                                        <Row className="g-3 mt-1">
                                            <Col md={4}>
                                                <Form.Group>
                                                    <Form.Label>PF Amount</Form.Label>
                                                    <InputGroup>
                                                        <InputGroup.Text>₹</InputGroup.Text>
                                                        <Form.Control
                                                            name="pfAmount"
                                                            value={formData.pfAmount}
                                                            onChange={handleNumericChange}
                                                            placeholder="0.00"
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group>
                                                    <Form.Label>UAN Number</Form.Label>
                                                    <Form.Control
                                                        name="uanNumber"
                                                        value={formData.uanNumber}
                                                        onChange={handleTextChange}
                                                        placeholder="Enter UAN number"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group>
                                                    <Form.Label>UAN Certificate</Form.Label>
                                                    <Form.Control
                                                        type="file"
                                                        name="uanCertificate"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={handleFileChange}
                                                    />
                                                    <Form.Text className="text-muted">PDF or image, max 2MB</Form.Text>

                                                    <div className="d-flex align-items-center gap-2 mt-1 flex-wrap">
                                                        {/* Show "already uploaded" only when in edit mode and no new file selected */}
                                                        {isEditMode && !formData.uanCertificate && selectedSalary?.uan_certificate && (
                                                            <small className="text-success">✓ Certificate already uploaded</small>
                                                        )}
                                                        {/* Preview button: shown whenever the employee has a uan_certificate doc */}
                                                        {uanCertDoc?.file_path && (
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                as="a"
                                                                href={`${mediaUrl}${uanCertDoc.file_path}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                👁 Preview UAN Certificate
                                                            </Button>
                                                        )}
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    )}
                                </div>
                            </Col>

                            {/* ESIC Section */}
                            <Col md={12}>
                                <div className="border rounded p-3">
                                    <Form.Check
                                        type="switch"
                                        id="esic-eligible"
                                        label={<span className="fw-semibold">Eligible for ESIC (Employee State Insurance)</span>}
                                        checked={formData.esic_applicable}
                                        onChange={() => handleEligibilityToggle("esic_applicable")}
                                        disabled={!selectedEmployee}
                                    />
                                    {formData.esic_applicable && (
                                        <Row className="g-3 mt-1">
                                            <Col md={4}>
                                                <Form.Group>
                                                    <Form.Label>ESIC Amount</Form.Label>
                                                    <InputGroup>
                                                        <InputGroup.Text>₹</InputGroup.Text>
                                                        <Form.Control
                                                            name="esicAmount"
                                                            value={formData.esicAmount}
                                                            onChange={handleNumericChange}
                                                            placeholder="0.00"
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group>
                                                    <Form.Label>ESIC Number</Form.Label>
                                                    <Form.Control
                                                        name="esicNumber"
                                                        value={formData.esicNumber}
                                                        onChange={handleTextChange}
                                                        placeholder="Enter ESIC number"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group>
                                                    <Form.Label>ESIC Certificate</Form.Label>
                                                    <Form.Control
                                                        type="file"
                                                        name="esicCertificate"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={handleFileChange}
                                                    />
                                                    <Form.Text className="text-muted">PDF or image, max 2MB</Form.Text>

                                                    <div className="d-flex align-items-center gap-2 mt-1 flex-wrap">
                                                        {/* Show "already uploaded" only when in edit mode and no new file selected */}
                                                        {isEditMode && !formData.esicCertificate && selectedSalary?.esic_certificate && (
                                                            <small className="text-success">✓ Certificate already uploaded</small>
                                                        )}
                                                        {/* Preview button: shown whenever the employee has an esic_certificate doc */}
                                                        {esicCertDoc?.file_path && (
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                as="a"
                                                                href={`${mediaUrl}${esicCertDoc.file_path}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                👁 Preview ESIC Certificate
                                                            </Button>
                                                        )}
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    )}
                                </div>
                            </Col>

                            {/* Net Salary preview */}
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Net Salary (Preview)</Form.Label>
                                    <Form.Control
                                        readOnly
                                        placeholder="0.00"
                                        className="bg-primary bg-opacity-10 border-primary fw-semibold"
                                        value={netSalary}
                                    />
                                    <Form.Text className="text-muted">Gross − PF − ESIC</Form.Text>
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
                                        {salaryLoading
                                            ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Saving...</>
                                            : isEditMode ? "Update Structure" : "Save Structure"
                                        }
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