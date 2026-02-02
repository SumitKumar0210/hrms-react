import React from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Alert,
    Form,
    Badge,
} from "react-bootstrap";
import { ImInfo } from "react-icons/im";
import { BsDownload } from "react-icons/bs";

const EmployeeFinalSettlement = () => {
    return (
        <Container fluid className="py-3">
            {/* Header */}
            <div className="mb-3">
                <h5 className="mb-0">Full & Final Settlement</h5>
                <small className="text-muted">Exit ID: EXIT-2026-0847</small>
            </div>

            {/* Employee Info */}
            <Card className="mb-3 border-success bg-success-subtle">
                <Card.Body>
                    <h6 className="mb-2">Employee Information</h6>
                    <Row className="gy-2">
                        <Col md={2}><small className="fs-14">Name</small><div className="fw-semibold">Priya Sharma</div></Col>
                        <Col md={2}><small className="fs-14">Employee ID</small><div className="fw-semibold">EMP-2847</div></Col>
                        <Col md={2}><small className="fs-14">Department</small><div className="fw-semibold">Housekeeping</div></Col>
                        <Col md={2}><small className="fs-14">Exit Type</small><div className="fw-semibold">Resignation</div></Col>
                        <Col md={2}><small className="fs-14">Joining Date</small><div className="fw-semibold">15-03-2019</div></Col>
                        <Col md={2}><small className="fs-14">Service Duration</small><div className="fw-semibold">6.9 Years</div></Col>
                    </Row>
                </Card.Body>
            </Card>

           <Row className="g-3 mb-3">
  {/* Dues Payable */}
  <Col md={6}>
    <Card className="h-100 bg-warning-subtle border rounded-3">
      <Card.Body>
        <h6 className="mb-3">Dues Payable to Employee</h6>

        <Row className="mb-2">
          <Col md={4}>
            <small className="text-muted d-block">Outstanding Salary (Prorated)</small>
            <div className="fw-semibold">₹45,000</div>
          </Col>
          <Col md={4}>
            <small className="text-muted d-block">Leave Encashment (8 days)</small>
            <div className="fw-semibold">₹12,000</div>
          </Col>
           <Col md={4}>
            <small className="text-muted d-block">Performance Bonus</small>
            <div className="fw-semibold">₹8,000</div>
          </Col>
        </Row>

        <Row className="mb-2">
         
          <Col md={4}>
            <small className="text-muted d-block">Gratuity (6.9 years of service)</small>
            <div className="fw-semibold">₹52,000</div>
          </Col>
          <Col md={4}>
            <small className="text-muted d-block">Overtime Pending</small>
            <div className="fw-semibold">₹0</div>
          </Col>
        </Row>

        

        <hr />

        <div className="d-flex justify-content-between fw-semibold text-success">
          <span>Total Payable:</span>
          <span>₹1,17,000</span>
        </div>
      </Card.Body>
    </Card>
  </Col>

  {/* Dues Recoverable */}
  <Col md={6}>
    <Card className="h-100 bg-warning-subtle border rounded-3">
      <Card.Body>
        <h6 className="mb-3">Dues Recoverable from Employee</h6>

        <Row className="mb-2">
          <Col md={6}>
            <small className="text-muted d-block">Notice Period Shortfall (30 days)</small>
            <div className="fw-semibold">₹15,000</div>
          </Col>
          <Col md={6}>
            <small className="text-muted d-block">Salary Advances / Loans</small>
            <div className="fw-semibold">₹0</div>
          </Col>
        </Row>

        <Row className="mb-2">
          <Col md={6}>
            <small className="text-muted d-block">Company Assets Not Returned</small>
            <div className="fw-semibold">₹0</div>
          </Col>
          <Col md={6}>
            <small className="text-muted d-block">Accommodation Adjustment</small>
            <div className="fw-semibold">₹0</div>
          </Col>
        </Row>

        <hr />

        <div className="d-flex justify-content-between fw-semibold text-danger">
          <span>Total Recoverable:</span>
          <span>₹15,000</span>
        </div>
      </Card.Body>
    </Card>
  </Col>
</Row>


            {/* Statutory + NOC */}
            <Row className="g-3 mb-3">
                <Col md={6}>
  <Card className="bg-warning-subtle h-100">
    <Card.Body>
      <h6 className="mb-3">Statutory Compliance</h6>

      <Row className="g-3">
        {/* Provident Fund */}
        <Col md={6}>
          <Card className="border rounded-3">
            <Card.Body className="py-2">
              <div className="fw-semibold mb-1">Provident Fund (PF)</div>
              <div className="small text-muted d-flex justify-content-between">
                <span>Employee Contribution:</span>
                <span>₹5,400</span>
              </div>
              <div className="small text-muted d-flex justify-content-between">
                <span>Employer Contribution:</span>
                <span>₹5,400</span>
              </div>
              <div className="small fw-semibold d-flex justify-content-between mt-1">
                <span>Total PF Balance:</span>
                <span>₹10,800</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* ESI */}
        <Col md={6}>
          <Card className="border rounded-3">
            <Card.Body className="py-2">
              <div className="fw-semibold mb-1">Employee State Insurance</div>
              <div className="small text-muted d-flex justify-content-between">
                <span>Employee Contribution:</span>
                <span>₹675</span>
              </div>
              <div className="small text-muted d-flex justify-content-between">
                <span>Employer Contribution:</span>
                <span>₹3,375</span>
              </div>
              <div className="small fw-semibold d-flex justify-content-between mt-1">
                <span>Medical Benefit Valid Till:</span>
                <span>90 days</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* TDS */}
        <Col md={12}>
          <Card className="border rounded-3">
            <Card.Body className="py-2">
              <div className="fw-semibold mb-1">
                Tax Deduction at Source (TDS)
              </div>
              <div className="small text-muted mb-1">
                Total TDS Deducted (FY 2025-26): <strong>₹2,500</strong>
              </div>
              <div className="small text-muted">
                Form 16 (TDS Certificate) will be generated and provided
                within 15 days of settlement
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Card.Body>
  </Card>
</Col>

                <Col md={6}>
                    <Card className="bg-warning-subtle h-100">
                        <Card.Body>
                            <h6 className="mb-3">Clearance & No Objection Certificate (NOC)</h6>

                            <Row className="g-3">
                                <Col md={6}>
                                    <Card className="border rounded-3">
                                        <Card.Body className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-muted d-block">
                                                    Work handover & transition complete
                                                </small>
                                                <div className="fw-semibold">Department Head</div>
                                            </div>
                                            <Form.Check type="checkbox" />
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={6}>
                                    <Card className="border rounded-3">
                                        <Card.Body className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-muted d-block">
                                                    Laptop, access cards, software licenses returned
                                                </small>
                                                <div className="fw-semibold">IT Department</div>
                                            </div>
                                            <Form.Check type="checkbox" />
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={6}>
                                    <Card className="border rounded-3">
                                        <Card.Body className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-muted d-block">
                                                    No pending advances, loans, or dues
                                                </small>
                                                <div className="fw-semibold">Finance Department</div>
                                            </div>
                                            <Form.Check type="checkbox" />
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={6}>
                                    <Card className="border rounded-3">
                                        <Card.Body className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-muted d-block">
                                                    ID card, uniforms, keys, equipment returned
                                                </small>
                                                <div className="fw-semibold">Admin Department</div>
                                            </div>
                                            <Form.Check type="checkbox" />
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

            </Row>

            {/* Documents */}
            <Row className="gy-2 gx-3 mb-3">
                {[
                    "Experience Letter",
                    "Relieving Letter",
                    "Service Certificate",
                    "Form 16",
                    "PF Withdrawal (Form 19)",
                    "Salary & Settlement Breakup",
                ].map(doc => (
                    <Col md={4} key={doc}>
                        <Button variant="outline-dark" className="w-100">
                            <BsDownload className="me-2" />
                            {doc}
                        </Button>
                    </Col>
                ))}
            </Row>

            {/* Important Notice */}
            <Alert variant="danger">
                <div className="d-flex gap-2">
                    <ImInfo className="mt-1" />
                    <div>
                        <strong>Important Notice</strong>
                        <div className="small">
                            All clearances must be completed before final settlement.
                            Employee will be marked as separated after processing.
                        </div>
                    </div>
                </div>
            </Alert>

            {/* Footer */}
            <div className="d-flex justify-content-between">
                <Button variant="outline-secondary">Save as Draft</Button>
                <Button variant="primary">
                    Complete Settlement & Process Payment
                </Button>
            </div>
        </Container>
    );
};

export default EmployeeFinalSettlement;
