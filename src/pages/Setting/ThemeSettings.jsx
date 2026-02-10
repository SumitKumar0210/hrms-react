import React, { useEffect, useState } from "react";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import { Card, Form, Button, Row, Col, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getSettingData, uploadLog } from "./slice/settingSlice";

const ThemeSettings = () => {
  const dispatch = useDispatch();
  const { data = {}, loading } = useSelector((state) => state.setting);
  const filePath = import.meta.env.VITE_MEDIA_URL;

  const [previews, setPreviews] = useState({
    logo: "",
    logoWhite: "",
    icon: "",
  });

  /* ================= FETCH SETTINGS ================= */
  useEffect(() => {
    dispatch(getSettingData());
  }, [dispatch]);

  /* ================= SET EXISTING IMAGES ================= */
  useEffect(() => {
    if (!data) return;

    setPreviews({
      logo: data.logo ? `${filePath}/storage/${data.logo}` : "",
      logoWhite: data.logo_white ? `${filePath}/storage/${data.logo_white}` : "",
      icon: data.favicon ? `${filePath}/storage/${data.favicon}` : "",
    });
  }, [data]);

  /* ================= FORM ================= */
  const initialValues = {
    logo: null,
    logoWhite: null,
    icon: null,
  };

  const validationSchema = Yup.object({
    logo: Yup.mixed(),
    logoWhite: Yup.mixed(),
    icon: Yup.mixed(),
  });

  /* ================= IMAGE HANDLER ================= */
  const handleImageChange = (e, field, setFieldValue) => {
    const file = e.target.files[0];
    if (!file) return;

    setFieldValue(field, file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews((prev) => ({
        ...prev,
        [field]: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = (values) => {
    const formData = new FormData();

    if (values.logo) formData.append("logo", values.logo);
    if (values.logoWhite) formData.append("logo_white", values.logoWhite);
    if (values.icon) formData.append("favicon", values.icon);

    dispatch(uploadLog(formData));
  };

  return (
    <Card.Body>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue }) => (
          <FormikForm>
            <Row className="gy-4">
              {/* ================= BRAND LOGO ================= */}
              <Col md={4}>
                <Form.Label>Brand Logo</Form.Label>
                <div className="mb-2">
                  {previews.logo && (
                    <img src={previews.logo} alt="Logo" height={70} />
                  )}
                </div>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageChange(e, "logo", setFieldValue)
                  }
                />
              </Col>

              {/* ================= WHITE LOGO ================= */}
              <Col md={4}>
                <Form.Label>Logo (White)</Form.Label>
                <div className="mb-2">
                  {previews.logoWhite && (
                    <img src={previews.logoWhite} alt="White Logo" height={70} />
                  )}
                </div>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageChange(e, "logoWhite", setFieldValue)
                  }
                />
              </Col>

              {/* ================= FAVICON ================= */}
              <Col md={4}>
                <Form.Label>Favicon / Icon</Form.Label>
                <div className="mb-2">
                  {previews.icon && (
                    <img src={previews.icon} alt="Icon" height={48} />
                  )}
                </div>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageChange(e, "icon", setFieldValue)
                  }
                />
              </Col>

              {/* ================= SUBMIT ================= */}
              <Col md={12} className="text-end">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Updating...
                    </>
                  ) : (
                    "Update Logos"
                  )}
                </Button>
              </Col>
            </Row>
          </FormikForm>
        )}
      </Formik>
    </Card.Body>
  );
};

export default ThemeSettings;
