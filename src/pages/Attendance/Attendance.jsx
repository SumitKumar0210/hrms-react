import { useEffect, useMemo, useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { BiEditAlt } from "react-icons/bi";
import { Formik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import { BsCalendar3 } from 'react-icons/bs';
import { forwardRef } from 'react';
import { InputGroup } from 'react-bootstrap';

const DateInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <InputGroup onClick={onClick} className="w-100">
    <Form.Control
      ref={ref}
      value={value}
      placeholder={placeholder}
      readOnly
    />
    <InputGroup.Text>
      <BsCalendar3 />
    </InputGroup.Text>
  </InputGroup>
));

/* ================= VALIDATION SCHEMA ================= */

const filterSchema = Yup.object({
  startDate: Yup.date().nullable(),
  endDate: Yup.date()
    .nullable()
    .min(Yup.ref('startDate'), 'End date must be after start date'),
  department: Yup.string(),
  staff: Yup.string(),
  status: Yup.string(),
});

/* ================= MOCK DATA ================= */
const mockData = [
  {
    id: 1,
    employeeId: 'EMP-001',
    name: 'Amit Kumar',
    shift: 'Morning',
    shiftTime: '(9 AM - 6 PM)',
    role: 'Admin',
    status: 'Active',
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    totalHours: 8.1,
  },
  {
    id: 2,
    employeeId: 'EMP-002',
    name: 'Ravi Sharma',
    shift: 'Afternoon',
    shiftTime: '(10 AM - 7 PM)',
    role: 'User',
    status: 'Inactive',
    checkIn: '09:15 AM',
    checkOut: '06:00 PM',
    totalHours: 7.75,
  },
  {
    id: 3,
    employeeId: 'EMP-003',
    name: 'Pooja Singh',
    shift: 'Evening',
    shiftTime: '(5 PM - 1 AM)',
    role: 'Manager',
    status: 'Active',
    checkIn: '08:50 AM',
    checkOut: '05:50 PM',
    totalHours: 8,
  },
];

const stats = [
  { title: 'Total Employees', value: 150, color: 'primary', bg: 'rgba(13,110,253,0.08)' },
  { title: 'On Time', value: 120, color: 'success', bg: 'rgba(25,135,84,0.08)' },
  { title: 'Late', value: 30, color: 'warning', bg: 'rgba(255,193,7,0.08)' },
  { title: 'Absent Today', value: 30, color: 'danger', bg: 'rgba(220,53,69,0.08)' },
  { title: 'Total Hours', value: 30, color: 'info', bg: 'rgba(103,58,183,0.08)' },
];

/* ================= COMPONENT ================= */

const Attendance = () => {
  const [data, setData] = useState(mockData);
  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState(mockData);
  const [loading] = useState(false);

  /* 🔍 Search */
  useEffect(() => {
    const result = data.filter(row =>
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      row.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredData(result);
  }, [search, data]);

  /* 🧱 Columns */
  const columns = useMemo(() => [
    {
      name: 'Employee',
      sortable: true,
      cell: row => (
        <div>
          <div className="fw-semibold">{row.name}</div>
          <small className="text-muted">{row.employeeId}</small>
        </div>
      ),
      selector: row => row.name, // used for sorting
    },
    {
      name: 'Department',
      selector: row => row.role,
      sortable: true,
    },
    {
      name: 'Shift',
      sortable: true,
      cell: row => (
        <div>
          <div className="">{row.shift}</div>
          <small className="text-muted">{row.shiftTime}</small>
        </div>
      ),
      selector: row => row.shift,

    },
    {
      name: 'Check-In',
      selector: row => row.checkIn,
      sortable: true,
    },
    {
      name: 'Check-Out',
      selector: row => row.checkOut,
      sortable: true,
    },
    {
      name: 'Total Hours',
      selector: row => row.totalHours,
      sortable: true,
    },
    {
      name: 'Status',
      selector: row => row.status,
      cell: row => (
        <span
          className={`badge rounded-1 fw-normal ${row.status === 'Active' ? 'bg-success' : 'bg-secondary'
            }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: 'Actions',
      cell: row => (
        <Button
          size="sm"
          onClick={() => handleEdit(row)}
          className="rounded-circle bg-primary-subtle border-primary-subtle text-primary"
          style={{ width: 32, height: 32 }}
        >
          <BiEditAlt size={18} />
        </Button>
      ),
    },
  ], []);

  /* ✏️ Edit */
  const handleEdit = (row) => {
    alert(`Edit user: ${row.name}`);
  };
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    department: '',
    staff: '',
    status: '',
  });

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
          const rowDate = new Date('2026-01-22'); // replace with real date
          return (
            rowDate >= filters.startDate &&
            rowDate <= filters.endDate
          );
        });
      }

      if (search) {
        result = result.filter(row =>
          row.name.toLowerCase().includes(search.toLowerCase()) ||
          row.employeeId.toLowerCase().includes(search.toLowerCase())
        );
      }

      setFilteredData(result);
    }, 400); // 🎯 debounce

    return () => clearTimeout(timer);
  }, [filters, search, data]);

  return (
    <div className="container-fluid g-0">
      {/* Header */}
      <div className="mt-3 d-flex justify-content-between align-items-center gap-3 flex-wrap">
        <div>
          <h5 className="mb-0">Attendance & Time Tracking</h5>
          <small>Monitor and manage hotel staff attendance</small>
        </div>

        <div className="d-flex gap-3">
          <Button
            type="button"
            variant="outline-secondary"
            className="fw-normal btn-sm py-2 px-3"
          >
            Download Sample
          </Button>

          <Button
            type="button"
            variant="primary"
            className="fw-normal btn-sm py-2 px-3"
          >
            Upload Attendance
          </Button>
        </div>
      </div>


      {/* Stats */}
      <div className="d-flex gap-3 mt-3 flex-wrap">
        {stats.map((item, index) => (
          <Card
            key={index}
            className={`flex-fill shadow-sm border-${item.color}`}
            style={{ backgroundColor: item.bg, minWidth: 220 }}
          >
            <Card.Body>
              <h6 className={`mb-0 text-${item.color}`}>{item.title}</h6>
              <h3 className={`mb-0 text-${item.color}`}>{item.value}</h3>
            </Card.Body>
          </Card>
        ))}
      </div>
      {/* Filter  */}
      <Card className="shadow-sm border-0 mt-4">
        <Card.Body>
          <Formik
            initialValues={filters}
            validationSchema={filterSchema}
            onSubmit={() => { }}
          >
            {({ resetForm }) => (
              <Form>
                <div className="d-flex flex-wrap gap-3 align-items-end">

                  {/* Date Range */}
                  <div className="flex-fill">
                    <Form.Label>Date</Form.Label>

                    <div className="d-flex gap-2 w-100">
                      {/* Start Date */}
                      <div className="w-100">
                        <DatePicker
                          selected={filters.startDate}
                          onChange={(date) =>
                            setFilters(prev => ({ ...prev, startDate: date }))
                          }
                          selectsStart
                          startDate={filters.startDate}
                          endDate={filters.endDate}
                          placeholderText="Start date"
                          customInput={
                            <DateInput placeholder="Start date" />
                          }
                          wrapperClassName="w-100"
                        />
                      </div>

                      {/* End Date */}
                      <div className="w-100">
                        <DatePicker
                          selected={filters.endDate}
                          onChange={(date) =>
                            setFilters(prev => ({ ...prev, endDate: date }))
                          }
                          selectsEnd
                          startDate={filters.startDate}
                          endDate={filters.endDate}
                          minDate={filters.startDate}
                          placeholderText="End date"
                          customInput={
                            <DateInput placeholder="End date" />
                          }
                          wrapperClassName="w-100"
                        />
                      </div>
                    </div>
                  </div>


                  {/* Department */}
                  <div className="flex-fill">
                    <Form.Label>Department</Form.Label>
                    <Form.Select
                      value={filters.department}
                      onChange={(e) =>
                        setFilters(prev => ({ ...prev, department: e.target.value }))
                      }
                      className="w-100"
                    >
                      <option value="">All Departments</option>
                      <option value="Admin">Admin</option>
                      <option value="User">User</option>
                      <option value="Manager">Manager</option>
                    </Form.Select>
                  </div>

                  {/* Staff */}
                  <div className="flex-fill">
                    <Form.Label>Staff</Form.Label>
                    <Form.Select
                      value={filters.staff}
                      onChange={(e) =>
                        setFilters(prev => ({ ...prev, staff: e.target.value }))
                      }
                      className="w-100"
                    >
                      <option value="">All Staff</option>
                      {data.map(emp => (
                        <option key={emp.id} value={emp.name}>
                          {emp.name}
                        </option>
                      ))}
                    </Form.Select>
                  </div>

                  {/* Status */}
                  <div className="flex-fill">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters(prev => ({ ...prev, status: e.target.value }))
                      }
                      className="w-100"
                    >
                      <option value="">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </Form.Select>
                  </div>

                  {/* Reset */}
                  <div className="flex-fill">
                    <Button
                      variant="outline-secondary"
                      className="w-100"
                      style={{ height: 38 }}
                      onClick={() => {
                        resetForm();
                        setFilters({
                          startDate: null,
                          endDate: null,
                          department: '',
                          staff: '',
                          status: '',
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
      <Card className="shadow-sm border-0 mt-4 custom-data-table">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Employees</h5>
            <Form.Control
              type="text"
              placeholder="Search..."
              style={{ maxWidth: 250 }}
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
            persistTableHead
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default Attendance;
