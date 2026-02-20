import { useEffect, useRef, useState, useCallback } from "react";
import {
    Container, Row, Col, Card, Button, Form, Modal, Spinner, Toast, ToastContainer,
} from "react-bootstrap";
import { BsTrash3, BsPencil } from "react-icons/bs";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Formik } from "formik";
import * as Yup from "yup";

import {
    fetchVariables,
    fetchTableVariables,
    storeVariable,
} from "./slice/templateVariableSlice";
import {
    fetchDocumentTemplates,
    storeTemplate,
    destroyTemplate,
} from "./slice/documentTemplateSlice";
import { fetchAllEmployees } from "../Employees/slice/employeeSlice";
import { useDispatch, useSelector } from "react-redux";

/* ─────────────────────────────────────────────
   EMPLOYEE FIELD MAP
   Maps DB field key → getter over the employee object.
   Handles nested relations (department, designation, shift, salaries).
   Add new fields here only — nothing else needs changing.
───────────────────────────────────────────── */
const EMPLOYEE_FIELD_MAP = {
    employee_code:     (e) => e.employee_code,
    name:              (e) => `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim(),
    first_name:        (e) => e.first_name,
    last_name:         (e) => e.last_name,
    blood_group:       (e) => e.blood_group,
    aadhar_number:     (e) => e.aadhar_number,
    mobile:            (e) => e.mobile,
    email:             (e) => e.email,
    department:        (e) => e.department?.name,
    shift:             (e) => e.shift?.name,
    date_of_joining:   (e) => e.date_of_joining,
    employment_type:   (e) => e.employment_type,
    designation:       (e) => e.designation?.name,
    status:            (e) => e.status,
    week_off:          (e) => e.week_off,
    address:           (e) => e.address,
    zip_code:          (e) => e.zip_code,
    city:              (e) => e.city,
    state:             (e) => e.state,
    source:            (e) => e.source,
    basic_salary:      (e) => e.salaries?.[0]?.basic_salary,
    hra:               (e) => e.salaries?.[0]?.hra,
    special_allowance: (e) => e.salaries?.[0]?.special_allowance,
};

/* ─────────────────────────────────────────────
   PURE HELPERS
───────────────────────────────────────────── */

const capitalize = (s) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : "Active";

const normalizeTemplate = (t) => ({
    ...t,
    status:    capitalize(t.status),
    updatedAt: t.updated_at ?? t.updatedAt ?? new Date().toISOString(),
});

const formatDateTime = (date) => {
    try {
        return new Intl.DateTimeFormat("en-IN", {
            dateStyle: "long",
            timeStyle: "short",
        }).format(new Date(date));
    } catch {
        return "—";
    }
};

/**
 * Replace all {{VariableName}} in an HTML string using the API variables list
 * and the EMPLOYEE_FIELD_MAP to resolve each placeholder.
 */
const resolveTemplate = (html, variables, employee) => {
    if (!html || !employee) return html ?? "";
    let resolved = html;
    variables?.forEach(({ name, value }) => {
        const getter   = EMPLOYEE_FIELD_MAP[value];
        const empValue = getter ? (getter(employee) ?? "") : (employee[value] ?? "");
        resolved = resolved.replaceAll(`{{${name}}}`, String(empValue));
    });
    return resolved;
};

/* ─────────────────────────────────────────────
   VALIDATION
───────────────────────────────────────────── */
const variableSchema = Yup.object({
    name:  Yup.string().required("Variable name is required"),
    value: Yup.string().required("Employee field is required"),
});

/* ─────────────────────────────────────────────
   SMALL REUSABLE SUB-COMPONENTS
───────────────────────────────────────────── */
const Avatar = ({ first, last, size = 36 }) => (
    <div
        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
        {first?.[0]}{last?.[0]}
    </div>
);

const StatusBadge = ({ status }) => (
    <span
        className={`badge rounded-pill px-2 py-1 fw-semibold border ${
            status === "Active"
                ? "bg-success-subtle text-success border-success"
                : "bg-secondary-subtle text-secondary border-secondary"
        }`}
        style={{ fontSize: 10 }}
    >
        ● {status}
    </span>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const DocumentTemplates = () => {
    const dispatch = useDispatch();

    const { data: reduxTemplates, loading: templatesLoading } = useSelector(
        (s) => s.documentTemplate
    );
    const { employees }                                      = useSelector((s) => s.employee);
    const { data: variables, tableData: tableVariablesList } = useSelector(
        (s) => s.templateVariable
    );

    const quillRef = useRef(null);

    /* ── local state ── */
    const [drafts,     setDrafts]     = useState({});
    const [selectedId, setSelectedId] = useState(null);
    const [editingId,  setEditingId]  = useState(null);
    const [tempTitle,  setTempTitle]  = useState("");
    const [saving,     setSaving]     = useState(false);

    const [toast, setToast] = useState({ show: false, msg: "", variant: "success" });
    const showToast = useCallback((msg, variant = "success") =>
        setToast({ show: true, msg, variant }), []);

    const [showPreview,        setShowPreview]        = useState(false);
    const [previewStep,        setPreviewStep]        = useState("select");
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [loadingEmployees,   setLoadingEmployees]   = useState(false);

    const [showVariableModal, setShowVariableModal] = useState(false);
    const [editVariable,      setEditVariable]      = useState(null);

    /* ── bootstrap ── */
    useEffect(() => {
        dispatch(fetchDocumentTemplates());
        dispatch(fetchTableVariables());
        dispatch(fetchVariables());
    }, [dispatch]);

    useEffect(() => {
        if (reduxTemplates?.length && !selectedId) {
            setSelectedId(reduxTemplates[0].id);
        }
    }, [reduxTemplates]);

    /* ── derived: merged template list ── */
    const templates = [
        ...Object.values(drafts).filter((d) => d._isNew),
        ...(reduxTemplates ?? []).map((t) => {
            const base = normalizeTemplate(t);
            return drafts[t.id] ? { ...base, ...drafts[t.id] } : base;
        }),
    ];

    const selectedTemplate =
        templates.find((t) => t.id === selectedId) ?? templates[0] ?? null;

    const isDirty = !!(selectedTemplate && drafts[selectedId]);

    /* ── field update → draft ── */
    const updateField = useCallback((key, value) => {
        setDrafts((prev) => ({
            ...prev,
            [selectedId]: {
                ...(prev[selectedId] ?? {}),
                [key]:     value,
                updatedAt: new Date().toISOString(),
            },
        }));
    }, [selectedId]);

    /* ── add template ── */
    const handleAddTemplate = () => {
        const tempId = `new_${Date.now()}`;
        setDrafts((prev) => ({
            ...prev,
            [tempId]: {
                id: tempId, title: "New Template", type: "",
                status: "Active", subject: "", body: "",
                updatedAt: new Date().toISOString(), _isNew: true,
            },
        }));
        setSelectedId(tempId);
    };

    /* ── inline rename ── */
    const handleRenameSave = (id) => {
        if (tempTitle.trim()) {
            setDrafts((prev) => ({
                ...prev,
                [id]: { ...(prev[id] ?? {}), title: tempTitle.trim(), updatedAt: new Date().toISOString() },
            }));
        }
        setEditingId(null);
    };

    /* ── delete template ── */
    const handleDeleteTemplate = (id) => {
        if (!window.confirm("Delete this template?")) return;
        const nextId = templates.find((t) => t.id !== id)?.id ?? null;
        setDrafts((prev) => { const n = { ...prev }; delete n[id]; return n; });
        if (!String(id).startsWith("new_")) {
            dispatch(destroyTemplate(id)).then(() => dispatch(fetchDocumentTemplates()));
        }
        setSelectedId(nextId);
    };

    /* ── save template ── */
    const handleSave = async () => {
        if (!selectedTemplate) return;
        setSaving(true);
        try {
            const isNew = !!selectedTemplate._isNew;
            const payload = {
                title:   selectedTemplate.title,
                subject: selectedTemplate.subject,
                body:    selectedTemplate.body,
                status:  selectedTemplate.status?.toLowerCase() ?? "active",
                ...(isNew ? {} : { template_id: selectedTemplate.id }),
            };

            await dispatch(storeTemplate(payload));
            setDrafts((prev) => { const n = { ...prev }; delete n[selectedId]; return n; });

            const refreshed = await dispatch(fetchDocumentTemplates());
            if (isNew && refreshed?.payload?.data) {
                const created = [...refreshed.payload.data]
                    .reverse()
                    .find((t) => t.title === selectedTemplate.title);
                if (created) setSelectedId(created.id);
            }

            showToast("Template saved successfully!");
        } catch {
            showToast("Failed to save template.", "danger");
        } finally {
            setSaving(false);
        }
    };

    /* ── preview ── */
    const handlePreview = async () => {
        setLoadingEmployees(true);
        setSelectedEmployeeId("");
        setPreviewStep("select");
        setShowPreview(true);
        await dispatch(fetchAllEmployees());
        setLoadingEmployees(false);
    };

    const closePreview = () => {
        setShowPreview(false);
        setPreviewStep("select");
        setSelectedEmployeeId("");
    };

    const previewEmployee = employees?.find(
        (e) => String(e.id) === String(selectedEmployeeId)
    );
    const previewHTML    = resolveTemplate(selectedTemplate?.body,    variables, previewEmployee);
    const previewSubject = resolveTemplate(selectedTemplate?.subject, variables, previewEmployee);

    /* ── variable insert into Quill ── */
    const insertVariable = useCallback((variableName) => {
        const editor = quillRef.current?.getEditor();
        if (!editor) return;
        const range = editor.getSelection(true);
        const text  = `{{${variableName}}}`;
        editor.insertText(range.index, text);
        editor.setSelection(range.index + text.length);
    }, []);

    /* ── variable modal ── */
    const closeVariableModal = () => { setShowVariableModal(false); setEditVariable(null); };

    const handleVariableSubmit = async (values, actions) => {
        try {
            await dispatch(storeVariable({
                name:   values.name,
                value:  values.value,
                status: values.status ? "active" : "inactive",
                ...(editVariable ? { id: editVariable.id } : {}),
            }));
            await Promise.all([dispatch(fetchVariables()), dispatch(fetchTableVariables())]);
            showToast(editVariable ? "Variable updated!" : "Variable created!");
        } catch {
            showToast("Failed to save variable.", "danger");
        } finally {
            actions.resetForm();
            closeVariableModal();
        }
    };

    /* ── early loading state ── */
    if (templatesLoading && !templates.length) {
        return (
            <Container fluid className="py-5 text-center text-muted">
                <Spinner animation="border" size="sm" className="me-2" />Loading templates…
            </Container>
        );
    }

    /* ─────────────────────────────────────────────
       RENDER
    ───────────────────────────────────────────── */
    return (
        <Container fluid className="py-3">

            {/* ── Toast ── */}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
                <Toast
                    show={toast.show}
                    onClose={() => setToast((t) => ({ ...t, show: false }))}
                    delay={3000} autohide bg={toast.variant}
                >
                    <Toast.Body className={toast.variant === "danger" ? "text-white" : ""}>
                        {toast.msg}
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <h5 className="mb-3 fw-semibold">Document Templates</h5>

            <Row className="g-4">

                {/* ════════ SIDEBAR ════════ */}
                <Col md={3}>
                    <Card className="border-0 shadow-sm" style={{ background: "#e8f0ff", height: "82vh" }}>
                        <Card.Body className="d-flex flex-column p-2">

                            <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                                <h6 className="mb-0 fw-semibold">Templates</h6>
                                <Button size="sm" className="rounded-pill px-3" onClick={handleAddTemplate}>
                                    + Add
                                </Button>
                            </div>

                            <div className="overflow-auto flex-grow-1 pe-1">
                                {templates.length === 0 && (
                                    <p className="text-muted small text-center mt-5">
                                        No templates yet.<br />Click "+ Add" to create one.
                                    </p>
                                )}

                                {templates.map((t) => {
                                    const isSelected = selectedTemplate?.id === t.id;
                                    const hasDraft   = !!drafts[t.id];

                                    return (
                                        <Card
                                            key={t.id}
                                            className={`mb-2 ${isSelected ? "border-primary shadow-sm" : "border-0"}`}
                                            style={{ cursor: "pointer", transition: "box-shadow .15s" }}
                                            onClick={() => !editingId && setSelectedId(t.id)}
                                        >
                                            <Card.Body className="py-2 px-3">
                                                <div className="d-flex align-items-start justify-content-between gap-1">

                                                    {/* Title / rename input */}
                                                    <div className="flex-grow-1 min-w-0">
                                                        {editingId === t.id ? (
                                                            <Form.Control
                                                                size="sm" autoFocus
                                                                value={tempTitle}
                                                                onChange={(e) => setTempTitle(e.target.value)}
                                                                onBlur={() => handleRenameSave(t.id)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter")  handleRenameSave(t.id);
                                                                    if (e.key === "Escape") setEditingId(null);
                                                                }}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        ) : (
                                                            <div className="d-flex align-items-center gap-1">
                                                                <span
                                                                    className="fw-semibold text-truncate"
                                                                    style={{ fontSize: 13 }}
                                                                    title={t.title}
                                                                >
                                                                    {t.title}
                                                                </span>
                                                                {hasDraft && (
                                                                    <span
                                                                        title="Unsaved changes"
                                                                        className="text-warning"
                                                                        style={{ fontSize: 7 }}
                                                                    >●</span>
                                                                )}
                                                            </div>
                                                        )}
                                                        <small
                                                            className="text-muted text-truncate d-block"
                                                            style={{ fontSize: 11 }}
                                                            title={t.subject}
                                                        >
                                                            {t.subject || "No subject"}
                                                        </small>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="d-flex flex-column align-items-end gap-1 flex-shrink-0">
                                                        <StatusBadge status={t.status} />
                                                        <div className="d-flex gap-2 mt-1">
                                                            <BsPencil
                                                                size={11}
                                                                className="text-secondary"
                                                                style={{ cursor: "pointer" }}
                                                                title="Rename"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditingId(t.id);
                                                                    setTempTitle(t.title);
                                                                }}
                                                            />
                                                            <BsTrash3
                                                                size={11}
                                                                className="text-danger"
                                                                style={{ cursor: "pointer" }}
                                                                title="Delete"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteTemplate(t.id);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                </div>
                                            </Card.Body>
                                        </Card>
                                    );
                                })}
                            </div>

                        </Card.Body>
                    </Card>
                </Col>

                {/* ════════ EDITOR ════════ */}
                <Col md={9}>
                    {!selectedTemplate ? (
                        <Card className="border-0 shadow-sm d-flex align-items-center justify-content-center text-muted"
                            style={{ height: "82vh" }}>
                            <Card.Body>Select or create a template to start editing.</Card.Body>
                        </Card>
                    ) : (
                        <Card className="border-0 shadow-sm">
                            <Card.Body>

                                {/* ── Header ── */}
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div>
                                        <h5 className="fw-semibold mb-0 d-flex align-items-center gap-2">
                                            {selectedTemplate.title}
                                            {isDirty && (
                                                <span
                                                    className="badge rounded-pill border"
                                                    style={{
                                                        fontSize: 10,
                                                        background: "#fff8e1",
                                                        color: "#b45309",
                                                        borderColor: "#fcd34d",
                                                    }}
                                                >
                                                    ● Unsaved
                                                </span>
                                            )}
                                        </h5>
                                        <small className="text-muted">
                                            Last updated: {formatDateTime(selectedTemplate.updatedAt)}
                                        </small>
                                    </div>
                                </div>

                                <Row className="g-3">

                                    {/* Template Name */}
                                    <Col md={12}>
                                        <Form.Label className="small fw-semibold text-muted text-uppercase mb-1">
                                            Template Name
                                        </Form.Label>
                                        <Form.Control
                                            value={selectedTemplate.title}
                                            onChange={(e) => updateField("title", e.target.value)}
                                            placeholder="Template name"
                                        />
                                    </Col>

                                    {/* Subject + Status */}
                                    <Col md={8}>
                                        <Form.Label className="small fw-semibold text-muted text-uppercase mb-1">
                                            Subject
                                        </Form.Label>
                                        <Form.Control
                                            value={selectedTemplate.subject ?? ""}
                                            onChange={(e) => updateField("subject", e.target.value)}
                                            placeholder="e.g. Salary Slip for {{Month}} {{Year}}"
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label className="small fw-semibold text-muted text-uppercase mb-1">
                                            Status
                                        </Form.Label>
                                        <Form.Select
                                            value={selectedTemplate.status}
                                            onChange={(e) => updateField("status", e.target.value)}
                                        >
                                            <option>Active</option>
                                            <option>Inactive</option>
                                        </Form.Select>
                                    </Col>

                                    {/* Variables strip */}
                                    <Col md={12}>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <Form.Label className="small fw-semibold text-muted text-uppercase mb-0">
                                                Variables
                                                <span className="fw-normal ms-1 text-lowercase">
                                                    — click or drag to insert
                                                </span>
                                            </Form.Label>
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                className="rounded-pill px-3"
                                                onClick={() => { setEditVariable(null); setShowVariableModal(true); }}
                                            >
                                                + Add Variable
                                            </Button>
                                        </div>

                                        <div
                                            className="d-flex gap-2 flex-wrap p-2 rounded"
                                            style={{
                                                background: "#f4f7ff",
                                                border: "1px dashed #c8d4f5",
                                                minHeight: 40,
                                            }}
                                        >
                                            {variables?.length ? variables.map((v) => (
                                                <span
                                                    key={v.id ?? v.name}
                                                    draggable
                                                    onDragStart={(e) => e.dataTransfer.setData("variable", v.name)}
                                                    onClick={() => insertVariable(v.name)}
                                                    className="px-2 py-1 rounded border bg-white text-primary"
                                                    style={{ fontSize: 12, cursor: "grab", userSelect: "none" }}
                                                    title={`Field: ${v.value}`}
                                                >
                                                    {`{{${v.name}}}`}
                                                </span>
                                            )) : (
                                                <span className="text-muted" style={{ fontSize: 12 }}>
                                                    No variables yet — add one above.
                                                </span>
                                            )}
                                        </div>
                                    </Col>

                                    {/* Quill editor */}
                                    <Col md={12}>
                                        <Form.Label className="small fw-semibold text-muted text-uppercase mb-1">
                                            Body
                                        </Form.Label>
                                        <div
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                insertVariable(e.dataTransfer.getData("variable"));
                                            }}
                                            onDragOver={(e) => e.preventDefault()}
                                            style={{ minHeight: 260 }}
                                        >
                                            <ReactQuill
                                                ref={quillRef}
                                                theme="snow"
                                                value={selectedTemplate.body ?? ""}
                                                onChange={(val) => updateField("body", val)}
                                                style={{ minHeight: 220 }}
                                            />
                                        </div>
                                    </Col>
                                </Row>

                                {/* Actions */}
                                <div className="d-flex justify-content-end gap-3 mt-4">
                                    <Button variant="outline-secondary" onClick={handlePreview}>
                                        Preview
                                    </Button>
                                    <Button onClick={handleSave} disabled={saving}>
                                        {saving ? (
                                            <><Spinner size="sm" animation="border" className="me-2" />Saving…</>
                                        ) : (
                                            isDirty ? "Save Changes ●" : "Save Template"
                                        )}
                                    </Button>
                                </div>

                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>

            {/* ════════ VARIABLE MODAL ════════ */}
            <Modal show={showVariableModal} onHide={closeVariableModal} centered>
                <Formik
                    initialValues={{
                        name:   editVariable?.name  ?? "",
                        value:  editVariable?.value ?? "",
                        status: editVariable ? editVariable.status === "active" : true,
                    }}
                    validationSchema={variableSchema}
                    enableReinitialize
                    onSubmit={handleVariableSubmit}
                >
                    {({ handleSubmit, handleChange, values, errors, touched, setFieldValue, isSubmitting }) => (
                        <Form onSubmit={handleSubmit} noValidate>
                            <Modal.Header closeButton>
                                <Modal.Title className="h6 fw-semibold">
                                    {editVariable ? "Edit Variable" : "New Variable"}
                                </Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Variable Name
                                        <small className="text-muted ms-1">
                                            — used as {`{{Name}}`} in the template
                                        </small>
                                    </Form.Label>
                                    <Form.Control
                                        name="name"
                                        placeholder="e.g. EmployeeName"
                                        value={values.name}
                                        onChange={handleChange}
                                        isInvalid={touched.name && !!errors.name}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Maps To (Employee Field)</Form.Label>
                                    <Form.Select
                                        name="value"
                                        value={values.value}
                                        onChange={handleChange}
                                        isInvalid={touched.value && !!errors.value}
                                    >
                                        <option value="">— Select employee field —</option>
                                        {/* Use Redux tableVariablesList when available, else fall back to EMPLOYEE_FIELD_MAP keys */}
                                        {tableVariablesList?.length
                                            ? tableVariablesList.map((tv) => (
                                                <option key={tv.id ?? tv.value ?? tv} value={tv.value ?? tv}>
                                                    {tv.label ?? tv.value ?? tv}
                                                </option>
                                            ))
                                            : Object.keys(EMPLOYEE_FIELD_MAP).map((key) => (
                                                <option key={key} value={key}>{key}</option>
                                            ))
                                        }
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">{errors.value}</Form.Control.Feedback>
                                </Form.Group>

                                <Form.Check
                                    type="switch"
                                    id="variable-status"
                                    className="border px-3 py-2 rounded"
                                    label="Active"
                                    checked={values.status}
                                    onChange={() => setFieldValue("status", !values.status)}
                                />
                            </Modal.Body>

                            <Modal.Footer>
                                <Button variant="outline-secondary" onClick={closeVariableModal}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting
                                        ? <><Spinner size="sm" className="me-1" />{editVariable ? "Updating…" : "Creating…"}</>
                                        : editVariable ? "Update" : "Create"
                                    }
                                </Button>
                            </Modal.Footer>
                        </Form>
                    )}
                </Formik>
            </Modal>

            {/* ════════ PREVIEW MODAL ════════ */}
            <Modal size="lg" centered show={showPreview} onHide={closePreview}>
                <Modal.Header closeButton>
                    <Modal.Title className="h6 fw-semibold">
                        {previewStep === "select" ? "Select Employee to Preview" : "Template Preview"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>

                    {/* Step 1 — employee picker */}
                    {previewStep === "select" && (
                        loadingEmployees ? (
                            <div className="text-center py-5 text-muted">
                                <Spinner animation="border" size="sm" className="me-2" />
                                Loading employees…
                            </div>
                        ) : (
                            <>
                                <Form.Label className="fw-semibold">Choose an Employee</Form.Label>
                                <Form.Select
                                    value={selectedEmployeeId}
                                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                >
                                    <option value="">— Select Employee —</option>
                                    {employees?.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.first_name} {emp.last_name} — {emp.employee_code}
                                            {emp.designation?.name ? ` · ${emp.designation.name}` : ""}
                                        </option>
                                    ))}
                                </Form.Select>

                                {/* Quick preview card on selection */}
                                {selectedEmployeeId && (() => {
                                    const emp = employees?.find((e) => String(e.id) === String(selectedEmployeeId));
                                    return emp ? (
                                        <div className="d-flex align-items-center gap-3 mt-3 p-3 rounded bg-light border">
                                            <Avatar first={emp.first_name} last={emp.last_name} size={44} />
                                            <div>
                                                <div className="fw-semibold">{emp.first_name} {emp.last_name}</div>
                                                <div className="text-muted small">
                                                    {[emp.employee_code, emp.designation?.name, emp.department?.name]
                                                        .filter(Boolean).join(" · ")}
                                                </div>
                                            </div>
                                        </div>
                                    ) : null;
                                })()}

                                <div className="d-flex justify-content-end mt-4">
                                    <Button
                                        disabled={!selectedEmployeeId}
                                        onClick={() => setPreviewStep("preview")}
                                    >
                                        Preview →
                                    </Button>
                                </div>
                            </>
                        )
                    )}

                    {/* Step 2 — rendered preview */}
                    {previewStep === "preview" && (
                        <>
                            {previewEmployee && (
                                <div className="d-flex align-items-center gap-2 mb-3 p-2 rounded bg-light border">
                                    <Avatar first={previewEmployee.first_name} last={previewEmployee.last_name} />
                                    <div>
                                        <div className="fw-semibold small">
                                            {previewEmployee.first_name} {previewEmployee.last_name}
                                        </div>
                                        <div className="text-muted" style={{ fontSize: 12 }}>
                                            {[previewEmployee.employee_code, previewEmployee.designation?.name]
                                                .filter(Boolean).join(" · ")}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm" variant="outline-secondary"
                                        className="ms-auto rounded-pill px-3"
                                        onClick={() => setPreviewStep("select")}
                                    >
                                        ← Change
                                    </Button>
                                </div>
                            )}

                            <div className="p-3 border rounded bg-white">
                                {previewSubject && (
                                    <h6 className="fw-semibold mb-2">{previewSubject}</h6>
                                )}
                                <hr className="my-2" />
                                <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
                            </div>
                        </>
                    )}

                </Modal.Body>
            </Modal>

        </Container>
    );
};

export default DocumentTemplates;