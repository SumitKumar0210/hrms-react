import React, { useState } from 'react';
import { Formik, Form as FormikForm, Field } from 'formik';
import * as Yup from 'yup';
import { Card, Form, Button, Container, Row, Col } from 'react-bootstrap';

const ThemeSettings = () => {
  const [previews, setPreviews] = useState({
    logo: '',
    logoWhite: '',
    icon: ''
  });

  const initialValues = {
    logo: null,
    logoWhite: null,
    icon: null
  };

  const validationSchema = Yup.object({
    logo: Yup.mixed(),
    logoWhite: Yup.mixed(),
    icon: Yup.mixed()
  });

  const handleImageChange = (e, fieldName, setFieldValue) => {
    const file = e.target.files[0];
    if (file) {
      setFieldValue(fieldName, file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [fieldName]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card.Body>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={values => {
            console.log('Submitted values:', values);
            // handle your form submit logic here (e.g., API call)
          }}
        >
          {({ setFieldValue, handleSubmit }) => (
            <FormikForm onSubmit={handleSubmit}>
              <Row className="gutters">
                <Col xl={6}>
                  <Form.Group className="mb-3">
                    <Row>
                      <Col md={6}>
                        <Form.Label>Brand Logo</Form.Label>
                        <div className='py-2'>
                            <img
                                src={
                                    previews.logo ||
                                    'https://portal.mapleconcretepumping.ca/assets/portal.mapleconcretepumping.ca/img/Untitled-3_1743397792.png'
                                }
                                alt="Brand Logo"
                                width="100"
                            />
                        </div>
                      </Col>
                      <Col md={6}>
                        <Form.Label>Logo Preview</Form.Label>
                        <div className='py-2'>
                          {previews.logo && (
                            <img src={previews.logo} alt="Preview" width="100" />
                          )}
                        </div>
                      </Col>
                    </Row>
                    <Form.Control
                      type="file"
                      name="logo"
                      onChange={(e) => handleImageChange(e, 'logo', setFieldValue)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Row>
                      <Col md={6}>
                        <Form.Label>Brand Logo White</Form.Label>
                        <div className='py-2'>
                            <img
                                src={
                                    previews.logoWhite ||
                                    'https://portal.mapleconcretepumping.ca/assets/portal.mapleconcretepumping.ca/img/Untitled-3_1743397920.png'
                                }
                                alt="Brand Logo White"
                                width="100"
                            />
                        </div>
                      </Col>
                      <Col md={6}>
                        <Form.Label>Logo Preview</Form.Label>
                        <div className='py-2'>
                          {previews.logoWhite && (
                            <img src={previews.logoWhite} alt="Preview" width="100" />
                          )}
                        </div>
                      </Col>
                    </Row>
                    <Form.Control
                      type="file"
                      name="logoWhite"
                      onChange={(e) => handleImageChange(e, 'logoWhite', setFieldValue)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Row>
                      <Col md={6}>
                        <Form.Label>Brand Icon</Form.Label>
                        <div className='py-2'>
                            <img
                                src={
                                    previews.icon ||
                                    'https://portal.mapleconcretepumping.ca/assets/portal.mapleconcretepumping.ca/img/favicon-maple_1742894323.png'
                                }
                                alt="Brand Icon"
                                width="100"
                            />
                        </div>
                      </Col>
                      <Col md={6}>
                        <Form.Label>Icon Preview</Form.Label>
                        <div className='py-2'>
                          {previews.icon && (
                            <img src={previews.icon} alt="Preview" width="100" />
                          )}
                        </div>
                      </Col>
                    </Row>
                    <Form.Control
                      type="file"
                      name="icon"
                      onChange={(e) => handleImageChange(e, 'icon', setFieldValue)}
                    />
                  </Form.Group>
                </Col>

                <Col xl={12}>
                  <div className="text-end mt-1">
                    <Button type="submit" variant="primary" className="fw-normal btn-sm py-2 px-3" id="update_photo">
                      Update Logo
                    </Button>
                  </div>
                </Col>
              </Row>
            </FormikForm>
          )}
        </Formik>
    </Card.Body>
  );
};

export default ThemeSettings;
