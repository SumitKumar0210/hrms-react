import React, { useEffect, useMemo } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Row,
  Col,
  Button,
  Card,
  Form as BootstrapForm,
  Spinner,
} from "react-bootstrap";
import { getSettingData, updateSetting } from "./slice/settingSlice";
import { useDispatch, useSelector } from "react-redux";

/* ================= VALIDATION ================= */
const validationSchema = Yup.object({
  companyName: Yup.string().required("Company Name is required"),
  phone: Yup.string()
    .required("Phone is required")
    .matches(/^[0-9+\-\s()]+$/, "Invalid phone number format"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  country: Yup.string().required("Country is required"),
  zip: Yup.string().required("ZIP Code is required"),
  about: Yup.string().required("About Us is required"),
  shortDescription: Yup.string().required("Short Description is required"),
  apiKey: Yup.string().required("Google Map API Key is required"),
  brandColor: Yup.string()
    .matches(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .required("Brand Color is required"),
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
  list 
}) => (
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
        touched[name] && errors[name] ? "is-invalid" : ""
      }`.trim()}
    />
    <ErrorMessage name={name} component="div" className="text-danger error-message" />
  </BootstrapForm.Group>
);

/* ================= COMPONENT ================= */
const GeneralSettings = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.setting);

  /* ================= FETCH ================= */
  useEffect(() => {
    dispatch(getSettingData());
  }, [dispatch]);

  /* ================= INITIAL VALUES (DYNAMIC) ================= */
  const initialValues = useMemo(
    () => ({
      companyName: data?.application_name || "",
      phone: data?.contact || "",
      email: data?.email || "",
      address: data?.address || "",
      city: data?.city || "",
      state: data?.state || "",
      country: data?.country || "",
      zip: data?.zip || "",
      about: data?.about || "",
      shortDescription: data?.short_description || "",
      apiKey: data?.api_key || "",
      brandColor: data?.theme_color || "#27a348",
    }),
    [data]
  );

  /* ================= SUBMIT HANDLER ================= */
  const handleSubmit = (values, { setSubmitting }) => {
    dispatch(updateSetting(values))
      .unwrap()
      .then(() => {
        // Optional: Show success message
        console.log("Settings updated successfully");
      })
      .catch((err) => {
        // Optional: Show error message
        console.error("Failed to update settings:", err);
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
                      label="Company Name"
                      placeholder="Enter Company Name"
                      touched={touched}
                      errors={errors}
                    />
                  </Col>
                  <Col xl={12}>
                    <FormField
                      name="phone"
                      label="Company Phone Number"
                      placeholder="Enter Company Phone Number"
                      touched={touched}
                      errors={errors}
                    />
                  </Col>
                  <Col xl={12}>
                    <FormField
                      name="email"
                      type="email"
                      label="Company Email"
                      placeholder="Enter Company Email"
                      touched={touched}
                      errors={errors}
                    />
                  </Col>
                  <Col xl={12}>
                    <FormField
                      name="address"
                      label="Company Address"
                      placeholder="Enter Company Address"
                      touched={touched}
                      errors={errors}
                    />
                  </Col>
                  <Col xl={6}>
                    <FormField
                      name="city"
                      label="Company City"
                      placeholder="Enter Company City"
                      touched={touched}
                      errors={errors}
                    />
                  </Col>
                  <Col xl={6}>
                    <FormField
                      name="state"
                      label="State / Province"
                      placeholder="Enter State / Province"
                      touched={touched}
                      errors={errors}
                    />
                  </Col>
                  <Col xl={6}>
                    <FormField
                      name="country"
                      label="Country"
                      placeholder="Enter Country"
                      touched={touched}
                      errors={errors}
                    />
                  </Col>
                  <Col xl={6}>
                    <FormField
                      name="zip"
                      label="PIN / ZIP Code"
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
                  label="Company About Us"
                  as="textarea"
                  rows={5}
                  placeholder="Write about your company"
                  touched={touched}
                  errors={errors}
                />

                <FormField
                  name="shortDescription"
                  label="Company Short Description"
                  as="textarea"
                  rows={4}
                  placeholder="Enter a short description"
                  touched={touched}
                  errors={errors}
                />

                <FormField
                  name="apiKey"
                  label="Google Map API Key"
                  placeholder="Enter Google Map API Key"
                  touched={touched}
                  errors={errors}
                />

                <BootstrapForm.Group className="mb-2">
                  <BootstrapForm.Label>Brand Color</BootstrapForm.Label>
                  <Field
                    name="brandColor"
                    type="color"
                    as={BootstrapForm.Control}
                    list="colors"
                    className="w-100"
                  />
                  <datalist id="colors">
                    <option value="#27a348" />
                    <option value="#791116" />
                    <option value="#30a32e" />
                    <option value="#308b8d" />
                  </datalist>
                  <ErrorMessage 
                    name="brandColor" 
                    component="div" 
                    className="text-danger error-message" 
                  />
                </BootstrapForm.Group>
              </Col>

              {/* SUBMIT BUTTON */}
              <Col xl={12}>
                <div className="text-end mt-1">
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