import { useEffect, useRef, useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Form,
    Modal,
} from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { BsTrash3 } from "react-icons/bs";

import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

/* ---------------- Mock API ---------------- */
const fetchTemplates = () =>
    Promise.resolve([
        {
            id: 1,
            title: "Monthly Salary Slip",
            type: "Salary Slip",
            status: "Active",
            subject: "Salary Slip for {{Month}} {{Year}}",
            body: "<p>Dear {{EmployeeName}},</p><p>Your salary slip is attached.</p>",
            updatedAt: new Date(),
        },
        {
            id: 2,
            title: "Standard Relieving Letter",
            type: "Relieving Letter",
            status: "Active",
            subject: "Relieving Letter",
            body: "<p>This is to certify that {{EmployeeName}}...</p>",
            updatedAt: new Date(),
        },
        {
            id: 3,
            title: "Experience Letter",
            type: "Experience Letter",
            status: "Active",
            subject: "Experience Letter",
            body: "<p>This is to certify that {{EmployeeName}}...</p>",
        },
    ]);

const saveTemplate = (template) =>
    Promise.resolve({ success: true, data: template });

/* ---------------- Variables ---------------- */
const variables = [
    "EmployeeName",
    "EmployeeID",
    "Designation",
    "DOJ",
    "Department",
    "Month",
    "Year",
    "CompanyName",
    "CurrentDate",
    "BasicSalary",
    "RelievingDate",
    "TotalExperience",
];

/* ---------------- Helpers ---------------- */
const formatDateTime = (date) =>
    new Intl.DateTimeFormat("en-IN", {
        dateStyle: "long",
        timeStyle: "short",
    }).format(date);

/* ---------------- Component ---------------- */
const DocumentTemplates = () => {
    const quillRef = useRef(null);

    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [tempTitle, setTempTitle] = useState("");
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        fetchTemplates().then((data) => {
            setTemplates(data);
            setSelectedTemplate(data[0]);
        });
    }, []);

    /* ---------- Field update ---------- */
    const updateField = (key, value) => {
        setSelectedTemplate((prev) => {
            const updated = {
                ...prev,
                [key]: value,
                updatedAt: new Date(),
            };

            // 🔥 Sync sidebar list
            setTemplates((list) =>
                list.map((t) => (t.id === updated.id ? updated : t))
            );

            return updated;
        });
    };


    /* ---------- Add template ---------- */
    const handleAddTemplate = () => {
        const newTemplate = {
            id: Date.now(),
            title: "New Template",
            type: "Template Type",
            status: "Active",
            subject: "",
            body: "",
            updatedAt: new Date(),
        };

        setTemplates((prev) => [newTemplate, ...prev]);
        setSelectedTemplate(newTemplate);
    };

    /* ---------- Rename ---------- */
    const handleRenameSave = (id) => {
        if (!tempTitle.trim()) return;

        setTemplates((prev) =>
            prev.map((t) =>
                t.id === id ? { ...t, title: tempTitle } : t
            )
        );

        if (selectedTemplate?.id === id) {
            setSelectedTemplate((prev) => ({
                ...prev,
                title: tempTitle,
                updatedAt: new Date(),
            }));
        }

        setEditingId(null);
    };

    /* ---------- Delete ---------- */
    const handleDeleteTemplate = (id) => {
        if (!window.confirm("Delete this template?")) return;

        setTemplates((prev) => {
            const updated = prev.filter((t) => t.id !== id);
            setSelectedTemplate(updated[0] || null);
            return updated;
        });
    };

    /* ---------- Variable insert ---------- */
    const insertVariable = (variable) => {
        const editor = quillRef.current?.getEditor();
        if (!editor) return;

        const range = editor.getSelection(true);
        editor.insertText(range.index, `{{${variable}}}`);
        editor.setSelection(range.index + variable.length + 4);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        insertVariable(e.dataTransfer.getData("variable"));
    };

    /* ---------- Save ---------- */
    const handleSave = async () => {
        const updated = { ...selectedTemplate, updatedAt: new Date() };

        setTemplates((prev) =>
            prev.map((t) => (t.id === updated.id ? updated : t))
        );

        setSelectedTemplate(updated);
        await saveTemplate(updated);
        alert("Template saved successfully");
    };

    if (!selectedTemplate) return null;

    return (
        <Container fluid className="py-3">
            <h5 className="mb-3 fw-semibold">Document Templates</h5>

            <Row className="g-4">
                {/* ---------------- Sidebar ---------------- */}
                <Col md={3}>
                    <Card className="h-100 border-0 shadow-sm" style={{ background: "#e8f0ff" }}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6>Templates</h6>
                                <Button size="sm" className="rounded-pill px-3" onClick={handleAddTemplate}>
                                    + Add
                                </Button>
                            </div>

                            {templates.map((t) => (
                                <Card
                                    key={t.id}
                                    className={`mb-3 cursor-pointer ${selectedTemplate.id === t.id ? "border-primary" : ""
                                        }`}
                                    onClick={() => !editingId && setSelectedTemplate(t)}
                                >
                                    <Card.Body className="d-flex justify-content-between gap-2">
                                        <div className="flex-grow-1">
                                            {editingId === t.id ? (
                                                <Form.Control
                                                    size="sm"
                                                    autoFocus
                                                    value={tempTitle}
                                                    onChange={(e) => setTempTitle(e.target.value)}
                                                    onBlur={() => handleRenameSave(t.id)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleRenameSave(t.id);
                                                        if (e.key === "Escape") setEditingId(null);
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    className="fw-semibold"
                                                    onDoubleClick={() => {
                                                        setEditingId(t.id);
                                                        setTempTitle(t.title);
                                                    }}
                                                >
                                                    {t.title}
                                                </div>
                                            )}
                                            <small className="text-muted">{t.type}</small>
                                        </div>

                                        <div className="d-flex  align-items-start gap-2">
                                            <span
                                                className={`badge rounded-pill px-3 py-1 fw-semibold border ${t.status === "Active"
                                                        ? "bg-success-subtle text-success border-success"
                                                        : "bg-secondary-subtle text-secondary border-secondary"
                                                    }`}
                                            >
                                                ● {t.status}
                                            </span>

                                            <BsTrash3
                                                size={13}
                                                className="text-danger cursor-pointer mt-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteTemplate(t.id);
                                                }}
                                            />
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>

                {/* ---------------- Editor ---------------- */}
                <Col md={9}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="mb-3">
                                <h5 className="fw-semibold mb-0">{selectedTemplate.title}</h5>
                                <small className="text-muted">
                                    Last updated: {formatDateTime(selectedTemplate.updatedAt)}
                                </small>
                            </div>

                            <Row className="g-3">
                                <Col md={12}>
                                    <Form.Label>Template Name</Form.Label>
                                    <Form.Control
                                        value={selectedTemplate.title}
                                        onChange={(e) =>
                                            updateField("title", e.target.value)
                                        }
                                    />
                                </Col>

                                <Col md={6}>
                                    <Form.Label>Template Type</Form.Label>
                                    <Form.Control value={selectedTemplate.type} disabled />
                                </Col>

                                <Col md={6}>
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        value={selectedTemplate.status}
                                        onChange={(e) =>
                                            updateField("status", e.target.value)
                                        }
                                    >
                                        <option>Active</option>
                                        <option>Inactive</option>
                                    </Form.Select>
                                </Col>

                                <Col md={12}>
                                    <Form.Label>Subject</Form.Label>
                                    <Form.Control
                                        value={selectedTemplate.subject}
                                        onChange={(e) =>
                                            updateField("subject", e.target.value)
                                        }
                                    />
                                </Col>

                                <Col md={12}>
                                    <Form.Label>Available Variables</Form.Label>
                                    <div className="d-flex gap-2 flex-wrap">
                                        {variables.map((v) => (
                                            <span
                                                key={v}
                                                draggable
                                                onDragStart={(e) =>
                                                    e.dataTransfer.setData("variable", v)
                                                }
                                                onClick={() => insertVariable(v)}
                                                className="px-3 py-1 rounded-pill border bg-light text-muted small cursor-pointer"
                                            >
                                                {`{{${v}}}`}
                                            </span>
                                        ))}
                                    </div>
                                </Col>

                                <Col md={12}>
                                    <div
                                        onDrop={handleDrop}
                                        onDragOver={(e) => e.preventDefault()}
                                        style={{ minHeight: 260 }}
                                    >
                                        <ReactQuill
                                            ref={quillRef}
                                            theme="snow"
                                            value={selectedTemplate.body}
                                            onChange={(val) =>
                                                updateField("body", val)
                                            }
                                            style={{ minHeight: 220 }}
                                        />
                                    </div>
                                </Col>
                            </Row>

                            <div className="d-flex justify-content-end gap-3 mt-4">
                                <Button variant="outline-secondary" onClick={() => setShowPreview(true)}>
                                    Preview
                                </Button>
                                <Button onClick={handleSave}>Save Template</Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* ---------------- Preview ---------------- */}
            <Modal size="lg" centered show={showPreview} onHide={() => setShowPreview(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Template Preview</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h6 className="fw-semibold">{selectedTemplate.subject}</h6>
                    <hr />
                    <div dangerouslySetInnerHTML={{ __html: selectedTemplate.body }} />
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default DocumentTemplates;
