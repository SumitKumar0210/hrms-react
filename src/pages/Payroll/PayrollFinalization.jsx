import React, { useState, useRef  } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup 
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import { BsCalendar3 } from "react-icons/bs";
import { ImWarning } from "react-icons/im";
import "react-datepicker/dist/react-datepicker.css";

const PayrollFinalization = () => {
  const [payrollMonth, setPayrollMonth] = useState(new Date());
  const [confirmFinal, setConfirmFinal] = useState(false);
const datePickerRef = useRef(null);

  return (
    <Container fluid className="my-3">
      {/* HEADER */}
    <Row className="mb-3 align-items-center">
  {/* LEFT : TITLE */}
  <Col>
    <h5 className="fw-semibold mb-0">Payroll Finalization</h5>
    <small className="text-muted">Monthly Payroll Processing</small>
  </Col>

  {/* RIGHT : PAYROLL MONTH */}
  <Col
    md="auto"
    className="d-flex align-items-center justify-content-end"
  >
    <div className="d-flex align-items-center gap-3 flex-nowrap">
      <Form.Label className="fw-semibold mb-0 text-nowrap">
        Payroll Month
      </Form.Label>

      <InputGroup className="flex-nowrap" style={{ width: 220 }}>
        <DatePicker
          ref={datePickerRef}
          selected={payrollMonth}
          onChange={(date) => setPayrollMonth(date)}
          dateFormat="MMMM yyyy"
          showMonthYearPicker
          className="form-control"
        />

        <InputGroup.Text
          role="button"
          style={{ cursor: "pointer" }}
          onClick={() => datePickerRef.current.setOpen(true)}
        >
          <BsCalendar3 />
        </InputGroup.Text>
      </InputGroup>
    </div>
  </Col>
</Row>


      {/* SUMMARY CARDS */}
      <Row className="mb-4">
        {[
          { label: "Total Payroll Amount", value: "₹48,50,000" },
          { label: "Total PF Liability", value: "₹3,40,500" },
          { label: "Total ESIC Liability", value: "₹68,250" },
          { label: "Net Payout", value: "₹44,41,250" },
        ].map((item, idx) => (
          <Col md={3} key={idx}>
            <Card className="px-3 py-2 border rounded-3">
              <div className="fw-semibold text-muted fs-14">
                {item.label}
              </div>
              <div className="fs-5 fw-normal">{item.value}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        {/* CHECKLIST */}
        <Col md={7}>
          <h6 className="fw-semibold mb-2">Pre Finalized Checklist</h6>

          {[
            {
              title: "Attendance Verified",
              desc: "All employee attendance records reviewed and confirmed",
            },
            {
              title: "Corrections Approved",
              desc: "Salary adjustments and deductions authorized by management",
            },
            {
              title: "PF/ESIC Calculated",
              desc: "Statutory contributions computed as per current rates",
            },
            {
              title: "Salary Slips Generated",
              desc: "Payslips prepared and ready for distribution",
            },
          ].map((item, idx) => (
            <Card key={idx} className="mb-3 px-3 py-2">
                <Form.Check
                    id={`check-${idx}`}
                    type="checkbox"
                    className="border-0 ms-3"
                    >
                    <Form.Check.Input />
                    <Form.Check.Label className="cursor-pointer mb-0">
                        <div className="fw-semibold">{item.title}</div>
                        <div className="text-muted fs-13">
                        {item.desc}
                        </div>
                    </Form.Check.Label>
                </Form.Check>
            </Card>
          ))}
        </Col>

        {/* CONFIRMATION PANEL */}
        <Col md={5}>
          <Card className="p-4 border-warning bg-warning-subtle mt-0 mt-md-4">
            <div className="d-flex gap-2 mb-3">
              <ImWarning className="text-warning fs-4" />
              <div>
                <div className="fw-bold">
                  Final Confirmation Required
                </div>
                <small className="text-muted">
                  Please review all data carefully before proceeding.
                  This action has compliance implications.
                </small>
              </div>
            </div>

            <Card className="px-3 py-2 mb-3">
                <Form.Check
                    id="final-confirmation"
                    type="checkbox"
                    className="border-0 ms-3"
                    >
                    <Form.Check.Input
                        checked={confirmFinal}
                        onChange={(e) => setConfirmFinal(e.target.checked)}
                    />
                    <Form.Check.Label className="cursor-pointer">
                        <div className="fw-semibold">
                        I confirm that the payroll data is accurate and complete
                        </div>
                        <small className="text-muted">
                        I have verified all calculations, statutory deductions,
                        and employee records
                        </small>
                    </Form.Check.Label>
                </Form.Check>
            </Card>
            <Card className="p-3 border-0" style={{backgroundColor: '#ffd9a0'}}>
              <div className="fw-semibold mb-1">⚠ Warning</div>
              <small className="text-muted">
                Once finalized, payroll data cannot be edited. Any
                corrections will require formal amendments and approval
                from senior management.
              </small>
            </Card>
          </Card>
            {/* FINALIZE BUTTON */}
          <Button
            className="w-100 mt-3 fw-semibold"
            variant="primary"
            disabled={!confirmFinal}
          >
            Finalize Payroll
          </Button>
        </Col>
      </Row>

    
    </Container>
  );
};

export default PayrollFinalization;
