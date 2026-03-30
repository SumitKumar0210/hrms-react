import React, { useEffect, useMemo, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Row,
  Col,
  Button,
  Card,
  Form as BootstrapForm,
  Spinner,
  Alert,
} from "react-bootstrap";
import { getSettingData, updateSetting } from "./slice/settingSlice";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../context/AuthContext";

/* ================= VALIDATION ================= */
const validationSchema = Yup.object({
  companyName: Yup.string()
    .trim()
    .required("Company Name is required"),
  phone: Yup.string()                                   // FIX: was "contact", mismatched with initialValues key "phone"
    .required("Phone is required")
    .matches(/^[0-9+\-\s()]+$/, "Invalid phone number format")
    .test("max-digits", "Phone number cannot exceed 10 digits", (value) => {
      if (!value) return true;
      return (value.replace(/\D/g, "").length <= 10);
    }),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  address: Yup.string()
    .trim()
    .required("Address is required"),
  city: Yup.string()
    .trim()
    .required("City is required"),
  state: Yup.string()
    .trim()
    .required("State is required"),
  country: Yup.string()
    .trim()
    .required("Country is required"),
  zip: Yup.string()
    .trim()
    .required("ZIP Code is required"),
  about: Yup.string()
    .trim()
    .required("About Us is required"),
  shortDescription: Yup.string()
    .trim()
    .required("Short Description is required"),
  apiKey: Yup.string()
    .trim(),
    // .required("Google Map API Key is required"),
  brandColor: Yup.string()
    .matches(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .required("Brand Color is required"),
  powered_by: Yup.string().trim(),
  copyright: Yup.string().trim(),
});

/* ================= REUSABLE FORM FIELD ================= */
const FormField = ({
  name,
  label,
  type = "text",
  placeholder,
  as,
  rows,
  touched,
  errors,
  list,
}) => {
  const isInvalid = !!(touched[name] && errors[name]);

  return (
    <BootstrapForm.Group className="mb-2">
      <BootstrapForm.Label>{label}</BootstrapForm.Label>
      <Field
        name={name}
        type={type}
        placeholder={placeholder}
        as={as || BootstrapForm.Control}
        rows={rows}
        list={list}
        className={`${as === "textarea" ? "form-control" : ""} ${
          isInvalid ? "is-invalid" : ""
        }`.trim()}
      />
      <ErrorMessage
        name={name}
        component="div"
        className="text-danger error-message"
      />
    </BootstrapForm.Group>
  );
};

/* ================= FEEDBACK ALERT ================= */
const FeedbackAlert = ({ feedback, onDismiss }) => {
  if (!feedback) return null;
  return (
    <Alert
      variant={feedback.type}
      dismissible
      onClose={onDismiss}
      className="mb-3"
    >
      {feedback.message}
    </Alert>
  );
};

/* ================= COMPONENT ================= */
const GeneralSettings = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.setting);
  const { refreshAppDetails, hasPermission } = useAuth();

  // FIX: replaced undefined setSuccessMessage with proper state
  const [feedback, setFeedback] = useState(null);

  /* ================= FETCH ================= */
  useEffect(() => {
    dispatch(getSettingData());
  }, [dispatch]);

  // Auto-dismiss feedback after 4 seconds
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  /* ================= INITIAL VALUES (DYNAMIC) ================= */
  const initialValues = useMemo(
    () => ({
      companyName: data?.application_name || "",
      phone: data?.contact || "",               // key is "phone" — validation schema now matches
      email: data?.email || "",
      address: data?.address || "",
      city: data?.city || "",
      state: data?.state || "",
      country: data?.country || "",
      zip: data?.zip || "",
      about: data?.about || "",
      shortDescription: data?.short_description || "",
      apiKey: data?.api_key || "",
      copyright: data?.copyright || "",
      powered_by: data?.powered_by || "",
      brandColor: data?.theme_color || "#27a348",
    }),
    [data]
  );

  /* ================= SUBMIT HANDLER ================= */
  const handleSubmit = (values, { setSubmitting }) => {
    setFeedback(null);
    dispatch(updateSetting(values))
      .unwrap()
      .then(() => {
        refreshAppDetails();
        setFeedback({
          type: "success",
          message: "Settings updated successfully!",
        });
      })
      .catch((err) => {
        console.error("Failed to update settings:", err);
        setFeedback({
          type: "danger",
          message:
            err?.message || "Failed to update settings. Please try again.",
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <Card.Body className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Card.Body>
    );
  }

  /* ================= ERROR STATE ================= */
  if (error) {
    return (
      <Card.Body className="text-center py-5">
        <p className="text-danger">Error loading settings: {error}</p>
        <Button onClick={() => dispatch(getSettingData())} variant="primary">
          Retry
        </Button>
      </Card.Body>
    );
  }

  return (
    <Card.Body>
      <FeedbackAlert feedback={feedback} onDismiss={() => setFeedback(null)} />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form>
            <Row className="gutters">
              {/* LEFT COLUMN */}
              <Col xl={6}>
                <Row>
                  <Col xl={12}>
                    <FormField
                      name="companyName"
                      label={<>Company Name <span className="text-danger">*</span></>}
                      placeholder="Enter Company Name"
                      touched={touched}
                      errors={errors}
                    />
                  </Col>
                  <Col xl={12}>
                    <BootstrapForm.Group className="mb-2">
                      <BootstrapForm.Label>Company Phone Number <span className="text-danger">*</span></BootstrapForm.Label>
                      <Field name="phone">
                        {({ field, form }) => (
                          <BootstrapForm.Control
                            {...field}
                            type="tel"
                            placeholder="Enter Company Phone Number"
                            isInvalid={!!(form.touched.phone && form.errors.phone)}
                            onChange={(e) => {
                              const raw = e.target.value;
                              const digits = raw.replace(/\D/g, "");
                              // Block any input that would exceed 10 digits
                              if (digits.length <= 10) {
                                form.setFieldValue("phone", raw);
                              }
                            }}
                          />
                        )}
                      </Field>
                      <ErrorMessage
                        name="phone"
                        component="div"
                        className="text-danger error-message"
                      />
                    </BootstrapForm.Group>
                  </Col>
                  <Col xl={12}>
                    <FormField
                      name="email"
                      type="email"
                      label={<> Company Details <span className="text-danger">*</span></>}
                      // label="Company Email"
                      placeholder="Enter Company Email"
                      touched={touched}
                      errors={errors}
                    />
                  </Col>
                  <Col xl={12}>
                    <FormField
                      name="address"
                      label={<> Company Address <span className="text-danger">*</span></>}
                      // label="Company Address"
                      placeholder="Enter Company Address"
                      touched={touched}
                      errors={errors}
                    />
                  </Col>
                  <Col xl={6}>
                    <FormField
                      name="city"
                      label={<>Company City <span className="text-danger">*</span></>}
                      // label="Company City"
                      placeholder="Enter Company City"
                      touched={touched}
                      errors={errors}
                    />
                  </Col>
                  <Col xl={6}>
                    <FormField
                      name="state"
                      label={<>State / Province <span className="text-danger">*</span></>}
                      // label="State / Province"
                      placeholder="Enter State / Province"
                      touched={touched}
                      errors={errors}
                    />
                  </Col>
                  <Col xl={6}>
                    <FormField
                      name="country"
                      label={<> Country <span className="text-danger">*</span></>}
                      // label="Country"
                      placeholder="Enter Country"
                      touched={touched}
                      errors={errors}
                    />
                  </Col>
                  <Col xl={6}>
                    <FormField
                      name="zip"
                      label={<>PIN / ZIP Code <span className="text-danger">*</span></>}
                      // label="PIN / ZIP Code"
                      placeholder="Enter ZIP Code"
                      touched={touched}
                      errors={errors}
                    />
                  </Col>
                </Row>
              </Col>

              {/* RIGHT COLUMN */}
              <Col xl={6}>
                <FormField
                  name="about"
                  label={<>Company About Us <span className="text-danger">*</span></>}
                  // label="Company About Us"
                  as="textarea"
                  rows={5}
                  placeholder="Write about your company"
                  touched={touched}
                  errors={errors}
                />
                <FormField
                  name="shortDescription"
                  label={<> Company Short Description <span className="text-danger">*</span></>}
                  // label="Company Short Description"
                  as="textarea"
                  rows={4}
                  placeholder="Enter a short description"
                  touched={touched}
                  errors={errors}
                />
                <Row>
                  <Col xl={6}>
                    <FormField
                      name="powered_by"
                      // label={<> Powered By <span className="text-danger">*</span></>}
                      label="Powered By"
                      placeholder="Enter Powered By"
                      touched={touched}
                      errors={errors}
                    />
                  </Col>
                  <Col xl={6}>
                    <FormField
                      name="copyright"
                      // label={<>Copyright <span className="text-danger">*</span></>}
                      label="Copyright"
                      placeholder="Enter Copyright"
                      touched={touched}
                      errors={errors}
                    />
                  </Col>
                </Row>
                <FormField
                  name="apiKey"
                  // label={<> Google Map API Key <span className="text-danger">*</span></>}
                  label="Google Map API Key"
                  placeholder="Enter Google Map API Key"
                  touched={touched}
                  errors={errors}
                />
              </Col>

              {/* SUBMIT BUTTON */}
              <Col xl={12}>
                <div className="text-end mt-1">
                  {hasPermission("setting.update") && (
                    <Button
                      type="submit"
                      variant="primary"
                      className="fw-normal btn-sm py-2 px-3"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Updating...
                        </>
                      ) : (
                        "Update Details"
                      )}
                    </Button>
                  )}
                </div>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
    </Card.Body>
  );
};

export default GeneralSettings;