import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Dropdown,
  Modal,
  InputGroup,
  Form
} from 'react-bootstrap';
import { FiEdit, FiMoreVertical, FiPlusCircle } from 'react-icons/fi';
import { LuTrash2 } from 'react-icons/lu';
import { Formik } from 'formik';
import * as Yup from 'yup';

const items = [
  { id: 6, name: 'Precast', price: 5.0, unit: 'ft' },
  { id: 5, name: 'Brick Extra', price: 13.0, unit: 'pcs' },
  { id: 4, name: 'Block', price: 15.0, unit: 'pcs' },
  { id: 3, name: 'Brick', price: 10.0, unit: 'pcs' },
  { id: 1, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 2, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 7, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 6, name: 'Precast', price: 5.0, unit: 'ft' },
  { id: 5, name: 'Brick Extra', price: 13.0, unit: 'pcs' },
  { id: 4, name: 'Block', price: 15.0, unit: 'pcs' },
  { id: 3, name: 'Brick', price: 10.0, unit: 'pcs' },
  { id: 1, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 2, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 7, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
  { id: 8, name: 'Stone', price: 4.0, unit: 'sq ft' },
];

const ItemSettings = () => {
  const [show, setShow] = useState(false);

  const editItem = (id) => {
    console.log('Edit item', id);
  };

  const deleteItem = (id) => {
    console.log('Delete item', id);
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const measurementOptions = [
    { value: '5', label: 'Area' },
    { value: '1', label: 'Length' },
    { value: '2', label: 'Liquid' },
    { value: '4', label: 'Quantity' },
    { value: '6', label: 'Volume' },
    { value: '3', label: 'Weight' }
  ];

  const unitOptions = [
    { value: '0', label: 'No Data Found' }
  ];

  const validationSchema = Yup.object().shape({
    item_name: Yup.string().required('Item Name is required'),
    measurement_id: Yup.string().required('Measurement Type is required'),
    unit_of_measurement: Yup.string().required('Unit of Measurement is required'),
    unit_cost: Yup.number()
      .typeError('Must be a number')
      .min(0, 'Must be positive')
      .required('Default Labour Rate is required'),
    item_status: Yup.boolean()
  });

  return (
    <>
      <Container fluid>
        <Row className="gutters">
          <Col xs={12}>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
              <h5 className="mb-0 fw-normal fs-6">Item Settings</h5>
              <Button variant="outline-primary" size="sm" onClick={handleShow}>
                <span className="me-2"><FiPlusCircle /></span>Create New
              </Button>
            </div>
          </Col>

          <Col xs={12} className='item-wrapper pt-3'>
            <Row>
              {items.map((item) => (
                <Col xl={2} lg={4} md={6} sm={6} xs={6} key={item.id} className="mt-2 mb-4">
                  <Card className="border border-primary position-relative">
                    <Card.Body className="p-2">
                      <div className="top-item">
                        <div className="item-details overflow-hidden">
                          <div className="item-top w-100 d-flex justify-content-between align-items-center">
                            <Badge pill bg="primary" className="fw-normal">
                              $ {item.price.toFixed(2)}
                            </Badge>
                            <div className="position-absolute end-1">
                              <Dropdown align="end">
                                <Dropdown.Toggle
                                  variant="outline-primary"
                                  size="sm"
                                  id="dropdown-basic"
                                  className="rounded-circle item-actions bg-white"
                                >
                                  <FiMoreVertical />
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="custom-dropdown-menu">
                                  <Dropdown.Item
                                    onClick={() => editItem(item.id)}
                                    className="text-secondary"
                                  >
                                    <FiEdit className="me-2" /> Edit
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() => deleteItem(item.id)}
                                    className="text-danger"
                                  >
                                    <LuTrash2 className="me-2" /> Delete
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </div>
                          </div>
                          <h5 className="mt-2 mb-1 text-truncate">{item.name}</h5>
                          <div className="item-unit">
                            <div className="points left">
                              <small>{item.unit}</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Container>

      {/* Add Item Modal */}
      <Modal show={show} onHide={handleClose}>
        <Formik
          initialValues={{
            item_name: '',
            measurement_id: '',
            unit_of_measurement: '',
            unit_cost: '',
            item_status: true
          }}
          validationSchema={validationSchema}
          onSubmit={(values, actions) => {
            console.log('Form values:', values);
            actions.setSubmitting(false);
            handleClose();
          }}
        >
          {({
            handleSubmit,
            handleChange,
            values,
            errors,
            touched,
            setFieldValue,
            isSubmitting
          }) => (
            <Form noValidate onSubmit={handleSubmit}>
              <Modal.Header closeButton>
                <Modal.Title className="h6 fw-normal">Create New Item</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Col md={12} className="mb-2">
                    <Form.Group>
                      <Form.Label>Item Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="item_name"
                        placeholder="Enter Item Name"
                        value={values.item_name}
                        onChange={handleChange}
                        isInvalid={touched.item_name && !!errors.item_name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.item_name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-2">
                    <Form.Group>
                      <Form.Label>Measurement Type</Form.Label>
                      <Form.Select
                        name="measurement_id"
                        value={values.measurement_id}
                        onChange={handleChange}
                        isInvalid={touched.measurement_id && !!errors.measurement_id}
                      >
                        <option value="">Select Measurement</option>
                        {measurementOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.measurement_id}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-2">
                    <Form.Group>
                      <Form.Label>Unit of Measurement</Form.Label>
                      <Form.Select
                        name="unit_of_measurement"
                        value={values.unit_of_measurement}
                        onChange={handleChange}
                        isInvalid={touched.unit_of_measurement && !!errors.unit_of_measurement}
                      >
                        <option value="">Select Unit of Measurement</option>
                        {unitOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.unit_of_measurement}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Default Labour Rate</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control
                          type="text"
                          name="unit_cost"
                          placeholder="Enter Default Labour Rate"
                          value={values.unit_cost}
                          onChange={handleChange}
                          isInvalid={touched.unit_cost && !!errors.unit_cost}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.unit_cost}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Check
                        type="switch"
                        id="item_status"
                        variant="primary"
                        className='item-status'
                        name="item_status"
                        label="Status (Open / Close)"
                        checked={values.item_status}
                        onChange={() =>
                          setFieldValue("item_status", !values.item_status)
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Modal.Body>

              <Modal.Footer className="custom">
                <div className="left-side">
                  <Button variant="" onClick={handleClose} className="btn-link danger w-100">
                    Close
                  </Button>
                </div>
                <div className="divider"></div>
                <div className="right-side">
                  {!isSubmitting ? (
                    <Button type="submit" variant="" className="btn-link success w-100">
                      Submit
                    </Button>
                  ) : (
                    <Button variant="" className="btn-link success w-100">
                      Please Wait...
                    </Button>
                  )}
                </div>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
};

export default ItemSettings;
