import React, { useMemo, useState, useEffect } from "react";
import {
  Container,
  Button,
  Badge,
  Modal,
  Form,
  Row,
  Col,
  Alert,
  Spinner,
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import { FiEdit, FiPlusCircle } from "react-icons/fi";
import { LuTrash2 } from "react-icons/lu";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  getShift,
  storeShift,
  updateShift,
  deleteShift,
} from "./slice/shiftSlice";
import { useDispatch, useSelector } from "react-redux";

/* ================= VALIDATION ================= */
const validationSchema = Yup.object({
  name: Yup.string().required("Shift name is required"),
  check_in_timing: Yup.string().required("Check-in time is required"),
  check_out_timing: Yup.string()
    .required("Check-out time is required")
    .test(
      "is-after",
      "Check-out time must be after check-in time",
      function (value) {
        const { check_in_timing } = this.parent;
        return !check_in_timing || value > check_in_timing;
      }
    ),
});

/* ================= COMPONENT ================= */
const Shift = () => {
  const dispatch = useDispatch();
  const { data = [], loading } = useSelector((state) => state.shift);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const [showDelete, setShowDelete] = useState(false);
  const [deleteRow, setDeleteRow] = useState(null);

  /* ================= FETCH ================= */
  useEffect(() => {
    dispatch(getShift());
  }, [dispatch]);

  /* ================= SEARCH ================= */
  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  /* ================= TABLE COLUMNS ================= */
  const columns = useMemo(
    () => [
      {
        name: "Shift Name",
        selector: (row) => row.name,
        sortable: true,
      },
      {
        name: "Timing",
        selector: (row) =>
          `${row.sign_in} – ${row.sign_out}`,
      },
      {
        name: "Type",
        cell: (row) => (
          <Badge bg="info-subtle" className="border text-info">
            {row.rotational_time ? "Rotational" : "Fixed"}
          </Badge>
        ),
      },
      {
        name: "Status",
        cell: (row) => (
          <Badge
            bg="transparent"
            className={`rounded-4 px-3 border ${
              row.status === "active"
                ? "bg-success-subtle text-success border-success"
                : "bg-secondary-subtle text-secondary border-secondary"
            }`}
          >
            {row.status}
          </Badge>
        ),
      },
      {
        name: "Actions",
        cell: (row) => (
          <div className="d-flex gap-2">
            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => {
                setEditRow(row);
                setShowForm(true);
              }}
            >
              <FiEdit />
            </Button>
            <Button
              size="sm"
              variant="outline-danger"
              onClick={() => {
                setDeleteRow(row);
                setShowDelete(true);
              }}
            >
              <LuTrash2 />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  /* ================= DELETE CONFIRM ================= */
  const confirmDelete = () => {
    if (!deleteRow) return;
    dispatch(deleteShift(deleteRow.id));
    setShowDelete(false);
    setDeleteRow(null);
  };

  return (
    <>
      <Container fluid>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
          <h5 className="mb-0 fw-normal fs-6">Shift</h5>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditRow(null);
              setShowForm(true);
            }}
          >
            <FiPlusCircle className="me-2" />
            Create New
          </Button>
        </div>

        {/* Search */}
        <div className="d-flex justify-content-between align-items-center my-3">
          <h6 className="mb-0">Shift List</h6>
          <Form.Control
            type="text"
            placeholder="Search shift..."
            style={{ maxWidth: 260 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Loading / Empty / Table */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : filteredData.length === 0 ? (
          <Alert variant="light" className="text-center">
            No shifts found
          </Alert>
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            highlightOnHover
            responsive
          />
        )}
      </Container>

      {/* ================= CREATE / EDIT MODAL ================= */}
      <Modal show={showForm} onHide={() => setShowForm(false)} centered>
        <Formik
          initialValues={{
            name: editRow?.name || "",
            check_in_timing: editRow?.check_in_timing || "",
            check_out_timing: editRow?.check_out_timing || "",
            default_time: editRow?.rotational_time ?? true,
            status: editRow ? editRow.status === "active" : true,
          }}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={(values, actions) => {
            const payload = {
              ...values,
              status: values.status ? "active" : "inactive",
            };

            if (editRow) {
              dispatch(updateShift({ ...payload, id: editRow.id }));
            } else {
              dispatch(storeShift(payload));
            }

            actions.resetForm();
            setShowForm(false);
            setEditRow(null);
          }}
        >
          {({
            handleSubmit,
            handleChange,
            values,
            errors,
            touched,
            setFieldValue,
            isValid,
          }) => (
            <Form onSubmit={handleSubmit} noValidate>
              <Modal.Header closeButton>
                <Modal.Title className="h6 fw-normal">
                  {editRow ? "Edit Shift" : "Create Shift"}
                </Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Shift Name</Form.Label>
                  <Form.Control
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    isInvalid={touched.name && !!errors.name}
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Col>
                    <Form.Label>Check In</Form.Label>
                    <Form.Control
                      type="time"
                      name="check_in_timing"
                      value={values.check_in_timing}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col>
                    <Form.Label>Check Out</Form.Label>
                    <Form.Control
                      type="time"
                      name="check_out_timing"
                      value={values.check_out_timing}
                      onChange={handleChange}
                      isInvalid={
                        touched.check_out_timing &&
                        !!errors.check_out_timing
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.check_out_timing}
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                <Form.Check
                  type="checkbox"
                  id="rotationalShift"
                  label="Rotational shift (timing may vary daily)"
                  checked={values.default_time}
                  onChange={() =>
                    setFieldValue("default_time", !values.default_time)
                  }
                />

                <Form.Check
                  type="switch"
                  id="status"
                  label="Status (Active / Inactive)"
                  checked={values.status}
                  onChange={() =>
                    setFieldValue("status", !values.status)
                  }
                />
              </Modal.Body>

              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={!isValid}
                >
                  {editRow ? "Update" : "Create"}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* ================= DELETE CONFIRM MODAL ================= */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 fw-bold text-dark">
            Confirm Delete
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="mb-0">
            Are you sure you want to delete the shift{" "}
            <strong>{deleteRow?.name}</strong>?
            <br />
            <small className="text-muted">
              This action cannot be undone.
            </small>
          </p>
        </Modal.Body>

        <Modal.Footer className="custom">
          <Button
            variant=""
            onClick={() => setShowDelete(false)}
            className="btn-link w-100"
          >
            Cancel
          </Button>

          <Button
            variant=""
            onClick={confirmDelete}
            className="btn-link danger w-100"
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Shift;
