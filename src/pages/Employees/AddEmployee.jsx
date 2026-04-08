import React, { useEffect, useState, useCallback } from "react";
import {
    Card,
    Button,
    Form,
    ProgressBar,
    Row,
    Col,
    Image,
    Spinner,
} from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createEmployee, clearSuccess, clearError } from "./slice/employeeSlice";
import { fetchAllActiveDepartment, resetDepartmentState } from "../Setting/slice/departmentSlice";
import { fetchAllActiveDesignation, resetDesignationState } from "../Setting/slice/designationSlice";
import { fetchAllActiveShift, resetShiftState } from "../Setting/slice/shiftSlice";
import { getactiveRoles } from "../Setting/slice/roleSlice";
import { useAuth } from "../../context/AuthContext";

// ─── Validation schema ────────────────────────────────────────────────────────
const validationSchema = Yup.object({
    firstName: Yup.string()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name must not exceed 50 characters")
        .matches(/^[a-zA-Z\s]+$/, "First name can only contain letters")
        .required("First name is required"),
    middleName: Yup.string()
        .min(2, "Middle name must be at least 2 characters")
        .max(50, "Middle name must not exceed 50 characters")
        .matches(/^[a-zA-Z\s]+$/, "Middle name can only contain letters")
        .nullable("Middle name is required"),

    lastName: Yup.string()
        .min(2, "Last name must be at least 2 characters")
        .max(50, "Last name must not exceed 50 characters")
        .matches(/^[a-zA-Z\s]+$/, "Last name can only contain letters")
        .required("Last name is required"),

    email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),

    phone: Yup.string()
        .matches(/^[6-9][0-9]{9}$/, "Must be a valid 10-digit Indian mobile number")
        .required("Phone number is required"),

    address: Yup.string()
        .min(10, "Address must be at least 10 characters")
        .max(200, "Address must not exceed 200 characters")
        .required("Address is required"),

    city: Yup.string()
        .min(2, "City must be at least 2 characters")
        .required("City is required"),

    state: Yup.string()
        .min(2, "State must be at least 2 characters")
        .required("State is required"),

    pinCode: Yup.string()
        .matches(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit PIN code")
        .required("PIN code is required"),

    bloodGroup: Yup.string().required("Blood group is required"),

    aadharNo: Yup.string()
        .matches(/^[2-9][0-9]{11}$/, "Aadhaar must be 12 digits starting with 2-9")
        .required("Aadhaar number is required"),

    source: Yup.string().required("Source is required"),
    probationPeriodEnd: Yup.date().required("Probation period end date is required"),
    dateOfJoining: Yup.date().required("Joining date is required"),
    jobRole: Yup.string().required("Job role is required"),
    department: Yup.string().required("Department is required"),
    shiftType: Yup.string().required("Shift type is required"),

    shiftCheckInTiming: Yup.string(),
    shiftCheckOutTiming: Yup.string()
        .test("after-checkin", "Check-out must be after check-in", function (value) {
            const { shiftCheckInTiming } = this.parent;
            if (!value || !shiftCheckInTiming) return true;
            return value > shiftCheckInTiming;
        }),

    isApplicationUser: Yup.boolean(),

    role: Yup.string().when("isApplicationUser", {
        is: true,
        then: (schema) => schema.required("User role is required"),
        otherwise: (schema) => schema.nullable(),
    }),

    // ── Bank Details ──────────────────────────────────────────────────────────
    beneficiaryName: Yup.string()
        .min(3, "Beneficiary name must be at least 3 characters")
        .max(100, "Beneficiary name must not exceed 100 characters")
        .matches(/^[a-zA-Z\s]+$/, "Beneficiary name can only contain letters and spaces")
        .required("Beneficiary name is required"),

    bankName: Yup.string()
        .min(3, "Bank name must be at least 3 characters")
        .max(100, "Bank name must not exceed 100 characters")
        .required("Bank name is required"),

    branchAddress: Yup.string()
        .min(10, "Branch address must be at least 10 characters")
        .max(250, "Branch address must not exceed 250 characters")
        .required("Branch address is required"),

    ifscCode: Yup.string()
        .matches(
            /^[A-Z]{4}0[A-Z0-9]{6}$/,
            "Invalid IFSC code (e.g. SBIN0001234)"
        )
        .required("IFSC code is required"),

    accountNumber: Yup.string()
        .matches(/^[0-9]{9,18}$/, "Account number must be 9–18 digits")
        .required("Account number is required"),

    confirmAccountNumber: Yup.string()
        .oneOf([Yup.ref("accountNumber")], "Account numbers do not match")
        .required("Please confirm the account number"),

    panNumber: Yup.string()
        .matches(
            /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
            "Invalid PAN (e.g. ABCDE1234F)"
        )
        .required("PAN number is required"),

    // bankAadharNo: Yup.string()
    //     .matches(/^[2-9][0-9]{11}$/, "Aadhaar must be 12 digits starting with 2-9")
    //     .required("Aadhaar number is required"),

    isMicro: Yup.string()
        .oneOf(["yes", "no"], "Please select whether this is a micro enterprise")
        .required("Micro enterprise status is required"),
});

// ─── Document definitions ─────────────────────────────────────────────────────
const DOCUMENTS = [
    { label: "Aadhar Card", desc: "Aadhar Card (PDF, max 150 KB)", name: "idProof" },
    { label: "Address Proof", desc: "Utility bill or Rental agreement (PDF, max 150 KB)", name: "addressProof" },
    { label: "Bank Details", desc: "Cancelled Cheque or Bank statement (PDF, max 150 KB)", name: "bankDetails" },
    // { label: "Contract Letter", desc: "Signed employment contract (PDF, max 150 KB)", name: "contractLetter" },
    { label: "Profile Image", desc: "Employee photo (Image, 4–30 KB)", name: "profileImage" },
];

// ─── Reusable field component ─────────────────────────────────────────────────
const Field = ({ label, name, required, children, touched, errors }) => (
    <Form.Group>
        <Form.Label>
            {label} {required && <span className="text-danger">*</span>}
        </Form.Label>
        {children}
        {touched?.[name] && errors?.[name] && (
            <Form.Control.Feedback type="invalid" style={{ display: "block" }}>
                {errors[name]}
            </Form.Control.Feedback>
        )}
    </Form.Group>
);

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle }) => (
    <div className="my-3 p-3 bg-light rounded d-flex align-items-center justify-content-between">
        <div>
            <h6 className="mb-0">{title}</h6>
            {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
    </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
const AddEmployee = () => {
    const [selectedShift, setSelectedShift] = useState(null);
    const [fileErrors, setFileErrors] = useState({});
    const [showAccountNumber, setShowAccountNumber] = useState(false);
    const [showConfirmAccountNumber, setShowConfirmAccountNumber] = useState(false);
    const { hasPermission } = useAuth();

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, success, error } = useSelector((state) => state.employee);
    const { data: departments = [], loading: departmentLoading } = useSelector((state) => state.department);
    const { data: designations = [], loading: designationLoading } = useSelector((state) => state.designation);
    const { data: shifts = [], loading: shiftLoading } = useSelector((state) => state.shift);
    const { data: roles = [] } = useSelector((state) => state.role);

    useEffect(() => {
        dispatch(fetchAllActiveDepartment());
        dispatch(fetchAllActiveDesignation());
        dispatch(fetchAllActiveShift());
        dispatch(getactiveRoles());
        dispatch(clearError());
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            dispatch(clearSuccess());
            navigate("/employees");
        }
    }, [success, dispatch, navigate]);

    useEffect(() => {
        return () => {
            dispatch(clearError());
            dispatch(resetDepartmentState());
            dispatch(resetShiftState());
            dispatch(resetDesignationState());
        };
    }, [dispatch]);

    // ── File validation ──────────────────────────────────────────────────────
    const validateFile = useCallback((file, docName) => {
        if (!file) return null;
        if (docName === "profileImage") {
            const minSize = 4 * 1024;
            const maxSize = 30 * 1024;
            if (!file.type.startsWith("image/")) return "Profile image must be an image file (JPG, PNG, etc.)";
            if (file.size < minSize) return "Profile image must be at least 4 KB";
            if (file.size > maxSize) return "Profile image must not exceed 30 KB";
        } else {
            const maxSize = 150 * 1024;
            if (file.type !== "application/pdf") return "Only PDF files are allowed (max 150 KB)";
            if (file.size > maxSize) return "File size must not exceed 150 KB";
        }
        return null;
    }, []);

    const handleFileUpload = useCallback((file, docName, setFieldValue) => {
        const err = validateFile(file, docName);
        if (err) {
            setFileErrors((prev) => ({ ...prev, [docName]: err }));
            return;
        }
        setFileErrors((prev) => {
            const next = { ...prev };
            delete next[docName];
            return next;
        });
        setFieldValue(docName, file);
    }, [validateFile]);

    // ── Shift change ─────────────────────────────────────────────────────────
    const handleShiftChange = useCallback((shift, setFieldValue) => {
        setSelectedShift(shift);
        if (shift?.rotational_time !== 1) {
            setFieldValue("shiftCheckInTiming", "");
            setFieldValue("shiftCheckOutTiming", "");
        }
    }, []);

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        try {
            if (selectedShift?.rotational_time === 1) {
                const timingErrors = {};
                if (!values.shiftCheckInTiming) timingErrors.shiftCheckInTiming = "Required for rotational shift";
                if (!values.shiftCheckOutTiming) timingErrors.shiftCheckOutTiming = "Required for rotational shift";
                if (Object.keys(timingErrors).length) {
                    setErrors(timingErrors);
                    setSubmitting(false);
                    return;
                }
            }

            const formData = new FormData();

            // Basic info
            formData.append("first_name", values.firstName.trim());
            formData.append("middle_name", values.middleName.trim());
            formData.append("last_name", values.lastName.trim());
            formData.append("email", values.email.toLowerCase().trim());
            formData.append("phone", values.phone.trim());
            formData.append("address", values.address.trim());
            formData.append("city", values.city.trim());
            formData.append("state", values.state.trim());
            formData.append("pin_code", values.pinCode.trim());
            formData.append("blood_group", values.bloodGroup);
            formData.append("aadhar_no", values.aadharNo.trim());
            formData.append("source", values.source);
            formData.append("probation_period_end", values.probationPeriodEnd);
            formData.append("date_of_joining", values.dateOfJoining);
            formData.append("job_role", values.jobRole);
            formData.append("department", values.department);
            formData.append("shift_id", values.shiftType);
            formData.append("is_application_user", values.isApplicationUser ? 1 : 0);


            if (values.isApplicationUser && values.role) {
                formData.append("role", values.role);
            }

            if (selectedShift?.rotational_time === 1) {
                formData.append("shift_check_in_timing", values.shiftCheckInTiming);
                formData.append("shift_check_out_timing", values.shiftCheckOutTiming);
            }

            // Bank details
            formData.append("beneficiary_name", values.beneficiaryName.trim());
            formData.append("bank_name", values.bankName.trim());
            formData.append("branch_address", values.branchAddress.trim());
            formData.append("ifsc_code", values.ifscCode.toUpperCase().trim());
            formData.append("account_number", values.accountNumber.trim());
            formData.append("pan_number", values.panNumber.toUpperCase().trim());
            formData.append("is_micro", values.isMicro);

            // Documents
            DOCUMENTS.forEach((doc) => {
                if (values[doc.name]) formData.append(doc.name, values[doc.name]);
            });

            const result = await dispatch(createEmployee(formData));
            if (createEmployee.rejected.match(result)) return;
        } catch (err) {
            console.error("Failed to create employee:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const isDataLoading = departmentLoading || designationLoading || shiftLoading;

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="container-fluid g-0">
            <div className="mt-3">
                <h5 className="mb-0">Staff Onboarding</h5>
                <small className="text-muted">Complete all fields to add a new team member</small>
            </div>

            <Formik
                initialValues={{
                    firstName: "",
                    middleName: "",
                    lastName: "",
                    email: "",
                    phone: "",
                    address: "",
                    city: "",
                    state: "",
                    pinCode: "",
                    bloodGroup: "",
                    aadharNo: "",
                    source: "",
                    probationPeriodEnd: "",
                    dateOfJoining: "",
                    jobRole: "",
                    department: "",
                    shiftType: "",
                    shiftCheckInTiming: "",
                    shiftCheckOutTiming: "",
                    idProof: null,
                    addressProof: null,
                    bankDetails: null,
                    contractLetter: null,
                    profileImage: null,
                    isApplicationUser: false,
                    role: "",
                    // Bank details
                    beneficiaryName: "",
                    bankName: "",
                    branchAddress: "",
                    ifscCode: "",
                    accountNumber: "",
                    confirmAccountNumber: "",
                    panNumber: "",
                    isMicro: "",
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({
                    handleSubmit,
                    handleChange,
                    handleBlur,
                    setFieldValue,
                    values,
                    touched,
                    errors,
                    isSubmitting,
                }) => {
                    const uploadedCount = DOCUMENTS.filter((d) => values[d.name]).length;
                    const progress = Math.round((uploadedCount / DOCUMENTS.length) * 100);
                    const isFormDisabled = loading || isSubmitting;

                    return (
                        <Form onSubmit={handleSubmit} noValidate>
                            <Card className="mt-3 p-3 shadow-sm border-0">
                                <Card.Body>

                                    {/* ── Basic Details ──────────────────────── */}
                                    <SectionHeader title="Basic Details" />
                                    <Row className="px-2">
                                        {[
                                            { label: "First Name", name: "firstName" },
                                            { label: "Middle Name", name: "middleName" },
                                            { label: "Last Name", name: "lastName" },
                                            { label: "Email Address", name: "email", type: "email" },
                                            { label: "Phone Number", name: "phone" },
                                        ].map((f) => (
                                            <Col md={3} className="mb-3" key={f.name}>
                                                <Form.Group>
                                                    <Form.Label>{f.label} {f.name != "middleName" && <span className="text-danger">*</span>}</Form.Label>
                                                    <Form.Control
                                                        type={f.type || "text"}
                                                        name={f.name}
                                                        value={values[f.name]}
                                                        placeholder={`Enter ${f.label.toLowerCase()}`}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        isInvalid={touched[f.name] && !!errors[f.name]}
                                                        disabled={isFormDisabled}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors[f.name]}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        ))}
                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Blood Group <span className="text-danger">*</span></Form.Label>
                                                <Form.Select
                                                    name="bloodGroup"
                                                    value={values.bloodGroup}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.bloodGroup && !!errors.bloodGroup}
                                                    disabled={isFormDisabled}
                                                >
                                                    <option value="">Select blood group</option>
                                                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                                                        <option key={bg}>{bg}</option>
                                                    ))}
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">{errors.bloodGroup}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Source <span className="text-danger">*</span></Form.Label>
                                                <Form.Select
                                                    name="source"
                                                    value={values.source}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.source && !!errors.source}
                                                    disabled={isFormDisabled}
                                                >
                                                    <option value="">Select source</option>
                                                    <option value="referral">Referral</option>
                                                    <option value="walk-in">Walk-in</option>
                                                    <option value="online">Online</option>
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">{errors.source}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Date of Joining</Form.Label>
                                                <Form.Control type="date" name="dateOfJoining" value={values.dateOfJoining} onChange={handleChange} onBlur={handleBlur} isInvalid={touched.dateOfJoining && !!errors.dateOfJoining} disabled={isFormDisabled} />
                                                <Form.Control.Feedback type="invalid">{errors.dateOfJoining}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Probation Period <span className="text-danger">*</span></Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="probationPeriodEnd"
                                                    value={values.probationPeriodEnd}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.probationPeriodEnd && !!errors.probationPeriodEnd}
                                                    disabled={isFormDisabled}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.probationPeriodEnd}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {/* ── Address Details ────────────────────── */}
                                    <SectionHeader title="Address Details" />
                                    <Row className="px-2">
                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Address <span className="text-danger">*</span></Form.Label>
                                                <Form.Control
                                                    name="address"
                                                    value={values.address}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.address && !!errors.address}
                                                    placeholder="Enter full address"
                                                    disabled={isFormDisabled}
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>City <span className="text-danger">*</span></Form.Label>
                                                <Form.Control
                                                    name="city"
                                                    value={values.city}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.city && !!errors.city}
                                                    placeholder="Enter city"
                                                    disabled={isFormDisabled}
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.city}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>State <span className="text-danger">*</span></Form.Label>
                                                <Form.Control
                                                    name="state"
                                                    value={values.state}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.state && !!errors.state}
                                                    placeholder="Enter state"
                                                    disabled={isFormDisabled}
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.state}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="px-2">
                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>PIN Code <span className="text-danger">*</span></Form.Label>
                                                <Form.Control
                                                    name="pinCode"
                                                    value={values.pinCode}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.pinCode && !!errors.pinCode}
                                                    placeholder="6-digit PIN"
                                                    disabled={isFormDisabled}
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.pinCode}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                    </Row>

                                    {/* ── Role & Department ──────────────────── */}
                                    <SectionHeader title="Role & Department" />
                                    <Row className="px-2">
                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Job Role <span className="text-danger">*</span></Form.Label>
                                                <Form.Select
                                                    name="jobRole"
                                                    value={values.jobRole}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.jobRole && !!errors.jobRole}
                                                    disabled={isFormDisabled || designationLoading}
                                                >
                                                    <option value="">{designationLoading ? "Loading..." : "Select role"}</option>
                                                    {designations.map((d) => (
                                                        <option key={d.id} value={d.id}>{d.name}</option>
                                                    ))}
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">{errors.jobRole}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Department <span className="text-danger">*</span></Form.Label>
                                                <Form.Select
                                                    name="department"
                                                    value={values.department}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.department && !!errors.department}
                                                    disabled={isFormDisabled || departmentLoading}
                                                >
                                                    <option value="">{departmentLoading ? "Loading..." : "Select department"}</option>
                                                    {departments.map((d) => (
                                                        <option key={d.id} value={d.id}>{d.name}</option>
                                                    ))}
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">{errors.department}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Shift Type <span className="text-danger">*</span></Form.Label>
                                                <Form.Select
                                                    name="shiftType"
                                                    value={values.shiftType}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        const shift = shifts.find((s) => s.id == e.target.value);
                                                        handleShiftChange(shift ?? null, setFieldValue);
                                                    }}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.shiftType && !!errors.shiftType}
                                                    disabled={isFormDisabled || shiftLoading}
                                                >
                                                    <option value="">{shiftLoading ? "Loading..." : "Select shift"}</option>
                                                    {shifts.map((s) => (
                                                        <option key={s.id} value={s.id}>
                                                            {s.name} ({s.sign_in} - {s.sign_out})
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">{errors.shiftType}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        {selectedShift?.rotational_time === 1 && (
                                            <>
                                                <Col md={3} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label>Check-in Timing <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="time"
                                                            name="shiftCheckInTiming"
                                                            value={values.shiftCheckInTiming}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            isInvalid={touched.shiftCheckInTiming && !!errors.shiftCheckInTiming}
                                                            disabled={isFormDisabled}
                                                        />
                                                        <Form.Control.Feedback type="invalid">{errors.shiftCheckInTiming}</Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={3} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label>Check-out Timing <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="time"
                                                            name="shiftCheckOutTiming"
                                                            value={values.shiftCheckOutTiming}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            isInvalid={touched.shiftCheckOutTiming && !!errors.shiftCheckOutTiming}
                                                            disabled={isFormDisabled}
                                                        />
                                                        <Form.Control.Feedback type="invalid">{errors.shiftCheckOutTiming}</Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                            </>
                                        )}
                                    </Row>

                                    {/* ══════════════════════════════════════════
                                        ── Bank Details ──────────────────────────
                                        ══════════════════════════════════════════ */}
                                    <SectionHeader
                                        title="Bank Details"
                                        subtitle="Used for salary disbursement — all fields are required"
                                    />

                                    {/* Row 1: Beneficiary name + Bank name + Branch address */}
                                    <Row className="px-2">
                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>
                                                    Beneficiary Full Name <span className="text-danger">*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    name="beneficiaryName"
                                                    value={values.beneficiaryName}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.beneficiaryName && !!errors.beneficiaryName}
                                                    placeholder="Name as on bank account"
                                                    disabled={isFormDisabled}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.beneficiaryName}
                                                </Form.Control.Feedback>
                                                <Form.Text className="text-muted">
                                                    Must match the name on the bank account exactly
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>

                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>
                                                    Bank Name <span className="text-danger">*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    name="bankName"
                                                    value={values.bankName}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.bankName && !!errors.bankName}
                                                    placeholder="e.g. State Bank of India"
                                                    disabled={isFormDisabled}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.bankName}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>
                                                    Branch Address <span className="text-danger">*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    name="branchAddress"
                                                    value={values.branchAddress}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.branchAddress && !!errors.branchAddress}
                                                    placeholder="Full branch address"
                                                    disabled={isFormDisabled}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.branchAddress}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {/* Row 2: IFSC + Account number + Confirm account number */}
                                    <Row className="px-2">
                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>
                                                    IFSC Code <span className="text-danger">*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    name="ifscCode"
                                                    value={values.ifscCode}
                                                    onChange={(e) =>
                                                        setFieldValue("ifscCode", e.target.value.toUpperCase())
                                                    }
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.ifscCode && !!errors.ifscCode}
                                                    placeholder="e.g. SBIN0001234"
                                                    maxLength={11}
                                                    disabled={isFormDisabled}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.ifscCode}
                                                </Form.Control.Feedback>
                                                <Form.Text className="text-muted">
                                                    4 letters · 0 · 6 alphanumeric characters
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>

                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>
                                                    Account Number <span className="text-danger">*</span>
                                                </Form.Label>
                                                <div className="input-group">
                                                    <Form.Control
                                                        type={showAccountNumber ? "text" : "password"}
                                                        name="accountNumber"
                                                        value={values.accountNumber}
                                                        onChange={(e) => {
                                                            // Only digits
                                                            const val = e.target.value.replace(/\D/g, "");
                                                            setFieldValue("accountNumber", val);
                                                        }}
                                                        onBlur={handleBlur}
                                                        isInvalid={touched.accountNumber && !!errors.accountNumber}
                                                        placeholder="9–18 digit account number"
                                                        maxLength={18}
                                                        inputMode="numeric"
                                                        disabled={isFormDisabled}
                                                        style={{ borderRight: "none" }}
                                                    />
                                                    <Button
                                                        variant="outline-secondary"
                                                        onClick={() => setShowAccountNumber((v) => !v)}
                                                        tabIndex={-1}
                                                        style={{
                                                            borderLeft: "none",
                                                            borderColor: touched.accountNumber && errors.accountNumber
                                                                ? "#dc3545"
                                                                : "#ced4da",
                                                        }}
                                                        title={showAccountNumber ? "Hide" : "Show"}
                                                    >
                                                        {showAccountNumber ? (
                                                            // eye-slash
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                                <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
                                                                <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
                                                                <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z" />
                                                            </svg>
                                                        ) : (
                                                            // eye
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                                                                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                                                            </svg>
                                                        )}
                                                    </Button>
                                                    {touched.accountNumber && errors.accountNumber && (
                                                        <div className="invalid-feedback d-block">
                                                            {errors.accountNumber}
                                                        </div>
                                                    )}
                                                </div>
                                            </Form.Group>
                                        </Col>

                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>
                                                    Confirm Account Number <span className="text-danger">*</span>
                                                </Form.Label>
                                                <div className="input-group">
                                                    <Form.Control
                                                        type={showConfirmAccountNumber ? "text" : "password"}
                                                        name="confirmAccountNumber"
                                                        value={values.confirmAccountNumber}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, "");
                                                            setFieldValue("confirmAccountNumber", val);
                                                        }}
                                                        onBlur={handleBlur}
                                                        isInvalid={touched.confirmAccountNumber && !!errors.confirmAccountNumber}
                                                        placeholder="Re-enter account number"
                                                        maxLength={18}
                                                        inputMode="numeric"
                                                        disabled={isFormDisabled}
                                                        onPaste={(e) => e.preventDefault()}
                                                        style={{ borderRight: "none" }}
                                                    />
                                                    <Button
                                                        variant="outline-secondary"
                                                        onClick={() => setShowConfirmAccountNumber((v) => !v)}
                                                        tabIndex={-1}
                                                        style={{
                                                            borderLeft: "none",
                                                            borderColor: touched.confirmAccountNumber && errors.confirmAccountNumber
                                                                ? "#dc3545"
                                                                : "#ced4da",
                                                        }}
                                                        title={showConfirmAccountNumber ? "Hide" : "Show"}
                                                    >
                                                        {showConfirmAccountNumber ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                                <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
                                                                <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
                                                                <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z" />
                                                            </svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                                                                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                                                            </svg>
                                                        )}
                                                    </Button>
                                                    {touched.confirmAccountNumber && errors.confirmAccountNumber && (
                                                        <div className="invalid-feedback d-block">
                                                            {errors.confirmAccountNumber}
                                                        </div>
                                                    )}
                                                </div>
                                                <Form.Text className="text-muted">
                                                    Paste is disabled — please type again
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>

                                        {/* Account match indicator */}
                                        {values.accountNumber && values.confirmAccountNumber && (
                                            <Col md={3} className="mb-3 d-flex align-items-center">
                                                {values.accountNumber === values.confirmAccountNumber ? (
                                                    <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
                                                        ✓ Account numbers match
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2">
                                                        ✗ Account numbers do not match
                                                    </span>
                                                )}
                                            </Col>
                                        )}
                                    </Row>

                                    {/* Row 3: PAN + Aadhaar + Is Micro */}
                                    <Row className="px-2">
                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>
                                                    PAN Number <span className="text-danger">*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    name="panNumber"
                                                    value={values.panNumber}
                                                    onChange={(e) =>
                                                        setFieldValue("panNumber", e.target.value.toUpperCase())
                                                    }
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.panNumber && !!errors.panNumber}
                                                    placeholder="e.g. ABCDE1234F"
                                                    maxLength={10}
                                                    disabled={isFormDisabled}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.panNumber}
                                                </Form.Control.Feedback>
                                                <Form.Text className="text-muted">
                                                    5 letters · 4 digits · 1 letter (10 characters)
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>

                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Aadhaar Number <span className="text-danger">*</span></Form.Label>
                                                <Form.Control
                                                    name="aadharNo"
                                                    value={values.aadharNo}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.aadharNo && !!errors.aadharNo}
                                                    placeholder="12-digit Aadhaar number"
                                                    disabled={isFormDisabled}
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.aadharNo}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        {/* Is Micro Enterprise */}
                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>
                                                    Is Micro Enterprise? <span className="text-danger">*</span>
                                                </Form.Label>
                                                <Form.Select
                                                    name="isMicro"
                                                    value={values.isMicro}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.isMicro && !!errors.isMicro}
                                                    disabled={isFormDisabled}
                                                >
                                                    <option value="">Select</option>
                                                    <option value="yes">Yes</option>
                                                    <option value="no">No</option>
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.isMicro}
                                                </Form.Control.Feedback>
                                                <Form.Text className="text-muted">
                                                    As per MSME / Udyam registration
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>

                                        {/* Live character counters */}
                                        <Col md={3} className="mb-3 d-flex align-items-center">
                                            <div className="text-muted small">
                                                <div>PAN: <strong>{values.panNumber.length}/10</strong> chars</div>
                                                <div>Aadhaar: <strong>{values.aadharNo.length}/12</strong> digits</div>
                                            </div>
                                        </Col>
                                    </Row>

                                    {/* Bank details info alert */}
                                    <Row className="px-2 mb-2">
                                        <Col>
                                            <div className="alert alert-info alert-sm d-flex align-items-start gap-2 py-2 px-3" role="alert">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="mt-1 flex-shrink-0">
                                                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2" />
                                                </svg>
                                                <small>
                                                    Bank account details are used exclusively for salary disbursement.
                                                    Ensure PAN and Aadhaar match the bank's KYC records.
                                                    This information is stored securely and kept confidential.
                                                </small>
                                            </div>
                                        </Col>
                                    </Row>

                                    {/* ── Document Upload ────────────────────── */}
                                    <SectionHeader title="Document Upload" />
                                    <div className="mb-4 p-3 border rounded mx-2">
                                        <div className="d-flex justify-content-between mb-1">
                                            <small>Upload Progress</small>
                                            <small>{progress}%</small>
                                        </div>
                                        <ProgressBar now={progress} style={{ height: "6px" }} />
                                    </div>

                                    <Row className="px-2">
                                        {DOCUMENTS.map((doc) => (
                                            <Col md={6} lg={4} className="mb-3" key={doc.name}>
                                                <div className={`rounded p-3 border ${values[doc.name] ? "border-success" : ""}`}>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <div className="fw-semibold">{doc.label} <span className="text-danger">*</span></div>
                                                            <small className="text-muted">{doc.desc}</small>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2 flex-wrap">
                                                            {values[doc.name] && (
                                                                doc.name === "profileImage" ? (
                                                                    <Image
                                                                        src={URL.createObjectURL(values[doc.name])}
                                                                        roundedCircle
                                                                        width={40}
                                                                        height={40}
                                                                        className="object-fit-cover border"
                                                                    />
                                                                ) : (
                                                                    <div
                                                                        className="small text-truncate text-success"
                                                                        style={{ maxWidth: "80px" }}
                                                                        title={values[doc.name].name}
                                                                    >
                                                                        ✓ {values[doc.name].name}
                                                                    </div>
                                                                )
                                                            )}
                                                            <Button
                                                                size="sm"
                                                                variant={values[doc.name] ? "success" : "secondary"}
                                                                onClick={() => document.getElementById(doc.name).click()}
                                                                disabled={isFormDisabled}
                                                            >
                                                                {values[doc.name] ? "Replace" : "Upload"}
                                                            </Button>
                                                        </div>
                                                        <input
                                                            hidden
                                                            type="file"
                                                            id={doc.name}
                                                            accept={doc.name === "profileImage" ? "image/*" : "application/pdf"}
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (file) handleFileUpload(file, doc.name, setFieldValue);
                                                                e.target.value = "";
                                                            }}
                                                        />
                                                    </div>
                                                    {fileErrors[doc.name] && (
                                                        <div className="small text-danger mt-2">{fileErrors[doc.name]}</div>
                                                    )}
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>

                                    {/* ── Application User ───────────────────── */}
                                    <Row className="px-2 mt-2">
                                        <Col md={6} lg={4} className="mb-3">
                                            <div className="rounded p-3 border">
                                                <Form.Check
                                                    type="checkbox"
                                                    id="isApplicationUser"
                                                    label="Is Application User"
                                                    checked={values.isApplicationUser}
                                                    onChange={(e) => {
                                                        setFieldValue("isApplicationUser", e.target.checked);
                                                        if (!e.target.checked) setFieldValue("role", "");
                                                    }}
                                                    disabled={isFormDisabled}
                                                />
                                            </div>
                                        </Col>

                                        {values.isApplicationUser && (
                                            <Col md={3} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label>User Role <span className="text-danger">*</span></Form.Label>
                                                    <Form.Select
                                                        name="role"
                                                        value={values.role}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        isInvalid={touched.role && !!errors.role}
                                                        disabled={isFormDisabled}
                                                    >
                                                        <option value="">Select role</option>
                                                        {roles.map((r) => (
                                                            <option key={r.id} value={r.name}>{r.name}</option>
                                                        ))}
                                                    </Form.Select>
                                                    <Form.Control.Feedback type="invalid">{errors.role}</Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        )}
                                    </Row>

                                    {/* Error display */}
                                    {error && (
                                        <div className="alert alert-danger mt-3" role="alert">
                                            {error}
                                        </div>
                                    )}

                                    {/* Action buttons */}
                                    <div className="text-end mt-4">
                                        <Button
                                            variant="outline-secondary"
                                            className="me-3"
                                            onClick={() => navigate("/employees")}
                                            disabled={isFormDisabled}
                                        >
                                            Cancel
                                        </Button>
                                        {hasPermission("staff_directory.create") && (
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                disabled={isFormDisabled}
                                            >
                                                {isFormDisabled ? (
                                                    <>
                                                        <Spinner as="span" animation="border" size="sm"
                                                            role="status" aria-hidden="true" className="me-2" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    "Save Employee"
                                                )}
                                            </Button>
                                        )}
                                    </div>

                                </Card.Body>
                            </Card>
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
};

export default AddEmployee;