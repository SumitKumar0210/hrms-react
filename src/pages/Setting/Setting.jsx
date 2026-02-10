import React from 'react'
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import SettingsSidebar from '../../components/SettingsSidebar/SettingsSidebar';
import { Tab, Nav, Card } from 'react-bootstrap';
import { GoGear } from "react-icons/go";
import { TbCurrencyDollarCanadian } from "react-icons/tb";
import { CiCalculator1 } from "react-icons/ci";
import { FaRegFileLines } from "react-icons/fa6";
import { AiOutlineFolderAdd } from "react-icons/ai";
import { FiLayers } from "react-icons/fi";
import { GrUserWorker } from "react-icons/gr";
import { TbSettingsCheck } from "react-icons/tb";
import { MdOutlineNewLabel } from "react-icons/md";
import { FaRegIdBadge } from "react-icons/fa6";
import { ImInfo } from "react-icons/im";
import GeneralSettings from './GeneralSettings';
import ThemeSettings from './ThemeSettings';
import ItemSettings from './ItemSettings';
import CategoryList from './CategorySettings';
import WorkTypeList from './WorkTypeSettings';
import User from '../user/User';
import Department from './Department';
import Designation from './Designation';
import Shift from './Shift';

const Setting = () => {

    return (
        <>
            <Container fluid className='gx-0'>
                <Row>
                    <Col>
                        <div className="page-header py-1">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item">Home</li>
                                <li className="breadcrumb-item active">Settings</li>
                            </ol>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Tab.Container defaultActiveKey="tab1">
                        <Row>
                            <Col xl={2} lg={2} md={3} sm={3} xs={3} className='mt-1'>
                                <Card className="border-0">
                                    <Card.Body>
                                        <h6 className="pt-2 mb-2">Settings</h6>
                                        <Nav variant="pills" className="flex-row settings-tab">
                                            <Nav.Item >
                                                <Nav.Link eventKey="tab1" className='rounded-1'><span className='me-2'><GoGear /></span>General Settings</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item >
                                                <Nav.Link eventKey="tab15" className='rounded-1'><span className='me-2'><GoGear /></span>Theme Settings</Nav.Link>
                                            </Nav.Item>
                                            {/* <Nav.Item>
                                        <Nav.Link eventKey="tab2" className='rounded-1'><span className='me-2'><TbCurrencyDollarCanadian/></span>Users</Nav.Link>
                                    </Nav.Item> */}
                                            <Nav.Item>
                                                <Nav.Link eventKey="tab3" className='rounded-1'><span className='me-2'><FaRegFileLines /></span>Department</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="tab4" className='rounded-1'><span className='me-2'><CiCalculator1 /></span>Designation</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="tab5" className='rounded-1'><span className='me-2'><AiOutlineFolderAdd /></span>Shift</Nav.Link>
                                            </Nav.Item>

                                            <Nav.Item>
                                                <Nav.Link eventKey="tab6" className='rounded-1'><span className='me-2'><FaRegIdBadge /></span>Roles & Permissions</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="tab7" className='rounded-1'><span className='me-2'><ImInfo /></span>Offday Type</Nav.Link>
                                            </Nav.Item>
                                        </Nav>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xl={10} lg={10} md={9} sm={9} xs={9} className='mt-1 pe-0'>
                                <Tab.Content>
                                    <Tab.Pane eventKey="tab1">
                                        <Card className="border-0">
                                            <GeneralSettings />
                                        </Card>
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="tab15">
                                        <Card className="border-0">
                                            <Card.Body>
                                                <ThemeSettings />
                                            </Card.Body>
                                        </Card>
                                    </Tab.Pane>
                                    {/* <Tab.Pane eventKey="tab2">
                                <Card className="border-0">
                                    <Card.Body>
                                        <User />
                                    </Card.Body>
                                </Card>
                            </Tab.Pane> */}
                                    <Tab.Pane eventKey="tab3">
                                        <Card className="border-0">
                                            <Card.Body>
                                                <Department />
                                            </Card.Body>
                                        </Card>
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="tab4">
                                        <Card className="border-0">
                                            <Card.Body>
                                                <Designation />
                                            </Card.Body>
                                        </Card>
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="tab5">
                                        <Card className="border-0">
                                            <Card.Body>
                                                <Shift />
                                            </Card.Body>
                                        </Card>
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="tab6">
                                        <Card className="border-0">
                                            <Card.Body>
                                                <h4>Tab 6 Content</h4>
                                                <p>This is content for Tab 6.</p>
                                            </Card.Body>
                                        </Card>
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="tab7">
                                        <Card className="border-0">
                                            <Card.Body className='py-3 px-2'>
                                                <h4>Tab 7 Content</h4>
                                                <p>This is content for Tab 7.</p>
                                            </Card.Body>
                                        </Card>
                                    </Tab.Pane>
                                </Tab.Content>
                            </Col>
                        </Row>
                    </Tab.Container>
                </Row>
            </Container>
        </>
    )
}

export default Setting