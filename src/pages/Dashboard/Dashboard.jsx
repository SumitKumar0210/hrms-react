import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
   const { user } = useAuth();
    return (
        <>
            <div className='container-fluid g-0'>
                <Row>
                    <Col>
                        <div className="page-header">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item active">{user.roles[0]?.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} Dashboard</li>
                            </ol>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col className=''>
                        <div className="intro_profile">
                            <h1 className="fw-light text-primary mb-0">Hello, {user.name?.toUpperCase()}!</h1>
                        </div>
                    </Col>
                </Row>
            </div>
        </>
       
    );
};

export default Dashboard;