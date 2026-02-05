import { useEffect, useMemo, useState } from 'react';
import { Card, Form, Button, Offcanvas, Badge } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { BiEditAlt } from "react-icons/bi";
import { Formik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import { BsCalendar3 } from 'react-icons/bs';
import { forwardRef } from 'react';
import { InputGroup } from 'react-bootstrap';
import { IoEyeOutline } from "react-icons/io5";
import { RiInformation2Line } from "react-icons/ri";


import {
  BsCheckCircleFill,
  BsClockFill,
  BsXCircleFill,
} from "react-icons/bs";


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
        status: 'Approved',
        fromDate: '03-02-2026',
        toDate: '03-03-2026',
        totalDays: '8 days',
    },
    {
        id: 2,
        employeeId: 'EMP-002',
        name: 'Ravi Sharma',
        shift: 'Afternoon',
        shiftTime: '(10 AM - 7 PM)',
        role: 'User',
        status: 'Pending',
        fromDate: '03-02-2026',
        toDate: '03-03-2026',
        totalDays: '18 days'
    },
    {
        id: 3,
        employeeId: 'EMP-003',
        name: 'Pooja Singh',
        shift: 'Evening',
        shiftTime: '(5 PM - 1 AM)',
        role: 'Receptionist',
        status: 'Rejected',
        fromDate: '03-02-2026',
        toDate: '03-03-2026',
        totalDays: '15 days'
    },
];

const stats = [
    { title: 'Total On Leave', value: 16, color: 'primary' },
    { title: 'Total Leave Applications', value: 42, color: 'success' },
    { title: 'Pending Requests', value: 30, color: 'info' },
    { title: 'Pending Approval', value: 30, color: 'danger' },
];

/* ================= COMPONENT ================= */

const LeaveManagement = () => {
    const [showView, setShowView] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);

    const handleView = (row) => {
        setSelectedLeave(row);
        setShowView(true);
    };

    const handleClose = () => {
        setShowView(false);
        setSelectedLeave(null);
    };

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
            name: 'From',
            selector: row => row.fromDate,
            sortable: true,
        },
        {
            name: 'To',
            selector: row => row.toDate,
            sortable: true,
        },
        {
            name: 'Total Days',
            selector: row => row.totalDays,
            sortable: true,
        },
        {
            name: 'Status',
            selector: row => row.status,
            cell: row => {
                const statusMap = {
                    Approved: 'bg-success-subtle text-success border border-success',
                    Pending: 'bg-warning-subtle text-warning border border-warning',
                    Rejected: 'bg-danger-subtle text-danger border border-danger',
                };

                return (
                    <span
                        className={`badge rounded-4 py-1 px-2 fw-semibold ${statusMap[row.status] || 'bg-secondary-subtle text-secondary border border-secondary'
                            }`}
                    >
                        {row.status}
                    </span>
                );
            },
        },

        {
            name: 'Actions',
            cell: row => (
                <div className="d-flex gap-2">
                    <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => handleView(row)}
                    >
                        <IoEyeOutline />
                    </Button>
                </div>
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
                    <h5 className="mb-0">Leave Management</h5>
                    <small>Manage employee leave requests and track leave balances</small>
                </div>
            </div>

            {/* Stats */}
            <div className="d-flex gap-3 mt-3 flex-wrap">
                {stats.map((item, index) => (
                    <Card
                        key={index}
                        className={`flex-fill shadow-sm border-${item.color} bg-${item.color}-subtle`}
                        style={{ minWidth: 220 }}
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
                        <h5 className="mb-0">Leave Records</h5>
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
            <Offcanvas
                show={showView}
                onHide={handleClose}
                placement="end"
                backdrop
                scroll={false}
                className="d-flex flex-column"
            >
                <Offcanvas.Header closeButton className='border-bottom py-2'>
                    <Offcanvas.Title>Leave Request Details</Offcanvas.Title>
                </Offcanvas.Header>

                <Offcanvas.Body className="d-flex flex-column h-100">
                    {selectedLeave && (
                        <>
                            {/* Employee */}
                            <div className="mb-3">
                                <small className="text-muted">EMPLOYEE</small>
                                <div className="fw-semibold">{selectedLeave.name}</div>
                                <small className="text-muted">{selectedLeave.employeeId}</small>
                            </div>

                            {/* Leave Type */}
                            <div className="mb-3">
                                <small className="text-muted">LEAVE TYPE</small>
                                <div className=' fs-14'>Casual Leave</div>
                            </div>

                            {/* Leave Dates */}
                            <div className="mb-3">
                                <small className="text-muted">LEAVE DATES</small>

                                <Card className="border-0 bg-light mt-2">
                                    <Card.Body className="py-2 fs-14">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>From</span>
                                            <span>{selectedLeave.fromDate}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>To</span>
                                            <span>{selectedLeave.toDate}</span>
                                        </div>
                                        <hr className="my-2" />
                                        <div className="d-flex justify-content-between fw-semibold mb-2">
                                            <span>Total Days</span>
                                            <span>{selectedLeave.totalDays}</span>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>

                            {/* Status */}
                            <div className="mb-3">
                                <small className="text-muted">STATUS</small>
                                <div className='mt-1'>
                                   <Badge
                                        bg={
                                            selectedLeave.status === "Approved"
                                            ? "success"
                                            : selectedLeave.status === "Pending"
                                            ? "warning"
                                            : "danger"
                                        }
                                        className="px-3 py-2 rounded-4 fw-semibold d-inline-flex align-items-center gap-2"
                                        >
                                        {selectedLeave.status === "Approved" && <BsCheckCircleFill />}
                                        {selectedLeave.status === "Pending" && <RiInformation2Line />}
                                        {selectedLeave.status === "Rejected" && <BsXCircleFill />}

                                        {selectedLeave.status}
                                    </Badge>

                                </div>
                            </div>

                            {/* Reason */}
                            <div className="mb-4">
                                <small className="text-muted">REASON</small>
                                <p className="mb-0 mt-1 text-muted fs-14">
                                    Family vacation planned for winter break. Will ensure all tasks
                                    are completed before departure.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="mt-auto border-top pt-3">
                                <div className="d-flex gap-2">
                                    <Button variant="outline-danger" className="w-50">
                                        Reject
                                    </Button>
                                    <Button variant="primary" className="w-50">
                                        Approve
                                    </Button>
                                </div>
                            </div>


                        </>
                    )}
                </Offcanvas.Body>
            </Offcanvas>

        </div>
    );
};

export default LeaveManagement;
