import { useMemo, useState, useEffect, forwardRef } from 'react';
import { Card, Badge, Button, Form, InputGroup, Image, Spinner, Alert } from "react-bootstrap";
import { Pencil, Trash2 } from "lucide-react";
import { Formik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import { BsCalendar3 } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchEmployees,
    deleteEmployee,
    toggleEmployeeStatus,
    clearError,
    clearSuccess,
} from './slice/employeeSlice';

/* ================= DATE INPUT ================= */
const DateInput = forwardRef(({ value, onClick, placeholder }, ref) => (
    <InputGroup onClick={onClick} className="w-100">
        <Form.Control ref={ref} value={value} placeholder={placeholder} readOnly />
        <InputGroup.Text><BsCalendar3 /></InputGroup.Text>
    </InputGroup>
));

/* ================= VALIDATION ================= */
const filterSchema = Yup.object({
    startDate: Yup.date().nullable(),
    endDate: Yup.date()
        .nullable()
        .min(Yup.ref('startDate'), 'End date must be after start date'),
});

/* ================= COMPONENT ================= */
const Employees = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redux state
    const { employees, loading, error, pagination } = useSelector((state) => state.employee);

    const [filters, setFilters] = useState({
        startDate: null,
        endDate: null,
        department: '',
        staff: '',
        status: '',
    });

    // Fetch employees on mount
    useEffect(() => {
        dispatch(fetchEmployees({ page: 1, limit: 100 }));
    }, [dispatch]);

    // Clear error on unmount
    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    // Filter employees
    const filteredEmployees = useMemo(() => {
        if (!employees || employees.length === 0) return [];

        return employees.filter((emp) => {
            const dojDate = emp.doj ? new Date(emp.doj) : null;

            if (filters.department && emp.department !== filters.department) return false;
            if (filters.staff && emp.name !== filters.staff) return false;
            if (filters.status && emp.status !== filters.status) return false;
            if (filters.startDate && dojDate && dojDate < filters.startDate) return false;
            if (filters.endDate && dojDate && dojDate > filters.endDate) return false;

            return true;
        });
    }, [employees, filters]);

    // Get unique departments
    const departments = useMemo(() => {
        if (!employees) return [];
        return [...new Set(employees.map((e) => e.department).filter(Boolean))];
    }, [employees]);

    // Get unique statuses
    const statuses = useMemo(() => {
        if (!employees) return [];
        return [...new Set(employees.map((e) => e.status).filter(Boolean))];
    }, [employees]);

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                await dispatch(deleteEmployee(id)).unwrap();
            } catch (err) {
                console.error('Delete failed:', err);
            }
        }
    };

    // Handle status toggle
    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === 'On Duty' ? 'Inactive' : 'On Duty';
        try {
            await dispatch(toggleEmployeeStatus({ id, status: newStatus })).unwrap();
        } catch (err) {
            console.error('Status toggle failed:', err);
        }
    };

    // Handle edit
    const handleEdit = (id) => {
        navigate(`/employees/edit/${id}`);
    };

    return (
        <div className="container-fluid g-0">
            {/* Header */}
            <div className="mt-3 d-flex justify-content-between align-items-center flex-wrap">
                <div>
                    <h5 className="mb-0">Employee Directory</h5>
                    <small>
                        {loading ? (
                            'Loading...'
                        ) : (
                            `${filteredEmployees.length} Employee${
                                filteredEmployees.length !== 1 ? 's' : ''
                            }`
                        )}
                    </small>
                </div>
                <Button size="sm" onClick={() => navigate('/employees/add')}>
                    Add New Employee
                </Button>
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
                    <Formik
                        initialValues={filters}
                        validationSchema={filterSchema}
                        onSubmit={() => {}}
                    >
                        {({ resetForm }) => (
                            <Form className="d-flex flex-wrap align-items-end gap-3">
                                {/* Date Range */}
                                <div className="flex-fill flex-grow-1">
                                    <Form.Label>Date of Joining</Form.Label>
                                    <div className="d-flex gap-2">
                                        <DatePicker
                                            selected={filters.startDate}
                                            placeholderText="Start date"
                                            onChange={(date) =>
                                                setFilters((p) => ({ ...p, startDate: date }))
                                            }
                                            customInput={<DateInput placeholder="Start" />}
                                            wrapperClassName="w-100"
                                            dateFormat="yyyy-MM-dd"
                                        />
                                        <DatePicker
                                            selected={filters.endDate}
                                            placeholderText="End date"
                                            onChange={(date) =>
                                                setFilters((p) => ({ ...p, endDate: date }))
                                            }
                                            minDate={filters.startDate}
                                            customInput={<DateInput placeholder="End" />}
                                            wrapperClassName="w-100"
                                            dateFormat="yyyy-MM-dd"
                                        />
                                    </div>
                                </div>

                                {/* Department */}
                                <div className="flex-fill">
                                    <Form.Label>Department</Form.Label>
                                    <Form.Select
                                        value={filters.department}
                                        onChange={(e) =>
                                            setFilters((p) => ({ ...p, department: e.target.value }))
                                        }
                                    >
                                        <option value="">All</option>
                                        {/* {departments.map((dep) => (
                                            <option key={dep} value={dep}>
                                                {dep}
                                            </option>
                                        ))} */}
                                    </Form.Select>
                                </div>

                                {/* Staff */}
                                <div className="flex-fill">
                                    <Form.Label>Staff</Form.Label>
                                    <Form.Select
                                        value={filters.staff}
                                        onChange={(e) =>
                                            setFilters((p) => ({ ...p, staff: e.target.value }))
                                        }
                                    >
                                        <option value="">All</option>
                                        {employees?.map((emp) => (
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
                                            setFilters((p) => ({ ...p, status: e.target.value }))
                                        }
                                    >
                                        <option value="">All</option>
                                        {statuses.map((st) => (
                                            <option key={st} value={st}>
                                                {st}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </div>

                                {/* Reset */}
                                <div className="flex-fill">
                                    <Button
                                        variant="outline-secondary"
                                        className="w-100"
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
                            </Form>
                        )}
                    </Formik>
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
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => navigate('/employees/add')}
                                className="mt-2"
                            >
                                Add Employee
                            </Button>
                        )}
                    </Card.Body>
                </Card>
            )}

            {/* Employee Cards */}
            {!loading && filteredEmployees.length > 0 && (
                <div className="row g-3 mt-3">
                    {filteredEmployees.map((emp) => (
                        <div key={emp.id} className="col-xl-3 col-lg-4 col-md-6">
                            <Card className="h-100 shadow-sm border-0">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="d-flex gap-2">
                                            <Image
                                                src={emp.image || `https://ui-avatars.com/api/?name=${emp.name}&background=random`}
                                                rounded
                                                width={45}
                                                height={45}
                                                className="object-fit-cover"
                                            />
                                            <div className="lh-1">
                                                <div className="fw-semibold mb-1 fs-14">
                                                    {emp.first_name +' '+ emp.last_name || 'N/A'}
                                                </div>
                                                <p className="text-muted mb-1 fs-12">
                                                    { emp.designation || 'N/A'}
                                                </p>
                                                <p className="text-muted mb-1 fs-12">
                                                    { emp.employee_code || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="d-flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="light"
                                                className="rounded-circle p-1"
                                                style={{ width: 32, height: 32 }}
                                                onClick={() => handleEdit(emp.id)}
                                                title="Edit"
                                            >
                                                <Pencil size={14} />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="light"
                                                className="rounded-circle p-1"
                                                style={{ width: 32, height: 32 }}
                                                onClick={() => handleDelete(emp.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={14} className="text-danger" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="small text-muted mt-2">
                                        <div>{emp.department.name || 'N/A'}</div>
                                        <div>{emp.shift || emp.shift_timing || 'N/A'}</div>
                                        <div>
                                            DOJ:{' '}
                                            {emp.date_of_joining
                                                ? new Date(emp.date_of_joining).toLocaleDateString()
                                                : 'N/A'}
                                        </div>
                                    </div>
                                </Card.Body>

                                <Card.Footer className="bg-white d-flex justify-content-between align-items-center border-0 pt-0">
                                    <Badge
                                        bg={
                                            emp.status === 'On Duty'
                                                ? 'success-subtle text-success'
                                                : emp.status === 'Leave'
                                                ? 'warning-subtle text-warning'
                                                : 'secondary-subtle text-dark'
                                        }
                                        className="fw-semibold rounded-4"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleStatusToggle(emp.id, emp.status)}
                                        title="Click to toggle status"
                                    >
                                        {emp.status || 'Inactive'}
                                    </Badge>
                                    <Badge
                                        bg="primary-subtle text-primary"
                                        className="mb-0 fw-semibold rounded-4"
                                    >
                                        {emp.type || emp.employment_type || 'N/A'}
                                    </Badge>
                                </Card.Footer>
                            </Card>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Employees;