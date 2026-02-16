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

// Enhanced validation schema with better error messages and patterns
const validationSchema = Yup.object({
    firstName: Yup.string()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name must not exceed 50 characters")
        .matches(/^[a-zA-Z\s]+$/, "First name can only contain letters")
        .required("First name is required"),

    lastName: Yup.string()
        .min(2, "Last name must be at least 2 characters")
        .max(50, "Last name must not exceed 50 characters")
        .matches(/^[a-zA-Z\s]+$/, "Last name can only contain letters")
        .required("Last name is required"),

    email: Yup.string()
        .email("Invalid email")
        .required("Email is required")
        .test('email-format', 'Invalid email format', (value) => {
            if (!value) return false;
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }),

    phone: Yup.string()
        .matches(/^[6-9][0-9]{9}$/, "Phone number must be a valid 10-digit Indian mobile number")
        .required("Phone number is required"),

    // Address fields
    address: Yup.string()
        .min(10, "Address must be at least 10 characters")
        .max(200, "Address must not exceed 200 characters")
        .required("Address is required"),

    city: Yup.string()
        .min(2, "City name must be at least 2 characters")
        .required("City is required"),

    state: Yup.string()
        .min(2, "State name must be at least 2 characters")
        .required("State is required"),

    pinCode: Yup.string()
        .matches(/^[1-9][0-9]{5}$/, "Enter valid 6 digit PIN code")
        .required("PIN code is required"),

    // Personal details
    bloodGroup: Yup.string().required("Blood group is required"),

    aadharNo: Yup.string()
        .matches(/^[2-9][0-9]{11}$/, "Aadhaar must be 12 digits")
        .required("Aadhaar number is required"),

    // Work details
    source: Yup.string().required("Source is required"),
    jobRole: Yup.string().required("Job role is required"),
    department: Yup.string().required("Department is required"),
    shiftType: Yup.string().required("Shift type is required"),

    // Conditional validation for rotational shifts
    shiftCheckInTiming: Yup.string(),
    shiftCheckOutTiming: Yup.string()
        .test('after-checkin', 'Check-out must be after check-in', function (value) {
            const { shiftCheckInTiming } = this.parent;
            if (!value || !shiftCheckInTiming) return true;
            return value > shiftCheckInTiming;
        }),
});

const documents = [
    { label: "ID Proof", desc: "Passport, Driving License or National ID", name: "idProof" },
    { label: "Address Proof", desc: "Utility bill or Rental agreement", name: "addressProof" },
    { label: "Bank Details", desc: "Cancelled Cheque or Bank statement", name: "bankDetails" },
    { label: "Contract Letter", desc: "Signed employment contract", name: "contractLetter" },
    { label: "Profile Image", desc: "Employee photo", name: "profileImage" },
];

const AddEmployee = () => {
    const [selectedShift, setSelectedShift] = useState(null);
    const [fileErrors, setFileErrors] = useState({});

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, success, error } = useSelector((state) => state.employee);
    const {
        data: departments = [],
        loading: departmentLoading,
        error: departmentError,
    } = useSelector((state) => state.department);

    const {
        data: designations = [],
        loading: designationLoading,
        error: designationError,
    } = useSelector((state) => state.designation);

    const {
        data: shifts = [],
        loading: shiftLoading,
        error: shiftError,
    } = useSelector((state) => state.shift);

    // Fetch data on mount
    useEffect(() => {
        dispatch(fetchAllActiveDepartment());
        dispatch(fetchAllActiveDesignation());
        dispatch(fetchAllActiveShift());
    }, [dispatch]);

    // Handle success redirect
    useEffect(() => {
        if (success) {
            dispatch(clearSuccess());
            navigate("/employees");
        }
    }, [success, dispatch, navigate]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            dispatch(clearError());
            dispatch(resetDepartmentState());
            dispatch(resetShiftState());
            dispatch(resetDesignationState());
        };
    }, [dispatch]);

    // Validate file size (max 10MB for documents, 5MB for images)
    const validateFile = useCallback((file, docName) => {
        if (!file) return null;

        const maxSize = docName === 'profileImage' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;

        if (file.size > maxSize) {
            return `File size must not exceed ${maxSize / (1024 * 1024)}MB`;
        }

        return null;
    }, []);

    // Handle shift change with validation
    const handleShiftChange = useCallback((shift, setFieldValue) => {
        setSelectedShift(shift);

        // Reset timing fields if not rotational
        if (shift?.rotational_time !== 1) {
            setFieldValue('shiftCheckInTiming', '');
            setFieldValue('shiftCheckOutTiming', '');
        }
    }, []);

    // Handle file upload with validation
    const handleFileUpload = useCallback((file, docName, setFieldValue) => {
        const error = validateFile(file, docName);

        if (error) {
            setFileErrors(prev => ({ ...prev, [docName]: error }));
            return;
        }

        setFileErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[docName];
            return newErrors;
        });

        setFieldValue(docName, file);
    }, [validateFile]);

    // Submit handler with proper validation
    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        console.log('Form getting submitted with values:', values);
        console.log('Selected shift:', selectedShift);
        
        try {
            // Validate rotational shift timings
            if (selectedShift?.rotational_time === 1) {
                if (!values.shiftCheckInTiming || !values.shiftCheckOutTiming) {
                    console.log('Shift timing validation failed');
                    setErrors({
                        shiftCheckInTiming: !values.shiftCheckInTiming ? 'Required for rotational shift' : undefined,
                        shiftCheckOutTiming: !values.shiftCheckOutTiming ? 'Required for rotational shift' : undefined
                    });
                    setSubmitting(false);
                    return;
                }
            }

            const formData = new FormData();

            // Append text fields with proper trimming
            formData.append("first_name", values.firstName.trim());
            formData.append("last_name", values.lastName.trim());
            formData.append("email", values.email.toLowerCase().trim());
            formData.append("phone", values.phone.trim());

            // Address fields
            formData.append("address", values.address.trim());
            formData.append("city", values.city.trim());
            formData.append("state", values.state.trim());
            formData.append("pin_code", values.pinCode.trim());

            // Personal details
            formData.append("blood_group", values.bloodGroup);
            formData.append("aadhar_no", values.aadharNo.trim());

            // Work details
            formData.append("source", values.source);
            formData.append("job_role", values.jobRole);
            formData.append("department", values.department);
            formData.append("shift_id", values.shiftType);
            formData.append(
                "is_application_user",
                values.isApplicationUser ? 1 : 0
            );

            if (selectedShift?.rotational_time === 1) {
                formData.append("shift_check_in_timing", values.shiftCheckInTiming);
                formData.append("shift_check_out_timing", values.shiftCheckOutTiming);
            }

            // Append files
            documents.forEach((doc) => {
                if (values[doc.name]) {
                    formData.append(doc.name, values[doc.name]);
                }
            });

            console.log("Dispatching createEmployee action");
            await dispatch(createEmployee(formData)).unwrap();
            console.log("Employee created successfully");
        } catch (err) {
            console.error("Failed to create employee:", err);
        } finally {
            setSubmitting(false);
        }
    };

    // Loading state for dropdowns
    const isDataLoading = departmentLoading || designationLoading || shiftLoading;

    return (
        <div className="container-fluid g-0">
            <div className="mt-3">
                <h5 className="mb-0">Staff Onboarding</h5>
                <small>Complete all fields to add a new team member</small>
            </div>

            <Formik
                initialValues={{
                    firstName: "",
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
                    isValid,
                }) => {
                    console.log('Current errors:', errors);
                    console.log('Form is valid:', isValid);
                    
                    const uploadedCount = documents.filter((d) => values[d.name]).length;
                    const progress = Math.round((uploadedCount / documents.length) * 100);
                    const isFormDisabled = loading || isSubmitting;

                    return (
                        <Form onSubmit={handleSubmit}>
                            <Card className="mt-3 p-3 shadow-sm border-0">
                                <Card.Body>
                                    {/* ===== BASIC DETAILS ===== */}
                                    <div className="mb-3 p-3 bg-light rounded">
                                        <h6 className="mb-0">Basic Details</h6>
                                    </div>

                                    <Row className="px-2">
                                        {[
                                            { label: "First Name", name: "firstName" },
                                            { label: "Last Name", name: "lastName" },
                                            { label: "Email Address", name: "email", type: "email" },
                                            { label: "Phone Number", name: "phone" },
                                        ].map((f) => (
                                            <Col md={3} className="mb-3" key={f.name}>
                                                <Form.Group>
                                                    <Form.Label>{f.label}</Form.Label>
                                                    <Form.Control
                                                        type={f.type || "text"}
                                                        name={f.name}
                                                        value={values[f.name]}
                                                        placeholder={`Enter ${f.label.toLowerCase()}`}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        isInvalid={touched[f.name] && errors[f.name]}
                                                        disabled={isFormDisabled}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors[f.name]}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        ))}
                                    </Row>

                                    {/* ===== ADDRESS DETAILS ===== */}
                                    <div className="my-3 p-3 bg-light rounded">
                                        <h6 className="mb-0">Address Details</h6>
                                    </div>

                                    <Row className="px-2">
                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Address</Form.Label>
                                                <Form.Control
                                                    name="address"
                                                    value={values.address}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.address && errors.address}
                                                    placeholder="Enter full address"
                                                    disabled={isFormDisabled}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.address}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>City</Form.Label>
                                                <Form.Control
                                                    name="city"
                                                    value={values.city}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.city && errors.city}
                                                    placeholder="Enter city"
                                                    disabled={isFormDisabled}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.city}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>State</Form.Label>
                                                <Form.Control
                                                    name="state"
                                                    value={values.state}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.state && errors.state}
                                                    placeholder="Enter state"
                                                    disabled={isFormDisabled}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.state}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="px-2">
                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>PIN Code</Form.Label>
                                                <Form.Control
                                                    name="pinCode"
                                                    value={values.pinCode}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.pinCode && errors.pinCode}
                                                    placeholder="6 digit PIN"
                                                    disabled={isFormDisabled}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.pinCode}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Blood Group</Form.Label>
                                                <Form.Select
                                                    name="bloodGroup"
                                                    value={values.bloodGroup}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.bloodGroup && errors.bloodGroup}
                                                    disabled={isFormDisabled}
                                                >
                                                    <option value="">Select blood group</option>
                                                    <option>A+</option>
                                                    <option>A-</option>
                                                    <option>B+</option>
                                                    <option>B-</option>
                                                    <option>O+</option>
                                                    <option>O-</option>
                                                    <option>AB+</option>
                                                    <option>AB-</option>
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.bloodGroup}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Aadhaar Number</Form.Label>
                                                <Form.Control
                                                    name="aadharNo"
                                                    value={values.aadharNo}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.aadharNo && errors.aadharNo}
                                                    placeholder="12 digit Aadhaar number"
                                                    disabled={isFormDisabled}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.aadharNo}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Source</Form.Label>
                                                <Form.Select
                                                    name="source"
                                                    value={values.source}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.source && errors.source}
                                                    disabled={isFormDisabled}
                                                >
                                                    <option value="">Select source</option>
                                                    <option value="referral">Referral</option>
                                                    <option value="walk-in">Walk-in</option>
                                                    <option value="online">Online</option>
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.source}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {/* ===== ROLE & DEPARTMENT ===== */}
                                    <div className="my-3 p-3 bg-light rounded">
                                        <h6 className="mb-0">Role & Department</h6>
                                    </div>

                                    <Row className="px-2">
                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Job Role</Form.Label>
                                                <Form.Select
                                                    name="jobRole"
                                                    value={values.jobRole}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.jobRole && errors.jobRole}
                                                    disabled={isFormDisabled}
                                                >
                                                    <option value="">Select role</option>
                                                    {designations.map((designation) => (
                                                        <option key={designation.id} value={designation.id}>
                                                            {designation.name}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.jobRole}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Department</Form.Label>
                                                <Form.Select
                                                    name="department"
                                                    value={values.department}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.department && errors.department}
                                                    disabled={isFormDisabled}
                                                >
                                                    <option value="">Select department</option>
                                                    {departments.map((department) => (
                                                        <option key={department.id} value={department.id}>
                                                            {department.name}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.department}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Shift Type</Form.Label>
                                                <Form.Select
                                                    name="shiftType"
                                                    value={values.shiftType}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        const shift = shifts.find(
                                                            (s) => s.id == e.target.value
                                                        );
                                                        handleShiftChange(shift, setFieldValue);
                                                    }}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.shiftType && errors.shiftType}
                                                    disabled={isFormDisabled}
                                                >
                                                    <option value="">Select type</option>
                                                    {shifts.map((shift) => (
                                                        <option key={shift.id} value={shift.id}>
                                                            {shift.name} ({shift.sign_in} - {shift.sign_out})
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.shiftType}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        {selectedShift?.rotational_time === 1 && (
                                            <>
                                                <Col md={3} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label>Shift Check In Timing</Form.Label>
                                                        <Form.Control
                                                            type="time"
                                                            name="shiftCheckInTiming"
                                                            value={values.shiftCheckInTiming}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            isInvalid={touched.shiftCheckInTiming && errors.shiftCheckInTiming}
                                                            disabled={isFormDisabled}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.shiftCheckInTiming}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>

                                                <Col md={3} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label>Shift Check Out Timing</Form.Label>
                                                        <Form.Control
                                                            type="time"
                                                            name="shiftCheckOutTiming"
                                                            value={values.shiftCheckOutTiming}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            isInvalid={touched.shiftCheckOutTiming && errors.shiftCheckOutTiming}
                                                            disabled={isFormDisabled}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.shiftCheckOutTiming}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                            </>
                                        )}
                                    </Row>

                                    {/* ===== DOCUMENT UPLOAD ===== */}
                                    <div className="my-3 p-3 bg-light rounded">
                                        <h6 className="mb-0">Document Upload</h6>
                                    </div>

                                    <div className="mb-4 p-3 border rounded mx-2">
                                        <div className="d-flex justify-content-between mb-1">
                                            <small>Completion Progress</small>
                                            <small>{progress}%</small>
                                        </div>
                                        <ProgressBar now={progress} style={{ height: "6px" }} />
                                    </div>

                                    <Row className="px-2">
                                        {documents.map((doc) => (
                                            <Col md={6} lg={4} className="mb-3" key={doc.name}>
                                                <div
                                                    className={`rounded p-3 border ${values[doc.name] ? "border-success" : "border"
                                                        }`}
                                                >
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <div className="fw-semibold">{doc.label}</div>
                                                            <small className="text-muted">{doc.desc}</small>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2 flex-wrap">
                                                            {values[doc.name] && (
                                                                <>
                                                                    {doc.name === "profileImage" ? (
                                                                        <Image
                                                                            src={URL.createObjectURL(
                                                                                values[doc.name]
                                                                            )}
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
                                                                    )}
                                                                </>
                                                            )}

                                                            <Button
                                                                size="sm"
                                                                variant={
                                                                    values[doc.name] ? "success" : "secondary"
                                                                }
                                                                onClick={() =>
                                                                    document.getElementById(doc.name).click()
                                                                }
                                                                disabled={isFormDisabled}
                                                            >
                                                                {values[doc.name] ? "Replace" : "Upload"}
                                                            </Button>
                                                        </div>

                                                        <input
                                                            hidden
                                                            type="file"
                                                            id={doc.name}
                                                            accept={
                                                                doc.name === "profileImage"
                                                                    ? "image/*"
                                                                    : ".pdf,.jpg,.jpeg,.png"
                                                            }
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    handleFileUpload(file, doc.name, setFieldValue);
                                                                }
                                                                e.target.value = ''; // Reset input
                                                            }}
                                                        />
                                                    </div>
                                                    {fileErrors[doc.name] && (
                                                        <div className="small text-danger mt-2">
                                                            {fileErrors[doc.name]}
                                                        </div>
                                                    )}
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                    <Row className="px-2">
                                        <Col md={6} lg={4} className="mb-3">
                                            <div className="rounded p-3 border">
                                                <Form.Check
                                                    type="checkbox"
                                                    id="applicationUser"
                                                    label="Is Application User"
                                                    checked={values.isApplicationUser}
                                                    onChange={(e) =>
                                                        setFieldValue("isApplicationUser", e.target.checked)
                                                    }
                                                    disabled={isFormDisabled}
                                                />
                                            </div>
                                        </Col>
                                    </Row>

                                    {/* Error Display */}
                                    {error && (
                                        <div className="alert alert-danger mt-3" role="alert">
                                            {error}
                                        </div>
                                    )}

                                    <div className="text-end mt-4">
                                        <Button
                                            variant="outline-secondary"
                                            className="me-3"
                                            onClick={() => navigate("/employees")}
                                            disabled={isFormDisabled}
                                        >
                                            Cancel
                                        </Button>

                                        <Button
                                            type="submit"
                                            variant="primary"
                                            disabled={isFormDisabled}
                                            onClick={() => {
                                                console.log("Submit button clicked");
                                                console.log("Current errors:", errors);
                                                console.log("Current values:", values);
                                            }}
                                        >
                                            {isFormDisabled ? (
                                                <>
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        role="status"
                                                        aria-hidden="true"
                                                        className="me-2"
                                                    />
                                                    Saving...
                                                </>
                                            ) : (
                                                "Save Employee"
                                            )}
                                        </Button>
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