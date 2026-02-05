import { useState } from "react";
import {
    Container,
    Card,
    Row,
    Col,
    Form,
    Button,
    InputGroup
} from "react-bootstrap";
import { IoSearchOutline } from "react-icons/io5";


const SalaryStructure = () => {
    const [formData, setFormData] = useState({
        employee: "",
        basicSalary: "",
        hra: "",
        medical: "",
        special: "",
        overtime: "",
        grossSalary: "",
        pf: false,
        esic: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleReset = () => {
        setFormData({
            employee: "",
            basicSalary: "",
            hra: "",
            medical: "",
            special: "",
            overtime: "",
            grossSalary: "",
            pf: false,
            esic: false,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Salary Structure:", formData);
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

            {/* Select Employee */}
            <Card className="mb-4 border-0 shadow-sm">
                <Card.Body>
                    <h6 className="fw-semibold mb-3">Select Employee</h6>

                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <div className="text-muted fs-14" style={{ minWidth: 130 }}>
                            Search by Name
                        </div>

                        <div style={{ maxWidth: 320, width: "100%" }}>
                            <InputGroup>
                                <Form.Control
                                    placeholder="Enter Employee Name or ID"
                                    name="employee"
                                    value={formData.employee}
                                    onChange={handleChange}
                                />
                                <InputGroup.Text>
                                    <IoSearchOutline />
                                </InputGroup.Text>
                            </InputGroup>
                        </div>
                    </div>

                </Card.Body>
            </Card>

            {/* Salary Structure */}
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <h6 className="fw-semibold mb-3">Salary Structure</h6>

                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3 align-items-end">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Basic Salary *</Form.Label>
                                    <Form.Control
                                        name="basicSalary"
                                        value={formData.basicSalary}
                                        onChange={handleChange}
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
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>House Rent Allowance (HRA)</Form.Label>
                                    <Form.Control />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Medical Allowance</Form.Label>
                                    <Form.Control
                                        name="medical"
                                        value={formData.medical}
                                        onChange={handleChange}
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
                                    />
                                </Form.Group>
                            </Col>

                            {/* Last Row */}
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Gross Salary (Monthly)</Form.Label>
                                    <Form.Control
                                        className="bg-success bg-opacity-10 border-success"
                                        name="grossSalary"
                                        value={formData.grossSalary}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>

                            <Col
                                md={4}
                                className="d-flex align-items-center gap-5 ms-5"
                            >
                                <Form.Check
                                    type="switch"
                                    label="PF Applicable"
                                    name="pf"
                                    checked={formData.pf}
                                    onChange={handleChange}
                                    className="border-0"
                                />

                                <Form.Check
                                    type="switch"
                                    label="ESIC Applicable"
                                    name="esic"
                                    checked={formData.esic}
                                    onChange={handleChange}
                                    className="border-0"
                                />
                            </Col>
                        </Row>


                        {/* Toggles & Actions */}
                        <Row className="align-items-center mt-4">

                            <Col className="text-end">
                                <Button
                                    variant="outline-secondary"
                                    className="me-4 px-4"
                                    onClick={handleReset}
                                >
                                    Reset
                                </Button>
                                <Button
                                    type="submit"
                                    className="px-4"
                                    style={{ background: "#6c6cff", border: "none" }}
                                >
                                    Save Structure
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
