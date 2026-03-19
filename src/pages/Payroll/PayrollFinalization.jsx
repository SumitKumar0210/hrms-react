import React, { useState, useRef, useEffect } from "react";
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
import { finalizePayrollByMonth, storeFinalizedPayroll } from "./slice/finalizePayrollSlice";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../context/AuthContext";

const PayrollFinalization = () => {
  const [payrollMonth, setPayrollMonth] = useState(null);
  const [monthSelected, setMonthSelected] = useState(false);
  const [confirmFinal, setConfirmFinal] = useState(false);

  const [attendance, setAttendance] = useState(false);
  const [correction, setCorrection] = useState(false);
  const [pf, setPf] = useState(false);
  const [slips, setSlips] = useState(false);

  const datePickerRef = useRef(null);
  const dispatch = useDispatch();
  const { data, payroll } = useSelector((s) => s.finalizePayroll);
  const { hasPermission, hasAnyPermission } = useAuth();

  // Fetch payroll data when month selected
  useEffect(() => {
    if (payrollMonth) {
      dispatch(finalizePayrollByMonth(payrollMonth));
    }
  }, [payrollMonth, dispatch]);

  const isReadonly = !!data;


  const allChecked = isReadonly
    ? true
    : attendance && correction && pf && slips && confirmFinal;

  const formatCurrency = (amount) => {
    const number = Number(amount || 0);

    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };

  const handleFinalizePayroll = () => {
    if (!payrollMonth) return;

    const payload = {
      month: payrollMonth, // backend will parse date
      attendance_approval_status: attendance,
      correction_status: correction,
      pf_calculation_status: pf,
      payslip_generation_status: slips,
      confirmation_status: confirmFinal,
    };

     const res =dispatch(storeFinalizedPayroll(payload));
     if(res.error) return; // handle error
    dispatch(finalizePayrollByMonth(payrollMonth));
  };
  return (
    <Container fluid className="my-3">

      {/* HEADER */}
      <Row className="mb-3 align-items-center">
        <Col>
          <h5 className="fw-semibold mb-0">Payroll Finalization</h5>
          <small className="text-muted">Monthly Payroll Processing</small>
        </Col>

        <Col md="auto" className="d-flex align-items-center">

          {hasPermission('payroll_finalization.read') && (
            <div className="d-flex align-items-center gap-3 flex-nowrap">
              <Form.Label className="fw-semibold mb-0 text-nowrap">
                Payroll Month
              </Form.Label>

              <InputGroup className="flex-nowrap" style={{ width: 220 }}>
                <DatePicker
                  ref={datePickerRef}
                  selected={payrollMonth}
                  onChange={(date) => {
                    setPayrollMonth(date);
                    setMonthSelected(true);
                  }}
                  dateFormat="MMMM yyyy"
                  showMonthYearPicker
                  className="form-control"
                />

                <InputGroup.Text
                  role="button"
                  onClick={() => datePickerRef.current.setOpen(true)}
                >
                  <BsCalendar3 />
                </InputGroup.Text>
              </InputGroup>
            </div>
          )}

        </Col>
      </Row>

      {/* SHOW BELOW CONTENT ONLY AFTER MONTH SELECTED */}
      {monthSelected && (
        <>
          {/* SUMMARY CARDS */}
          <Row className="mb-4">
            {[
              { label: "Total Payroll Amount", value: payroll?.gross_amount },
              { label: "Total PF Liability", value: payroll?.pf_amount },
              { label: "Total ESIC Liability", value: payroll?.esic_amount },
              { label: "Net Payout", value: payroll?.net_amount },
            ].map((item, idx) => (
              <Col md={3} key={idx}>
                <Card className="px-3 py-2 border rounded-3">
                  <div className="fw-semibold text-muted fs-14">
                    {item.label}
                  </div>
                  <div className="fs-5 fw-normal">
                    ₹ {formatCurrency(item.value)}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Row>
            {/* CHECKLIST */}
            <Col md={7}>
              <h6 className="fw-semibold mb-2">Pre Finalized Checklist</h6>

              {/* Attendance */}
              <Card className="mb-3 px-3 py-2">
                <Form.Check
                  id="check-attendance"
                  type="checkbox"
                  className="border-0 ms-3"
                >
                  <Form.Check.Input
                    checked={
                      isReadonly
                        ? data?.attendance_approval_status
                        : attendance
                    }
                    disabled={isReadonly}
                    onChange={(e) => setAttendance(e.target.checked)}
                  />
                  <Form.Check.Label>
                    <div className="fw-semibold">Attendance Verified</div>
                    <div className="text-muted fs-13">
                      All employee attendance records reviewed and confirmed
                    </div>
                  </Form.Check.Label>
                </Form.Check>
              </Card>

              {/* Corrections */}
              <Card className="mb-3 px-3 py-2">
                <Form.Check
                  id="check-corrections"
                  type="checkbox"
                  className="border-0 ms-3"
                >
                  <Form.Check.Input
                    checked={
                      isReadonly
                        ? data?.correction_status
                        : correction
                    }
                    disabled={isReadonly}
                    onChange={(e) => setCorrection(e.target.checked)}
                  />
                  <Form.Check.Label>
                    <div className="fw-semibold">Corrections Approved</div>
                    <div className="text-muted fs-13">
                      Salary adjustments authorized by management
                    </div>
                  </Form.Check.Label>
                </Form.Check>
              </Card>

              {/* PF */}
              <Card className="mb-3 px-3 py-2">
                <Form.Check
                  id="check-pf"
                  type="checkbox"
                  className="border-0 ms-3"
                >
                  <Form.Check.Input
                    checked={
                      isReadonly
                        ? data?.pf_calculation_status
                        : pf
                    }
                    disabled={isReadonly}
                    onChange={(e) => setPf(e.target.checked)}
                  />
                  <Form.Check.Label>
                    <div className="fw-semibold">PF/ESIC Calculated</div>
                    <div className="text-muted fs-13">
                      Statutory contributions computed correctly
                    </div>
                  </Form.Check.Label>
                </Form.Check>
              </Card>

              {/* Payslips */}
              <Card className="mb-3 px-3 py-2">
                <Form.Check
                  id="check-slips"
                  type="checkbox"
                  className="border-0 ms-3"
                >
                  <Form.Check.Input
                    checked={
                      isReadonly
                        ? data?.payslip_generation_status
                        : slips
                    }
                    disabled={isReadonly}
                    onChange={(e) => setSlips(e.target.checked)}
                  />
                  <Form.Check.Label>
                    <div className="fw-semibold">Salary Slips Generated</div>
                    <div className="text-muted fs-13">
                      Payslips prepared and ready for distribution
                    </div>
                  </Form.Check.Label>
                </Form.Check>
              </Card>
            </Col>

            {/* CONFIRMATION PANEL */}
            <Col md={5}>
              <Card className="p-4 border-warning bg-warning-subtle">
                <div className="d-flex gap-2 mb-3">
                  <ImWarning className="text-warning fs-4" />
                  <div>
                    <div className="fw-bold">
                      Final Confirmation Required
                    </div>
                    <small className="text-muted">
                      Please review all data carefully before proceeding.
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
                    checked={
                      isReadonly
                        ? data?.finalized_status
                        : confirmFinal
                    }
                      disabled={isReadonly}
                      onChange={(e) =>
                        setConfirmFinal(e.target.checked)
                      }
                    />
                    <Form.Check.Label>
                      I confirm payroll data is accurate and complete
                    </Form.Check.Label>
                  </Form.Check>
                </Card>
              </Card>
              {hasPermission('payroll_finalization.create') && (
                <Button
                  className="w-100 mt-3 fw-semibold"
                  variant={isReadonly ? "secondary" : "primary"}
                  disabled={isReadonly || !allChecked}
                  onClick={handleFinalizePayroll}
                >
                  {isReadonly
                    ? "Payroll Already Finalized"
                    : "Finalize Payroll"}
                </Button>
              )}

            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default PayrollFinalization;