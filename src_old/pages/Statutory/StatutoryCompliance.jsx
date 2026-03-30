import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
} from "react-bootstrap";

const StatutoryCompliance = () => {
  return (
    <Container fluid className="py-3">

      {/* ================= HEADER ================= */}
      <Row className="align-items-center mb-3">
        <Col>
          <h5 className="mb-0">Statutory Compliance</h5>
          <small className="text-muted">
            PF & ESI management for your hotel
          </small>
        </Col>

        <Col md="auto">
          <Form.Control
            type="text"
            value="January 2026"
            readOnly
            className="text-center"
          />
        </Col>
      </Row>

      {/* ================= SUMMARY CARDS ================= */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="h-100 border-primary bg-primary-subtle">
            <Card.Body>
              <div className="fw-semibold text-primary">
                PF Applicable Employees
              </div>
              <h3 className="text-primary mb-1">47</h3>
              <small className="text-muted">
                Out of 52 total employees
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 border-success bg-success-subtle">
            <Card.Body>
              <div className="fw-semibold text-success">
                ESIC Applicable Employees
              </div>
              <h3 className="text-success mb-1">38</h3>
              <small className="text-muted">
                Out of 52 total employees
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 border-warning bg-warning-subtle">
            <Card.Body>
              <div className="fw-semibold text-warning">
                PF Contribution (Jan 2025)
              </div>
              <h5 className="mb-2 text-warning">₹94,340</h5>
              <small className="d-block">
                Employer: ₹61,421
              </small>
              <small>
                Employee: ₹32,919
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 border-danger bg-danger-subtle">
            <Card.Body>
              <div className="fw-semibold text-danger">
                ESIC Contribution (Jan 2025)
              </div>
              <h5 className="mb-2 text-danger">₹29,640</h5>
              <small className="d-block">
                Employer: ₹22,800
              </small>
              <small>
                Employee: ₹6,840
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ================= PF SECTION ================= */}
      <Row className="g-3 mb-4">
        <Col md={9}>
          <Card className="border-primary bg-primary-subtle">
            <Card.Body>
              <h6 className="text-primary mb-3">
                Provident Fund (PF)
              </h6>
              <small className="text-muted">
                EPF & EPS contributions for January 2025
              </small>

              <Row className="g-3 mt-3">
                <Col md={4}>
                  <Card className="bg-primary-subtle border-primary">
                    <Card.Body>
                      <div className="fw-semibold">
                        Employee Share (12%)
                      </div>
                      <h5 className="mb-0">₹32,919</h5>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="bg-primary-subtle border-primary">
                    <Card.Body>
                      <div className="fw-semibold">
                        Employer Share (13%)
                      </div>
                      <h5 className="mb-0">₹61,421</h5>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="bg-primary-subtle border-primary">
                    <Card.Body>
                      <div className="fw-semibold">
                        Total Contribution
                      </div>
                      <h5 className="mb-0">₹94,340</h5>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Button
                variant="primary"
                className="w-100 mt-3"
              >
                Review PF Data
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 d-flex align-items-center justify-content-center bg-primary-subtle border-primary">
            <Button variant="link" className="fw-semibold text-decoration-none text-primary">
              Generate ECR
            </Button>
          </Card>
        </Col>
      </Row>

      {/* ================= ESIC SECTION ================= */}
      <Row className="g-3 mb-4">
        <Col md={9}>
          <Card className="border-success bg-success bg-opacity-10">
            <Card.Body>
              <h6 className="text-success mb-3">
                Employee State Insurance (ESIC)
              </h6>
              <small className="text-muted">
                ESIC contributions for January 2025
              </small>

              <Row className="g-3 mt-3">
                <Col md={4}>
                  <Card className="bg-success-subtle border-success">
                    <Card.Body>
                      <div className="fw-semibold">
                        Employee Share (0.75%)
                      </div>
                      <h5 className="mb-0">₹6,840</h5>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="bg-success-subtle border-success">
                    <Card.Body>
                      <div className="fw-semibold">
                        Employer Share (3.25%)
                      </div>
                      <h5 className="mb-0">₹22,800</h5>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="bg-success-subtle border-success">
                    <Card.Body>
                      <div className="fw-semibold">
                        Total Contribution
                      </div>
                      <h5 className="mb-0">₹29,640</h5>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Button
                variant="success"
                className="w-100 mt-3"
              >
                Review ESIC Data
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 d-flex align-items-center justify-content-center border-success bg-success-subtle">
            <Button variant="link" className="fw-semibold text-decoration-none text-success">
              Generate Return
            </Button>
          </Card>
        </Col>
      </Row>

      {/* ================= QUICK TIPS ================= */}
      <Card className="bg-warning-subtle bg-opacity-10 border-warning">
        <Card.Body>
          <h6 className="text-warning mb-2">Quick Tips</h6>
          <ul className="ps-3 mb-0 fs-14" style={{ listStyleType: "disc", lineHeight: 1.5 }}>
  <li>PF returns must be filed by the 15th of the following month</li>
  <li>ESIC returns must be filed by the 21st of the following month</li>
  <li>System auto-calculates contributions based on salary components</li>
  <li>Green status means data is verified and ready for filing</li>
</ul>

        </Card.Body>
      </Card>

    </Container>
  );
};

export default StatutoryCompliance;
