import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
} from "react-bootstrap";

const StatutoryBenefits = () => {
  const [pfEnabled, setPfEnabled] = useState(true);
  const [esicEnabled, setEsicEnabled] = useState(true);

  return (
    <Container fluid className="py-3">
      {/* ================= HEADER ================= */}
        <Row className="align-items-center mb-3">
            <Col>
                <h5 className="mb-0">Statutory Benefits Setup</h5>
                <small className="text-muted">Configure PF & ESIC for Employee Profile </small>
            </Col>
        </Row>
        {/* ================= EMPLOYEE DETAILS ================= */}
      <Card className="mb-4 border-warning bg-warning-subtle">
        <Card.Body>
          <Row className="text-center text-md-start">
            <Col md={4}>
                <small className="text-muted">Employee Name</small>
                <div className="fw-semibold">Rajesh Kumar</div>
            </Col>
            <Col md={4}>
                <small className="text-muted">Employee ID</small>
                <div className="fw-semibold">EMP-2024-001</div>
            </Col>
            <Col md={4}>
                <small className="text-muted">Basic Salary</small>
                <div className="fw-semibold">₹12,000</div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ================= PF & ESIC ================= */}
      <Row className="g-4">
        {/* ================= PF ================= */}
        <Col md={6}>
          <Card className="h-100 border-primary-subtle" style={{ background: "#eaf1ff" }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h6 className="fw-semibold mb-0">Provident Fund (PF)</h6>
                  <small className="text-muted">
                    Eligible (Salary ≤ ₹15,000)
                  </small>
                </div>
                <Form.Check
                  type="switch"
                  checked={pfEnabled}
                  onChange={() => setPfEnabled(!pfEnabled)}
                />
              </div>

              <Form.Group className="mb-3">
                <Form.Label>UAN Number *</Form.Label>
                <Form.Control
                  placeholder="Enter 12 digit UAN"
                  disabled={!pfEnabled}
                />
              </Form.Group>

              <Row className="g-3">
                <Col md={4} className="d-flex">
                  <Card className="text-center h-100 w-100" >
                    <Card.Body>
                      <small className="text-muted">Employee Contribution</small>
                      <div className="fw-semibold fs-5">₹1440.00</div>
                      <small className="text-muted">12% of Basic Salary</small>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4} className="d-flex">
                  <Card className="text-center h-100 w-100" >
                    <Card.Body>
                      <small className="text-muted">Employer Contribution</small>
                      <div className="fw-semibold fs-5">₹1440.00</div>
                      <small className="text-muted">12% of Basic Salary</small>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4} className="d-flex">
                  <Card className="text-center h-100 w-100" >
                    <Card.Body>
                      <small className="text-muted">Total Monthly PF</small>
                      <div className="fw-semibold fs-5">₹2880.00</div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* ================= ESIC ================= */}
        <Col md={6}>
          <Card className="h-100 border-primary-subtle" style={{ background: "#eaf1ff" }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h6 className="fw-semibold mb-0">
                    Employee State Insurance (ESIC)
                  </h6>
                  <small className="text-muted">
                    Eligible (Salary ≤ ₹21,000)
                  </small>
                </div>
                <Form.Check
                  type="switch"
                  checked={esicEnabled}
                  onChange={() => setEsicEnabled(!esicEnabled)}
                />
              </div>

              <Form.Group className="mb-3">
                <Form.Label>ESIC IP Number *</Form.Label>
                <Form.Control
                  placeholder="Enter 17 digit ESIC IP Number"
                  disabled={!esicEnabled}
                />
              </Form.Group>

              <Row className="g-3">
                <Col md={4} className="d-flex">
                  <Card className="text-center h-100 w-100" >
                    <Card.Body>
                      <small className="text-muted">Employee Contribution</small>
                      <div className="fw-semibold fs-5">₹90.00</div>
                      <small className="text-muted">0.75% of Salary</small>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4} className="d-flex">
                  <Card className="text-center h-100 w-100">
                    <Card.Body>
                      <small className="text-muted">Employer Contribution</small>
                      <div className="fw-semibold fs-5">₹90.00</div>
                      <small className="text-muted">3.25% of Salary</small>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4} className="d-flex">
                  <Card className="text-center h-100 w-100">
                    <Card.Body>
                      <small className="text-muted">Total Monthly ESIC</small>
                      <div className="fw-semibold fs-5">₹180.00</div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ================= FOOTER ACTIONS ================= */}
      <div className="d-flex justify-content-between mt-4">
        <Button variant="outline-secondary">Cancel</Button>
        <Button variant="warning" className="px-4">
          Save Configuration
        </Button>
      </div>
    </Container>
  );
};

export default StatutoryBenefits;
