import { useState, useMemo } from "react";
import { Modal, Form, Button, Badge, InputGroup, Spinner } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { BsCreditCard, BsBank2, BsPhone, BsCash, BsCheck2Circle } from "react-icons/bs";
import { MdOutlineReceipt } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { makePayment } from "../../pages/Payroll/slice/paymentSlice";

const paymentMethods = [
    { value: "bank_transfer", label: "Bank Transfer", icon: <BsBank2 /> },
    { value: "upi",           label: "UPI",           icon: <BsPhone /> },
    { value: "cheque",        label: "Cheque",        icon: <MdOutlineReceipt /> },
    { value: "card",          label: "Card",          icon: <BsCreditCard /> },
    { value: "cash",          label: "Cash",          icon: <BsCash /> },
];

/**
 * PaymentModal — reusable salary payment modal
 *
 * Props:
 *  show       {boolean}   — controlled visibility
 *  onHide     {function}  — called when modal closes
 *  payrollRow {object}    — { id, employee_name, employee_code, month, year, net_salary }
 *  onSuccess  {function}  — optional: called after a successful API response (e.g. refresh table)
 */
const PaymentModal = ({ show, onHide, payrollRow, onSuccess }) => {

    const dispatch = useDispatch();
    const { loading: paymentLoading } = useSelector((s) => s.payment);

    const [succeeded, setSucceeded] = useState(false);

    const netSalary = Number(payrollRow?.net_salary ?? 0);

    /* ── Dynamic validation — max is always the current net salary ── */
    const validationSchema = useMemo(() => Yup.object({
        amount: Yup.number()
            .typeError("Enter a valid number")
            .required("Amount is required")
            .min(1, "Minimum payable amount is ₹1")
            .max(netSalary, `Cannot exceed net salary ₹${netSalary.toLocaleString()}`),
        payment_method: Yup.string().required("Select a payment method"),
        transaction_id: Yup.string().when("payment_method", {
            is: (val) => val !== "cash",
            then: (s) => s.required("Transaction / Reference ID is required").min(4, "Minimum 4 characters"),
            otherwise: (s) => s.notRequired(),
        }),
        payment_date: Yup.string().required("Payment date is required"),
        remarks: Yup.string().max(200, "Max 200 characters"),
    }), [netSalary]);

    const monthNames = ["January","February","March","April","May","June",
                        "July","August","September","October","November","December"];

    const monthLabel = payrollRow
        ? `${monthNames[(payrollRow.month ?? 1) - 1]} ${payrollRow.year}`
        : "—";

    /* ── Close: always reset success screen ── */
    const handleHide = () => {
        setSucceeded(false);
        onHide();
    };

    /* ── Submit → dispatch → success screen or toast error ── */
    const handleSubmit = async (values, actions) => {
        const payload = {
            payroll_id:     payrollRow?.id,
            amount:         Number(values.amount),
            payment_method: values.payment_method,
            transaction_id: values.payment_method !== "cash" ? values.transaction_id : null,
            payment_date:   values.payment_date,
            remarks:        values.remarks || null,
        };

        try {
            await dispatch(makePayment(payload)).unwrap();
            setSucceeded(true);
            actions.resetForm();
            if (onSuccess) onSuccess();
        } catch {
            /* error toast already fired inside the slice */
        } finally {
            actions.setSubmitting(false);
        }
    };

    return (
        <>
            <style>{`
                .pay-method-group {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                }
                .pay-method-option input[type="radio"] { display: none; }
                .pay-method-card {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 9px 10px;
                    border: 1.5px solid #dee2e6;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.81rem;
                    font-weight: 500;
                    color: #495057;
                    transition: border-color .15s, background .15s, color .15s, box-shadow .15s;
                    user-select: none;
                    background: #fff;
                    white-space: nowrap;
                }
                .pay-method-card:hover {
                    border-color: #0d6efd;
                    background: #f0f6ff;
                    color: #0d6efd;
                }
                .pay-method-option input:checked + .pay-method-card {
                    border-color: #0d6efd;
                    background: #e7f0ff;
                    color: #0d6efd;
                    box-shadow: 0 0 0 3px rgba(13,110,253,.12);
                }
                .pay-summary-strip {
                    background: linear-gradient(135deg, #f0f6ff 0%, #e8f4fd 100%);
                    border: 1px solid #c9e0fb;
                    border-radius: 10px;
                    padding: 14px 16px;
                    margin-bottom: 18px;
                }
                .pay-summary-strip .net-amount {
                    font-size: 1.3rem;
                    font-weight: 700;
                    color: #0d6efd;
                    letter-spacing: -0.4px;
                }
                .pay-modal-footer {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    border-top: 1px solid #f0f0f0;
                    padding: 12px 16px;
                }
                .pay-btn-cancel {
                    color: #dc3545 !important;
                    background: #fff5f5;
                    border: 1.5px solid #f5c2c7 !important;
                    border-radius: 7px !important;
                    font-size: 0.85rem;
                    font-weight: 600;
                    padding: 8px;
                    transition: background .15s;
                    width: 100%;
                }
                .pay-btn-cancel:hover:not(:disabled) { background: #fce8e8; }

                .pay-btn-submit {
                    color: #fff !important;
                    background: #0d6efd !important;
                    border: none !important;
                    border-radius: 7px !important;
                    font-size: 0.85rem;
                    font-weight: 600;
                    padding: 8px;
                    width: 100%;
                    display: flex !important;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    transition: background .15s, opacity .15s;
                }
                .pay-btn-submit:hover:not(:disabled) { background: #0b5ed7 !important; }
                .pay-btn-submit:disabled { opacity: .65; }

                /* ── Success screen ── */
                .pay-success-screen {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 44px 24px 36px;
                    text-align: center;
                    animation: payFadeUp .3s ease;
                }
                .pay-success-icon {
                    width: 66px; height: 66px;
                    background: #d1f4e0;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 2rem;
                    color: #198754;
                    margin-bottom: 16px;
                    animation: payPop .35s cubic-bezier(.36,.07,.19,.97);
                }
                @keyframes payPop {
                    0%   { transform: scale(0.3); opacity: 0; }
                    70%  { transform: scale(1.18); }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes payFadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <Modal show={show} onHide={handleHide} centered size="md" backdrop="static" keyboard={!paymentLoading}>

                {/* ══════════════════════════════
                    SUCCESS SCREEN
                ══════════════════════════════ */}
                {succeeded ? (
                    <>
                        <Modal.Header closeButton className="border-0 pb-0" />
                        <Modal.Body className="p-0">
                            <div className="pay-success-screen">
                                <div className="pay-success-icon">
                                    <BsCheck2Circle />
                                </div>
                                <h6 className="fw-bold mb-1">Payment Successful!</h6>
                                <p className="text-muted mb-1" style={{ fontSize: "0.86rem" }}>
                                    Salary for <strong>{payrollRow?.employee_name}</strong>
                                </p>
                                <p className="text-muted mb-4" style={{ fontSize: "0.82rem" }}>
                                    {monthLabel}&nbsp;·&nbsp;
                                    <span className="text-success fw-semibold">
                                        ₹{Number(payrollRow?.net_salary ?? 0).toLocaleString()}
                                    </span>
                                </p>
                                <Button variant="success" size="sm" className="rounded-pill px-4" onClick={handleHide}>
                                    Done
                                </Button>
                            </div>
                        </Modal.Body>
                    </>
                ) : (

                /* ══════════════════════════════
                    FORM SCREEN
                ══════════════════════════════ */
                <Formik
                    enableReinitialize
                    initialValues={{
                        amount:         payrollRow?.net_salary ?? "",
                        payment_method: "",
                        transaction_id: "",
                        payment_date:   new Date().toISOString().split("T")[0],
                        remarks:        "",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ handleSubmit, handleChange, values, errors, touched, setFieldValue, isSubmitting }) => {

                        const isBusy = isSubmitting || paymentLoading;

                        return (
                            <Form onSubmit={handleSubmit} noValidate>
                                <Modal.Header closeButton>
                                    <Modal.Title className="h6 fw-normal d-flex align-items-center gap-2">
                                        <BsCreditCard className="text-primary" />
                                        Process Salary Payment
                                    </Modal.Title>
                                </Modal.Header>

                                <Modal.Body className="pt-3 pb-2">

                                    {/* Summary Strip */}
                                    <div className="pay-summary-strip">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <div className="fw-semibold text-dark" style={{ fontSize: "0.95rem" }}>
                                                    {payrollRow?.employee_name ?? "—"}
                                                </div>
                                                <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                                                    {payrollRow?.employee_code}&nbsp;|&nbsp;{monthLabel}
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <div className="net-amount">
                                                    ₹{Number(payrollRow?.net_salary ?? 0).toLocaleString()}
                                                </div>
                                                <Badge bg="success-subtle" text="success" className="rounded-4 px-2" style={{ fontSize: "0.7rem" }}>
                                                    Net Payable
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold" style={{ fontSize: "0.83rem" }}>
                                            AMOUNT <span className="text-danger">*</span>
                                        </Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text>₹</InputGroup.Text>
                                            <Form.Control
                                                name="amount"
                                                type="number"
                                                placeholder="Enter payment amount"
                                                value={values.amount}
                                                onChange={handleChange}
                                                isInvalid={touched.amount && !!errors.amount}
                                                min={1}
                                                max={netSalary}
                                                disabled={isBusy}
                                                onKeyDown={(e) =>
                                                    ["-", "+", "e", "E"].includes(e.key) && e.preventDefault()
                                                }
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.amount}
                                            </Form.Control.Feedback>
                                        </InputGroup>
                                    </Form.Group>

                                    {/* Payment Method */}
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold" style={{ fontSize: "0.83rem" }}>
                                            PAYMENT METHOD <span className="text-danger">*</span>
                                        </Form.Label>
                                        <div className="pay-method-group">
                                            {paymentMethods.map((m) => (
                                                <label
                                                    key={m.value}
                                                    className="pay-method-option"
                                                    style={{ opacity: isBusy ? 0.6 : 1, pointerEvents: isBusy ? "none" : "auto" }}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="payment_method"
                                                        value={m.value}
                                                        checked={values.payment_method === m.value}
                                                        onChange={() => {
                                                            setFieldValue("payment_method", m.value);
                                                            setFieldValue("transaction_id", ""); // clear stale value on switch
                                                        }}
                                                    />
                                                    <span className="pay-method-card">{m.icon} {m.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {touched.payment_method && errors.payment_method && (
                                            <div className="text-danger mt-1" style={{ fontSize: "0.8rem" }}>
                                                {errors.payment_method}
                                            </div>
                                        )}
                                    </Form.Group>

                                    {/* Transaction ID — hidden for cash */}
                                    {values.payment_method && values.payment_method !== "cash" && (
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-semibold" style={{ fontSize: "0.83rem" }}>
                                                TRANSACTION / REFERENCE ID <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                name="transaction_id"
                                                placeholder="e.g. TXN123456789 or UTR number"
                                                value={values.transaction_id}
                                                onChange={handleChange}
                                                isInvalid={touched.transaction_id && !!errors.transaction_id}
                                                disabled={isBusy}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.transaction_id}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    )}

                                    {/* Payment Date */}
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold" style={{ fontSize: "0.83rem" }}>
                                            PAYMENT DATE <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="payment_date"
                                            value={values.payment_date}
                                            onChange={handleChange}
                                            isInvalid={touched.payment_date && !!errors.payment_date}
                                            disabled={isBusy}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.payment_date}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    {/* Remarks */}
                                    <Form.Group className="mb-1">
                                        <Form.Label className="fw-semibold" style={{ fontSize: "0.83rem" }}>
                                            REMARKS <span className="text-muted fw-normal">(optional)</span>
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            name="remarks"
                                            placeholder="Any additional notes..."
                                            value={values.remarks}
                                            onChange={handleChange}
                                            isInvalid={touched.remarks && !!errors.remarks}
                                            disabled={isBusy}
                                            style={{ resize: "none", fontSize: "0.85rem" }}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.remarks}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                </Modal.Body>

                                <Modal.Footer className="pay-modal-footer">
                                    <Button variant="" className="pay-btn-cancel" onClick={handleHide} disabled={isBusy}>
                                        Cancel
                                    </Button>
                                    <Button variant="" type="submit" className="pay-btn-submit" disabled={isBusy}>
                                        {isBusy ? (
                                            <><Spinner animation="border" size="sm" /> Processing…</>
                                        ) : (
                                            "Confirm Payment"
                                        )}
                                    </Button>
                                </Modal.Footer>
                            </Form>
                        );
                    }}
                </Formik>
                )}
            </Modal>
        </>
    );
};

export default PaymentModal;