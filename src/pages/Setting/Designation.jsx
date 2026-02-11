import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Button,
  Badge,
  Modal,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import { FiEdit, FiPlusCircle } from "react-icons/fi";
import { LuTrash2 } from "react-icons/lu";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  fetchDesignation,
  storeDesignation,
  updateDesignation,
  deleteDesignation,
} from "./slice/designationSlice";
import { useDispatch, useSelector } from "react-redux";

/* ================= VALIDATION ================= */
const validationSchema = Yup.object({
  name: Yup.string().required("Designation Name is required"),
});

/* ================= COMPONENT ================= */
const Designation = () => {
  const dispatch = useDispatch();
  const { data = [], loading } = useSelector((state) => state.designation);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteRow, setDeleteRow] = useState(null);

  /* ================= FETCH ================= */
  useEffect(() => {
    dispatch(fetchDesignation());
  }, [dispatch]);

  /* ================= SEARCH ================= */
  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter((item) =>
      item.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  /* ================= TABLE ================= */
  const columns = useMemo(
    () => [
      {
        name: "Designation Name",
        selector: (row) => row.name,
        sortable: true,
        grow: 2,
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
        center: true,
      },
      {
        name: "Actions",
        cell: (row) => (
          <div className="d-flex gap-2">
            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => handleEdit(row)}
              aria-label="Edit designation"
            >
              <FiEdit />
            </Button>
            <Button
              size="sm"
              variant="outline-danger"
              onClick={() => handleDeleteClick(row)}
              aria-label="Delete designation"
            >
              <LuTrash2 />
            </Button>
          </div>
        ),
        center: true,
        ignoreRowClick: true,
      },
    ],
    []
  );

  /* ================= HANDLERS ================= */
  const handleEdit = (row) => {
    setEditRow(row);
    setShowForm(true);
  };

  const handleDeleteClick = (row) => {
    setDeleteRow(row);
    setShowDelete(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditRow(null);
  };

  const handleCloseDelete = () => {
    setShowDelete(false);
    setDeleteRow(null);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (values, actions) => {
    try {
      const payload = {
        name: values.name,
        status: values.status ? "active" : "inactive",
      };

      if (editRow) {
        await dispatch(updateDesignation({ id: editRow.id, ...payload }));
      } else {
        await dispatch(storeDesignation(payload));
      }

      actions.resetForm();
      handleCloseForm();
    } catch (error) {
      console.error("Error submitting designation:", error);
      actions.setSubmitting(false);
    }
  };

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    if (!deleteRow) return;
    
    try {
      await dispatch(deleteDesignation(deleteRow.id));
      handleCloseDelete();
    } catch (error) {
      console.error("Error deleting designation:", error);
    }
  };

  return (
    <>
      <Container fluid>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
          <h5 className="mb-0 fw-normal fs-6">Designation</h5>
          <Button
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
          <h6 className="mb-0">Designation List</h6>
          <Form.Control
            type="text"
            placeholder="Search designation..."
            style={{ maxWidth: 260 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : filteredData.length === 0 ? (
          <Alert variant="light" className="text-center">
            {search ? "No matching designations found" : "No designations found"}
          </Alert>
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            highlightOnHover
            responsive
            striped
          />
        )}
      </Container>

      {/* ================= CREATE/EDIT MODAL ================= */}
      <Modal show={showForm} onHide={handleCloseForm} centered>
        <Formik
          initialValues={{
            name: editRow?.name || "",
            status: editRow ? editRow.status === "active" : true,
          }}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={handleSubmit}
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
                  {editRow ? "Edit Designation" : "Create Designation"}
                </Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Designation Name</Form.Label>
                  <Form.Control
                    name="name"
                    placeholder="Enter Designation Name"
                    value={values.name}
                    onChange={handleChange}
                    isInvalid={touched.name && !!errors.name}
                    autoFocus
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
                  onChange={() => setFieldValue("status", !values.status)}
                />
              </Modal.Body>

              <Modal.Footer className="custom">
                <Button
                  variant=""
                  onClick={handleCloseForm}
                  className="btn-link danger w-100"
                  disabled={isSubmitting}
                >
                  Close
                </Button>

                <Button
                  variant=""
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-link success w-100"
                >
                  {isSubmitting ? "Saving..." : editRow ? "Update" : "Submit"}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* ================= DELETE CONFIRM MODAL ================= */}
      <Modal show={showDelete} onHide={handleCloseDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 fw-bold text-dark">
            Confirm Delete
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="mb-0">
            Are you sure you want to delete the designation{" "}
            <strong>{deleteRow?.name}</strong>?
            <br />
            <small className="text-muted">This action cannot be undone.</small>
          </p>
        </Modal.Body>

        <Modal.Footer className="custom">
          <Button
            variant=""
            onClick={handleCloseDelete}
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

export default Designation;