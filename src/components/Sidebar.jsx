import React, { useState } from 'react';
import { RiArchiveLine, RiSettings2Line, RiLogoutCircleRLine, RiAccountBoxLine } from "react-icons/ri";
import { LuUserPlus } from "react-icons/lu";
import { ImFileText2, ImManWoman, ImTree, ImHome } from "react-icons/im";
import { BiDollarCircle } from "react-icons/bi";
import { PiWallFill } from "react-icons/pi";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import { GoPlusCircle } from "react-icons/go";
import { BiRefresh } from "react-icons/bi";
import { FaRegUser } from "react-icons/fa";
import { MdOutlineLogout } from "react-icons/md";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { RiDashboardLine } from "react-icons/ri";
import { LuUsers } from "react-icons/lu";
import { TbUsersGroup } from "react-icons/tb";
import { RiMoneyRupeeCircleLine } from "react-icons/ri";
import { MdTimeToLeave } from "react-icons/md";




import { Link, NavLink } from 'react-router-dom';
import { Dropdown } from "react-bootstrap";
import logo from "../assets/images/logosmall.png";
import logofull from "../assets/images/logo.svg";
const Sidebar = ({children}) => {
    
    const[isOpen ,setIsOpen] = useState(false);
    const toggle = () => setIsOpen (!isOpen);
    const closeSidebar = () => setIsOpen(false);

    const [showAdd, setShowAdd] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const menuItem=[
        {
            path:"/",
            name:"Dashboard",
            icon: <RiDashboardLine />

        },
        {
            path:"/attendance",
            name:"Attendance",
            icon:<LuUsers/>
        },
        {
            path:"/employees",
            name:"Employees",
            icon:<TbUsersGroup/>
        },
        {
            path:"/leave",
            name:"Leave",
            icon:<MdTimeToLeave/>
        },
        {
            path:"/payroll",
            name:"Payroll",
            icon:<RiMoneyRupeeCircleLine/>
        },
        // {
        //     path:"/users",
        //     name:"User",
        //     icon:<LuUserPlus/>
        // },
        {
            path:"/reports",
            name:"Reports",
            icon:<ImFileText2/>
        }
       
      
    ]
    const menuItemLast=[
        {
            path:"/#",
            // path:"/settings",
            name:"Settings",
            icon:<RiSettings2Line/>
        },
        {
            path:"/archived-users",
            name:"Archived",
            icon:<RiArchiveLine/>
        },
        {
            path:"/logout",
            name:"Logout",
            icon:<RiLogoutCircleRLine/>
        }
    ]
    return (
        <>
            <div className="page-wrapper">
                <div className={`d-md-block ${isOpen ? "d-block" : "d-none"}`}>
                    <div style={{width: isOpen ? "200px" : "65px"}} className="sidebar-wrapper">
                        <div className="sidebar-brand">
                            <Link to="/" className="logo d-none d-md-block">
                                <img src={logo} alt="Hotlr"/>
                            </Link>
                            <Link to="/" className="logo d-block d-md-none">
                                <img src={logofull} alt="Hotlr"/>
                            </Link>
                        </div>
                        <div className="sidebar-content">
                            {menuItem.map((item, index) => (
                                <NavLink 
                                    to={item.path} 
                                    key={index} 
                                    className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                                    onClick={closeSidebar}
                                >
                                    <div className="nav-icon">
                                        {item.icon}
                                        <span className="menu-item text-truncate d-none d-sm-block">{item.name}</span>
                                    </div>
                                    {isOpen && <div className="link_text">{item.name}</div>}
                                </NavLink>
                            ))}
                            <div className='last-item'>
                            {menuItemLast.map((item, index) => (
                                <NavLink 
                                    to={item.path} 
                                    key={index} 
                                    className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                                    onClick={closeSidebar}
                                >
                                    <div className="nav-icon">
                                        {item.icon}
                                        <span className="menu-item text-truncate d-none d-sm-block">{item.name}</span>
                                    </div>
                                    {isOpen && <div className="link_text">{item.name}</div>}
                                </NavLink>
                            ))}
                            </div>
                        </div>
                    </div>
                </div>
                <main>
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
        </>
    );
};

export default Sidebar;