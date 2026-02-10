import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Button,
  Badge,
  Modal,
  Form,
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import { FiEdit, FiPlusCircle } from "react-icons/fi";
import { LuTrash2 } from "react-icons/lu";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  getDepartment,
  storeDepartment,
  updateDepartment,
  deleteDepartment,
} from "./slice/departmentSlice";
import { useDispatch, useSelector } from "react-redux";

/* ================= VALIDATION ================= */
const validationSchema = Yup.object({
  name: Yup.string().required("Department Name is required"),
  status: Yup.boolean(),
});

/* ================= COMPONENT ================= */
const Department = () => {
  const dispatch = useDispatch();
  const { data = [], loading } = useSelector((state) => state.department);

  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteRow, setDeleteRow] = useState(null);

  /* ================= FETCH ================= */
  useEffect(() => {
    dispatch(getDepartment());
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
        name: "Department Name",
        selector: (row) => row.name,
        sortable: true,
      },
      {
        name: "Status",
        cell: (row) => (
          <Badge
            bg="transparent"
            className={`rounded-4 px-3 border ${row.status === "active"
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
              onClick={() => handleEdit(row)}
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
    [dispatch]
  );

  /* ================= HANDLERS ================= */
  const handleEdit = (row) => {
    setEditRow(row);
    setShow(true);
  };

  const handleAddNew = () => {
    setEditRow(null);
    setShow(true);
  };

  const confirmDelete = () => {
    if (!deleteRow) return;

    dispatch(deleteDepartment(deleteRow.id));
    setShowDelete(false);
    setDeleteRow(null);
  };


  /* ================= UI ================= */
  return (
    <>
      <Container fluid>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
          <h5 className="mb-0 fw-normal fs-6">Department</h5>
          <Button variant="primary" size="sm" onClick={handleAddNew}>
            <FiPlusCircle className="me-2" />
            Create New
          </Button>
        </div>

        {/* Search */}
        <div className="d-flex justify-content-between align-items-center mb-3 mt-3">
          <h6 className="mb-0">Departments List</h6>
          <Form.Control
            type="text"
            placeholder="Search department..."
            style={{ maxWidth: 260 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          progressPending={loading}
          highlightOnHover
          responsive
          persistTableHead
        />
      </Container>

      {/* ================= MODAL ================= */}
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Formik
          initialValues={{
            name: editRow?.name || "",
            status: editRow ? editRow.status === "active" : true,
          }}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={(values, actions) => {
            const payload = {
              name: values.name,
              status: values.status ? "active" : "inactive",
            };

            if (editRow) {
              dispatch(updateDepartment({ ...payload, id: editRow.id }));
            } else {
              dispatch(storeDepartment(payload));
            }

            actions.resetForm();
            setShow(false);
          }}
        >
          {({
            handleSubmit,
            handleChange,
            values,
            errors,
            touched,
            setFieldValue,
            isSubmitting,
          }) => (
            <Form onSubmit={handleSubmit} noValidate>
              <Modal.Header closeButton>
                <Modal.Title className="h6 fw-normal">
                  {editRow ? "Edit Department" : "Create Department"}
                </Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Department Name</Form.Label>
                  <Form.Control
                    name="name"
                    placeholder="Enter Department Name"
                    value={values.name}
                    onChange={handleChange}
                    isInvalid={touched.name && !!errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Check
                  type="switch"
                  id="status"
                  className="custom-status border px-3 py-1"
                  label="Status (Active / Inactive)"
                  checked={values.status}
                  onChange={() =>
                    setFieldValue("status", !values.status)
                  }
                />
              </Modal.Body>

              <Modal.Footer className="custom">
                <Button
                  variant=""
                  onClick={() => setShow(false)}
                  className="btn-link danger w-100"
                >
                  Close
                </Button>

                <Button
                  variant=""
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-link success w-100"
                >
                  {editRow ? "Update" : "Submit"}
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
            Are you sure you want to delete the department{" "}
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

export default Department;
