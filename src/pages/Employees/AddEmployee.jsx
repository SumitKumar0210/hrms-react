import React from "react";
import {
    Card,
    Button,
    Form,
    ProgressBar,
    Row,
    Col,
    Image,
} from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().required("Phone number is required"),
    source: Yup.string().required("Source is required"),
    jobRole: Yup.string().required("Job role is required"),
    department: Yup.string().required("Department is required"),
    shiftType: Yup.string().required("Shift type is required"),
    shiftTiming: Yup.string().required("Shift timing is required"),
});

const documents = [
    { label: "ID Proof", desc: "Passport, Driving Lcence or National ID", name: "idProof" },
    { label: "Address Proof", desc: "Utility bill or Rental agreement", name: "addressProof" },
    { label: "Bank Details", desc: "Cancelled Cheque or Bank statement", name: "bankDetails" },
    { label: "Contract Letter", desc: "Signed employment contract", name: "contractLetter" },
    { label: "Profile Image", desc: "Employee photo", name: "profileImage" },
];

const AddEmployee = () => {
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
                    source: "",
                    jobRole: "",
                    department: "",
                    shiftType: "",
                    shiftTiming: "",
                    idProof: null,
                    addressProof: null,
                    bankDetails: null,
                    contractLetter: null,
                    profileImage: null,
                }}
                validationSchema={validationSchema}
                onSubmit={(values) => console.log(values)}
            >
                {({
                    handleSubmit,
                    handleChange,
                    setFieldValue,
                    values,
                    touched,
                    errors,
                }) => {
                    const uploadedCount = documents.filter(d => values[d.name]).length;
                    const progress = Math.round((uploadedCount / documents.length) * 100);

                    return (
                        <Form onSubmit={handleSubmit}>
                            <Card className="mt-3 p-3 shadow-sm border-0">
                                <Card.Body>

                                    {/* ===== BASIC DETAILS ===== */}
                                    <div className="mb-3 p-3 bg-light rounded">
                                        <h6 className="mb-0">Basic Details</h6>
                                    </div>

                                    <Row>
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
                                                       placeholder={`Enter ${f.label}`}
                                                        onChange={handleChange}
                                                        isInvalid={touched[f.name] && errors[f.name]}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors[f.name]}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        ))}

                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Source</Form.Label>
                                                <Form.Select name="source" onChange={handleChange}>
                                                    <option value="">Select source</option>
                                                    <option>Referral</option>
                                                    <option>Walk-in</option>
                                                    <option>Online</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {/* ===== ROLE & DEPARTMENT ===== */}
                                    <div className="my-3 p-3 bg-light rounded">
                                        <h6 className="mb-0">Role & Department</h6>
                                    </div>

                                    <Row>
                                        <Col md={3} className="mb-3">
                                            <Form.Label>Job Role</Form.Label>
                                            <Form.Select name="jobRole" onChange={handleChange}>
                                                <option value="">Select role</option>
                                                <option>Manager</option>
                                                <option>Supervisor</option>
                                                <option>Staff</option>
                                            </Form.Select>
                                        </Col>

                                        <Col md={3} className="mb-3">
                                            <Form.Label>Department</Form.Label>
                                            <Form.Select name="department" onChange={handleChange}>
                                                <option value="">Select department</option>
                                                <option>HR</option>
                                                <option>Operations</option>
                                                <option>Front Desk</option>
                                            </Form.Select>
                                        </Col>
                                    </Row>

                                    {/* ===== SHIFT ASSIGNMENT ===== */}
                                    <div className="my-3 p-3 bg-light rounded">
                                        <h6 className="mb-0">Shift Assignment</h6>
                                    </div>

                                    <Row>
                                        <Col md={3} className="mb-3">
                                            <Form.Label>Shift Type</Form.Label>
                                            <Form.Select name="shiftType" onChange={handleChange}>
                                                <option value="">Select type</option>
                                                <option>Day</option>
                                                <option>Night</option>
                                                <option>Rotational</option>
                                            </Form.Select>
                                        </Col>

                                        <Col md={3} className="mb-3">
                                            <Form.Label>Shift Timing</Form.Label>
                                            <Form.Select name="shiftTiming" onChange={handleChange}>
                                                <option value="">Select timing</option>
                                                <option>9AM – 6PM</option>
                                                <option>6PM – 3AM</option>
                                            </Form.Select>
                                        </Col>
                                    </Row>

                                    {/* ===== DOCUMENT UPLOAD ===== */}
                                    <div className="my-3 p-3 bg-light rounded">
                                        <h6 className="mb-0">Document Upload</h6>
                                    </div>

                                    <div className="mb-4 p-3 border rounded">
                                        <div className="d-flex justify-content-between mb-1">
                                            <small>Completion Progress</small>
                                            <small>{progress}%</small>
                                        </div>
                                        <ProgressBar now={progress} style={{ height: "6px" }} />
                                    </div>
                                    <Row>
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
                                                                    <Image
                                                                        src={URL.createObjectURL(values[doc.name])}
                                                                        roundedCircle
                                                                        width={40}
                                                                        height={40}
                                                                        className="object-fit-cover border"
                                                                    />

                                                                    <div
                                                                        className="small text-truncate text-warning fs-10"
                                                                        style={{ maxWidth: "60px" }}
                                                                        title={values[doc.name].name}
                                                                    >
                                                                        {values[doc.name].name}
                                                                    </div>
                                                                </>
                                                            )}

                                                            <Button
                                                                size="sm"
                                                                variant={values[doc.name] ? "success" : "secondary"}
                                                                onClick={() =>
                                                                    document.getElementById(doc.name).click()
                                                                }
                                                            >
                                                                {values[doc.name] ? "Replace" : "Upload"}
                                                            </Button>
                                                        </div>

                                                        <input
                                                            hidden
                                                            type="file"
                                                            id={doc.name}
                                                            onChange={(e) =>
                                                                setFieldValue(doc.name, e.target.files[0])
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>

                                    <div className="text-end mt-4">

                                        <Button type="submit" variant="outline-warning me-3">Save As Draft</Button>
                                        <Button type="submit">Save Employee</Button>
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
