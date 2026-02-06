import React, { useEffect } from "react";
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

const validationSchema = Yup.object({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string()
        .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
        .required("Phone number is required"),
    
    // Address fields
    address: Yup.string().required("Address is required"),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    pinCode: Yup.string()
        .matches(/^[0-9]{6}$/, "Enter valid 6 digit PIN code")
        .required("PIN code is required"),
    
    // Personal details
    bloodGroup: Yup.string().required("Blood group is required"),
    aadharNo: Yup.string()
        .matches(/^[0-9]{12}$/, "Aadhaar must be 12 digits")
        .required("Aadhaar number is required"),
    
    // Work details
    source: Yup.string().required("Source is required"),
    jobRole: Yup.string().required("Job role is required"),
    department: Yup.string().required("Department is required"),
    shiftType: Yup.string().required("Shift type is required"),
    shiftTiming: Yup.string().required("Shift timing is required"),
});

const documents = [
    { label: "ID Proof", desc: "Passport, Driving License or National ID", name: "idProof" },
    { label: "Address Proof", desc: "Utility bill or Rental agreement", name: "addressProof" },
    { label: "Bank Details", desc: "Cancelled Cheque or Bank statement", name: "bankDetails" },
    { label: "Contract Letter", desc: "Signed employment contract", name: "contractLetter" },
    { label: "Profile Image", desc: "Employee photo", name: "profileImage" },
];

const AddEmployee = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, success, error } = useSelector((state) => state.employee);

    useEffect(() => {
        // Redirect after successful creation
        if (success) {
            dispatch(clearSuccess());
            navigate("/employees");
        }
    }, [success, dispatch, navigate]);

    useEffect(() => {
        // Clear error when component unmounts
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            // Create FormData for file uploads
            const formData = new FormData();

            // Append text fields
            formData.append("first_name", values.firstName);
            formData.append("last_name", values.lastName);
            formData.append("email", values.email);
            formData.append("phone", values.phone);
            
            // Address fields
            formData.append("address", values.address);
            formData.append("city", values.city);
            formData.append("state", values.state);
            formData.append("pin_code", values.pinCode);
            
            // Personal details
            formData.append("blood_group", values.bloodGroup);
            formData.append("aadhar_no", values.aadharNo);
            
            // Work details
            formData.append("source", values.source);
            formData.append("job_role", values.jobRole);
            formData.append("department", values.department);
            formData.append("shift_type", values.shiftType);
            formData.append("shift_timing", values.shiftTiming);

            // Append files if they exist
            documents.forEach((doc) => {
                if (values[doc.name]) {
                    formData.append(doc.name, values[doc.name]);
                }
            });

            // Dispatch create employee action
            await dispatch(createEmployee(formData)).unwrap();
        } catch (err) {
            console.error("Failed to create employee:", err);
        } finally {
            setSubmitting(false);
        }
    };

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
                    
                    // Address
                    address: "",
                    city: "",
                    state: "",
                    pinCode: "",
                    
                    // Personal details
                    bloodGroup: "",
                    aadharNo: "",
                    
                    // Work details
                    source: "",
                    jobRole: "",
                    department: "",
                    shiftType: "",
                    shiftTiming: "",
                    
                    // Documents
                    idProof: null,
                    addressProof: null,
                    bankDetails: null,
                    contractLetter: null,
                    profileImage: null,
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({
                    handleSubmit,
                    handleChange,
                    setFieldValue,
                    values,
                    touched,
                    errors,
                    isSubmitting,
                }) => {
                    const uploadedCount = documents.filter((d) => values[d.name]).length;
                    const progress = Math.round((uploadedCount / documents.length) * 100);

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
                                                        isInvalid={touched[f.name] && errors[f.name]}
                                                        disabled={loading || isSubmitting}
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
                                                    isInvalid={touched.address && errors.address}
                                                    placeholder="Enter full address"
                                                    disabled={loading || isSubmitting}
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
                                                    isInvalid={touched.city && errors.city}
                                                    placeholder="Enter city"
                                                    disabled={loading || isSubmitting}
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
                                                    isInvalid={touched.state && errors.state}
                                                    placeholder="Enter state"
                                                    disabled={loading || isSubmitting}
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
                                                    isInvalid={touched.pinCode && errors.pinCode}
                                                    placeholder="6 digit PIN"
                                                    disabled={loading || isSubmitting}
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
                                                    isInvalid={touched.bloodGroup && errors.bloodGroup}
                                                    disabled={loading || isSubmitting}
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
                                                    isInvalid={touched.aadharNo && errors.aadharNo}
                                                    placeholder="12 digit Aadhaar number"
                                                    disabled={loading || isSubmitting}
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
                                                    isInvalid={touched.source && errors.source}
                                                    disabled={loading || isSubmitting}
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
                                                    isInvalid={touched.jobRole && errors.jobRole}
                                                    disabled={loading || isSubmitting}
                                                >
                                                    <option value="">Select role</option>
                                                    <option value="manager">Manager</option>
                                                    <option value="supervisor">Supervisor</option>
                                                    <option value="staff">Staff</option>
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
                                                    isInvalid={touched.department && errors.department}
                                                    disabled={loading || isSubmitting}
                                                >
                                                    <option value="">Select department</option>
                                                    <option value="hr">HR</option>
                                                    <option value="operations">Operations</option>
                                                    <option value="front-desk">Front Desk</option>
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
                                                    onChange={handleChange}
                                                    isInvalid={touched.shiftType && errors.shiftType}
                                                    disabled={loading || isSubmitting}
                                                >
                                                    <option value="">Select type</option>
                                                    <option value="day">Day</option>
                                                    <option value="night">Night</option>
                                                    <option value="rotational">Rotational</option>
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.shiftType}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Shift Timing</Form.Label>
                                                <Form.Select
                                                    name="shiftTiming"
                                                    value={values.shiftTiming}
                                                    onChange={handleChange}
                                                    isInvalid={touched.shiftTiming && errors.shiftTiming}
                                                    disabled={loading || isSubmitting}
                                                >
                                                    <option value="">Select timing</option>
                                                    <option value="9am-6pm">9AM – 6PM</option>
                                                    <option value="6pm-3am">6PM – 3AM</option>
                                                    <option value="3am-12pm">3AM – 12PM</option>
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.shiftTiming}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
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
                                                    className={`rounded p-3 border ${
                                                        values[doc.name] ? "border-success" : "border"
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
                                                                disabled={loading || isSubmitting}
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
                                                                    setFieldValue(doc.name, file);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                        ))}
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
                                            disabled={loading || isSubmitting}
                                        >
                                            Cancel
                                        </Button>

                                        <Button
                                            type="submit"
                                            variant="primary"
                                            disabled={loading || isSubmitting}
                                        >
                                            {loading || isSubmitting ? (
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