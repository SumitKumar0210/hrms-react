import React, { useState } from 'react';
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

const User = () => {
  const [isOn, setIsOn] = useState(true);
  const toggle = () => setIsOn(!isOn);

  const statusOptions = [
    { label: 'Active', color: '#0f883930' },
    { label: 'Inactive', color: '#cfb00f66' },
    { label: 'Fired', color: '#ee000130' },
  ];

  const [selectedStatus, setSelectedStatus] = useState(null);
  const handleClick = (status) => setSelectedStatus(status);

  const [selectedType, setSelectedType] = useState('');
  const setTypeUser = (type) => setSelectedType(type);

  const [layout, setLayout] = useState('card');
  const [show, setShow] = useState(false);

  const handleSelect = (eventKey) => {
    setLayout(eventKey);
    setShow(false);
  };

  const layoutOptions = {
    card: { icon: <SlGrid />, label: 'As Card' },
    table: { icon: <BsLayoutThreeColumns />, label: 'As Table' },
  };

  const designationOptions = [
    { value: 'all', label: 'All' },
    { value: 'bricklayer', label: 'Bricklayer' },
    { value: 'foreman', label: 'Foreman' },
    { value: 'labour', label: 'Labour' },
  ];

  const [selectedDesignation, setSelectedDesignation] = useState(designationOptions[0]);

  const handleDesignationChange = (selected) => {
    setSelectedDesignation(selected);
  };

  const users = [
    {
      name: "Aditya Choudhary",
      phone: "4166190631",
      email: "adi2426@gmail.com",
      designation: "Bricklayer",
      crew: "Crew-Choudhary",
      payoutRate: "30",
      profile: "https://ui-avatars.com/api/?name=Aditya+Choudhary&size=48&background=f3f2ff&color=5174f3",
      userType: "user",
      status: "active",
    },
    {
      name: "Liam Patterson",
      phone: "4035551122",
      email: "liam.patterson@example.com",
      designation: "Foreman",
      crew: "Crew-A",
      payoutRate: "28",
      profile: "https://ui-avatars.com/api/?name=Liam+Patterson&size=48&background=f3f2ff&color=5174f3",
      userType: "employee",
      status: "inactive",
    },
    {
      name: "Sophia Green",
      phone: "2891234567",
      email: "sophia.green@example.com",
      designation: "Labour",
      crew: "Crew-B",
      payoutRate: "24",
      profile: "https://ui-avatars.com/api/?name=Sophia+Green&size=48&background=f3f2ff&color=5174f3",
      userType: "employee",
      status: "active",
    },
    {
      name: "Noah Bennett",
      phone: "6478883344",
      email: "noah.bennett@example.com",
      designation: "Manager",
      crew: "Crew-X",
      payoutRate: "35",
      profile: "https://ui-avatars.com/api/?name=Noah+Bennett&size=48&background=f3f2ff&color=5174f3",
      userType: "user",
      status: "fired",
    },
    {
      name: "Emma Thompson",
      phone: "4162227755",
      email: "emma.thompson@example.com",
      designation: "Bricklayer",
      crew: "Crew-Z",
      payoutRate: "30",
      profile: "https://ui-avatars.com/api/?name=Emma+Thompson&size=48&background=f3f2ff&color=5174f3",
      userType: "user",
      status: "active",
    },
    {
      name: "Oliver Hayes",
      phone: "9056667788",
      email: "oliver.hayes@example.com",
      designation: "Labour",
      crew: "Crew-Y",
      payoutRate: "26",
      profile: "https://ui-avatars.com/api/?name=Oliver+Hayes&size=48&background=f3f2ff&color=5174f3",
      userType: "employee",
      status: "inactive",
    },
    {
      name: "Ava Brooks",
      phone: "6133338888",
      email: "ava.brooks@example.com",
      designation: "Foreman",
      crew: "Crew-C",
      payoutRate: "29",
      profile: "https://ui-avatars.com/api/?name=Ava+Brooks&size=48&background=f3f2ff&color=5174f3",
      userType: "employee",
      status: "active",
    },
    {
      name: "Ethan Kelly",
      phone: "5871239000",
      email: "ethan.kelly@example.com",
      designation: "Labour",
      crew: "Crew-D",
      payoutRate: "25",
      profile: "https://ui-avatars.com/api/?name=Ethan+Kelly&size=48&background=f3f2ff&color=5174f3",
      userType: "employee",
      status: "fired",
    },
    {
      name: "Mia Richardson",
      phone: "7804441122",
      email: "mia.richardson@example.com",
      designation: "Bricklayer",
      crew: "Crew-R",
      payoutRate: "30",
      profile: "https://ui-avatars.com/api/?name=Mia+Richardson&size=48&background=f3f2ff&color=5174f3",
      userType: "user",
      status: "active",
    },
  ];
  

  // Filter users based on status/type
  const filteredUsers = users.filter(user => {
    const matchStatus = selectedStatus ? user.status.toLowerCase() === selectedStatus.toLowerCase() : true;
    const matchType = selectedType ? user.userType.toLowerCase() === selectedType.toLowerCase() : true;
    const matchDesignation = selectedDesignation?.value === 'all' || user.designation.toLowerCase() === selectedDesignation?.value;
    return matchStatus && matchType && matchDesignation;
  });
  
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
                <div>{layoutOptions[layout].icon}<span className='ms-2'><RiArrowDownSLine /></span></div>
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
              <div className="d-flex align-items-center filter-btn-area">
                {['', 'user', 'employee'].map((type) => (
                  <div
                    key={type || 'all'}
                    className={`report-filter-btn btn ${selectedType === type ? 'active' : ''}`}
                    onClick={() => setTypeUser(type)}
                  >
                    <p className='mb-0'>{type === '' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}</p>
                  </div>
                ))}
              </div>

              <div className="svg-container d-flex">
                {statusOptions.map(({ label, color }) => {
                  const isSelected = selectedStatus === label;
                  return (
                    <div
                      key={label}
                      className="svg-item position-relative"
                      onClick={() => handleClick(label)}
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

              <div>
                <Select
                  className="my-select"
                  classNamePrefix="custom"
                  options={designationOptions}
                  value={selectedDesignation}
                  onChange={handleDesignationChange}
                  placeholder="Select designation..."
                />
              </div>
            </div>

            <div className='user-wrapper'>
              <CardBody className='py-0'>
                <div className='user-content'>
                {layout === 'card' ? (
                  <Row>
                    {filteredUsers.map((user, index) => (
                      <Col lg={3} sm={12} key={index}>
                        <Card className='border-primary mb-3'>
                          <CardHeader className='bg-white'>
                            <div className='d-flex justify-content-between align-items-center'>
                              <div className='d-flex align-items-center'>
                                 <Image src={user.profile} roundedCircle alt="user" className='border p-1 avatar' />
                                <div className="ms-2 ps-2 border-start">
                                  <label className="ps-1 d-block">{user.name}</label>
                                  <div>
                                    <Badge pill bg="primary" className='fw-normal'>{user.designation}</Badge>
                                    <Badge pill bg="dark" className='ms-2 fw-normal'>{user.crew}</Badge>
                                  </div>
                                </div>
                              </div>
                              <CustomSwitch isOn={isOn} handleToggle={toggle} />
                            </div>
                          </CardHeader>
                          <CardBody>
                            <p><LuPhone /> <span className="ms-1">{user.phone}</span></p>
                            <p><MdAlternateEmail /> <span className="text-truncate ms-1">{user.email}</span></p>
                            <p><LuDollarSign /> <span className="text-truncate ms-1">{user.payoutRate}</span></p>
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
                            <th>Permission</th>
                            <th>Crew</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user, index) => (
                          <tr key={index}>
                            <td>{user.name}</td>
                            <td>{user.designation}</td>
                            <td><BiLogInCircle size={'1.2rem'} className='text-success me-2'/> <LuFilePen size={'1rem'} className='text-warning'/></td>
                            <td>{user.crew}</td>
                            <td>{user.phone}</td>
                            <td>{user.email}</td>
                            <td><CustomSwitch isOn={isOn} handleToggle={toggle} /></td>
                            <td><FiEdit size={'1rem'} className='text-info'/></td>
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

 