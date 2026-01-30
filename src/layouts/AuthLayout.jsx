import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';


const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <Container fluid className="h-100">
        <Row className="h-100 align-items-center justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={4}>
            <Outlet />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AuthLayout;