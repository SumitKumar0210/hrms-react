import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Card,
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
import { fetchDesignation, updateDesignation, deleteDesignation } from "./slice/designationSlice";
import { useDispatch, useSelector } from "react-redux";
/* ================= MOCK DATA ================= */

const initialDesignations = [
  { id: 1, designation_name: "Manager", status: "Active" },
  { id: 2, designation_name: "Staff", status: "Inactive" },
  { id: 3, designation_name: "Supervisor", status: "Active" },
];

/* ================= VALIDATION ================= */

const validationSchema = Yup.object({
  designation_name: Yup.string().required("Designation Name is required"),
  status: Yup.boolean(),
});

/* ================= COMPONENT ================= */

const Designation = () => {
  const [data, setData] = useState(initialDesignations);
  const [filteredData, setFilteredData] = useState(initialDesignations);
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);
  const [editRow, setEditRow] = useState(null);

  /* 🔍 Search */
  useEffect(() => {
    const result = data.filter((item) =>
      item.designation_name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredData(result);
  }, [search, data]);

  /* 🧱 Columns */
  const columns = useMemo(
    () => [
      {
        name: "Designation Name",
        selector: (row) => row.designation_name,
        sortable: true,
      },
      {
        name: "Status",
        cell: (row) => (
            <Badge
                bg="transparent"
                className={`rounded-4 px-3 border ${
                    row.status === "Active"
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
              onClick={() => handleDelete(row.id)}
            >
              <LuTrash2 />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  /* ✏️ Edit */
  const handleEdit = (row) => {
    setEditRow(row);
    setShow(true);
  };

  /* ❌ Delete */
  const handleDelete = (id) => {
    setData((prev) => prev.filter((item) => item.id !== id));
  };

  /* ➕ Add New */
  const handleAddNew = () => {
    setEditRow(null);
    setShow(true);
  };

  return (
    <>
      <Container fluid>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
          <h5 className="mb-0 fw-normal fs-6">Designation</h5>
          <Button variant="primary" size="sm" onClick={handleAddNew}>
            <FiPlusCircle className="me-2" />
            Create New
          </Button>
        </div>

        {/* Table */}
        
            <div className="d-flex justify-content-between align-items-center mb-3 mt-3">
              <h6 className="mb-0">Designation List</h6>
              <Form.Control
                type="text"
                placeholder="Search designation..."
                style={{ maxWidth: 260 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <DataTable
              columns={columns}
              data={filteredData}
              pagination
              highlightOnHover
              responsive
              persistTableHead
              className="custom-data-table"
            />
          
      </Container>

      {/* ================= MODAL ================= */}

      <Modal show={show} onHide={() => setShow(false)} centered>
        <Formik
          initialValues={{
            designation_name: editRow?.designation_name || "",
            status: editRow ? editRow.status === "Active" : true,
          }}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={(values, actions) => {
            if (editRow) {
              setData((prev) =>
                prev.map((item) =>
                  item.id === editRow.id
                    ? {
                        ...item,
                        designation_name: values.designation_name,
                        status: values.status ? "Active" : "Inactive",
                      }
                    : item
                )
              );
            } else {
              setData((prev) => [
                ...prev,
                {
                  id: Date.now(),
                  designation_name: values.designation_name,
                  status: values.status ? "Active" : "Inactive",
                },
              ]);
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
            isSubmitting
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
                    name="designation_name"
                    placeholder="Enter Designation Name"
                    value={values.designation_name}
                    onChange={handleChange}
                    isInvalid={
                      touched.designation_name && !!errors.designation_name
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.designation_name}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group>
                    <Form.Check
                        type="switch"
                        id="status"
                        variant="primary"
                        className='custom-status border px-3 py-1'
                        name="status"
                        label="Status (Open / Close)"
                        checked={values.status}
                        onChange={() =>
                            setFieldValue("status", !values.status)
                        }
                    />
                 
                </Form.Group>
              </Modal.Body>
                <Modal.Footer className="custom">
                    <div className="left-side">
                        <Button variant="" onClick={() => setShow(false)} className="btn-link danger w-100">
                            Close
                        </Button>
                    </div>
                    <div className="divider"></div>
                    <div className="right-side">
                        {!isSubmitting ? (
                            <Button variant="" type="submit"  className="btn-link success w-100">
                            {editRow ? "Update" : "Submit"}
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

export default Designation;
