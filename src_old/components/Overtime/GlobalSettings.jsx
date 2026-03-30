import { Form, Row, Col } from "react-bootstrap";

const GlobalSettings = () => {
  const baseRate = 200;
  const otPercentage = 50;
  const otHours = 3;

  const otHourlyRate = baseRate + (baseRate * otPercentage) / 100;
  const totalOtPay = otHourlyRate * otHours;

  return (
    <>
      {/* OT Applicable */}
      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">
          OT Applicable <span className="text-danger">*</span>
        </Form.Label>

        <div className="d-flex gap-4 ms-3">
          <Form.Check type="radio" className="border-0" label="Yes" name="ot" defaultChecked />
          <Form.Check type="radio" className="border-0" label="No" name="ot" />
        </div>

        <small className="text-muted">
          Percentage method auto-adjusts when salaries change
        </small>
      </Form.Group>
<small className="text-uppercase text-muted mb-3">
          How percentage-based OT works
        </small>
      {/* Explanation box */}
      <div className="border rounded-3 p-3 mt-2 bg-white">
        

        <Row className="">
          <Col>Employee Base Hourly Rate:</Col>
          <Col className="text-end">₹{baseRate}/hour</Col>
        </Row>
        <hr />

        <Row>
          <Col>Employee OT Percentage:</Col>
          <Col className="text-end">{otPercentage}%</Col>
        </Row>
        <hr />

        <Row>
          <Col>OT Hourly Rate:</Col>
          <Col className="text-end">
            ₹{baseRate} + (₹{baseRate} × {otPercentage}%) = ₹{otHourlyRate}/hour
          </Col>
        </Row>
        <hr />

        <Row>
          <Col>OT Hours Worked:</Col>
          <Col className="text-end">{otHours} hours</Col>
        </Row>
        <hr />

        <Row className="fw-semibold fs-5">
          <Col>Total OT Pay:</Col>
          <Col className="text-end fw-semibold"><span className="fw-normal">₹</span>{totalOtPay}</Col>
        </Row>

        <div className="text-success mt-3 small fw-semibold">
          ✓ If base rate becomes ₹250/hour, OT becomes ₹375/hour (₹250 + 50%)
        </div>
      </div>
    </>
  );
};

export default GlobalSettings;
