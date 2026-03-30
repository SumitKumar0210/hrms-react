import { useState, useMemo, forwardRef } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  InputGroup,
  Offcanvas,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import DataTable from "react-data-table-component";
import Select from "react-select";
import { FaCalendarAlt, FaTimes } from "react-icons/fa";
import { format } from "date-fns";
import CustomSelect from "../../components/CustomSelect/CustomSelect";

/* -------------------- Custom Date Input -------------------- */
const DateInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <InputGroup onClick={onClick} className="cursor-pointer">
    <Form.Control
      ref={ref}
      value={value}
      placeholder={placeholder}
      readOnly
    />
    <InputGroup.Text className="bg-white">
      <FaCalendarAlt className="text-muted" />
    </InputGroup.Text>
  </InputGroup>
));

/* -------------------- Weekly Off Limiter -------------------- */
const applyWeeklyOffRule = (shifts, maxOffs = 2) => {
  let offCount = 0;

  return shifts.map((shift) => {
    if (shift === "Weekly Off") {
      offCount += 1;
      if (offCount > maxOffs) {
        return "Morning (6:00 AM - 2:00 PM)";
      }
    }
    return shift;
  });
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/* -------------------- Component -------------------- */
const ShiftRoster = () => {
  /* ---------- Filters ---------- */
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [startDate, endDate] = dateRange;
  const [department, setDepartment] = useState("Front Office");
  const [shiftType, setShiftType] = useState("Rotational");
  const [search, setSearch] = useState("");

  /* ---------- Offcanvas ---------- */
  const [showAssign, setShowAssign] = useState(false);

  const today = new Date();

  const [assignData, setAssignData] = useState({
    employees: [],
    shift: "Morning (6:00 AM - 2:00 PM)",
    startDate: today,
    endDate: addDays(today, 7),
    startTime: new Date(),
    endTime: new Date(),
    notes: "",
  });


  /* ---------- Table Data ---------- */
  const data = [
    {
      id: 1,
      name: "Sarah Johnson",
      empId: "EMP001",
      shifts: applyWeeklyOffRule([
        "Weekly Off",
        "Weekly Off",
        "Morning (6:00 AM - 2:00 PM)",
        "Morning (6:00 AM - 2:00 PM)",
        "Morning (6:00 AM - 2:00 PM)",
      ]),
    },
    {
      id: 2,
      name: "Priya Singh",
      empId: "EMP002",
      shifts: applyWeeklyOffRule(
        Array(5).fill("Morning (6:00 AM - 2:00 PM)")
      ),
    },
    {
      id: 3,
      name: "Amit Sharma",
      empId: "EMP004",
      shifts: applyWeeklyOffRule([
        "Weekly Off",
        "Morning (6:00 AM - 2:00 PM)",
        "Weekly Off",
        "Morning (6:00 AM - 2:00 PM)",
        "Weekly Off",
      ]),
    },
  ];

  /* ---------- Employee Options ---------- */
  const employeeOptions = data.map((emp) => ({
    label: `${emp.name} (${emp.empId})`,
    value: emp.id,
  }));

  /* ---------- Search Filter ---------- */
  const filteredData = useMemo(() => {
    return data.filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.empId.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, data]);

  /* ---------- Table Columns ---------- */
  const columns = [
    {
      name: "Employee",
      cell: (row) => {
        const weeklyOffCount = row.shifts.filter(
          (s) => s === "Weekly Off"
        ).length;

        return (
          <div>
            <div className="fw-semibold">{row.name}</div>
            <small className="text-muted">{row.empId}</small>
            {weeklyOffCount === 2 && (
              <div className="text-warning small">
                Max weekly off reached
              </div>
            )}
          </div>
        );
      },
      minWidth: "220px",
    },
    ...["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, index) => ({
      name: (
        <div>
          {day}
          <br />
          <small className="text-muted">
            {format(new Date(2026, 1, index + 1), "MMM d")}
          </small>
        </div>
      ),
      cell: (row) => {
        const value = row.shifts[index];

        if (value === "Weekly Off") {
          return (
            <div className="text-danger fw-semibold">
              Weekly Off
            </div>
          );
        }

        const [shiftName, shiftTime] = value.split(" (");

        return (
          <div>
            <div className="fw-semibold">{shiftName}</div>
            <small className="text-muted">
              {shiftTime?.replace(")", "")}
            </small>
          </div>
        );
      },
      minWidth: "180px",
    })),
  ];

  /* -------------------- UI -------------------- */
  return (
    <Container fluid className="py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h5 className="mb-0">Shift Roster</h5>
          <small className="text-muted">
            Plan and manage employee shifts
          </small>
        </div>

        <div className="d-flex gap-2">
          <Button size="sm" variant="info">Export</Button>
          <Button size="sm" variant="secondary">Copy Previous Week</Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              const today = new Date();
              setAssignData(prev => ({
                ...prev,
                startDate: today,
                endDate: addDays(today, 7),
              }));
              setShowAssign(true);
            }}
          >
            Assign Shift
          </Button>

        </div>
      </div>

      {/* Filters */}
      <Card className="mt-3 p-3 border-0 shadow-sm">
        <div className="d-flex gap-3 flex-wrap align-items-end">
          <div style={{ minWidth: 260 }}>
            <Form.Label>Date</Form.Label>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              dateFormat="dd/MM/yyyy"
              customInput={<DateInput placeholder="Start - End Date" />}
              wrapperClassName="w-100"
            />
          </div>

          <div style={{ minWidth: 220 }}>
            <Form.Label>Department</Form.Label>
            <Form.Select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option>Front Office</option>
              <option>HR</option>
              <option>Operations</option>
            </Form.Select>
          </div>

          <div style={{ minWidth: 220 }}>
            <Form.Label>Shift Type</Form.Label>
            <Form.Select
              value={shiftType}
              onChange={(e) => setShiftType(e.target.value)}
            >
              <option>Rotational</option>
              <option>Fixed</option>
            </Form.Select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="mt-4 border-0 shadow-sm custom-data-table">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Shift Roster Details</h5>
            <Form.Control
              type="text"
              placeholder="Search employee"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 250 }}
            />
          </div>

          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            highlightOnHover
            noDataComponent="No employees found"
          />
        </Card.Body>
      </Card>

      {/* Assign Shift Offcanvas */}
      <Offcanvas
        show={showAssign}
        onHide={() => setShowAssign(false)}
        placement="end"
        className="assign-shift-canvas"
      >
        <Offcanvas.Header closeButton className='border-bottom py-2'>
            <Offcanvas.Title>Assign Shift</Offcanvas.Title>
        </Offcanvas.Header>
      
        <Offcanvas.Body>
          <Form className="d-flex flex-column gap-3">
            <Form.Group>
              <Form.Label>Select Employee(s)</Form.Label>
              <CustomSelect
                isMulti
                options={employeeOptions}
                placeholder="Search Employee(s)"
                onChange={(val) =>
                  setAssignData(prev => ({ ...prev, employees: val }))
                }
              />

            </Form.Group>

            <Form.Group>
              <Form.Label>Shift Type *</Form.Label>
              <Form.Select
                value={assignData.shift}
                onChange={(e) =>
                  setAssignData(prev => ({ ...prev, shift: e.target.value }))
                }
              >
                <option>Morning (6:00 AM - 2:00 PM)</option>
                <option>Evening (2:00 PM - 10:00 PM)</option>
                <option>Night (10:00 PM - 6:00 AM)</option>
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Start Date *</Form.Label>
              <DatePicker
                selected={assignData.startDate}
                onChange={(date) =>
                  setAssignData(prev => ({ ...prev, startDate: date }))
                }
                dateFormat="dd/MM/yyyy"
                customInput={<DateInput placeholder="Start Date" />}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>End Date *</Form.Label>
              <DatePicker
                selected={assignData.endDate}
                onChange={(date) =>
                  setAssignData(prev => ({ ...prev, endDate: date }))
                }
                dateFormat="dd/MM/yyyy"
                customInput={<DateInput placeholder="End Date" />}
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Form.Group className="w-50">
                <Form.Label>Start Time</Form.Label>
                <DatePicker
                  selected={assignData.startTime}
                  onChange={(date) =>
                    setAssignData(prev => ({ ...prev, startTime: date }))
                  }
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  dateFormat="h:mm aa"
                  customInput={<Form.Control />}
                />
              </Form.Group>

              <Form.Group className="w-50">
                <Form.Label>End Time</Form.Label>
                <DatePicker
                  selected={assignData.endTime}
                  onChange={(date) =>
                    setAssignData(prev => ({ ...prev, endTime: date }))
                  }
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  dateFormat="h:mm aa"
                  customInput={<Form.Control />}
                />
              </Form.Group>
            </div>

            <Form.Group>
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Note Special Notes"
                value={assignData.notes}
                onChange={(e) =>
                  setAssignData(prev => ({ ...prev, notes: e.target.value }))
                }
              />
            </Form.Group>
          </Form>
        </Offcanvas.Body>

        <div className="p-3 border-top d-flex justify-content-between gap-3">
          <Button variant="outline-danger" className="w-50" onClick={() => setShowAssign(false)}>
            Cancel
          </Button>
          <Button variant="primary" className="w-50">Save Assignment</Button>
        </div>
      </Offcanvas>
    </Container>
  );
};

export default ShiftRoster;
