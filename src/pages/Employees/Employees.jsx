import { useMemo, useState, forwardRef } from 'react';
import { Card, Badge, Button, Form, InputGroup, Image } from "react-bootstrap";
import { Pencil } from "lucide-react";
import { Formik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import { BsCalendar3 } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

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


/* ================= EMPLOYEE DATA ================= */
const EMPLOYEES = [
    {
        id: 1,
        name: 'David Kumar',
        role: 'Executive',
        empId: 'EMP001',
        department: 'Front Office',
        shift: 'Morning (6AM–2PM)',
        doj: '2024-02-01',
        status: 'On Duty',
        type: 'Full Time',
        image: 'https://i.pravatar.cc/100?img=1',
    },
    {
        id: 2,
        name: 'Amit Sharma',
        role: 'Manager',
        empId: 'EMP002',
        department: 'Administration',
        shift: 'General (9AM–6PM)',
        doj: '2023-11-15',
        status: 'Leave',
        type: 'Full Time',
        image: 'https://i.pravatar.cc/100?img=2',
    },
    {
        id: 3,
        name: 'Rahul Singh',
        role: 'Receptionist',
        empId: 'EMP003',
        department: 'Front Office',
        shift: 'Evening (2PM–10PM)',
        doj: '2022-07-20',
        status: 'On Duty',
        type: 'Part Time',
        image: 'https://i.pravatar.cc/100?img=3',
    },
    {
        id: 4,
        name: 'Rohit Verma',
        role: 'Security',
        empId: 'EMP004',
        department: 'Security',
        shift: 'Night (10PM–6AM)',
        doj: '2021-05-10',
        status: 'Inactive',
        type: 'Contract',
        image: 'https://i.pravatar.cc/100?img=4',
    },
    {
        id: 5,
        name: 'Priya Verma',
        role: 'Security',
        empId: 'EMP004',
        department: 'Security',
        shift: 'Night (10PM–6AM)',
        doj: '2021-05-10',
        status: 'Inactive',
        type: 'Contract',
        image: 'https://i.pravatar.cc/100?img=5',
    },
    {
        id: 6,
        name: 'Rohit Verma',
        role: 'Security',
        empId: 'EMP004',
        department: 'Security',
        shift: 'Night (10PM–6AM)',
        doj: '2021-05-10',
        status: 'Inactive',
        type: 'Contract',
        image: 'https://i.pravatar.cc/100?img=6',
    },
    {
        id: 7,
        name: 'Rohit Verma',
        role: 'Security',
        empId: 'EMP004',
        department: 'Security',
        shift: 'Night (10PM–6AM)',
        doj: '2021-05-10',
        status: 'Inactive',
        type: 'Contract',
        image: 'https://i.pravatar.cc/100?img=7',
    },
    {
        id: 8,
        name: 'Rohit Verma',
        role: 'Security',
        empId: 'EMP004',
        department: 'Security',
        shift: 'Night (10PM–6AM)',
        doj: '2021-05-10',
        status: 'Inactive',
        type: 'Contract',
        image: 'https://i.pravatar.cc/100?img=8',
    },
];

/* ================= COMPONENT ================= */
const Employees = () => {
    
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        startDate: null,
        endDate: null,
        department: '',
        staff: '',
        status: '',
    });

    const filteredEmployees = useMemo(() => {
        return EMPLOYEES.filter(emp => {
            const dojDate = new Date(emp.doj);

            if (filters.department && emp.department !== filters.department) return false;
            if (filters.staff && emp.name !== filters.staff) return false;
            if (filters.status && emp.status !== filters.status) return false;
            if (filters.startDate && dojDate < filters.startDate) return false;
            if (filters.endDate && dojDate > filters.endDate) return false;

            return true;
        });
    }, [filters]);

    return (
        <div className="container-fluid g-0">

            {/* Header */}
            <div className="mt-3 d-flex justify-content-between align-items-center flex-wrap">
                <div>
                    <h5 className="mb-0">Employee Directory</h5>
                    <small>{filteredEmployees.length} Employees</small>
                </div>
                <Button size="sm" onClick={() => navigate('/employees/add')}>Add New Employee</Button>
            </div>

            {/* Filters */}
            <Card className="shadow-sm border-0 mt-3">
                <Card.Body>
                    <Formik
                        initialValues={filters}
                        validationSchema={filterSchema}
                        onSubmit={() => { }}
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
                                            onChange={date =>
                                                setFilters(p => ({ ...p, startDate: date }))
                                            }
                                            customInput={<DateInput placeholder="Start" />}
                                            wrapperClassName="w-100"
                                        />
                                        <DatePicker
                                            selected={filters.endDate}
                                            placeholderText="End date"
                                            onChange={date =>
                                                setFilters(p => ({ ...p, endDate: date }))
                                            }
                                            minDate={filters.startDate}
                                            customInput={<DateInput placeholder="End" />}
                                            wrapperClassName="w-100"
                                        />
                                    </div>
                                </div>

                                {/* Department */}
                                <div className="flex-fill">
                                    <Form.Label>Department</Form.Label>
                                    <Form.Select
                                        onChange={e =>
                                            setFilters(p => ({ ...p, department: e.target.value }))
                                        }
                                    >
                                        <option value="">All</option>
                                        {[...new Set(EMPLOYEES.map(e => e.department))].map(dep => (
                                            <option key={dep}>{dep}</option>
                                        ))}
                                    </Form.Select>
                                </div>

                                {/* Staff */}
                                <div className="flex-fill">
                                    <Form.Label>Staff</Form.Label>
                                    <Form.Select
                                        onChange={e =>
                                            setFilters(p => ({ ...p, staff: e.target.value }))
                                        }
                                    >
                                        <option value="">All</option>
                                        {EMPLOYEES.map(emp => (
                                            <option key={emp.id}>{emp.name}</option>
                                        ))}
                                    </Form.Select>
                                </div>

                                {/* Status */}
                                <div className="flex-fill">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        onChange={e =>
                                            setFilters(p => ({ ...p, status: e.target.value }))
                                        }
                                    >
                                        <option value="">All</option>
                                        {[...new Set(EMPLOYEES.map(e => e.status))].map(st => (
                                            <option key={st}>{st}</option>
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


            {/* Employee Cards */}
            <div className="row g-3 mt-3">
                {filteredEmployees.map(emp => (
                    <div key={emp.id} className="col-xl-3 col-lg-4 col-md-6">
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="d-flex gap-2">
                                        <Image
                                            src={emp.image}
                                            rounded
                                            width={45}
                                            height={45}
                                        />
                                        <div className="lh-1">
                                            <div className="fw-semibold mb-1 fs-14">{emp.name}</div>
                                            <p className="text-muted mb-1 fs-12">{emp.role}</p>
                                            <p className="text-muted mb-1 fs-12">{emp.empId}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" width={32} height={32} variant="light" className='rounded-circle'><Pencil size={14} /></Button>
                                </div>

                                <div className="small text-muted mt-2">
                                    <div>{emp.department}</div>
                                    <div>{emp.shift}</div>
                                    <div>DOJ: {emp.doj}</div>
                                </div>
                            </Card.Body>

                            <Card.Footer className="bg-white d-flex justify-content-between align-items-center border-0 pt-0">
                                <Badge bg={emp.status === 'On Duty' ? 'success-subtle text-success' : emp.status === 'Leave' ? 'warning-subtle text-warning' : 'secondary-subtle text-dark'} className='fw-semibold rounded-4'>
                                    {emp.status}
                                </Badge>
                                <Badge bg="primary-subtle text-primary" className="mb-0 fw-semibold rounded-4">{emp.type}</Badge>
                            </Card.Footer>
                        </Card>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default Employees;