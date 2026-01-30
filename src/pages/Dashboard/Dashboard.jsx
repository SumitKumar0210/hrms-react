import React from 'react';
import { Col, Row } from 'react-bootstrap';

const Dashboard = () => {
   
    return (
        <>
            <div className='container-fluid g-0'>
                <Row>
                    <Col>
                        <div className="page-header">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item active">Admin Dashboard</li>
                            </ol>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col className=''>
                        <div className="intro_profile">
                            <h1 className="fw-light text-primary mb-0">Hello, Amit Kumar!</h1>
                        </div>
                    </Col>
                </Row>
            </div>
        </>
       
    );
};

export default Dashboard;