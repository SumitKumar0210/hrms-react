import React, { useState, forwardRef } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Button,
    Alert,
    InputGroup,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import { BsCalendar3 } from "react-icons/bs";
import { ImInfo } from "react-icons/im";
import { useNavigate } from "react-router-dom";

import "react-datepicker/dist/react-datepicker.css";

/* ===== Custom Date Input with Calendar Icon ===== */
const DateInput = forwardRef(({ value, onClick }, ref) => (
    <InputGroup>
        <Form.Control
            ref={ref}
            value={value}
            onClick={onClick}
            placeholder="Select date"
            readOnly
        />
        <InputGroup.Text role="button" onClick={onClick}>
            <BsCalendar3 />
        </InputGroup.Text>
    </InputGroup>
));

const EmployeeExit = () => {
    const [lastWorkingDay, setLastWorkingDay] = useState(null);
    const [confirmExit, setConfirmExit] = useState(false);
    const navigate = useNavigate();
    return (
        <Container fluid className="py-3">
            {/* Header */}
            <div className="mb-3">
                <h5 className="mb-0">Employee Exit</h5>
                <small className="text-muted">
                    Initiate employee separation process
                </small>
            </div>

            {/* Employee Information */}
            <Card className="mb-4 border-success bg-success-subtle">
                <Card.Body>
                    <h6 className="mb-2">Employee Information</h6>
                    <Row className="gy-2">
                        <Col md={2}>
                            <small className="text-muted fs-14">Employee Name</small>
                            <div className="fw-semibold">Priya Sharma</div>
                        </Col>
                        <Col md={2}>
                            <small className="text-muted fs-14">Employee ID</small>
                            <div className="fw-semibold">EMP-2847</div>
                        </Col>
                        <Col md={2}>
                            <small className="text-muted fs-14">Department</small>
                            <div className="fw-semibold">Housekeeping</div>
                        </Col>
                        <Col md={2}>
                            <small className="text-muted fs-14">Role</small>
                            <div className="fw-semibold">Senior</div>
                        </Col>
                        <Col md={2}>
                            <small className="text-muted fs-14">Employment Type</small>
                            <div className="fw-semibold">Full Time</div>
                        </Col>
                        <Col md={2}>
                            <small className="text-muted fs-14">Current Status</small>
                            <div className="fw-semibold text-success">Active</div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Exit Details + Payroll Impact */}
            <Row className="g-4">
                {/* Exit Details */}
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <h6 className="mb-3">Exit Details</h6>

                            {/* Exit Type + Last Working Day */}
                            <Row className="mb-3">
                                <Col md={4}>
                                    <Form.Group className="mb-0">
                                        <Form.Label>Exit Type *</Form.Label>
                                        <Form.Select size="sm">
                                            <option>Select exit type</option>
                                            <option>Resignation</option>
                                            <option>Termination</option>
                                            <option>Absconding</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={4}>
                                    <Form.Label>Last Working Day *</Form.Label>
                                    <div className="d-block w-100">
                                        <DatePicker
                                            selected={lastWorkingDay}
                                            onChange={(date) => setLastWorkingDay(date)}
                                            dateFormat="dd/MM/yyyy"
                                            customInput={<DateInput />}
                                            placeholderText="Select date"
                                            className="form-control w-100"
                                        />
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-0">
                                        <Form.Label className="mb-0">Eligible for Full & Final</Form.Label>
                                        <div className="d-flex gap-3 ms-3">
                                            <Form.Check
                                                type="radio"
                                                label="Yes"
                                                name="fnf"
                                                defaultChecked
                                                className="border-0"
                                            />
                                            <Form.Check type="radio" label="No" name="fnf" className="border-0" />
                                        </div>
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* Eligible for F&F */}


                            {/* Exit Reason */}
                            <Form.Group>
                                <Form.Label>Exit Reason *</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Enter exit reason"
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Payroll Impact Preview */}
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <h6 className="mb-3">Payroll Impact Preview</h6>

                            <Row className="mb-2">
                                <Col>
                                    <small className="text-muted">Salary Payable Till Last</small>
                                    <div className="fw-semibold">₹33,000.00</div>
                                </Col>
                                <Col>
                                    <small className="text-muted">Pending Attendance</small>
                                    <div className="fw-semibold">22 days</div>
                                </Col>
                            </Row>

                            <Row className="mb-1">
                                <Col>
                                    <small className="text-muted">Leave Balance Adjustment</small>
                                    <div className="fw-semibold mb-3">8 days (₹12,000.00)</div>
                                    <small className="text-muted">Full & Final Settlement</small>
                                    <div className="fw-semibold">Yes</div>
                                </Col>
                                <Col>
                                    <small className="text-muted">
                                        PF / ESIC Applicability Status
                                    </small>
                                    <div className="fw-semibold">
                                        <p>PF: Applicable</p>
                                        <p>ESIC: Applicable</p>
                                    </div>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col>

                                </Col>
                            </Row>

                            <Row>

                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Warning */}
            <Alert variant="danger" className="mt-4">
                <div className="d-flex align-items-start gap-2">
                    <ImInfo className="mt-1" />

                    <div>
                        <div className="fw-semibold mb-1">Important Warning</div>
                        <small>
                            Once an employee exit is confirmed, the employee will be excluded from
                            future payroll cycles. This action cannot be undone.
                        </small>

                        <Form.Check
                            className="mt-2 ms-2 border-0"
                            type="checkbox"
                            label="I confirm the exit details are correct and understand this action is irreversible"
                            checked={confirmExit}
                            onChange={(e) => setConfirmExit(e.target.checked)}
                        />
                    </div>
                </div>
            </Alert>


            {/* Footer Actions */}
            <div className="d-flex justify-content-between mt-3">
                <Button variant="outline-secondary">Cancel</Button>
                <Button variant="primary" onClick={() => navigate("/employees/full-final-settlement")} >
                    Proceed to Full & Final Settlement
                </Button>
            </div>
        </Container>
    );
};

export default EmployeeExit;
