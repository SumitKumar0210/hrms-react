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

const SalaryStructure = () => {
    const dispatch = useDispatch();
    
    // Redux state
    const { employees = [], searchLoading } = useSelector((state) => state.employee);
    const { loading: salaryLoading, success, error } = useSelector((state) => state.salaryStructure);

    // Local state
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    
    const [formData, setFormData] = useState({
        basicSalary: "",
        hra: "",
        conveyance: "",
        medical: "",
        special: "",
        overtime: "",
        grossSalary: "",
        pf: false,
        esic: false,
    });

    // Fetch all employees on mount
    useEffect(() => {
        dispatch(fetchAllEmployees());
    }, [dispatch]);

    // Filter employees based on search term
    useEffect(() => {
        if (searchTerm.trim() && !selectedEmployee) { // Only show dropdown if no employee is selected
            const filtered = employees.filter((emp) => {
                const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
                const empCode = emp.employee_code?.toLowerCase() || "";
                const search = searchTerm.toLowerCase();
                
                return fullName.includes(search) || empCode.includes(search);
            });
            setFilteredEmployees(filtered);
            setShowDropdown(true);
        } else {
            setFilteredEmployees([]);
            setShowDropdown(false);
        }
    }, [searchTerm, employees, selectedEmployee]);

    // Auto-calculate gross salary
    useEffect(() => {
        const basic = parseFloat(formData.basicSalary) || 0;
        const hra = parseFloat(formData.hra) || 0;
        const conveyance = parseFloat(formData.conveyance) || 0;
        const medical = parseFloat(formData.medical) || 0;
        const special = parseFloat(formData.special) || 0;

        const gross = basic + hra + conveyance + medical + special;
        
        setFormData(prev => ({
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

    // Auto-apply PF and ESIC rules based on gross salary
    useEffect(() => {
        const gross = parseFloat(formData.grossSalary) || 0;

        if (gross > 0) {
            // PF is applicable if gross salary > 15,000
            const pfApplicable = gross > 15000;
            
            // ESIC is applicable if gross salary <= 21,000
            const esicApplicable = gross <= 21000;

            setFormData(prev => ({
                ...prev,
                pf: pfApplicable,
                esic: esicApplicable,
            }));
        }
    }, [formData.grossSalary]);

    // Handle employee selection
    const handleEmployeeSelect = useCallback((employee) => {
        setSelectedEmployee(employee);
        setSearchTerm(`${employee.first_name} ${employee.last_name} (${employee.employee_code})`);
        setShowDropdown(false);

        // Check if employee has existing salary data
        const existingSalary = employee.salaries && employee.salaries.length > 0 
            ? employee.salaries[0] 
            : null;

        if (existingSalary) {
            // Edit mode - Pre-fill existing salary data
            setIsEditMode(true);
            setFormData({
                basicSalary: existingSalary.basic_salary || "",
                hra: existingSalary.hra || "",
                conveyance: existingSalary.conveyance_allowance || "",
                medical: existingSalary.medical_allowance || existingSalary.medical || "",
                special: existingSalary.special_allowance || existingSalary.special || "",
                overtime: existingSalary.overtime_rate || "",
                grossSalary: existingSalary.gross_salary || "",
                pf: existingSalary.pf_applicable === 1 || existingSalary.pf_applicable === "1",
                esic: existingSalary.esic_applicable === 1 || existingSalary.esic_applicable === "1",
            });
        } else {
            // Create mode - Reset form
            setIsEditMode(false);
            setFormData({
                basicSalary: "",
                hra: "",
                conveyance: "",
                medical: "",
                special: "",
                overtime: "",
                grossSalary: "",
                pf: false,
                esic: false,
            });
        }
    }, []);

    // Handle form input change
    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        
        // Only allow numbers and decimals for salary fields
        if (type !== "checkbox" && name !== "employee") {
            const numericValue = value.replace(/[^0-9.]/g, '');
            setFormData(prev => ({
                ...prev,
                [name]: numericValue,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
        }
    }, []);

    // Handle form reset
    const handleReset = useCallback(() => {
        // Check if there's existing salary data to reset to
        if (selectedEmployee && selectedEmployee.salaries && selectedEmployee.salaries.length > 0) {
            const existingSalary = selectedEmployee.salaries[0];
            setFormData({
                basicSalary: existingSalary.basic_salary || "",
                hra: existingSalary.hra || "",
                conveyance: existingSalary.conveyance_allowance || "",
                medical: existingSalary.medical_allowance || existingSalary.medical || "",
                special: existingSalary.special_allowance || existingSalary.special || "",
                overtime: existingSalary.overtime_rate || "",
                grossSalary: existingSalary.gross_salary || "",
                pf: existingSalary.pf_applicable === 1,
                esic: existingSalary.esic_applicable === 1,
            });
        } else {
            // Reset to empty form
            setFormData({
                basicSalary: "",
                hra: "",
                conveyance: "",
                medical: "",
                special: "",
                overtime: "",
                grossSalary: "",
                pf: false,
                esic: false,
            });
            setSelectedEmployee(null);
            setSearchTerm("");
            setIsEditMode(false);
        }
    }, [selectedEmployee]);

    // Handle form submit
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
            pf_applicable: formData.pf ? 1 : 0,
            esic_applicable: formData.esic ? 1 : 0,
        };

        console.log("Submitting salary data:", salaryData);
        console.log("Is Edit Mode:", isEditMode);

        try {
            if (isEditMode && selectedEmployee.salaries && selectedEmployee.salaries.length > 0) {
                // Update existing salary
                const salaryId = selectedEmployee.salaries[0].id;
                await dispatch(updateSalary({ id: salaryId, values: salaryData })).unwrap();
            } else {
                // Create new salary
                await dispatch(createSalaryStructure(salaryData)).unwrap();
            }
            
            // Clear selection after successful save
            setFormData({
                basicSalary: "",
                hra: "",
                conveyance: "",
                medical: "",
                special: "",
                overtime: "",
                grossSalary: "",
                pf: false,
                esic: false,
            });
            setSelectedEmployee(null);
            setSearchTerm("");
            setIsEditMode(false);
            
            // Refresh employee list to get updated salary data
            dispatch(fetchAllEmployees());
        } catch (err) {
            console.error("Failed to save salary structure:", err);
        }
    };

    return (
        <Container fluid className="my-3">
            {/* Header */}
            <div className="mb-3">
                <h5 className="fw-semibold mb-0">Salary Structure & Revision</h5>
                <small className="text-muted">
                    Create salary structure for new employees and revise salary for existing employees
                </small>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <Alert variant="success" dismissible onClose={() => dispatch(clearSuccess())}>
                    Salary structure {isEditMode ? 'updated' : 'created'} successfully!
                </Alert>
            )}
            {error && (
                <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>
                    {error}
                </Alert>
            )}

            {/* Select Employee */}
            <Card className="mb-4 border-0 shadow-sm">
                <Card.Body>
                    <h6 className="fw-semibold mb-3">Select Employee</h6>

                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <div className="text-muted fs-14" style={{ minWidth: 130 }}>
                            Search by Name
                        </div>

                        <div style={{ maxWidth: 320, width: "100%", position: "relative" }}>
                            <InputGroup>
                                <Form.Control
                                    placeholder="Enter Employee Name or ID"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        // Clear selected employee if user starts typing again
                                        if (selectedEmployee) {
                                            setSelectedEmployee(null);
                                            setIsEditMode(false);
                                        }
                                    }}
                                    onFocus={() => {
                                        if (searchTerm && !selectedEmployee) {
                                            setShowDropdown(true);
                                        }
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

                            {/* Employee Dropdown */}
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
                                            className="cursor-pointer"
                                        >
                                            <div className="fw-semibold">
                                                {emp.first_name} {emp.last_name}
                                                {emp.salaries && emp.salaries.length > 0 && (
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
                                    style={{ 
                                        zIndex: 1000,
                                        top: "100%",
                                        marginTop: "2px"
                                    }}
                                >
                                    <ListGroup.Item className="text-muted">
                                        No employees found
                                    </ListGroup.Item>
                                </ListGroup>
                            )}
                        </div>
                    </div>

                    {/* Selected Employee Info */}
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
                                    <div className="fw-semibold">
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

            {/* Salary Structure Form */}
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <h6 className="fw-semibold mb-3">
                        Salary Structure {isEditMode && <span className="text-muted">(Editing)</span>}
                    </h6>

                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3 align-items-end">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Basic Salary *</Form.Label>
                                    <Form.Control
                                        name="basicSalary"
                                        value={formData.basicSalary}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        required
                                        disabled={!selectedEmployee}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>House Rent Allowance (HRA)</Form.Label>
                                    <Form.Control
                                        name="hra"
                                        value={formData.hra}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        disabled={!selectedEmployee}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Conveyance Allowance</Form.Label>
                                    <Form.Control
                                        name="conveyance"
                                        value={formData.conveyance}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        disabled={!selectedEmployee}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Medical Allowance</Form.Label>
                                    <Form.Control
                                        name="medical"
                                        value={formData.medical}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        disabled={!selectedEmployee}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Special Allowance</Form.Label>
                                    <Form.Control
                                        name="special"
                                        value={formData.special}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        disabled={!selectedEmployee}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Overtime Rate (per hour)</Form.Label>
                                    <Form.Control
                                        name="overtime"
                                        value={formData.overtime}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        disabled={!selectedEmployee}
                                    />
                                </Form.Group>
                            </Col>

                            {/* Gross Salary & Toggles */}
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Gross Salary (Monthly)</Form.Label>
                                    <Form.Control
                                        className="bg-success bg-opacity-10 border-success fw-semibold"
                                        name="grossSalary"
                                        value={formData.grossSalary}
                                        readOnly
                                        placeholder="0.00"
                                    />
                                    <Form.Text className="text-muted">
                                        Auto-calculated based on allowances
                                    </Form.Text>
                                </Form.Group>
                            </Col>

                            <Col md={4} className="d-flex align-items-center gap-4">
                                <Form.Check
                                    type="switch"
                                    label={
                                        <span>
                                            PF Applicable
                                            <small className="d-block text-muted" style={{ fontSize: "0.75rem" }}>
                                                (Gross &gt; ₹15,000)
                                            </small>
                                        </span>
                                    }
                                    name="pf"
                                    checked={formData.pf}
                                    onChange={handleChange}
                                    disabled={!selectedEmployee}
                                />

                                <Form.Check
                                    type="switch"
                                    label={
                                        <span>
                                            ESIC Applicable
                                            <small className="d-block text-muted" style={{ fontSize: "0.75rem" }}>
                                                (Gross ≤ ₹21,000)
                                            </small>
                                        </span>
                                    }
                                    name="esic"
                                    checked={formData.esic}
                                    onChange={handleChange}
                                    disabled={!selectedEmployee}
                                />
                            </Col>
                        </Row>

                        {/* Action Buttons */}
                        <Row className="align-items-center mt-4">
                            <Col className="text-end">
                                <Button
                                    variant="outline-secondary"
                                    className="me-3 px-4"
                                    onClick={handleReset}
                                    disabled={salaryLoading}
                                >
                                    Reset
                                </Button>
                                <Button
                                    type="submit"
                                    className="px-4"
                                    style={{ background: "#6c6cff", border: "none" }}
                                    disabled={!selectedEmployee || salaryLoading}
                                >
                                    {salaryLoading ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                className="me-2"
                                            />
                                            Saving...
                                        </>
                                    ) : (
                                        isEditMode ? "Update Structure" : "Save Structure"
                                    )}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default SalaryStructure;