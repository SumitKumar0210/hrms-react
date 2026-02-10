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
  phone: Yup.string().required("Phone is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  country: Yup.string().required("Country is required"),
  zip: Yup.string().required("ZIP Code is required"),
  about: Yup.string().required("About Us is required"),
  shortDescription: Yup.string().required("Short Description is required"),
  apiKey: Yup.string().required("Google Map API Key is required"),
  brandColor: Yup.string().matches(/^#[0-9A-Fa-f]{6}$/),
});

/* ================= COMPONENT ================= */
const GeneralSettings = () => {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.setting);

  /* ================= FETCH ================= */
  useEffect(() => {
    dispatch(getSettingData());
  }, [dispatch]);

  /* ================= INITIAL VALUES (DYNAMIC) ================= */
  const initialValues = useMemo(
    () => ({
      companyName: data?.companyName || "",
      phone: data?.phone || "",
      email: data?.email || "",
      address: data?.address || "",
      city: data?.city || "",
      state: data?.state || "",
      country: data?.country || "",
      zip: data?.zip || "",
      about: data?.about || "",
      shortDescription: data?.shortDescription || "",
      apiKey: data?.apiKey || "",
      brandColor: data?.brandColor || "#27a348",
    }),
    [data]
  );

  if (loading) {
    return (
      <Card.Body className="text-center py-5">
        <Spinner animation="border" />
      </Card.Body>
    );
  }

  return (
    <Card.Body>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={(values, { setSubmitting }) => {
          dispatch(updateSetting(values));
          setSubmitting(false);
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form>
            <Row>
              {/* LEFT */}
              <Col xl={6}>
                {[
                  ["companyName", "Company Name"],
                  ["phone", "Company Phone"],
                  ["email", "Company Email"],
                  ["address", "Company Address"],
                  ["city", "City"],
                  ["state", "State / Province"],
                  ["country", "Country"],
                  ["zip", "ZIP Code"],
                ].map(([name, label]) => (
                  <BootstrapForm.Group className="mb-2" key={name}>
                    <BootstrapForm.Label>{label}</BootstrapForm.Label>
                    <Field
                      name={name}
                      as={BootstrapForm.Control}
                      isInvalid={touched[name] && !!errors[name]}
                    />
                    <ErrorMessage
                      name={name}
                      component="div"
                      className="text-danger small"
                    />
                  </BootstrapForm.Group>
                ))}
              </Col>

              {/* RIGHT */}
              <Col xl={6}>
                <BootstrapForm.Group className="mb-2">
                  <BootstrapForm.Label>About Company</BootstrapForm.Label>
                  <Field
                    name="about"
                    as="textarea"
                    rows={4}
                    className={`form-control ${
                      touched.about && errors.about ? "is-invalid" : ""
                    }`}
                  />
                  <ErrorMessage
                    name="about"
                    component="div"
                    className="text-danger small"
                  />
                </BootstrapForm.Group>

                <BootstrapForm.Group className="mb-2">
                  <BootstrapForm.Label>Short Description</BootstrapForm.Label>
                  <Field
                    name="shortDescription"
                    as="textarea"
                    rows={3}
                    className={`form-control ${
                      touched.shortDescription && errors.shortDescription
                        ? "is-invalid"
                        : ""
                    }`}
                  />
                  <ErrorMessage
                    name="shortDescription"
                    component="div"
                    className="text-danger small"
                  />
                </BootstrapForm.Group>

                <BootstrapForm.Group className="mb-2">
                  <BootstrapForm.Label>Google Map API Key</BootstrapForm.Label>
                  <Field
                    name="apiKey"
                    as={BootstrapForm.Control}
                    isInvalid={touched.apiKey && !!errors.apiKey}
                  />
                  <ErrorMessage
                    name="apiKey"
                    component="div"
                    className="text-danger small"
                  />
                </BootstrapForm.Group>

                <BootstrapForm.Group className="mb-2">
                  <BootstrapForm.Label>Brand Color</BootstrapForm.Label>
                  <Field
                    name="brandColor"
                    type="color"
                    as={BootstrapForm.Control}
                  />
                </BootstrapForm.Group>
              </Col>

              {/* ACTION */}
              <Col xl={12} className="text-end mt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Settings"}
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
    </Card.Body>
  );
};

export default GeneralSettings;
