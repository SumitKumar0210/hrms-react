import { useState, useMemo, useEffect } from "react";
import {
  Badge, Button, Card, Modal,
  Form, Row, Col, Spinner, Alert,
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import { FaEdit, FaTrash, FaPlus, FaCheck, FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllOvertime,
  createOvertime,
  updateOvertime,
  deleteOvertime,
} from "../../pages/Payroll/slice/overtimeSlice";
import { fetchAllEmployees } from "../../pages/Employees/slice/employeeSlice";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const fullName = (emp) =>
  `${emp?.first_name ?? ""} ${emp?.last_name ?? ""}`.trim();

/**
 * Normalise one raw API overtime record into a flat table row.
 *
 * Raw shape:
 *   { id, employee_id, ot_rate:"50.00", min_time:"60.00", max_time:"4.00",
 *     status:"active",
 *     employee: { id, employee_code, first_name, last_name,
 *                 department:{name}, designation:{name} } }
 */
const apiToRow = (rec) => ({
  recordId: rec.id,
  employeeId: rec.employee_id,
  employeeCode: rec.employee?.employee_code ?? "—",
  name: fullName(rec.employee),
  dept: rec.employee?.department?.name ?? "—",
  designation: rec.employee?.designation?.name ?? "—",
  rate: parseFloat(rec.ot_rate) || 0,
  min: parseFloat(rec.min_time) || 0,
  max: parseFloat(rec.max_time) || 0,
  // slice stores "active"/"inactive" → display "Active"/"Inactive"
  status: rec.status === "active" ? "Active" : "Inactive",
});

const DEFAULT_FORM = {
  employeeId: "",
  rate: "",
  min: "",
  max: "",
  status: "Active",
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const EmployeeOTConfig = () => {
  const dispatch = useDispatch();

  // ── Selectors — using exact key names from the real slice ──────────────────
  // slice initialState: { overtimeRecords:[], currentOvertime:null, data:null,
  //                       error:null, loading:false, success:false, pagination:{} }
  const {
    overtimeRecords,          // ← real key in slice
    loading: otLoading,
    error: otError,
  } = useSelector((state) => state.overtime);

  const {
    employees: _employees,
    loading: empLoading,
    error: empError,
  } = useSelector((state) => state.employee);

  // Guard: both can be null before first fetch resolves
  const safeRecords = Array.isArray(overtimeRecords) ? overtimeRecords : [];
  const employees = Array.isArray(_employees) ? _employees : [];

  // ── Fetch on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchAllOvertime());
    dispatch(fetchAllEmployees());
  }, [dispatch]);

  // ── Local table state (seeded from Redux) ──────────────────────────────────
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    setTableData(safeRecords.map(apiToRow));
  }, [safeRecords]); // re-sync whenever Redux overtime list changes

  // ── Search ─────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      tableData.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.employeeCode.toLowerCase().includes(search.toLowerCase())
      ),
    [search, tableData]
  );

  // ── Add-employee modal ─────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [modalSaving, setModalSaving] = useState(false);

  // Only offer employees that don't already have an OT record
  const availableEmployees = useMemo(
    () => employees.filter((e) => !tableData.some((t) => t.employeeId === e.id)),
    [employees, tableData]
  );


  const openModal = () => { setForm(DEFAULT_FORM); setFormErrors({}); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setForm(DEFAULT_FORM); setFormErrors({}); };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.employeeId)
      e.employeeId = "Please select an employee.";
    if (form.rate === "" || isNaN(form.rate) || +form.rate < 0)
      e.rate = "Enter a valid OT rate (%).";
    if (form.min === "" || isNaN(form.min) || +form.min < 0)
      e.min = "Enter a valid minimum OT time (mins).";
    if (form.max === "" || isNaN(form.max) || +form.max < 0)
      e.max = "Enter a valid max OT/day (hrs).";
    return e;
  };

  const handleAddEmployee = async () => {
    const errors = validate();
    if (Object.keys(errors).length) { setFormErrors(errors); return; }

    const selected = employees.find((e) => String(e.id) === String(form.employeeId));
    if (!selected) return;

    // Payload for POST /emp-config
    const overtimeData = {
      employee_id: selected.id,
      ot_rate: Number(form.rate),
      min_time: Number(form.min),
      max_time: Number(form.max),
      status: form.status.toLowerCase(), // "active" | "inactive"
    };

    setModalSaving(true);
    try {
      // createOvertime thunk: returns res.data  →  { message, data: <record> }
      const response = await dispatch(createOvertime(overtimeData)).unwrap();
      const newRecord = response?.data || response;   // handle both shapes
      if (newRecord?.id) {
        // Redux slice already unshifts the record, so the useEffect above
        // will re-sync tableData automatically. We close the modal.
      }
      closeModal();
    } catch {
      // toast is already shown by the slice
    } finally {
      setModalSaving(false);
    }
  };

  // ── Inline edit ────────────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState(null); // overtime recordId
  const [editRow, setEditRow] = useState({});

  const startEdit = (row) => {
    setEditingId(row.recordId);
    setEditRow({ rate: row.rate, min: row.min, max: row.max, status: row.status });
  };
  const cancelEdit = () => { setEditingId(null); setEditRow({}); };

  const handleEditChange = (field, value) =>
    setEditRow((prev) => ({ ...prev, [field]: value }));

  const saveEdit = async (row) => {
    // updateOvertime thunk expects: { id, overtimeData }
    const overtimeData = {
      employee_id: row.employeeId,
      ot_rate: Number(editRow.rate),
      min_time: Number(editRow.min),
      max_time: Number(editRow.max),
      status: editRow.status.toLowerCase(),
    };

    try {
      await dispatch(updateOvertime({ id: row.recordId, overtimeData })).unwrap();
      // Optimistic local update (Redux slice also updates overtimeRecords,
      // which will re-sync via useEffect, but this keeps the UI instant)
      setTableData((prev) =>
        prev.map((r) =>
          r.recordId === row.recordId
            ? { ...r, rate: +editRow.rate, min: +editRow.min, max: +editRow.max, status: editRow.status }
            : r
        )
      );
    } catch {
      // toast shown by slice
    } finally {
      cancelEdit();
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (row) => {
    try {
      // deleteOvertime thunk expects: id  →  returns { id, data }
      await dispatch(deleteOvertime(row.recordId)).unwrap();
      // Redux slice removes from overtimeRecords → useEffect re-syncs tableData
    } catch {
      // toast shown by slice
    }
  };

  // ── Save All (individual updates in parallel) ──────────────────────────────
  const [saving, setSaving] = useState(false);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await Promise.all(
        tableData.map((r) =>
          dispatch(
            updateOvertime({
              id: r.recordId,
              overtimeData: {
                employee_id: r.employeeId,
                ot_rate: r.rate,
                min_time: r.min,
                max_time: r.max,
                status: r.status.toLowerCase(),
              },
            })
          ).unwrap()
        )
      );
    } catch {
      // individual errors already toasted by the slice
    } finally {
      setSaving(false);
    }
  };

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns = [
    {
      name: "Employee",
      cell: (row) => (
        <div>
          <div className="fw-semibold">{row.name}</div>
          <small className="text-muted">
            {row.employeeCode}
            {row.designation !== "—" ? ` · ${row.designation}` : ""}
          </small>
        </div>
      ),
      grow: 2,
      minWidth: "180px",
    },
    {
      name: "Department",
      selector: (row) => row.dept,
      minWidth: "130px",
    },
    {
      name: "OT Rate (%)",
      cell: (row) =>
        editingId === row.recordId ? (
          <Form.Control
            size="sm" type="number"
            value={editRow.rate}
            onChange={(e) => handleEditChange("rate", e.target.value)}
            style={{ width: 80 }} min={0}
          />
        ) : (
          <span>{row.rate}%</span>
        ),
      minWidth: "110px",
    },
    {
      name: "Min OT (mins)",
      cell: (row) =>
        editingId === row.recordId ? (
          <Form.Control
            size="sm" type="number"
            value={editRow.min}
            onChange={(e) => handleEditChange("min", e.target.value)}
            style={{ width: 80 }} min={0}
          />
        ) : (
          <span>{row.min} mins</span>
        ),
      minWidth: "120px",
    },
    {
      name: "Max OT/Day (hrs)",
      cell: (row) =>
        editingId === row.recordId ? (
          <Form.Control
            size="sm" type="number"
            value={editRow.max}
            onChange={(e) => handleEditChange("max", e.target.value)}
            style={{ width: 80 }} min={0}
          />
        ) : (
          <span>{row.max} hrs</span>
        ),
      minWidth: "130px",
    },
    {
      name: "Status",
      cell: (row) =>
        editingId === row.recordId ? (
          <Form.Select
            size="sm"
            value={editRow.status}
            onChange={(e) => handleEditChange("status", e.target.value)}
            style={{ width: 110 }}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Form.Select>
        ) : (
          <Badge
            bg={row.status === "Active" ? "success" : "secondary"}
            pill className="px-3 fw-semibold"
          >
            {row.status}
          </Badge>
        ),
      minWidth: "120px",
    },
    {
      name: "Actions",
      cell: (row) =>
        editingId === row.recordId ? (
          <div className="d-flex gap-2">
            <Button variant="success" size="sm" title="Save" onClick={() => saveEdit(row)}><FaCheck /></Button>
            <Button variant="outline-secondary" size="sm" title="Cancel" onClick={cancelEdit}><FaTimes /></Button>
          </div>
        ) : (
          <div className="d-flex gap-2">
            <Button
              variant="outline-primary" size="sm" title="Edit"
              onClick={() => startEdit(row)}
              disabled={!!editingId}
            ><FaEdit /></Button>
            <Button
              variant="outline-danger" size="sm" title="Delete"
              onClick={() => handleDelete(row)}
              disabled={!!editingId}
            ><FaTrash /></Button>
          </div>
        ),
      ignoreRowClick: true,
      width: "130px",
    },
  ];

  // ── Sub-header search ──────────────────────────────────────────────────────
  const subHeaderComponent = (
    <Form.Control
      type="search"
      placeholder="Search by name or code…"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{ maxWidth: 260 }}
      size="sm"
    />
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {otError && <Alert variant="danger" className="py-2 mb-3">Overtime error: {otError}</Alert>}
      {empError && <Alert variant="danger" className="py-2 mb-3">Employee error: {empError}</Alert>}

      <Card className="custom-data-table p-0 border-0 shadow-sm">
        <Card.Body className="p-0">
          <DataTable
            columns={columns}
            data={filtered}
            progressPending={otLoading}
            progressComponent={
              <div className="py-4">
                <Spinner animation="border" size="sm" className="me-2" />
                Loading overtime config…
              </div>
            }
            highlightOnHover
            responsive
            subHeader
            subHeaderComponent={subHeaderComponent}
            noDataComponent={
              <div className="py-4 text-muted">
                No OT configurations yet. Click <strong>Add Employee</strong> to begin.
              </div>
            }
          />
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-end gap-3 mt-4">
        <Button
          variant="secondary" size="sm"
          onClick={openModal}
        >
          <FaPlus className="me-1" />

          Add Employee
        </Button>

        {/* <Button
          variant="primary" size="sm"
          onClick={handleSaveAll}
          disabled={saving || tableData.length === 0}
        >
          {saving
            ? <><Spinner animation="border" size="sm" className="me-2" />Saving…</>
            : "Save All Employee Settings"
          }
        </Button>  */}
      </div>

      {/* ── Add Employee Modal ── */}
      <Modal show={showModal} onHide={closeModal} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title className="h6 fw-semibold">
            Add Employee OT Configuration
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form noValidate>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Select Employee <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={form.employeeId}
                onChange={(e) => handleFormChange("employeeId", e.target.value)}
                isInvalid={!!formErrors.employeeId}
              >
                <option value="">— Choose an employee —</option>
                {availableEmployees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {fullName(e)} ({e.employee_code})
                    {e.department?.name ? ` — ${e.department.name}` : ""}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {formErrors.employeeId}
              </Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    OT Rate (%) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number" placeholder="e.g. 50"
                    value={form.rate} min={0}
                    onChange={(e) => handleFormChange("rate", e.target.value)}
                    isInvalid={!!formErrors.rate}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.rate}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Min OT Time (mins) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number" placeholder="e.g. 30"
                    value={form.min} min={0}
                    onChange={(e) => handleFormChange("min", e.target.value)}
                    isInvalid={!!formErrors.min}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.min}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Max OT/Day (hrs) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number" placeholder="e.g. 4"
                    value={form.max} min={0}
                    onChange={(e) => handleFormChange("max", e.target.value)}
                    isInvalid={!!formErrors.max}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.max}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Status</Form.Label>
                  <Form.Select
                    value={form.status}
                    onChange={(e) => handleFormChange("status", e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer className="custom">
          <Button variant="" onClick={closeModal} className="btn-link danger w-100">
            Close
          </Button>
          <Button
            variant="" onClick={handleAddEmployee}
            className="btn-link success w-100"
            disabled={modalSaving}
          >
            {modalSaving
              ? <Spinner animation="border" size="sm" className="me-1" />
              : <FaPlus className="me-1" />
            }
            Add to Table
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EmployeeOTConfig;