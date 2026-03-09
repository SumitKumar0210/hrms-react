import React, { useState, useEffect } from 'react';
import { Container, Card, CardBody, CardHeader, Col, Image, Row, Badge, Dropdown, Table } from 'react-bootstrap';
import CustomSwitch from '../../components/Customswitch/Customswitch';
import { LuDollarSign, LuPhone } from "react-icons/lu";
import { MdAlternateEmail } from "react-icons/md";
import Select from 'react-select';
import { SlGrid } from "react-icons/sl";
import { BsLayoutThreeColumns } from "react-icons/bs";
import { RiArrowDownSLine } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import { BiLogInCircle } from "react-icons/bi";
import { LuFilePen } from "react-icons/lu";
import { useDispatch, useSelector } from 'react-redux';
import { getUsers, updateStatus } from './slice/userSlice';
import { fetchAllEmployees, toggleEmployeeStatus } from '../Employees/slice/employeeSlice';

const User = () => {
  const dispatch = useDispatch();

  const [layout, setLayout] = useState('card');
  const [show, setShow] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState({ value: 'all', label: 'All' });

  // Redux state
  const { data: usersData, loading: usersLoading } = useSelector((state) => state.user);
  const { employees: employeesData, loading: empLoading } = useSelector((state) => state.employee);

  useEffect(() => {
    dispatch(getUsers());
    dispatch(fetchAllEmployees());
  }, [dispatch]);

  // ─── Normalize Users ───────────────────────────────────────────────────────
  const normalizedUsers = (usersData || []).map((u) => ({
    id: u.id,
    name: u.name,
    phone: u.phone || u.mobile || '—',
    email: u.email,
    designation: u.designation || '—',
    crew: u.crew || '—',
    payoutRate: u.payout_rate || u.payoutRate || '—',
    profile: u.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&size=48&background=f3f2ff&color=5174f3`,
    userType: 'user',
    // API returns "1" / "0" or "active" / "inactive"
    status: u.status === '1' || u.status === 'active' ? 'active' : 'inactive',
    rawStatus: u.status,
  }));

  // ─── Normalize Employees ───────────────────────────────────────────────────
  const normalizedEmployees = (employeesData || []).map((e) => ({
    id: e.id,
    name: `${e.first_name} ${e.last_name}`,
    phone: e.mobile || '—',
    email: e.email || '—',
    designation: e.designation?.name || '—',
    crew: e.department?.name || '—',
    payoutRate: e.salaries?.[0]?.amount || '—',
    profile:
      e.profile_photo_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(e.first_name + '+' + e.last_name)}&size=48&background=f3f2ff&color=5174f3`,
    userType: 'employee',
    status: e.status === 'active' ? 'active' : 'inactive',
    rawStatus: e.status,
  }));

  // ─── Merge both lists ──────────────────────────────────────────────────────
  const allUsers = [...normalizedUsers, ...normalizedEmployees];

  // ─── Dynamic designation options from data ─────────────────────────────────
  const designationSet = new Set(allUsers.map((u) => u.designation).filter((d) => d && d !== '—'));
  const designationOptions = [
    { value: 'all', label: 'All' },
    ...Array.from(designationSet).map((d) => ({ value: d.toLowerCase(), label: d })),
  ];

  // ─── Status options (removed "Fired") ─────────────────────────────────────
  const statusOptions = [
    { label: 'Active', color: '#0f883930' },
    { label: 'Inactive', color: '#cfb00f66' },
  ];

  // ─── Layout options ────────────────────────────────────────────────────────
  const layoutOptions = {
    card: { icon: <SlGrid />, label: 'As Card' },
    table: { icon: <BsLayoutThreeColumns />, label: 'As Table' },
  };

  const handleSelect = (eventKey) => {
    setLayout(eventKey);
    setShow(false);
  };

  const handleClick = (status) => {
    setSelectedStatus((prev) => (prev === status ? null : status));
  };

  // ─── Toggle status handler ─────────────────────────────────────────────────
  const handleToggle = (item) => {
    if (item.userType === 'user') {
      dispatch(updateStatus({ id: item.id, status: item.status === 'active' ? '0' : '1' }));
      usersLoading = false;
    } else {
      dispatch(toggleEmployeeStatus({ id: item.id, status: item.status === 'active' ? 'inactive' : 'active' }));
    }
  };

  // ─── Filtering ─────────────────────────────────────────────────────────────
  const filteredUsers = allUsers.filter((user) => {
    const matchStatus = selectedStatus
      ? user.status.toLowerCase() === selectedStatus.toLowerCase()
      : true;
    const matchType = selectedType ? user.userType === selectedType : true;
    const matchDesignation =
      selectedDesignation?.value === 'all' ||
      user.designation.toLowerCase() === selectedDesignation?.value;
    return matchStatus && matchType && matchDesignation;
  });

  const isLoading = usersLoading || empLoading;

  return (
    <Container fluid className='gx-0'>
      <Row>
        <Col>
          <div className='d-flex justify-content-between align-items-center py-2'>
            <div className="page-header w-100">
              <h5 className='mb-0'>Users</h5>
            </div>
            <Dropdown show={show} onToggle={(isOpen) => setShow(isOpen)} onSelect={handleSelect}>
              <Dropdown.Toggle id="layout-dropdown" className='border bg-transparent text-dark'>
                <div>
                  {layoutOptions[layout].icon}
                  <span className='ms-2'><RiArrowDownSLine /></span>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {Object.entries(layoutOptions).map(([key, option]) => (
                  <Dropdown.Item eventKey={key} key={key}>
                    {option.icon} <span className='ms-2'>{option.label}</span>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className='border-0 pt-3'>
            <div className='d-flex justify-content-between align-items-center px-4 mb-2'>
              {/* Type filter */}
              <div className="d-flex align-items-center filter-btn-area">
                {['', 'user', 'employee'].map((type) => (
                  <div
                    key={type || 'all'}
                    className={`report-filter-btn btn ${selectedType === type ? 'active' : ''}`}
                    onClick={() => setSelectedType(type)}
                  >
                    <p className='mb-0'>
                      {type === '' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Status filter (Active / Inactive only) */}
              <div className="svg-container d-flex">
                {statusOptions.map(({ label, color }) => {
                  const isSelected = selectedStatus === label;
                  return (
                    <div
                      key={label}
                      className="svg-item position-relative"
                      onClick={() => handleClick(label)}
                      style={{ cursor: 'pointer' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="185 358.75 450 102.5">
                        <polygon
                          fill={isSelected ? color : '#fff'}
                          stroke={color}
                          strokeWidth="3"
                          points="564 460.25 186 460.25 256 410 186 359.75 564 359.75 634 410 564 460.25"
                        />
                      </svg>
                      <p className='mb-0'>{label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Designation filter */}
              <div>
                <Select
                  className="my-select"
                  classNamePrefix="custom"
                  options={designationOptions}
                  value={selectedDesignation}
                  onChange={setSelectedDesignation}
                  placeholder="Select designation..."
                />
              </div>
            </div>

            <div className='user-wrapper'>
              <CardBody className='py-0'>
                <div className='user-content'>
                  {isLoading ? (
                    <div className="text-center py-5">Loading...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-5 text-muted">No users found.</div>
                  ) : layout === 'card' ? (
                    <Row>
                      {filteredUsers.map((user) => (
                        <Col lg={3} sm={12} key={`${user.userType}-${user.id}`}>
                          <Card className='border-primary mb-3'>
                            <CardHeader className='bg-white'>
                              <div className='d-flex justify-content-between align-items-center'>
                                <div className='d-flex align-items-center'>
                                  <Image
                                    src={user.profile}
                                    roundedCircle
                                    alt={user.name}
                                    className='border p-1 avatar'
                                  />
                                  <div className="ms-2 ps-2 border-start">
                                    <label className="ps-1 d-block">{user.name}</label>
                                    <div>
                                      <Badge pill bg="primary" className='fw-normal'>
                                        {user.designation}
                                      </Badge>
                                      <Badge pill bg="dark" className='ms-2 fw-normal'>
                                        {user.crew}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <CustomSwitch
                                  isOn={user.status === 'active'}
                                  handleToggle={() => handleToggle(user)}
                                />
                              </div>
                            </CardHeader>
                            <CardBody>
                              <p><LuPhone /><span className="ms-1">{user.phone}</span></p>
                              <p><MdAlternateEmail /><span className="text-truncate ms-1">{user.email}</span></p>
                              <p><LuDollarSign /><span className="text-truncate ms-1">{user.payoutRate}</span></p>
                            </CardBody>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Row>
                      <Col>
                        <Table striped bordered hover responsive>
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Designation</th>
                              {/* Show Permission only for users, hide for employees */}
                              <th>Permission</th>
                              <th>Crew</th>
                              <th>Phone</th>
                              <th>Email</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.map((user) => (
                              <tr key={`${user.userType}-${user.id}`}>
                                <td>{user.name}</td>
                                <td>{user.designation}</td>
                                <td>
                                  {/* Show icons only for 'user' type; empty for employees */}
                                  {user.userType === 'user' ? (
                                    <>
                                      <BiLogInCircle size={'1.2rem'} className='text-success me-2' />
                                      <LuFilePen size={'1rem'} className='text-warning' />
                                    </>
                                  ) : null}
                                </td>
                                <td>{user.crew}</td>
                                <td>{user.phone}</td>
                                <td>{user.email}</td>
                                <td>
                                  <CustomSwitch
                                    isOn={user.status === 'active'}
                                    handleToggle={() => handleToggle(user)}
                                  />
                                </td>
                                <td>
                                  <FiEdit size={'1rem'} className='text-info' />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </Col>
                    </Row>
                  )}
                </div>
              </CardBody>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default User;