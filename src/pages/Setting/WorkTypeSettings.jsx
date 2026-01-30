import React from 'react';
import { Card, Row, Col,Button } from 'react-bootstrap';
import { FiTrash2 } from "react-icons/fi";
import { FiEdit } from "react-icons/fi";
import { FiPlusCircle } from 'react-icons/fi';

const workTypes = [
  { id: 6, name: 'Commercial', status: 1 },
  { id: 4, name: 'Residential', status: 1 },
  { id: 3, name: 'Default', status: 1 }
];

const WorkTypeCard = ({ worktype, onEdit, onDelete }) => {
  return (
    <Col xl={2} lg={4} md={6} sm={6} xs={6} className="mb-3 position-relative">
      <Card border="primary" style={{ borderRadius: '10px' }}>
        <Card.Body className="p-2">
          <div className="top-agents-container">
            <div className="top-agent d-flex align-items-start">
              <div className="agent-details overflow-hidden flex-grow-1 d-flex flex-column">
                <h5 className='fw-normal py-2 mt-2'>{worktype.name}</h5>
                {/* <div className="agent-score">
                  <div className="points left text-muted">{worktype.type}</div>
                </div> */}
              </div>
              <div className="corner-place">
                <a
                  href="#!"
                  className="corner-edit"
                  onClick={() =>
                    onEdit(worktype.id, worktype.name, worktype.type, worktype.status)
                  }
                >
                  <FiEdit />
                </a>
                <a
                  href="#!"
                  className="corner-delete"
                  onClick={() => onDelete(worktype.id)}
                >
                  <FiTrash2 />
                </a>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
};

const WorkTypeList = () => {
  const handleEdit = (id, name, type, status) => {
    console.log('Edit:', id, name, type, status);
    // Add your edit logic
  };

  const handleDelete = (id) => {
    console.log('Delete:', id);
    // Add your delete logic
  };

  return (
    <>
    <Row>
        <Col xs={12} className='mb-3'>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
              <h5 className="mb-0 fw-normal fs-6">work Type Settings</h5>
              <Button variant="outline-primary" size="sm">
                <span className="me-2"><FiPlusCircle /></span>Create New
              </Button>
            </div>
          </Col>
    </Row>
    <Row>
      {workTypes.map((work) => (
        <WorkTypeCard
          key={work.id}
          worktype={work}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </Row>
    </>
    
  );
};

export default WorkTypeList;
