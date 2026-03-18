import React, { useEffect, useState } from "react";
import { Formik, Form as FormikForm } from "formik";
import { Card, Form, Button, Row, Col, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getSettingData, uploadLog } from "./slice/settingSlice";

const FILE_MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

const LOGO_FIELDS = [
  { name: "logo",       label: "Brand Logo",     apiKey: "logo",       height: 70 },
  { name: "logoWhite",  label: "Logo (White)",    apiKey: "logo_white", height: 70 },
  { name: "icon",       label: "Favicon / Icon",  apiKey: "favicon",    height: 48 },
];

const buildPreviews = (data) =>
  LOGO_FIELDS.reduce((acc, { name, apiKey }) => {
    acc[name] = data?.[apiKey] ? `${FILE_MEDIA_URL}${data[apiKey]}` : "";
    return acc;
  }, {});

const INITIAL_VALUES = Object.fromEntries(LOGO_FIELDS.map(({ name }) => [name, null]));

/* ─────────────────────────────────────────────── */

const ThemeSettings = () => {
  const dispatch = useDispatch();
  const { data = {}, loading } = useSelector((state) => state.setting);
  const [previews, setPreviews] = useState(() => buildPreviews(null));

  useEffect(() => { dispatch(getSettingData()); }, [dispatch]);

  useEffect(() => {
    if (data) setPreviews(buildPreviews(data));
  }, [data]);

  const handleImageChange = (e, field, setFieldValue) => {
    const file = e.target.files[0];
    if (!file) return;
    setFieldValue(field, file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviews((prev) => ({ ...prev, [field]: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (values) => {
    const formData = new FormData();
    LOGO_FIELDS.forEach(({ name, apiKey }) => {
      if (values[name]) formData.append(apiKey, values[name]);
    });
    dispatch(uploadLog(formData));
  };

  return (
    <Card.Body>
      <Formik initialValues={INITIAL_VALUES} onSubmit={handleSubmit}>
        {({ setFieldValue }) => (
          <FormikForm>
            <Row className="gy-4">
              {LOGO_FIELDS.map(({ name, label, height }) => (
                <Col key={name} md={4}>
                  <Form.Label>{label}</Form.Label>
                  {previews[name] && (
                    <div className="mb-2">
                      <img src={previews[name]} alt={label} height={height} />
                    </div>
                  )}
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, name, setFieldValue)}
                  />
                </Col>
              ))}

              <Col md={12} className="text-end">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? <><Spinner size="sm" className="me-2" />Updating...</> : "Update Logos"}
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