import { useMemo, useState, useEffect, forwardRef } from 'react';
import { Card, Badge, Button, Form, InputGroup, Image, Spinner, Alert } from "react-bootstrap";
import { Pencil, Trash2 } from "lucide-react";
import DatePicker from 'react-datepicker';
import { BsCalendar3 } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from "react-bootstrap";
import {
    fetchEmployees,
    deleteEmployee,
    toggleEmployeeStatus,
    clearError,
    clearSuccess,
} from './slice/employeeSlice';
import { useAuth } from '../../context/AuthContext';

/* ================= DATE INPUT ================= */
const DateInput = forwardRef(({ value, onClick, placeholder }, ref) => (
    <InputGroup onClick={onClick} className="w-100">
        <Form.Control ref={ref} value={value} placeholder={placeholder} readOnly />
        <InputGroup.Text><BsCalendar3 /></InputGroup.Text>
    </InputGroup>
));

/* ================= COMPONENT ================= */
const Employees = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { hasPermission } = useAuth();

    const [showDelete, setShowDelete] = useState(false);
    const [deleteRow, setDeleteRow] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const { employees, loading, error } = useSelector((state) => state.employee);

    const [filters, setFilters] = useState({
        search: '',
        startDate: null,
        endDate: null,
        department: '',
        status: '',
    });

    // Fetch employees on mount
    useEffect(() => {
        dispatch(fetchEmployees({ page: 1, limit: 100 }));
    }, [dispatch]);

    // Clear error on unmount
    useEffect(() => {
        return () => { dispatch(clearError()); };
    }, [dispatch]);

    // ── Filter employees client-side ──────────────────────────────────────────
    const filteredEmployees = useMemo(() => {
        if (!employees || employees.length === 0) return [];

        return employees.filter((emp) => {
            const fullName = `${emp.first_name ?? ''} ${emp.last_name ?? ''}`.toLowerCase();
            const dojDate = emp.date_of_joining ? new Date(emp.date_of_joining) : null;

            // Search: name, email, mobile, employee_code
            if (filters.search) {
                const q = filters.search.toLowerCase();
                const match =
                    fullName.includes(q) ||
                    (emp.email ?? '').toLowerCase().includes(q) ||
                    (emp.mobile ?? '').includes(q) ||
                    (emp.employee_code ?? '').toLowerCase().includes(q);
                if (!match) return false;
            }

            // Department — compare by department.id (value from select)
            if (filters.department && String(emp.department?.id) !== String(filters.department))
                return false;

            // Status — backend returns "active" / "inactive"
            if (filters.status && emp.status !== filters.status)
                return false;

            // Date range
            if (filters.startDate && dojDate && dojDate < filters.startDate) return false;
            if (filters.endDate && dojDate && dojDate > filters.endDate) return false;

            return true;
        });
    }, [employees, filters]);

    // Get unique departments from data
    const departments = useMemo(() => {
        if (!employees) return [];
        const seen = new Map();
        employees.forEach((e) => {
            if (e.department?.id) seen.set(e.department.id, e.department.name);
        });
        return [...seen.entries()].map(([id, name]) => ({ id, name }));
    }, [employees]);

    // Get unique statuses from data
    const statuses = useMemo(() => {
        if (!employees) return [];
        return [...new Set(employees.map((e) => e.status).filter(Boolean))];
    }, [employees]);

    // Reset filters
    const resetFilters = () => {
        setFilters({ search: '', startDate: null, endDate: null, department: '', status: '' });
    };

    // Handle delete
    const handleDelete = (employee) => {
        setDeleteRow(employee);
        setShowDelete(true);
    };

    const confirmDelete = async () => {
        if (!deleteRow) return;
        try {
            setDeleting(true);
            await dispatch(deleteEmployee(deleteRow.id)).unwrap();
            setShowDelete(false);
            setDeleteRow(null);
        } catch (err) {
            console.error('Delete failed:', err);
        } finally {
            setDeleting(false);
        }
    };

    // Handle status toggle
    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await dispatch(toggleEmployeeStatus({ id, status: newStatus })).unwrap();
        } catch (err) {
            console.error('Status toggle failed:', err);
        }
    };

    // Status badge color
    const statusBadge = (status) => {
        switch (status) {
            case 'active':   return 'success';
            case 'inactive': return 'secondary';
            case 'on_leave': return 'warning';
            default:         return 'secondary';
        }
    };

    return (
        <div className="container-fluid g-0">

            {/* Header */}
            <div className="mt-3 d-flex justify-content-between align-items-center flex-wrap">
                <div>
                    <h5 className="mb-0">Employee Directory</h5>
                    <small className="text-muted">
                        {loading ? 'Loading...' : `${filteredEmployees.length} Employee${filteredEmployees.length !== 1 ? 's' : ''}`}
                    </small>
                </div>
                {hasPermission('staff_directory.create') && (
                    <Button size="sm" onClick={() => navigate('/employees/add')}>
                        Add New Employee
                    </Button>
                )}
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="danger" dismissible onClose={() => dispatch(clearError())} className="mt-3">
                    {error}
                </Alert>
            )}

            {/* Filters */}
            <Card className="shadow-sm border-0 mt-3">
                <Card.Body>
                    <div className="d-flex flex-wrap align-items-end gap-3">

                        {/* Search */}
                        <div className="flex-fill" style={{ minWidth: 180 }}>
                            <Form.Label>Search</Form.Label>
                            <Form.Control
                                placeholder="Name, email, mobile, code..."
                                value={filters.search}
                                onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                            />
                        </div>

                        {/* Date Range */}
                        <div className="flex-fill flex-grow-1" style={{ minWidth: 260 }}>
                            <Form.Label>Date of Joining</Form.Label>
                            <div className="d-flex gap-2">
                                <DatePicker
                                    selected={filters.startDate}
                                    placeholderText="Start date"
                                    onChange={(date) => setFilters((p) => ({ ...p, startDate: date }))}
                                    customInput={<DateInput placeholder="Start" />}
                                    wrapperClassName="w-100"
                                    dateFormat="yyyy-MM-dd"
                                />
                                <DatePicker
                                    selected={filters.endDate}
                                    placeholderText="End date"
                                    onChange={(date) => setFilters((p) => ({ ...p, endDate: date }))}
                                    minDate={filters.startDate}
                                    customInput={<DateInput placeholder="End" />}
                                    wrapperClassName="w-100"
                                    dateFormat="yyyy-MM-dd"
                                />
                            </div>
                        </div>

                        {/* Department — uses department.id as value */}
                        <div className="flex-fill" style={{ minWidth: 150 }}>
                            <Form.Label>Department</Form.Label>
                            <Form.Select
                                value={filters.department}
                                onChange={(e) => setFilters((p) => ({ ...p, department: e.target.value }))}
                            >
                                <option value="">All</option>
                                {departments.map(({ id, name }) => (
                                    <option key={id} value={id}>{name}</option>
                                ))}
                            </Form.Select>
                        </div>

                        {/* Status */}
                        <div className="flex-fill" style={{ minWidth: 130 }}>
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                value={filters.status}
                                onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                            >
                                <option value="">All</option>
                                {statuses.map((st) => (
                                    <option key={st} value={st}>
                                        {st.charAt(0).toUpperCase() + st.slice(1).replace('_', ' ')}
                                    </option>
                                ))}
                            </Form.Select>
                        </div>

                        {/* Reset */}
                        <div>
                            <Button variant="outline-secondary" onClick={resetFilters}>
                                Reset
                            </Button>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Loading Spinner */}
            {loading && (
                <div className="text-center mt-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Loading employees...</p>
                </div>
            )}

            {/* No Employees */}
            {!loading && filteredEmployees.length === 0 && (
                <Card className="shadow-sm border-0 mt-3">
                    <Card.Body className="text-center py-5">
                        <h6 className="text-muted">No employees found</h6>
                        <p className="text-muted small">
                            {employees?.length === 0
                                ? 'Start by adding your first employee'
                                : 'Try adjusting your filters'}
                        </p>
                        {employees?.length === 0 && (
                            <Button variant="primary" size="sm" onClick={() => navigate('/employees/add')} className="mt-2">
                                Add Employee
                            </Button>
                        )}
                    </Card.Body>
                </Card>
            )}

            {/* Employee Cards */}
            {!loading && filteredEmployees.length > 0 && (
                <div className="row g-3 mt-1">
                    {filteredEmployees.map((emp) => (
                        <div key={emp.id} className="col-xl-3 col-lg-4 col-md-6">
                            <Card className="h-100 shadow-sm border-0">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="d-flex gap-2">
                                            <Image
                                                src={
                                                    emp.image ||
                                                    `https://ui-avatars.com/api/?name=${emp.first_name}+${emp.last_name}&background=random`
                                                }
                                                rounded
                                                width={45}
                                                height={45}
                                                className="object-fit-cover"
                                            />
                                            <div className="lh-1">
                                                <div className="fw-semibold mb-1 fs-14">
                                                    {`${emp.first_name ?? ''} ${emp.last_name ?? ''}`.trim() || 'N/A'}
                                                </div>
                                                <p className="text-muted mb-1 fs-12">
                                                    {emp.designation?.name || 'N/A'}
                                                </p>
                                                <p className="text-muted mb-1 fs-12">
                                                    {emp.employee_code || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="d-flex gap-1">
                                            {hasPermission('staff_directory.update') && (
                                                <Button
                                                    size="sm" variant="light"
                                                    className="rounded-circle p-1"
                                                    style={{ width: 32, height: 32 }}
                                                    onClick={() => navigate(`/employees/edit/${emp.id}`)}
                                                    title="Edit"
                                                >
                                                    <Pencil size={14} />
                                                </Button>
                                            )}
                                            {hasPermission('staff_directory.delete') && (
                                                <Button
                                                    size="sm" variant="light"
                                                    className="rounded-circle p-1"
                                                    style={{ width: 32, height: 32 }}
                                                    onClick={() => handleDelete(emp)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} className="text-danger" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="small text-muted mt-2">
                                        <div>{emp?.department?.name || 'N/A'}</div>
                                        <div>
                                            {emp?.shift?.name || 'N/A'} (
                                            {emp?.shift?.employee_shift?.[0]?.sign_in
                                                ? `${emp.shift.employee_shift[0].sign_in} - ${emp.shift.employee_shift[0].sign_out}`
                                                : emp?.shift?.sign_in
                                                    ? `${emp.shift.sign_in} - ${emp?.shift?.sign_out ?? 'N/A'}`
                                                    : 'N/A'
                                            })
                                        </div>
                                        <div>
                                            DOJ:{' '}
                                            {emp.date_of_joining
                                                ? new Date(emp.date_of_joining).toLocaleDateString()
                                                : 'N/A'}
                                        </div>
                                    </div>
                                </Card.Body>

                                <Card.Footer className="bg-white d-flex justify-content-between align-items-center border-0 pt-0">
                                    {hasPermission('staff_directory.update') ? (
                                        <Badge
                                            bg={statusBadge(emp.status)}
                                            className="fw-semibold rounded-4"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleStatusToggle(emp.id, emp.status)}
                                            title="Click to toggle status"
                                        >
                                            {emp.status
                                                ? emp.status.charAt(0).toUpperCase() + emp.status.slice(1).replace('_', ' ')
                                                : 'Inactive'}
                                        </Badge>
                                    ) : (
                                        <Badge bg={statusBadge(emp.status)} className="fw-semibold rounded-4">
                                            {emp.status || 'Inactive'}
                                        </Badge>
                                    )}
                                </Card.Footer>
                            </Card>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirm Modal */}
            <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="h6 fw-bold">Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-0">
                        Are you sure you want to delete{' '}
                        <strong>{deleteRow?.first_name} {deleteRow?.last_name}</strong>?
                        <br />
                        <small className="text-muted">This action cannot be undone.</small>
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDelete(false)} disabled={deleting}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
                        {deleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Employees;