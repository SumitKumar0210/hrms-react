import React, { useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Button,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import { FiClock } from "react-icons/fi";

const ManualAttendanceCorrection = () => {
    const [employee, setEmployee] = useState("");
    const [date, setDate] = useState(new Date());
    const [checkIn, setCheckIn] = useState(null);
    const [checkOut, setCheckOut] = useState(null);
    const [status, setStatus] = useState("");
    const [reason, setReason] = useState("");

    return (
        <Container fluid className="py-3">
            {/* Header */}
            <div className="mb-3">
                <h5 className="fw-semibold mb-0">Manual Attendance Correction</h5>
                <small className="text-muted">
                    Update and Correct employee attendance records with full audit trail
                </small>
            </div>

            <Row className="g-3">
                {/* Left Section */}
                <Col md={5}>
                    <Card className="border-0 shadow-sm bg-primary-subtle">
                        <Card.Body>
                            <h6 className="fw-semibold mb-3">Search Attendance Record</h6>

                            <Form>

                                <Row className="align-items-end mb-3 g-3">
                                    {/* Employee */}
                                    <Col md={5}>
                                        <Form.Group>
                                            <Form.Label>EMPLOYEE *</Form.Label>
                                            <Form.Select
                                                value={employee}
                                                onChange={(e) => setEmployee(e.target.value)}
                                            >
                                                <option value="">Select an Employee</option>
                                                <option value="1">John Doe</option>
                                                <option value="2">Jane Smith</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>

                                    {/* Date */}
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label>DATE *</Form.Label>
                                            <DatePicker
                                                selected={date}
                                                onChange={(date) => setDate(date)}
                                                dateFormat="dd/MM/yyyy"
                                                className="form-control"
                                            />
                                        </Form.Group>
                                    </Col>

                                    {/* Button */}
                                    <Col md={3}>
                                        <Button className="w-100">
                                            Search Record
                                        </Button>
                                    </Col>
                                </Row>





                                {/* Correction Form */}
                                <Card className="border rounded-3">
                                    <Card.Body>
                                        <p className="fw-semibold d-block">
                                            Correction Form
                                        </p>

                                        {/* Check-in */}
                                        <Form.Group className="py-2 border-bottom">
                                            <Row className="align-items-center">
                                                <Col md={9}>
                                                    <Form.Label className="mb-0 text-muted fw-semibold">
                                                        CHECK-IN TIME
                                                    </Form.Label>
                                                </Col>
                                                <Col md={3} className="text-end">
                                                    <DatePicker
                                                        selected={checkIn}
                                                        onChange={(time) => setCheckIn(time)}
                                                        showTimeSelect
                                                        showTimeSelectOnly
                                                        timeIntervals={15}
                                                        timeCaption="Time"
                                                        dateFormat="hh:mm aa"
                                                        className="form-control"
                                                        placeholderText="12:30 PM"
                                                    />
                                                </Col>
                                            </Row>
                                        </Form.Group>

                                        {/* Check-out */}
                                        <Form.Group className="py-2 border-bottom">
                                            <Row className="align-items-center">
                                                <Col md={9}>
                                                    <Form.Label className="mb-0 text-muted fw-semibold">
                                                        CHECK-OUT TIME
                                                    </Form.Label>
                                                </Col>
                                                <Col md={3} className="text-end">
                                                    <DatePicker
                                                        selected={checkOut}
                                                        onChange={(time) => setCheckOut(time)}
                                                        showTimeSelect
                                                        showTimeSelectOnly
                                                        timeIntervals={15}
                                                        timeCaption="Time"
                                                        dateFormat="hh:mm aa"
                                                        className="form-control"
                                                        placeholderText="12:30 PM"
                                                    />
                                                </Col>
                                            </Row>
                                        </Form.Group>

                                        {/* Status */}
                                        <Form.Group className="py-2 border-bottom">
                                            <Row className="align-items-center">
                                                <Col md={9}>
                                                    <Form.Label className="mb-0 text-muted fw-semibold">
                                                        STATUS *
                                                    </Form.Label>
                                                </Col>
                                                <Col md={3} className="text-end">
                                                    <Form.Select className="form-control">
                                                        <option value="">Select</option>
                                                        <option value="present">Present</option>
                                                        <option value="absent">Absent</option>
                                                        <option value="halfday">Half Day</option>
                                                    </Form.Select>
                                                </Col>
                                            </Row>
                                        </Form.Group>

                                        {/* Reason */}
                                        <Form.Group className="mt-3">
                                            <Form.Label>CORRECTION REASON *</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                placeholder="Enter reason for correction"
                                            />
                                        </Form.Group>
                                    </Card.Body>
                                </Card>

                                {/* Actions */}
                                <div className="d-flex justify-content-between mt-3">
                                    <Button variant="outline-secondary">
                                        Cancel
                                    </Button>
                                    <Button variant="warning">
                                        Save Correction
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Section */}
                <Col md={7}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="d-flex flex-column">
                            <h6 className="fw-semibold mb-3">Correction History</h6>

                            <div className="flex-grow-1 d-flex align-items-center justify-content-center text-muted text-center">
                                <div>
                                    <FiClock size={28} className="mb-2 opacity-50" />
                                    <p className="mb-0 fw-semibold">
                                        No correction history available
                                    </p>
                                    <small>
                                        Search for a record to view history
                                    </small>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ManualAttendanceCorrection;
