import {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  InputGroup,
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import { BiEditAlt } from "react-icons/bi";
import { BsCalendar3 } from "react-icons/bs";
import DatePicker from "react-datepicker";
import { Formik } from "formik";
import * as Yup from "yup";
import AttendanceDownload from "../../components/Attendance/AttendanceDownload";

/* ================= CUSTOM DATE INPUT ================= */

const DateInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <InputGroup onClick={onClick} className="w-100">
    <Form.Control
      ref={ref}
      value={value || ""}
      placeholder={placeholder}
      readOnly
    />
    <InputGroup.Text>
      <BsCalendar3 />
    </InputGroup.Text>
  </InputGroup>
));

/* ================= VALIDATION ================= */

const filterSchema = Yup.object({
  startDate: Yup.date().nullable(),
  endDate: Yup.date()
    .nullable()
    .min(Yup.ref("startDate"), "End date must be after start date"),
  department: Yup.string(),
  staff: Yup.string(),
  status: Yup.string(),
});

/* ================= MOCK DATA ================= */

const mockData = [
  {
    id: 1,
    employeeId: "EMP-001",
    name: "Amit Kumar",
    shift: "Morning",
    shiftTime: "(9 AM - 6 PM)",
    role: "Admin",
    status: "Active",
    checkIn: "09:00 AM",
    checkOut: "06:00 PM",
    totalHours: 8.1,
  },
  {
    id: 2,
    employeeId: "EMP-002",
    name: "Ravi Sharma",
    shift: "Afternoon",
    shiftTime: "(10 AM - 7 PM)",
    role: "User",
    status: "Inactive",
    checkIn: "09:15 AM",
    checkOut: "06:00 PM",
    totalHours: 7.75,
  },
  {
    id: 3,
    employeeId: "EMP-003",
    name: "Pooja Singh",
    shift: "Evening",
    shiftTime: "(5 PM - 1 AM)",
    role: "Manager",
    status: "Active",
    checkIn: "08:50 AM",
    checkOut: "05:50 PM",
    totalHours: 8,
  },
];

const stats = [
  { title: "Total Employees", value: 150, color: "primary", bg: "rgba(13,110,253,.08)" },
  { title: "On Time", value: 120, color: "success", bg: "rgba(25,135,84,.08)" },
  { title: "Late", value: 30, color: "warning", bg: "rgba(255,193,7,.08)" },
  { title: "Absent Today", value: 30, color: "danger", bg: "rgba(220,53,69,.08)" },
  { title: "Total Hours", value: 30, color: "info", bg: "rgba(103,58,183,.08)" },
];

/* ================= COMPONENT ================= */

const Attendance = () => {
  const [data] = useState(mockData);
  const [filteredData, setFilteredData] = useState(mockData);
  const [search, setSearch] = useState("");
  const [loading] = useState(false);

  /* Filter State */
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    department: "",
    staff: "",
    status: "",
  });

  /* Independent Download Date */
  const downloadDateRef = useRef(null);
  const [downloadDate, setDownloadDate] = useState(null);

  /* ================= FILTER + SEARCH ================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      let result = [...data];

      if (filters.department) {
        result = result.filter(r => r.role === filters.department);
      }

      if (filters.staff) {
        result = result.filter(r => r.name === filters.staff);
      }

      if (filters.status) {
        result = result.filter(r => r.status === filters.status);
      }

      if (filters.startDate && filters.endDate) {
        result = result.filter(() => {
          const rowDate = new Date("2026-01-22"); // replace with real date
          return rowDate >= filters.startDate && rowDate <= filters.endDate;
        });
      }

      if (search) {
        result = result.filter(r =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.employeeId.toLowerCase().includes(search.toLowerCase())
        );
      }

      setFilteredData(result);
    }, 400);

    return () => clearTimeout(timer);
  }, [filters, search, data]);

  /* ================= TABLE COLUMNS ================= */

  const columns = useMemo(() => [
    {
      name: "Employee",
      selector: row => row.name,
      sortable: true,
      cell: row => (
        <div>
          <div className="fw-semibold">{row.name}</div>
          <small className="text-muted">{row.employeeId}</small>
        </div>
      ),
    },
    {
      name: "Department",
      selector: row => row.role,
      sortable: true,
    },
    {
      name: "Shift",
      selector: row => row.shift,
      sortable: true,
      cell: row => (
        <div>
          <div>{row.shift}</div>
          <small className="text-muted">{row.shiftTime}</small>
        </div>
      ),
    },
    { name: "Check-In", selector: row => row.checkIn, sortable: true },
    { name: "Check-Out", selector: row => row.checkOut, sortable: true },
    { name: "Total Hours", selector: row => row.totalHours, sortable: true },
    {
      name: "Status",
      selector: row => row.status,
      cell: row => (
        <span className={`badge ${row.status === "Active" ? "bg-success" : "bg-secondary"}`}>
          {row.status}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: row => (
        <Button
          size="sm"
          className="rounded-circle bg-primary-subtle border-0 text-primary"
          style={{ width: 32, height: 32 }}
          onClick={() => alert(`Edit user: ${row.name}`)}
        >
          <BiEditAlt size={18} />
        </Button>
      ),
    },
  ], []);

  /* ================= UI ================= */

  return (
    <div className="container-fluid g-0">
      {/* Header */}

      <Row className="mt-3 align-items-center">
        <Col md={6}>
          <div>
            <h5 className="mb-1">Attendance & Time Tracking</h5>
            <small className="text-muted">
              Monitor and manage hotel staff attendance
            </small>
          </div>
        </Col>

        <Col
          md={6}
          className="d-flex justify-content-md-end justify-content-start mt-3 mt-md-0"
        >
          <AttendanceDownload />
        </Col>
      </Row>

      {/* Stats */}
      <div className="d-flex gap-3 mt-3 flex-wrap">
        {stats.map((s, i) => (
          <Card key={i} style={{ background: s.bg, minWidth: 220 }} className={`border-${s.color}`}>
            <Card.Body>
              <h6 className={`text-${s.color}`}>{s.title}</h6>
              <h3 className={`text-${s.color}`}>{s.value}</h3>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mt-4 shadow-sm border-0">
        <Card.Body>
          <Formik initialValues={filters} validationSchema={filterSchema}>
            {({ resetForm }) => (
              <Form>
                <div className="d-flex flex-wrap gap-3 align-items-end">
                  <div className="flex-fill">
                    <Form.Label>Date</Form.Label>
                    <div className="d-flex gap-2">
                      <DatePicker
                        selected={filters.startDate}
                        onChange={date => setFilters(p => ({ ...p, startDate: date }))}
                        selectsStart
                        startDate={filters.startDate}
                        endDate={filters.endDate}
                        customInput={<DateInput placeholder="Start date" />}
                      />
                      <DatePicker
                        selected={filters.endDate}
                        onChange={date => setFilters(p => ({ ...p, endDate: date }))}
                        selectsEnd
                        startDate={filters.startDate}
                        endDate={filters.endDate}
                        minDate={filters.startDate}
                        customInput={<DateInput placeholder="End date" />}
                      />
                    </div>
                  </div>

                  <div className="flex-fill">
                    <Form.Label>Department</Form.Label>
                    <Form.Select
                      value={filters.department}
                      onChange={e => setFilters(p => ({ ...p, department: e.target.value }))}
                    >
                      <option value="">All</option>
                      <option value="Admin">Admin</option>
                      <option value="User">User</option>
                      <option value="Manager">Manager</option>
                    </Form.Select>
                  </div>

                  <div className="flex-fill">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={filters.status}
                      onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
                    >
                      <option value="">All</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </Form.Select>
                  </div>

                  <div className="flex-fill">
                    <Button
                      variant="outline-secondary"
                      className="w-100"
                      onClick={() => {
                        resetForm();
                        setFilters({
                          startDate: null,
                          endDate: null,
                          department: "",
                          staff: "",
                          status: "",
                        });
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </Card.Body>
      </Card>

      {/* Table */}
      <Card className="mt-4 shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between mb-3">
            <h5>Employees</h5>
            <Form.Control
              style={{ maxWidth: 250 }}
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            highlightOnHover
            responsive
            progressPending={loading}
            className="custom-data-table"
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default Attendance;