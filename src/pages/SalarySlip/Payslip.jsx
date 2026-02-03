import React from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Table,
    Button
} from "react-bootstrap";
import { BsDownload, BsEnvelope } from "react-icons/bs";

const Payslip = () => {
    return (
        <Container fluid className="my-3">
            <Row>
                <Col className="mb-3">
                    <h5 className="fw-semibold mb-0">Pay Slip</h5>
                    <small className="text-muted">Generated for the month of January 2026</small>
                  </Col>
            </Row>
            <Card className="p-4 shadow-sm border-0 rounded-3">

                {/* ACTION BUTTONS */}
                <div className="d-flex justify-content-end gap-3 mb-3">
                    <Button size="sm" variant="outline-secondary">
                        <BsDownload className="me-1" /> Download PDF
                    </Button>
                    <Button size="sm" variant="outline-primary">
                        <BsEnvelope className="me-1" /> Send Email
                    </Button>
                </div>

                {/* HEADER */}
                <Row className="mb-4">
                    <Col>
                        <h6 className="fw-semibold mb-1">Sample Company</h6>
                        <div className="text-muted small">
                            123 Marina Road, Chennai - 600001<br />
                            Tel: +91 44 1234 5678
                        </div>
                    </Col>

                    <Col className="text-end">
                        <h6 className="fw-semibold mb-1">Employee Details</h6>
                        <div className="small">
                            Rajesh Kumar (EMP-2024-1523)<br />
                            Room Attendant Supervisor<br />
                            Housekeeping<br />
                            Bank: XXXX XXXX XXXX 4567
                        </div>
                    </Col>
                </Row>

                {/* EARNINGS & DEDUCTIONS */}
                <Row className="mb-4">
                    <Col md={6}>
                        <Card className="h-100">
                            <Card.Header className="fw-semibold">EARNINGS</Card.Header>
                            <Table size="sm" borderless striped className="mb-0">
                                <tbody>
                                    <tr>
                                        <td className="py-2 px-3">Basic Salary</td>
                                        <td className="py-2 px-3 text-end">₹ 25,000.00</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3">HRA</td>
                                        <td className="py-2 px-3 text-end">₹ 10,000.00</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3">Allowances</td>
                                        <td className="py-2 px-3 text-end">₹ 5,000.00</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3">Overtime</td>
                                        <td className="py-2 px-3 text-end">₹ 3,500.00</td>
                                    </tr>
                                    <tr className="fw-bold border-top">
                                        <td className="py-2 px-3">Total Earnings</td>
                                        <td className="py-2 px-3 text-end">₹ 43,500.00</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card>
                    </Col>

                    <Col md={6}>
                        <Card className="h-100">
                            <Card.Header className="fw-semibold">DEDUCTIONS</Card.Header>
                            <Table size="sm" borderless striped className="mb-0">
                                <tbody>
                                    <tr>
                                        <td className="py-2 px-3">PF (Employee)</td>
                                        <td className="py-2 px-3 text-end">₹ 2,500.00</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3">ESIC (Employee)</td>
                                        <td className="py-2 px-3 text-end">₹ 1,000.00</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3">Other Deductions</td>
                                        <td className="py-2 px-3 text-end">₹ 500.00</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card>
                    </Col>
                </Row>

                {/* NET PAY */}
                <Card className="bg-success bg-opacity-25 border-success mb-4">
                    <Card.Body className="d-flex justify-content-between align-items-center px-4 py-3">
                        <h5 className="mb-0 fw-semibold">NET PAY</h5>
                        <h5 className="mb-0 fw-semibold"><span className="fw-normal">₹</span> 39,250.00</h5>
                    </Card.Body>
                </Card>

                {/* FOOTER */}
                <div className="text-center small fs-12 text-muted mb-4">
                    This is a system-generated document and does not require a physical signature.
                </div>

                {/* SIGNATURE BLOCK */}
                <div className="d-flex justify-content-end mt-3 print-signature">
                    <div className="text-center small signature-box">
                        <div className="signature-line mb-2"></div>
                        <div className="fw-semibold">Authorized Signatory</div>
                        <div>HR Department</div>
                    </div>
                </div>


                <div className="text-center small fs-12 text-muted mt-4">
                    This document is optimized for printing on A4 paper
                </div>

            </Card>
        </Container>
    );
};

export default Payslip;
