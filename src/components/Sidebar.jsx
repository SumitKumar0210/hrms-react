import React, { useState } from "react";
import {
  RiDashboardLine,
  RiSettings2Line,
  RiArchiveLine,
  RiLogoutCircleRLine,
  RiMoneyRupeeCircleLine,
} from "react-icons/ri";
import { TbUsersGroup } from "react-icons/tb";
import { MdTimeToLeave } from "react-icons/md";
import { ImFileText2 } from "react-icons/im";
import { LuUsers } from "react-icons/lu";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import { GoPlusCircle } from "react-icons/go";
import { BiRefresh } from "react-icons/bi";
import { FaRegUser } from "react-icons/fa";
import { MdOutlineLogout } from "react-icons/md";

import { Link, NavLink } from "react-router-dom";
import { OverlayTrigger, Popover, Dropdown } from "react-bootstrap";

import logo from "../assets/images/logosmall.png";
import logofull from "../assets/images/logo.svg";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  /* ================= POPOVER MENUS ONLY ================= */

  const popoverMenus = [
    {
      name: "Attendance",
      icon: <LuUsers />,
      title: "Attendance & Time Tracking",
      items: [
        { label: "Attendance & Time Tracking", path: "/attendance" },
        { label: "Manual Attendance Correction", path: "/attendance/manual" },
        { label: "Attendance Reports", path: "/attendance/reports" },
      ],
    },
    {
      name: "Employees",
      icon: <TbUsersGroup />,
      title: "Employees",
      items: [
        { label: "Staff Directory", path: "/employees" },
        { label: "Add New Staff", path: "/employees/add" },
        { label: "Staff Onboarding", path: "/employees/onboarding" },
        { label: "Shift Roster", path: "/employees/shift-roster" },
        { label: "Employee Exit", path: "/employees/exit" },
        { label: "Employee Payroll History", path: "/employees/payroll-history" },
      ],
    },
    {
      name: "Leave",
      icon: <MdTimeToLeave />,
      title: "Leave Management",
      items: [
        { label: "Leave Management", path: "/leave" },
        { label: "Leave Request Details", path: "/leave/requests" },
      ],
    },
    {
      name: "Payroll",
      icon: <RiMoneyRupeeCircleLine />,
      title: "Payroll",
      items: [
        { label: "Salary Structure & Revision", path: "/payroll/salary-structure" },
        { label: "Overtime Rules", path: "/payroll/overtime" },
        { label: "Payroll Processing", path: "/payroll/process" },
        { label: "Payroll History", path: "/payroll-history" },
        { label: "Salary Slip Distribution", path: "/payroll/slips" },
        { label: "Statutory Compliance", path: "/payroll/statutory" },
        { label: "Document Templates", path: "/payroll/templates" },
      ],
    },
    {
      name: "Reports",
      icon: <ImFileText2 />,
      title: "Reports",
      items: [
        { label: "Attendance Reports", path: "/reports/attendance" },
        { label: "Payroll Reports", path: "/reports/payroll" },
        { label: "Statutory Reports", path: "/reports/statutory" },
        { label: "Employee Reports", path: "/reports/employees" },
      ],
    },
  ];

  const renderPopover = (menu) => (
    <Popover className="sidebar-popover">
      <Popover.Header>{menu.title}</Popover.Header>
      <Popover.Body className="px-0 py-0 mt-1 mb-2">
        {menu.items.map((item, i) => (
          <NavLink key={i} to={item.path} className="popover-item">
            {item.label}
          </NavLink>
        ))}
      </Popover.Body>
    </Popover>
  );

  return (
    <div className="page-wrapper">
      {/* ================= SIDEBAR ================= */}
      <div
        className="sidebar-wrapper"
        style={{ width: isOpen ? "200px" : "65px" }}
      >
        {/* LOGO (FIXED HEIGHT) */}
        <div className="sidebar-brand">
            <Link to="/" className="logo d-none d-md-block">
                <img src={logo} alt="Hotlr"/>
            </Link>
            <Link to="/" className="logo d-block d-md-none">
                <img src={logofull} alt="Hotlr"/>
            </Link>
        </div>

        <div className="sidebar-content">
          {/* DASHBOARD (NO POPOVER) */}
          <NavLink to="/" className="nav-link">
            <div className="nav-icon">
              <RiDashboardLine />
              <span className="menu-item d-none d-sm-block">Dashboard</span>
            </div>
          </NavLink>

          {/* POPOVER MENUS */}
          {popoverMenus.map((menu, idx) => (
            <OverlayTrigger
              key={idx}
              trigger="click"
              placement="right-start"
              overlay={renderPopover(menu)}
              rootClose
            >
              <div className="nav-link cursor-pointer">
                <div className="nav-icon">
                  {menu.icon}
                  <span className="menu-item d-none d-sm-block">
                    {menu.name}
                  </span>
                </div>
              </div>
            </OverlayTrigger>
          ))}

          {/* ===== BOTTOM MENU (ALWAYS VISIBLE) ===== */}
          <div className="last-item">
            <NavLink to="/settings" className="nav-link">
              <div className="nav-icon">
                <RiSettings2Line />
                <span className="menu-item d-none d-sm-block">Settings</span>
              </div>
            </NavLink>

            <NavLink to="/archived-users" className="nav-link">
              <div className="nav-icon">
                <RiArchiveLine />
                <span className="menu-item d-none d-sm-block">Archived</span>
              </div>
            </NavLink>

            <NavLink to="/logout" className="nav-link">
              <div className="nav-icon">
                <RiLogoutCircleRLine />
                <span className="menu-item d-none d-sm-block">Logout</span>
              </div>
            </NavLink>
          </div>
        </div>
      </div>

      {/* ================= HEADER ================= */}
      <main>
        <header className="header fixed-top">
          <div className="bars d-block d-sm-none">
            <HiOutlineMenuAlt1 onClick={toggle} />
          </div>

          <div className="header-items">
            <ul className="header-actions">
              {/* ADD */}
              <li>
                <Dropdown
                  show={showAdd}
                  onMouseEnter={() => setShowAdd(true)}
                  onMouseLeave={() => setShowAdd(false)}
                  align="end"
                >
                  <Dropdown.Toggle as="div" className="custom-toggle">
                    <div className="add-generic">
                      <GoPlusCircle />
                    </div>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item>Action</Dropdown.Item>
                    <Dropdown.Item>Another Action</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </li>

              {/* PROFILE */}
              <li>
                <Dropdown
                  show={showProfile}
                  onMouseEnter={() => setShowProfile(true)}
                  onMouseLeave={() => setShowProfile(false)}
                  align="end"
                >
                  <Dropdown.Toggle as="div" className="custom-toggle">
                    <div className="user-settings">
                      <span className="avatar">
                        <img
                          src="https://app.masonrygroup.com/assets/app.masonrygroup.com/img/amit_1722580135.jpg"
                          alt="User"
                        />
                      </span>
                    </div>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item>
                      <BiRefresh /> User Dashboard
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <FaRegUser /> My Profile
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <MdOutlineLogout /> Sign Out
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </li>
            </ul>
          </div>
        </header>
      </main> <main>
                          <header className="header fixed-top">
                              {/* Toggle Sidebar Button */}
                              <div style={{marginLeft: isOpen ? "180px" : "0px"}} className="bars d-block d-sm-none">
                                  <HiOutlineMenuAlt1 onClick={toggle}/>
                              </div>
                              <div className="header-items">
                              {/* Header Actions */}
                              <ul className="header-actions">
                                  <li>
                                  <Dropdown
                                      onMouseEnter={() => setShowAdd(true)}
                                      onMouseLeave={() => setShowAdd(false)}
                                      show={showAdd}
                                      align="end"
                                  >
                                      <Dropdown.Toggle as="div" className="custom-toggle">
                                          <div  className="add-generic">
                                              <GoPlusCircle/>
                                          </div>
                                      </Dropdown.Toggle>
                                      <Dropdown.Menu>
                                          <div className='header-profile-actions'>
                                              <Dropdown.Item href="#">Action</Dropdown.Item>
                                              <Dropdown.Item href="#">Another Action</Dropdown.Item>
                                              <Dropdown.Item href="#">Something Else</Dropdown.Item>
                                          </div>
                                      </Dropdown.Menu>
                                  </Dropdown>
                                  
                                  </li>
                                  
                                  {/* User Settings Dropdown */}
                                  <li>
                                 
                                  <Dropdown
                                      onMouseEnter={() => setShowProfile(true)}
                                      onMouseLeave={() => setShowProfile(false)}
                                      show={showProfile}
                                      align="end"
                                  >
                                      <Dropdown.Toggle as="div" className="custom-toggle">
                                          <div id="userSettings" className="user-settings">
                                              <span className="avatar">
                                                  <img src="https://app.masonrygroup.com/assets/app.masonrygroup.com/img/amit_1722580135.jpg" alt="Amit Kumar" />
                                              </span>
                                          </div>
                                      </Dropdown.Toggle>
                                      <Dropdown.Menu>
                                          <div className='header-profile-actions'>
                                              <div className="header-user-profile">
                                                  <h5 className='mt-2 mb-0 fw-normal'>Amit Kumar</h5>
                                                  <p className='mb-1'>Admin</p>
                                              </div>
                                              <Dropdown.Item href="#"><span><BiRefresh/></span> User Dashboard</Dropdown.Item>
                                              <Dropdown.Item href="#"><span><FaRegUser /></span>My Profile</Dropdown.Item>
                                              <Dropdown.Item href="#"><span><MdOutlineLogout /></span>Sign Out</Dropdown.Item>
                                          </div>
                                      </Dropdown.Menu>
                                  </Dropdown>
                                  </li>
                              </ul>
                              </div>
                          </header>
                          {/* <div className="main-container">
                              {children}
                          </div> */}
                      </main>
    </div>
  );
};

export default Sidebar;
