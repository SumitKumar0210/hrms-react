import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
  return (
    <div className="d-flex">
      <Container fluid className="main-container">
        <Sidebar />
        <Outlet />
      </Container>
    </div>
  );
};

export default MainLayout;