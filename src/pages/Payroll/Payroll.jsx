import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Card,
  Col,
  Form,
  InputGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import { BsCalendar3, BsPencilSquare } from "react-icons/bs";
import { ImDownload3 } from "react-icons/im";
import { MdOutlinePayments } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  clearAttendance,
  getEmployeeWithAttendanceMonthly,
  processMonthlyPayroll,
} from "./slice/payrollSlice";
import { updateAttendance } from "../Attendance/slice/attendanceSlice";
import { useAuth } from "../../context/AuthContext";
import { fetchAllEmployees } from "../Employees/slice/employeeSlice";

/* ================= HELPERS ================= */

const formatMonth = (date) =>
  date.toLocaleString("default", { month: "long", year: "numeric" });

const toMonthParam = (date) => ({
  month: date.getMonth() + 1,
  year: date.getFullYear(),
});

const STATUS_OPTIONS = [
  "present",
  "absent",
  "half_day",
  "casual_leave",
  "earned_leave",
  "sick_leave",
  "maternity_leave",
  "paternity_leave",
  "compensatory_off",
  "leave_without_pay",
  "public_holiday",
  "week_off",
];

const STATUS_META = {
  present: { bg: "#d1fae5", border: "#6ee7b7", label: "Present" },
  week_off: { bg: "#d1fae5", border: "#6ee7b7", label: "Week Off" },
  absent: { bg: "#fee2e2", border: "#fca5a5", label: "Absent" },
  half_day: { bg: "#e0f2fe", border: "#7dd3fc", label: "Half Day" },
  casual_leave: { bg: "#fef9c3", border: "#fde047", label: "Casual Leave" },
  earned_leave: { bg: "#fef3c7", border: "#fbbf24", label: "Earned Leave" },
  sick_leave: { bg: "#ede9fe", border: "#a78bfa", label: "Sick Leave" },
  maternity_leave: {
    bg: "#fce7f3",
    border: "#f9a8d4",
    label: "Maternity Leave",
  },
  paternity_leave: {
    bg: "#f0fdf4",
    border: "#86efac",
    label: "Paternity Leave",
  },
  compensatory_off: { bg: "#f0f9ff", border: "#38bdf8", label: "Comp. Off" },
  leave_without_pay: { bg: "#fef2f2", border: "#f87171", label: "LWP" },
  public_holiday: { bg: "#f5f3ff", border: "#c4b5fd", label: "Public Holiday" },
};

const statusColor = (s) => STATUS_META[s?.toLowerCase()]?.bg ?? "transparent";
const statusBorder = (s) => STATUS_META[s?.toLowerCase()]?.border ?? "#e5e7eb";
const statusLabel = (s) =>
  STATUS_META[s?.toLowerCase()]?.label ?? (s ? s.replace(/_/g, " ") : "—");

const getDaysInMonth = (date) => {
  if (!date) return [];
  const year = date.getFullYear();
  const month = date.getMonth();
  const count = new Date(year, month + 1, 0).getDate();
  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(year, month, i + 1);
    return {
      day: i + 1,
      dayName: DAY_NAMES[d.getDay()],
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      isoDate: `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`,
    };
  });
};

/* ================= COMPONENT ================= */

const Payroll = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const {
    attendanceData,
    employeeData,
    isPayrollFinalized,
    attendanceLoading,
    processing,
    error,
  } = useSelector((state) => state.payroll);
  const { employees = [], searchLoading } = useSelector((s) => s.employee);

  const [payrollMonth, setPayrollMonth] = useState(null);
  const [search, setSearch] = useState("");
  const datePickerRef = useRef(null);

  // Local editable overrides: { [empId_isoDate]: { sign_in, sign_out, status } }
  const [edits, setEdits] = useState({});

  // Tracks whether unsaved edits exist
  const hasEdits = Object.keys(edits).length > 0;

  // Tracks whether attendance data has been successfully loaded
  const [attendanceLoaded, setAttendanceLoaded] = useState(false);

  // Tracks update-in-progress state
  const [updating, setUpdating] = useState(false);

  // Whether we are in "create" mode (month selected but no attendance records)
  const isCreateMode =
    attendanceLoaded &&
    (!attendanceData || attendanceData.length === 0) &&
    employees.length > 0;

  useEffect(() => {
    dispatch(fetchAllEmployees());
  }, [dispatch]);

  /* ---- Month select → fetch attendance ---- */
  const handleMonthChange = (date) => {
    setPayrollMonth(date);
    setSearch("");
    setEdits({});
    setAttendanceLoaded(false);
    dispatch(clearAttendance());
    if (date) {
      dispatch(getEmployeeWithAttendanceMonthly(toMonthParam(date)))
        .unwrap()
        .then(() => {
          setAttendanceLoaded(true);
        })
        .catch(() => {
          setAttendanceLoaded(false);
        });
    }
  };

  /* ---- Days in selected month ---- */
  const days = useMemo(() => getDaysInMonth(payrollMonth), [payrollMonth]);

  /* ---- Active employee list: use employeeData if available, else fall back to all employees ---- */
  const activeEmployeeList = useMemo(
    () => (employeeData && employeeData.length > 0 ? employeeData : employees),
    [employeeData, employees],
  );

  /* ---- Build attendance lookup: { empId: { isoDate: record } } ---- */
  const attendanceLookup = useMemo(() => {
    const lookup = {};
    (attendanceData ?? []).forEach((rec) => {
      const empId = rec.employee_id;
      if (!lookup[empId]) lookup[empId] = {};
      const dateKey = rec.date ?? rec.attendance_date ?? rec.work_date;
      if (dateKey) {
        lookup[empId][dateKey.slice(0, 10)] = rec;
      }
    });
    return lookup;
  }, [attendanceData]);

  /* ---- Edit handler ---- */
  const handleEdit = useCallback((empId, isoDate, field, value) => {
    const key = `${empId}_${isoDate}`;
    setEdits((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] ?? {}),
        [field]: value,
      },
    }));
  }, []);

  /* ---- Get cell value (edits override server data) ---- */
  const getCellValue = useCallback(
    (empId, isoDate, field) => {
      const key = `${empId}_${isoDate}`;
      if (edits[key]?.[field] !== undefined) return edits[key][field];
      const rec = attendanceLookup[empId]?.[isoDate];
      if (!rec) return "";
      if (field === "sign_in") return rec.sign_in ?? rec.check_in ?? "";
      if (field === "sign_out") return rec.sign_out ?? rec.check_out ?? "";
      if (field === "status") return rec.status ?? "";
      return "";
    },
    [edits, attendanceLookup],
  );

  /* ---- Update / create attendance records ---- */
  const handleUpdateAttendance = useCallback(async () => {
    if (!hasEdits) return;

    const payload = Object.entries(edits).map(([key, changes]) => {
      const [empId, isoDate] = key.split(/_(.+)/);
      const originalRec = attendanceLookup[empId]?.[isoDate] ?? {};
      const attendanceId =
        originalRec.id ?? originalRec.attendance_id ?? undefined;

      return {
        // Omit attendance_id entirely for new records so backend treats it as insert
        ...(attendanceId ? { attendance_id: attendanceId } : {}),
        employee_id: Number(empId),
        date: isoDate,
        sign_in:
          changes.sign_in ??
          originalRec.sign_in ??
          originalRec.check_in ??
          null,
        sign_out:
          changes.sign_out ??
          originalRec.sign_out ??
          originalRec.check_out ??
          null,
        status: changes.status ?? originalRec.status ?? null,
      };
    });

    try {
      setUpdating(true);
      await dispatch(updateAttendance(payload)).unwrap();
      // Refresh attendance data after update
      await dispatch(
        getEmployeeWithAttendanceMonthly(toMonthParam(payrollMonth)),
      );
      setEdits({});
    } catch (err) {
      console.error("Attendance update failed:", err);
    } finally {
      setUpdating(false);
    }
  }, [hasEdits, edits, attendanceLookup, dispatch, payrollMonth]);

  /* ---- Process salary ---- */
  const handleProcessPayroll = async () => {
    if (!payrollMonth) return;
    try {
      await dispatch(
        processMonthlyPayroll(toMonthParam(payrollMonth)),
      ).unwrap();
      navigate("/employees/payroll-history");
    } catch (err) {
      console.error("Payroll processing failed:", err);
    }
  };

  /* ---- Filtered employees ---- */
  const filteredEmployees = useMemo(() => {
    if (!search.trim()) return activeEmployeeList;
    const q = search.toLowerCase();
    return activeEmployeeList.filter(
      (emp) =>
        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(q) ||
        emp.employee_code?.toLowerCase().includes(q),
    );
  }, [search, activeEmployeeList]);

  // hasData is true if either employeeData or employees are available and a month is selected
  const hasData =
    (employeeData && employeeData.length > 0) ||
    (employees.length > 0 && !!payrollMonth && attendanceLoaded);

  /* ---- Stats (only meaningful when attendanceData has records) ---- */
  const stats = useMemo(() => {
    const total = activeEmployeeList.length;
    const present = (attendanceData ?? []).filter(
      (r) => r.status?.toLowerCase() === "present",
    ).length;
    const absent = (attendanceData ?? []).filter(
      (r) => r.status?.toLowerCase() === "absent",
    ).length;
    const LEAVE_STATUSES = [
      "casual_leave",
      "compensatory_off",
      "earned_leave",
      "half_day",
      "leave_without_pay",
      "maternity_leave",
      "paternity_leave",
      "sick_leave",
      "public_holiday",
    ];
    const leave = (attendanceData ?? []).filter((r) =>
      LEAVE_STATUSES.includes(r.status?.toLowerCase()),
    ).length;
    return { total, present, absent, leave };
  }, [activeEmployeeList, attendanceData]);

  /* ================= UI ================= */
  return (
    <div className="container-fluid g-0">
      {/* ── HEADER ── */}
      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h5 className="fw-semibold mb-0">Payroll Processing</h5>
          <small className="text-muted">
            Select a month to preview & edit attendance, then process salary
          </small>
        </div>
      </div>

      {/* ── STEP 1 : Month Picker card ── */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="py-3">
          <Row className="align-items-center g-3">
            <Col>
              <div
                className="fw-semibold mb-1"
                style={{ fontSize: "0.875rem" }}
              >
                Step 1 — Select Payroll Month
              </div>
              <InputGroup style={{ maxWidth: 260 }}>
                <DatePicker
                  ref={datePickerRef}
                  selected={payrollMonth}
                  onChange={handleMonthChange}
                  dateFormat="MMMM yyyy"
                  showMonthYearPicker
                  placeholderText="Pick a month…"
                  className="form-control"
                  isClearable
                />
              </InputGroup>
            </Col>

            <Col xs="auto">
              <div
                className="fw-semibold mb-1"
                style={{ fontSize: "0.875rem" }}
              >
                Step 2 — Process Salary
              </div>

              {hasEdits && (
                <small className="text-warning d-block mb-1">
                  ⚠ Save attendance changes before processing salary.
                </small>
              )}

              {isPayrollFinalized && (
                <small className="text-white text-bg-danger d-block mb-1">
                  ⚠ This month salary is already processed.
                </small>
              )}

              {!attendanceLoaded && payrollMonth && !attendanceLoading && (
                <small className="text-muted d-block mb-1">
                  Load attendance data first.
                </small>
              )}

              {hasPermission("payroll_processing.create") && (
                <button
                  className="btn btn-primary d-flex align-items-center gap-2"
                  onClick={isPayrollFinalized ? undefined : handleProcessPayroll}
                  disabled={
                    !hasData ||
                    processing ||
                    hasEdits ||
                    !attendanceLoaded ||
                    isPayrollFinalized ||
                    isCreateMode // can't process salary if no attendance exists yet
                  }
                  title={
                    isCreateMode
                      ? "Fill and save attendance before processing salary"
                      : !attendanceLoaded && payrollMonth
                        ? "Load attendance data first"
                        : hasEdits
                          ? "You have unsaved attendance edits — update attendance first"
                          : !hasData
                            ? "No data available"
                            : ""
                  }
                >
                  {processing ? (
                    <>
                      <Spinner animation="border" size="sm" aria-hidden="true" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <MdOutlinePayments size={17} />
                      {payrollMonth
                        ? `Process ${formatMonth(payrollMonth)}`
                        : "Process Salary"}
                    </>
                  )}
                </button>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ── ERROR ── */}
      {error && (
        <Alert variant="danger" className="py-2 mb-3">
          {error}
        </Alert>
      )}

      {/* ── CREATE MODE BANNER ── */}
      {isCreateMode && (
        <Alert variant="info" className="py-2 mb-3">
          📋 No attendance records found for{" "}
          <strong>{formatMonth(payrollMonth)}</strong>. Fill in the attendance
          below and click <strong>Save Attendance</strong> to create records.
        </Alert>
      )}

      {/* ── EMPTY PROMPT ── */}
      {!payrollMonth && !attendanceLoading && (
        <Card className="border-0 shadow-sm">
          <Card.Body className="py-5 text-center text-muted">
            <BsCalendar3 size={36} className="mb-3 opacity-25" />
            <p className="mb-0">
              Select a payroll month above to load employee attendance
            </p>
          </Card.Body>
        </Card>
      )}

      {/* ── STATS STRIP (only when real attendance data exists) ── */}
      {hasData && !attendanceLoading && !isCreateMode && (
        <Row className="g-3 mb-3">
          {[
            { label: "Total Employees", value: stats.total, color: "primary" },
            { label: "Present", value: stats.present, color: "success" },
            { label: "Absent", value: stats.absent, color: "danger" },
            { label: "Leave / Half-day", value: stats.leave, color: "warning" },
          ].map((s) => (
            <Col key={s.label} xs={6} md={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="py-3 px-3">
                  <div className={`fs-4 fw-bold text-${s.color}`}>
                    {s.value}
                  </div>
                  <small className="text-muted">{s.label}</small>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* ── CALENDAR ATTENDANCE TABLE ── */}
      {(payrollMonth || attendanceLoading) && (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            {/* Table toolbar */}
            <div className="d-flex justify-content-between align-items-center px-3 py-3 flex-wrap gap-2">
              <h6 className="mb-0">
                {payrollMonth
                  ? `Attendance — ${formatMonth(payrollMonth)}`
                  : "Attendance"}
                {hasData && !attendanceLoading && (
                  <span
                    className="text-muted fw-normal ms-2"
                    style={{ fontSize: "0.875rem" }}
                  >
                    ({filteredEmployees.length} employees)
                  </span>
                )}
                {isCreateMode && (
                  <span
                    className="badge bg-info text-dark ms-2"
                    style={{ fontSize: "0.7rem" }}
                  >
                    New Entry
                  </span>
                )}
              </h6>
              {hasData && (
                <div className="d-flex align-items-center gap-2">
                  <Form.Control
                    style={{ maxWidth: 260 }}
                    placeholder="Search name or code…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    size="sm"
                  />
                  {!isCreateMode && (
                    <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
                      <ImDownload3 /> Export
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Loading state */}
            {attendanceLoading && (
              <div className="py-5 text-center text-muted">
                <Spinner animation="border" size="sm" className="me-2" />
                Loading attendance for{" "}
                {payrollMonth ? formatMonth(payrollMonth) : ""}…
              </div>
            )}

            {/* Calendar Grid */}
            {!attendanceLoading && hasData && days.length > 0 && (
              <>
                <div style={{ overflowX: "auto", fontSize: "0.75rem" }}>
                  <table
                    style={{
                      borderCollapse: "collapse",
                      minWidth: "100%",
                      tableLayout: "fixed",
                    }}
                  >
                    <colgroup>
                      <col style={{ width: 160, minWidth: 160 }} />
                      <col style={{ width: 64, minWidth: 64 }} />
                      {days.map((d) => (
                        <col
                          key={d.isoDate}
                          style={{ width: 90, minWidth: 90 }}
                        />
                      ))}
                    </colgroup>

                    {/* ── HEADER ROW ── */}
                    <thead>
                      <tr>
                        <th
                          colSpan={2}
                          style={{
                            background: "#1e3a5f",
                            color: "#fff",
                            padding: "8px 12px",
                            fontWeight: 600,
                            borderRight: "1px solid #334d6e",
                            position: "sticky",
                            left: 0,
                            zIndex: 3,
                          }}
                        >
                          Labour Name
                        </th>
                        {days.map((d) => (
                          <th
                            key={d.isoDate}
                            style={{
                              background: d.isWeekend ? "#2d5fa6" : "#1e3a5f",
                              color: "#fff",
                              textAlign: "center",
                              padding: "6px 4px",
                              borderLeft: "1px solid #334d6e",
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <div style={{ fontSize: "0.85rem" }}>{d.day}</div>
                            <div style={{ fontSize: "0.65rem", opacity: 0.8 }}>
                              {d.dayName}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    {/* ── BODY ── */}
                    <tbody>
                      {filteredEmployees.map((emp, empIdx) => {
                        const empId = emp.id;
                        const fullName = `${emp.first_name} ${emp.middle_name ?? ""} ${emp.last_name}`;
                        const rowBg = empIdx % 2 === 0 ? "#fff" : "#f8fafc";

                        return ["sign_in", "sign_out", "status"].map(
                          (field, fieldIdx) => (
                            <tr
                              key={`${empId}_${field}`}
                              style={{ background: rowBg }}
                            >
                              {fieldIdx === 0 && (
                                <td
                                  rowSpan={3}
                                  style={{
                                    padding: "0 12px",
                                    fontWeight: 600,
                                    borderBottom: "2px solid #e2e8f0",
                                    borderRight: "1px solid #e2e8f0",
                                    verticalAlign: "middle",
                                    background: rowBg,
                                    position: "sticky",
                                    left: 0,
                                    zIndex: 1,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <div className="d-flex align-items-center gap-2">
                                    <div>
                                      <div style={{ fontSize: "0.8rem" }}>
                                        {fullName}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: "0.65rem",
                                          color: "#94a3b8",
                                        }}
                                      >
                                        {emp.employee_code}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              )}

                              <td
                                style={{
                                  padding: "2px 6px",
                                  color: "#64748b",
                                  fontWeight: 500,
                                  borderBottom:
                                    field === "status"
                                      ? "2px solid #e2e8f0"
                                      : "1px solid #f1f5f9",
                                  borderRight: "1px solid #e2e8f0",
                                  whiteSpace: "nowrap",
                                  background: rowBg,
                                  position: "sticky",
                                  left: 160,
                                  zIndex: 1,
                                }}
                              >
                                {field === "sign_in" && "In"}
                                {field === "sign_out" && "Out"}
                                {field === "status" && (
                                  <>
                                    <BsPencilSquare size={10} className="me-1" />
                                    Status
                                  </>
                                )}
                              </td>

                              {days.map((d) => {
                                const val = getCellValue(empId, d.isoDate, field);
                                const cellBg =
                                  field === "status"
                                    ? statusColor(val)
                                    : d.isWeekend
                                      ? "#eff6ff"
                                      : rowBg;
                                const editKey = `${empId}_${d.isoDate}`;
                                const isDirty = !!edits[editKey]?.[field];

                                return (
                                  <td
                                    key={d.isoDate}
                                    style={{
                                      padding: "2px 3px",
                                      borderLeft: "1px solid #e2e8f0",
                                      borderBottom:
                                        field === "status"
                                          ? "2px solid #e2e8f0"
                                          : "1px solid #f1f5f9",
                                      background: cellBg,
                                      verticalAlign: "middle",
                                      outline: isDirty
                                        ? "2px solid #f97316"
                                        : "none",
                                      outlineOffset: "-2px",
                                    }}
                                  >
                                    {field === "status" ? (
                                      <select
                                        value={val}
                                        disabled={isPayrollFinalized}
                                        onChange={(e) =>
                                          handleEdit(
                                            empId,
                                            d.isoDate,
                                            "status",
                                            e.target.value,
                                          )
                                        }
                                        style={{
                                          width: "100%",
                                          border: `1px solid ${statusBorder(val)}`,
                                          borderRadius: 4,
                                          background:
                                            statusColor(val) || "#f8fafc",
                                          fontSize: "0.65rem",
                                          padding: "1px 2px",
                                          cursor: "pointer",
                                          outline: "none",
                                          textTransform: "capitalize",
                                          color: "#1e293b",
                                        }}
                                      >
                                        <option value="">—</option>
                                        {STATUS_OPTIONS.map((s) => (
                                          <option key={s} value={s}>
                                            {statusLabel(s)}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <input
                                        type="time"
                                        value={val}
                                        disabled={isPayrollFinalized}
                                        onChange={(e) =>
                                          handleEdit(
                                            empId,
                                            d.isoDate,
                                            field,
                                            e.target.value,
                                          )
                                        }
                                        style={{
                                          width: "100%",
                                          border: "1px solid #e2e8f0",
                                          borderRadius: 4,
                                          fontSize: "0.65rem",
                                          padding: "1px 2px",
                                          outline: "none",
                                          background: d.isWeekend
                                            ? "#eff6ff"
                                            : "#fff",
                                          color: "#1e293b",
                                        }}
                                      />
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ),
                        );
                      })}

                      {filteredEmployees.length === 0 && (
                        <tr>
                          <td
                            colSpan={days.length + 2}
                            className="text-center text-muted py-5"
                          >
                            No attendance records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ── SAVE / UPDATE ATTENDANCE BUTTON ── */}
                <div className="px-3 py-3 d-flex align-items-center gap-3 border-top">
                  {hasPermission("payroll_processing.create") && (
                    <button
                      className="btn btn-success d-flex align-items-center gap-2"
                      onClick={
                        isPayrollFinalized ? undefined : handleUpdateAttendance
                      }
                      disabled={!hasEdits || updating || isPayrollFinalized}
                      title={!hasEdits ? "No changes to save" : ""}
                    >
                      {updating ? (
                        <>
                          <Spinner animation="border" size="sm" />
                          {isCreateMode ? "Saving…" : "Updating…"}
                        </>
                      ) : isCreateMode ? (
                        "Save Attendance"
                      ) : (
                        "Update Attendance"
                      )}
                    </button>
                  )}

                  {hasEdits && !updating && (
                    <small className="text-muted">
                      {Object.keys(edits).length} record
                      {Object.keys(edits).length > 1 ? "s" : ""} modified
                    </small>
                  )}

                  {!hasEdits && attendanceLoaded && !isCreateMode && (
                    <small className="text-success fw-semibold">
                      ✓ Ready to process salary
                    </small>
                  )}

                  {isCreateMode && !hasEdits && (
                    <small className="text-info fw-semibold">
                      Fill in attendance above to get started
                    </small>
                  )}
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      )}

      {/* ── Legend ── */}
      {hasData && !attendanceLoading && (
        <div className="d-flex align-items-center gap-3 mt-3 flex-wrap">
          <small className="text-muted fw-semibold">Legend:</small>
          {STATUS_OPTIONS.map((s) => (
            <span
              key={s}
              className="d-flex align-items-center gap-1"
              style={{ fontSize: "0.72rem" }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: statusColor(s),
                  border: `1px solid ${statusBorder(s)}`,
                }}
              />
              <span className="text-muted text-capitalize">
                {statusLabel(s)}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Payroll;