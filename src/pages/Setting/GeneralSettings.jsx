import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Row, Col, Button, Card, Form as BootstrapForm } from "react-bootstrap";

const GeneralSettings = () => {
  const initialValues = {
    companyName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zip: "",
    about: "",
    shortDescription: "",
    apiKey: "",
    brandColor: "#27a348",
  };

  const validationSchema = Yup.object({
    companyName: Yup.string().required("Company Name is required"),
    phone: Yup.string().required("Phone is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    address: Yup.string().required("Address is required"),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State/Province is required"),
    country: Yup.string().required("Country is required"),
    zip: Yup.string().required("ZIP Code is required"),
    about: Yup.string().required("About Us is required"),
    shortDescription: Yup.string().required("Short Description is required"),
    apiKey: Yup.string().required("Google Map API Key is required"),
    brandColor: Yup.string().matches(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
  });

//   const handleSubmit = (values) => {
//     console.log("Submitted values:", values);
//   };

  return (
    <Card.Body>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
        console.log("Submitted values:", values);
        setTimeout(() => setSubmitting(false), 1000); // Simulate async
        }}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <Row className="gutters">
              <Col xl={6}>
                <Row>
                    <Col xl={12}>
                        <BootstrapForm.Group className="mb-2">
                            <BootstrapForm.Label>Company Name</BootstrapForm.Label>
                            <Field
                                name="companyName"
                                type="text"
                                placeholder="Enter Company Name"
                                as={BootstrapForm.Control}
                                className={touched.companyName && errors.companyName ? "is-invalid" : ""}
                            />
                            <ErrorMessage name="companyName" component="div" className="text-danger error-message" />
                        </BootstrapForm.Group>
                    </Col>
                    <Col xl={12}>
                        <BootstrapForm.Group className="mb-2">
                            <BootstrapForm.Label>Company Phone Number</BootstrapForm.Label>
                            <Field
                                name="phone"
                                type="text"
                                placeholder="Enter Company Phone Number"
                                as={BootstrapForm.Control}
                                className={touched.phone && errors.phone ? "is-invalid" : ""}
                            />
                            <ErrorMessage name="phone" component="div" className="text-danger error-message" />
                        </BootstrapForm.Group>
                    </Col>
                    <Col xl={12}>
                        <BootstrapForm.Group className="mb-2">
                            <BootstrapForm.Label>Company Email</BootstrapForm.Label>
                            <Field
                                name="email"
                                type="email"
                                placeholder="Enter Company Email"
                                as={BootstrapForm.Control}
                                className={touched.email && errors.email ? "is-invalid" : ""}
                            />
                            <ErrorMessage name="email" component="div" className="text-danger error-message" />
                        </BootstrapForm.Group>
                    </Col>
                    <Col xl={12}>
                        <BootstrapForm.Group className="mb-2">
                            <BootstrapForm.Label>Company Address</BootstrapForm.Label>
                            <Field
                                name="address"
                                type="text"
                                placeholder="Enter Company Address"
                                as={BootstrapForm.Control}
                                className={touched.address && errors.address ? "is-invalid" : ""}
                            />
                            <ErrorMessage name="address" component="div" className="text-danger error-message" />
                        </BootstrapForm.Group>
                    </Col>
                    <Col xl={6}>
                        <BootstrapForm.Group className="mb-2">
                            <BootstrapForm.Label>Company City</BootstrapForm.Label>
                            <Field
                                name="city"
                                type="text"
                                placeholder="Enter Company City"
                                as={BootstrapForm.Control}
                                className={touched.city && errors.city ? "is-invalid" : ""}
                            />
                            <ErrorMessage name="city" component="div" className="text-danger error-message" />
                        </BootstrapForm.Group>
                    </Col>
                    <Col xl={6}>
                        <BootstrapForm.Group className="mb-2">
                            <BootstrapForm.Label>State / Province</BootstrapForm.Label>
                            <Field
                                name="state"
                                type="text"
                                placeholder="Enter State / Province"
                                as={BootstrapForm.Control}
                                className={touched.state && errors.state ? "is-invalid" : ""}
                            />
                            <ErrorMessage name="state" component="div" className="text-danger error-message" />
                        </BootstrapForm.Group>
                    </Col>
                    <Col xl={6}>
                        <BootstrapForm.Group className="mb-2">
                            <BootstrapForm.Label>Country</BootstrapForm.Label>
                            <Field
                                name="country"
                                type="text"
                                placeholder="Enter Country"
                                as={BootstrapForm.Control}
                                className={touched.country && errors.country ? "is-invalid" : ""}
                            />
                            <ErrorMessage name="country" component="div" className="text-danger error-message" />
                        </BootstrapForm.Group>
                    </Col>
                    <Col xl={6}>
                        <BootstrapForm.Group className="mb-2">
                            <BootstrapForm.Label>PIN / ZIP Code</BootstrapForm.Label>
                            <Field
                                name="zip"
                                type="text"
                                placeholder="Enter ZIP Code"
                                as={BootstrapForm.Control}
                                className={touched.zip && errors.zip ? "is-invalid" : ""}
                            />
                            <ErrorMessage name="zip" component="div" className="text-danger error-message" />
                        </BootstrapForm.Group>
                    </Col>
                </Row>
              </Col>
              <Col xl={6}>
                <BootstrapForm.Group className="mb-2">
                  <BootstrapForm.Label>Company About Us</BootstrapForm.Label>
                  <Field
                    name="about"
                    as="textarea"
                    rows={5}
                    placeholder="Write about your company"
                    className={`form-control ${touched.about && errors.about ? "is-invalid" : ""}`}
                  />
                  <ErrorMessage name="about" component="div" className="text-danger error-message" />
                </BootstrapForm.Group>

                <BootstrapForm.Group className="mb-2">
                  <BootstrapForm.Label>Company Short Description</BootstrapForm.Label>
                  <Field
                    name="shortDescription"
                    as="textarea"
                    rows={4}
                    placeholder="Enter a short description"
                    className={`form-control ${touched.shortDescription && errors.shortDescription ? "is-invalid" : ""}`}
                  />
                  <ErrorMessage name="shortDescription" component="div" className="text-danger error-message" />
                </BootstrapForm.Group>

                <BootstrapForm.Group className="mb-2">
                  <BootstrapForm.Label>Google Map API Key</BootstrapForm.Label>
                  <Field
                    name="apiKey"
                    type="text"
                    as={BootstrapForm.Control}
                    className={touched.apiKey && errors.apiKey ? "is-invalid" : ""}
                  />
                  <ErrorMessage name="apiKey" component="div" className="text-danger error-message" />
                </BootstrapForm.Group>

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
                </BootstrapForm.Group>
              </Col>
              <Col xl={12}>
                <div className="text-end mt-1">
                    <Button type="submit" variant="primary" className="fw-normal btn-sm py-2 px-3" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Details"}
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
