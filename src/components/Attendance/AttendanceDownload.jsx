import { useState, useEffect } from "react";
import {
    Button,
    Card,
    Modal,
    Form,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetchAllEmployees } from "../../pages/Employees/slice/employeeSlice";
import { useDispatch, useSelector } from "react-redux";
import { uploadAttendance } from "../../pages/Attendance/slice/attendanceSlice";

const AttendanceDownload = () => {
    const dispatch = useDispatch();

    /* ================= STATE ================= */
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    const [showUpload, setShowUpload] = useState(false);
    const [file, setFile] = useState(null);

    const [csvPreview, setCsvPreview] = useState([]);
    const [headers, setHeaders] = useState([]);

    const { employees: data = [] } = useSelector(
        (state) => state.employee
    );

    /* ================= EFFECT ================= */
    useEffect(() => {
        dispatch(fetchAllEmployees());
    }, [dispatch]);

    /* ================= DOWNLOAD ================= */

    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleDownload = (date) => {
        setSelectedDate(date);

        let sheetContent =
            "Employee ID,First Name,Last Name,Date,Sign In,Sign Out\n";

        data.forEach((emp) => {
            sheetContent += `${emp.employee_code},${emp.first_name},${emp.last_name},${formatDate(
                date
            )},,\n`;
        });

        const blob = new Blob([sheetContent], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `attendance_${formatDate(date)}.csv`;
        link.click();

        setShowCalendar(false);
    };

    /* ================= CSV PARSER ================= */

    const parseCSV = (text) => {
        const rows = text.split("\n").filter((r) => r.trim() !== "");
        if (rows.length < 2) return;

        const headerRow = rows[0].split(",").map((h) => h.trim());

        const parsedRows = rows.slice(1).map((row, index) => {
            const values = row.split(",");
            let rowData = {};

            headerRow.forEach((h, i) => {
                rowData[h] = values[i]?.trim() || "";
            });

            // 🔹 Status logic
            const isValid =
                rowData["Employee ID"] &&
                rowData["Sign In"] &&
                rowData["Sign Out"];

            return {
                rowNo: index + 1,
                ...rowData,
                status: isValid ? "Valid" : "Invalid",
            };
        });

        setHeaders(headerRow);
        setCsvPreview(parsedRows);
    };

    /* ================= FILE CHANGE ================= */

    const handleFileChange = (e) => {
        const uploadedFile = e.target.files[0];
        setFile(uploadedFile);

        if (!uploadedFile) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            parseCSV(event.target.result);
        };
        reader.readAsText(uploadedFile);
    };

    /* ================= UPLOAD ================= */

    // const handleUpload = () => {
    //     if (!file) {
    //         alert("Please select a CSV file");
    //         return;
    //     }

    //     console.log("Uploading CSV:", csvPreview);

    //     // 🔌 API CALL HERE
    //     // dispatch(uploadAttendance(csvPreview))

    //     closeUploadModal();
    // };

    const handleUpload = async () => {
        if (!csvPreview.length) {
            alert("No CSV data to upload");
            return;
        }

        const res = await dispatch(uploadAttendance(csvPreview));

        if (res.payload) {
            setCsvPreview((prev) =>
                prev.map((row) => {
                    console.log("Processing row:", row);
                    const resultRow = res.payload.find(
                        (r) => r.rowNo === row.rowNo
                    );

                    if (!resultRow) return row;

                    return {
                        ...row,
                        status: resultRow.status,
                        error: resultRow.error,
                    };
                })
            );
        }
    };

    const closeUploadModal = () => {
        setShowUpload(false);
        setFile(null);
        setCsvPreview([]);
        setHeaders([]);
    };

    /* ================= UI ================= */

    return (
        <>
            {/* ================= BUTTONS ================= */}
            <div className="d-flex gap-2 align-items-start">
                {/* Download */}
                <div className="position-relative">
                    <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => setShowCalendar((p) => !p)}
                    >
                        Download Date CSV
                    </Button>

                    {showCalendar && (
                        <Card
                            className="shadow-sm mt-2"
                            style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                zIndex: 1000,
                            }}
                        >
                            <Card.Body className="p-2">
                                <DatePicker
                                    inline
                                    selected={selectedDate}
                                    maxDate={new Date()}
                                    onChange={handleDownload}
                                />
                            </Card.Body>
                        </Card>
                    )}
                </div>

                {/* Upload */}
                <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setShowUpload(true)}
                >
                    Upload Attendance
                </Button>
            </div>

            {/* ================= UPLOAD MODAL ================= */}
            <Modal show={showUpload} onHide={closeUploadModal} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title className="h6 fw-normal">
                        Upload Attendance
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Upload CSV File</Form.Label>
                            <Form.Control
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                            />
                        </Form.Group>
                    </Form>

                    {/* ================= CSV PREVIEW ================= */}
                    {csvPreview.length > 0 && (
                        <div
                            className="mt-3"
                            style={{ maxHeight: 300, overflow: "auto" }}
                        >
                            <table className="table table-sm table-bordered">
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        {headers.map((h, i) => (
                                            <th key={i}>{h}</th>
                                        ))}
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {csvPreview.map((row, i) => (
                                        <tr key={i}>
                                            <td>{row.rowNo}</td>

                                            {headers.map((h, idx) => (
                                                <td key={idx}>{row[h]}</td>
                                            ))}

                                            <td>
                                                {row.status === "Uploaded" && (
                                                    <span className="badge bg-success">Uploaded</span>
                                                )}

                                                {row.status === "Error" && (
                                                    <span className="badge bg-danger">
                                                        Error
                                                        <div className="small text-muted">
                                                            {row.error}
                                                        </div>
                                                    </span>
                                                )}

                                                {!row.status && (
                                                    <span className="badge bg-secondary">Pending</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer className="custom">
                    <div className="left-side">
                        <Button
                            variant=""
                            onClick={closeUploadModal}
                            className="btn-link danger w-100"
                        >
                            Cancel
                        </Button>
                    </div>
                    <div className="divider"></div>
                    <div className="right-side">
                        <Button
                            variant=""
                            onClick={handleUpload}
                            className="btn-link success w-100"
                        >
                            Upload
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default AttendanceDownload;
