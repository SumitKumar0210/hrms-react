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
    },
    {
      id: 2,
      title: "Standard Relieving Letter",
      type: "Relieving Letter",
      status: "Active",
      subject: "Relieving Letter",
      body: "<p>This is to certify that {{EmployeeName}}...</p>",
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
  "Basic Salary",
  "Relieving Date",
  "Total Experience"
];

/* ---------------- Component ---------------- */
const DocumentTemplates = () => {
  const quillRef = useRef(null);

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchTemplates().then((data) => {
      setTemplates(data);
      setSelectedTemplate(data[0]);
    });
  }, []);

  const updateField = (key, value) => {
    setSelectedTemplate((prev) => ({ ...prev, [key]: value }));
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

  const handleSave = async () => {
    await saveTemplate(selectedTemplate);
    alert("Template saved successfully");
  };

  if (!selectedTemplate) return null;

  return (
    <Container fluid className="py-4">
      <h4 className="mb-3 fw-semibold">Document Templates</h4>

      <Row className="g-4">
        {/* ---------------- Sidebar ---------------- */}
        <Col md={3}>
          <Card
            className="h-100 border-0 shadow-sm"
            style={{ background: "#e8f0ff" }}
          >
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <strong>Templates</strong>
                <Button size="sm" className="rounded-pill px-3">
                  + Add
                </Button>
              </div>

              {templates.map((t) => (
                <Card
                  key={t.id}
                  className={`mb-3 cursor-pointer ${
                    selectedTemplate.id === t.id ? "border-primary" : ""
                  }`}
                  style={{ borderRadius: 10 }}
                  onClick={() => setSelectedTemplate(t)}
                >
                  <Card.Body className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-semibold">{t.title}</div>
                      <small className="text-muted">{t.type}</small>
                    </div>

                    <span
                      className={`badge rounded-pill px-3 py-1 fw-semibold border ${
                        t.status === "Active"
                          ? "bg-success-subtle text-success border-success"
                          : "bg-secondary-subtle text-secondary border-secondary"
                      }`}
                    >
                      ● {t.status}
                    </span>
                  </Card.Body>
                </Card>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* ---------------- Editor Panel ---------------- */}
        <Col md={9}>
          <Card
            className="border-0 shadow-sm"
          >
            <Card.Body>
              {/* Header */}
              <div className="mb-3">
                <h5 className="fw-semibold mb-0">
                  Salary Slip Distribution
                </h5>
                <small className="text-muted">
                  Last updated: January 23, 2026 at 2:30 PM IST
                </small>
              </div>

              <Row className="g-3">
                <Col md={12}>
                  <Form.Label>Template Name</Form.Label>
                  <Form.Control
                    className="rounded-3"
                    value={selectedTemplate.title}
                    onChange={(e) =>
                      updateField("title", e.target.value)
                    }
                  />
                </Col>

                <Col md={6}>
                  <Form.Label>Template Type</Form.Label>
                  <Form.Control
                    className="rounded-3"
                    value={selectedTemplate.type}
                    disabled
                  />
                </Col>

                <Col md={6}>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    className="rounded-3"
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
                    className="rounded-3"
                    value={selectedTemplate.subject}
                    onChange={(e) =>
                      updateField("subject", e.target.value)
                    }
                  />
                </Col>

                {/* Variables */}
                <Col md={12}>
                  <Form.Label>
                    Available Variables (Click to insert)
                  </Form.Label>
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
                        style={{ userSelect: "none" }}
                      >
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                </Col>

                {/* Editor */}
                <Col md={12}>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className=" rounded-0 overflow-hidden bg-white"
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

              {/* Footer */}
              <div className="d-flex justify-content-end gap-3 mt-4">
                <Button
                  variant="outline-secondary"
                  className=" px-4"
                  onClick={() => setShowPreview(true)}
                >
                  Preview
                </Button>

                <Button
                  className=" px-4"
                  onClick={handleSave}
                >
                  Save Template
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ---------------- Preview Modal ---------------- */}
      <Modal
        size="lg"
        centered
        show={showPreview}
        onHide={() => setShowPreview(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Template Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6 className="fw-semibold">{selectedTemplate.subject}</h6>
          <hr />
          <div
            className="border rounded-3 p-3"
            dangerouslySetInnerHTML={{
              __html: selectedTemplate.body,
            }}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default DocumentTemplates;
