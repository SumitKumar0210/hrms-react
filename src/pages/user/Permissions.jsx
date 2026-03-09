import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import {
  Container, Row, Col, Button, Modal, Form, Badge,
  Table, InputGroup, Tooltip, OverlayTrigger, Pagination, Spinner,
} from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { BiSolidEditAlt } from "react-icons/bi";
import { RiDeleteBinLine } from "react-icons/ri";
import { FiPrinter, FiPlus, FiSearch } from "react-icons/fi";
import { BsCloudDownload } from "react-icons/bs";
import { successMessage, errorMessage } from "../../toast";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserPermissions,
  createUserPermission,
  updateUserPermission,
  deleteUserPermission,
} from "./slice/userPermissionsSlice";
import { capitalize } from "lodash";

// ─── Constants ───────────────────────────────────────────────────────────────
const MODULES = [
  { value: "add_new_staff", label: "Add New Staff" },
  { value: "attendance", label: "Attendance" },
  { value: "document_templates", label: "Document Templates" },
  { value: "employee_payroll_history", label: "Employee Payroll History" },
  { value: "payroll_processing", label: "Payroll Processing" },
  { value: "payroll_finalization", label: "Payroll Finalization" },
  { value: "salary_structure_revision", label: "Salary Structure & Revision" },
  { value: "staff_directory", label: "Staff Directory" },
  { value: "users", label: "Users" },
];

const ACTION_TYPE = { CRUD: "crud", OTHER: "other" };

// ─── Validation ───────────────────────────────────────────────────────────────
const createValidationSchema = () =>
  Yup.object({
    module: Yup.string().required("Module is required"),
    action_type: Yup.string()
      .oneOf([ACTION_TYPE.CRUD, ACTION_TYPE.OTHER], "Invalid action type")
      .required("Action type is required"),
    custom_action: Yup.string().when("action_type", {
      is: ACTION_TYPE.OTHER,
      then: (s) =>
        s
          .min(2, "At least 2 characters")
          .max(50, "Max 50 characters")
          .matches(/^[a-zA-Z\s._-]+$/, "Letters, spaces, dots, hyphens, underscores only")
          .required("Custom action is required"),
      otherwise: (s) => s.nullable(),
    }),
  });

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generatePermission = (values) => {
  const { module, action_type, custom_action } = values;
  if (action_type === ACTION_TYPE.CRUD) {
    return `${module}.create, ${module}.read, ${module}.update, ${module}.delete`;
  }
  return `${module}.${custom_action.toLowerCase().replace(/\s+/g, "_")}`;
};

const getSplitData = (permission) => {
  if (!permission) return "";
  const parts = permission.split(".");
  return parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : "";
};

const getInitialValues = (isEdit = false, data = null) => {
  if (isEdit && data) {
    return {
      module: data.module || "",
      action_type: data.action_type || ACTION_TYPE.CRUD,
      custom_action: data.custom_action || "",
    };
  }
  return { module: "", action_type: ACTION_TYPE.CRUD, custom_action: "", group: "" };
};

// ─── Form Fields ──────────────────────────────────────────────────────────────
const FormFields = ({ values, errors, touched, handleChange, setFieldValue }) => (
  <Row className="g-3">
    {/* Module */}
    <Col xs={12}>
      <Form.Group>
        <Form.Label className="fw-semibold">Module</Form.Label>
        <Form.Select
          name="module"
          size="sm"
          value={values.module}
          onChange={handleChange}
          isInvalid={touched.module && !!errors.module}
        >
          <option value="">Select Module</option>
          {MODULES.map((mod) => (
            <option key={mod.value} value={mod.value}>
              {mod.label}
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">{errors.module}</Form.Control.Feedback>
      </Form.Group>
    </Col>

    {/* Action Type */}
    <Col xs={12}>
      <Form.Group>
        <Form.Label className="fw-semibold">Action Type</Form.Label>
        <div className="d-flex gap-4">
          <Form.Check
            type="radio"
            id="action-crud"
            name="action_type"
            value={ACTION_TYPE.CRUD}
            label="CRUD (Create, Read, Update, Delete)"
            checked={values.action_type === ACTION_TYPE.CRUD}
            onChange={(e) => {
              setFieldValue("action_type", e.target.value);
              setFieldValue("custom_action", "");
            }}
          />
          <Form.Check
            type="radio"
            id="action-other"
            name="action_type"
            value={ACTION_TYPE.OTHER}
            label="Other (Custom Action)"
            checked={values.action_type === ACTION_TYPE.OTHER}
            onChange={(e) => setFieldValue("action_type", e.target.value)}
          />
        </div>
      </Form.Group>
    </Col>

    {/* Custom Action */}
    {values.action_type === ACTION_TYPE.OTHER && (
      <Col xs={12}>
        <Form.Group>
          <Form.Label className="fw-semibold">Custom Action</Form.Label>
          <Form.Control
            name="custom_action"
            size="sm"
            value={values.custom_action}
            onChange={handleChange}
            isInvalid={touched.custom_action && !!errors.custom_action}
            placeholder="e.g., approve, reject, export"
          />
          <Form.Control.Feedback type="invalid">{errors.custom_action}</Form.Control.Feedback>
        </Form.Group>
      </Col>
    )}

    {/* Preview */}
    {values.module && (
      <Col xs={12}>
        <div className="p-2 rounded border bg-light">
          <small className="text-muted d-block mb-1">Generated Permission:</small>
          <span className="fw-semibold text-primary" style={{ fontSize: "0.85rem" }}>
            {values.action_type === ACTION_TYPE.CRUD
              ? `${values.module}.create, ${values.module}.read, ${values.module}.update, ${values.module}.delete`
              : values.custom_action
              ? `${values.module}.${values.custom_action.toLowerCase().replace(/\s+/g, "_")}`
              : `${values.module}.[custom_action]`}
          </span>
        </div>
      </Col>
    )}
  </Row>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Permissions = () => {
  const [open, setOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, permission: "", loading: false });
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const tableContainerRef = useRef(null);

  const { permissions = [], loading = false } = useSelector((state) => state.userPermissions);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUserPermissions());
  }, [dispatch]);

  const filteredPermissions = useMemo(() => {
    if (!globalFilter) return permissions;
    const s = globalFilter.toLowerCase();
    return permissions.filter(
      (p) =>
        p.permission?.toLowerCase().includes(s) ||
        p.module?.toLowerCase().includes(s) ||
        p.group?.toLowerCase().includes(s)
    );
  }, [permissions, globalFilter]);

  const paginatedData = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return filteredPermissions.slice(start, start + pagination.pageSize);
  }, [filteredPermissions, pagination]);

  const totalPages = Math.ceil(filteredPermissions.length / pagination.pageSize);

  useEffect(() => {
    if (globalFilter) setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [globalFilter]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleAdd = useCallback(
    async (values, { resetForm }) => {
      try {
        const permission = generatePermission(values);
        const res = await dispatch(
          createUserPermission({ permission, module: values.module, action_type: values.action_type, custom_action: values.custom_action || null })
        );
        if (res.error) return;
        dispatch(fetchUserPermissions());
        resetForm();
        setOpen(false);
        successMessage("Permission added successfully!");
      } catch {
        errorMessage("Failed to add permission.");
      }
    },
    [dispatch]
  );

  const handleDeleteClick = useCallback((row) => {
    setDeleteDialog({ open: true, id: row.id, permission: row.permission, loading: false });
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteDialog.id) return;
    setDeleteDialog((p) => ({ ...p, loading: true }));
    try {
      await dispatch(deleteUserPermission(deleteDialog.id)).unwrap();
      successMessage("Permission deleted successfully!");
    } catch {
      errorMessage("Failed to delete permission.");
    } finally {
      setDeleteDialog({ open: false, id: null, permission: "", loading: false });
    }
  }, [deleteDialog.id, dispatch]);

  const handleUpdate = useCallback((row) => { setEditData(row); setEditOpen(true); }, []);
  const handleEditClose = useCallback(() => { setEditOpen(false); setEditData(null); }, []);

  const handleEditSubmit = useCallback(
    async (values, { resetForm }) => {
      try {
        const permission = generatePermission(values);
        const res = await dispatch(
          updateUserPermission({
            id: editData.id,
            data: { permission, module: values.module, action_type: values.action_type, custom_action: values.custom_action || null, group: values.group },
          })
        );
        if (res.error) return;
        resetForm();
        handleEditClose();
        successMessage("Permission updated successfully!");
      } catch {
        errorMessage("Failed to update permission.");
      }
    },
    [dispatch, editData, handleEditClose]
  );

  const handleStatusChange = useCallback(
    (row, checked) => {
      dispatch(updateUserPermission({ id: row.id, data: { ...row, status: checked ? 1 : 0 } }));
    },
    [dispatch]
  );

  // ─── CSV Export ───────────────────────────────────────────────────────────
  const downloadCSV = useCallback(() => {
    const headers = ["Module", "Permission", "Type", "Group", "Status"];
    const rows = filteredPermissions.map((r) => [
      `"${String(r.module || "").replace(/"/g, '""')}"`,
      `"${String(r.permission || "").replace(/"/g, '""')}"`,
      `"${String(r.action_type || "").replace(/"/g, '""')}"`,
      `"${String(r.group || "").replace(/"/g, '""')}"`,
      `"${r.status ? "Active" : "Inactive"}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Permissions_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredPermissions]);

  // ─── Print ────────────────────────────────────────────────────────────────
  const handlePrint = useCallback(() => {
    if (!tableContainerRef.current) return;
    const w = window.open("", "_blank");
    w.document.write(`
      <html><head><title>Permissions List</title>
      <style>body{font-family:Arial,sans-serif;margin:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f2f2f2}@media print{button,.no-print{display:none}}</style>
      </head><body><h2>Permissions List</h2>${tableContainerRef.current.innerHTML}</body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 250);
  }, []);

  // ─── Tooltip helper ───────────────────────────────────────────────────────
  const tip = (label, children) => (
    <OverlayTrigger placement="top" overlay={<Tooltip>{label}</Tooltip>}>
      {children}
    </OverlayTrigger>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Container fluid className="gx-0">
      {/* Header */}
      <Row className="align-items-center mb-3">
        <Col>
          <h5 className="mb-0">Permissions</h5>
        </Col>
        <Col xs="auto">
          <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
            <FiPlus className="me-1" /> Add Permission
          </Button>
        </Col>
      </Row>

      {/* Table Card */}
      <div className="card border-0 shadow-sm" ref={tableContainerRef}>
        {/* Toolbar */}
        <div className="card-body pb-0">
          <Row className="align-items-center mb-2">
            <Col>
              <h6 className="mb-0 fw-semibold">Permissions List</h6>
            </Col>
            <Col xs="auto" className="d-flex align-items-center gap-2">
              <InputGroup size="sm" style={{ width: 220 }}>
                <InputGroup.Text className="bg-white border-end-0">
                  <FiSearch size={14} />
                </InputGroup.Text>
                <Form.Control
                  className="border-start-0 ps-0"
                  placeholder="Search..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                />
              </InputGroup>

              {tip("Print",
                <Button variant="light" size="sm" className="border" onClick={handlePrint}>
                  <FiPrinter size={16} />
                </Button>
              )}
              {tip("Download CSV",
                <Button variant="light" size="sm" className="border" onClick={downloadCSV}>
                  <BsCloudDownload size={16} />
                </Button>
              )}
            </Col>
          </Row>
        </div>

        {/* Table */}
        <div className="table-responsive px-3">
          <Table hover size="sm" className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: 160 }}>Module</th>
                <th>Permission</th>
                <th style={{ width: 120 }} className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-4">
                    <Spinner animation="border" size="sm" className="me-2" />
                    Loading...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-muted">
                    No permissions found.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Badge bg="secondary" pill className="fw-normal">
                        {capitalize(row.module)}
                      </Badge>
                    </td>
                    <td>
                      <span className="fw-medium" style={{ fontSize: "0.875rem" }}>
                        {getSplitData(row.name)}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        {tip("Delete",
                          <Button
                            variant="light"
                            size="sm"
                            className="text-danger border-0 p-1"
                            onClick={() => handleDeleteClick(row)}
                          >
                            <RiDeleteBinLine size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card-footer bg-white border-top d-flex align-items-center justify-content-between py-2 px-3">
            <small className="text-muted">
              Showing {pagination.pageIndex * pagination.pageSize + 1}–
              {Math.min((pagination.pageIndex + 1) * pagination.pageSize, filteredPermissions.length)} of{" "}
              {filteredPermissions.length}
            </small>
            <Pagination size="sm" className="mb-0">
              <Pagination.Prev
                disabled={pagination.pageIndex === 0}
                onClick={() => setPagination((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))}
              />
              {Array.from({ length: totalPages }, (_, i) => (
                <Pagination.Item
                  key={i}
                  active={i === pagination.pageIndex}
                  onClick={() => setPagination((p) => ({ ...p, pageIndex: i }))}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={pagination.pageIndex >= totalPages - 1}
                onClick={() => setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))}
              />
            </Pagination>
          </div>
        )}
      </div>

      {/* ── Add Modal ──────────────────────────────────────────────────────── */}
      <Modal show={open} onHide={() => setOpen(false)} centered size="md">
        <Modal.Header closeButton>
          <Modal.Title as="h6">Add Permission</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={getInitialValues(false)}
          validationSchema={createValidationSchema()}
          onSubmit={handleAdd}
        >
          {({ handleChange, handleSubmit, setFieldValue, touched, errors, values }) => (
            <form onSubmit={handleSubmit}>
              <Modal.Body>
                <FormFields
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  setFieldValue={setFieldValue}
                />
              </Modal.Body>
              <Modal.Footer>
                <Button variant="outline-danger" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Submit
                </Button>
              </Modal.Footer>
            </form>
          )}
        </Formik>
      </Modal>

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      <Modal show={editOpen} onHide={handleEditClose} centered size="md">
        <Modal.Header closeButton>
          <Modal.Title as="h6">Edit Permission</Modal.Title>
        </Modal.Header>
        <Formik
          enableReinitialize
          initialValues={getInitialValues(true, editData)}
          validationSchema={createValidationSchema()}
          onSubmit={handleEditSubmit}
        >
          {({ handleChange, handleSubmit, setFieldValue, touched, errors, values }) => (
            <form onSubmit={handleSubmit}>
              <Modal.Body>
                <FormFields
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  setFieldValue={setFieldValue}
                />
              </Modal.Body>
              <Modal.Footer>
                <Button variant="outline-danger" size="sm" onClick={handleEditClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Changes
                </Button>
              </Modal.Footer>
            </form>
          )}
        </Formik>
      </Modal>

      {/* ── Delete Confirm Dialog ──────────────────────────────────────────── */}
      <Modal
        show={deleteDialog.open}
        onHide={() => !deleteDialog.loading && setDeleteDialog({ open: false, id: null, permission: "", loading: false })}
        centered
        size="sm"
      >
        <Modal.Header closeButton={!deleteDialog.loading}>
          <Modal.Title as="h6">Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">
            Are you sure you want to delete{" "}
            <strong>{deleteDialog.permission}</strong>?
            <br />
            <small className="text-muted">This action cannot be undone.</small>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={deleteDialog.loading}
            onClick={() => setDeleteDialog({ open: false, id: null, permission: "", loading: false })}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={deleteDialog.loading}
            onClick={confirmDelete}
          >
            {deleteDialog.loading ? (
              <><Spinner animation="border" size="sm" className="me-1" />Deleting...</>
            ) : (
              "Delete"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Permissions;