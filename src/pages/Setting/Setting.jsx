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
                                        <Nav.Link eventKey="tab1" className='rounded-1'><span className='me-2'><GoGear/></span>General Settings</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item >
                                        <Nav.Link eventKey="tab15" className='rounded-1'><span className='me-2'><GoGear/></span>Theme Settings</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="tab2" className='rounded-1'><span className='me-2'><TbCurrencyDollarCanadian/></span>Payout Settings</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="tab3" className='rounded-1'><span className='me-2'><FaRegFileLines/></span>Report Settings</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="tab4" className='rounded-1'><span className='me-2'><CiCalculator1/></span>Calculations Settings</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="tab5" className='rounded-1'><span className='me-2'><AiOutlineFolderAdd/></span>Category Settings</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="tab6" className='rounded-1'><span className='me-2'><TbCurrencyDollarCanadian/></span>Fixed Expense Settings</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="tab7" className='rounded-1'><span className='me-2'><FiLayers/></span>Items Settings</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="tab8" className='rounded-1'><span className='me-2'><GrUserWorker/></span>Work Type Settings</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="tab9" className='rounded-1'><span className='me-2'><TbSettingsCheck/></span>Status Settings</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="tab10" className='rounded-1'><span className='me-2'><MdOutlineNewLabel/></span>Manage Label Settings</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="tab11" className='rounded-1'><span className='me-2'><FaRegIdBadge/></span>Roles & Permissions</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="tab12" className='rounded-1'><span className='me-2'><ImInfo/></span>Manadatory</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="tab13" className='rounded-1'><span className='me-2'><ImInfo/></span>Leave Comment</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="tab14" className='rounded-1'><span className='me-2'><ImInfo/></span>Offday Type</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xl={10} lg={10} md={9} sm={9} xs={9} className='mt-1 pe-0'>
                        <Tab.Content>
                            <Tab.Pane eventKey="tab1">
                                <Card className="border-0">
                                    <GeneralSettings/>
                                </Card>
                            </Tab.Pane>
                            <Tab.Pane eventKey="tab15">
                                <Card className="border-0">
                                    <Card.Body>
                                        <ThemeSettings/>
                                    </Card.Body>
                                </Card>
                            </Tab.Pane>
                            <Tab.Pane eventKey="tab2">
                                <Card className="border-0">
                                    <Card.Body>
                                        <h4>Tab 2 Content</h4>
                                        <p>This is content for Tab 2.</p>
                                    </Card.Body>
                                </Card>
                            </Tab.Pane>
                            <Tab.Pane eventKey="tab3">
                                <Card className="border-0">
                                    <Card.Body>
                                        <h4>Tab 3 Content</h4>
                                        <p>This is content for Tab 3.</p>
                                    </Card.Body>
                                </Card>
                            </Tab.Pane>
                            <Tab.Pane eventKey="tab4">
                                <Card className="border-0">
                                    <Card.Body>
                                        <h4>Tab 4 Content</h4>
                                        <p>This is content for Tab 4.</p>
                                    </Card.Body>
                                </Card>
                            </Tab.Pane>
                            <Tab.Pane eventKey="tab5">
                                <Card className="border-0">
                                    <Card.Body>
                                        <CategoryList/>
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
                                        <ItemSettings/>
                                    </Card.Body>
                                </Card>
                            </Tab.Pane>
                            <Tab.Pane eventKey="tab8">
                                <Card className="border-0">
                                    <Card.Body>
                                        <WorkTypeList/>
                                    </Card.Body>
                                </Card>
                            </Tab.Pane>
                            <Tab.Pane eventKey="tab9">
                                <Card className="border-0">
                                    <Card.Body>
                                        <h4>Tab 9 Content</h4>
                                        <p>This is content for Tab 9.</p>
                                    </Card.Body>
                                </Card>
                            </Tab.Pane>
                            <Tab.Pane eventKey="tab10">
                                <Card className="border-0">
                                    <Card.Body>
                                        <h4>Tab 10 Content</h4>
                                        <p>This is content for Tab 10.</p>
                                    </Card.Body>
                                </Card>
                            </Tab.Pane>
                            <Tab.Pane eventKey="tab11">
                                <Card className="border-0">
                                    <Card.Body>
                                        <h4>Tab 11 Content</h4>
                                        <p>This is content for Tab 11.</p>
                                    </Card.Body>
                                </Card>
                            </Tab.Pane>
                            <Tab.Pane eventKey="tab12">
                                <Card className="border-0">
                                    <Card.Body>
                                        <h4>Tab 12 Content</h4>
                                        <p>This is content for Tab 12.</p>
                                    </Card.Body>
                                </Card>
                            </Tab.Pane>
                            <Tab.Pane eventKey="tab13">
                                <Card className="border-0">
                                    <Card.Body>
                                        <h4>Tab 13 Content</h4>
                                        <p>This is content for Tab 13.</p>
                                    </Card.Body>
                                </Card>
                            </Tab.Pane>
                            <Tab.Pane eventKey="tab14">
                                <Card className="border-0">
                                    <Card.Body>
                                        <h4>Tab 14 Content</h4>
                                        <p>This is content for Tab 14.</p>
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