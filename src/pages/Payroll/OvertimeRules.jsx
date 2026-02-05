import { Card, Alert, Tabs, Tab, Form, Container, InputGroup } from "react-bootstrap";
import GlobalSettings from "../../components/Overtime/GlobalSettings";
import EmployeeOTConfig from "../../components/Overtime/EmployeeOTConfig";
import { IoSearchOutline } from "react-icons/io5";

const OvertimeRules = () => {
  return (
    <Container fluid className="py-3">
      {/* Page Header */}
      <div className="mb-3">
        <h5 className="fw-semibold mb-0">Overtime Rules</h5>
        <small className="text-muted">
          Define global overtime settings and configure individual employee OT rates
        </small>
      </div>


      {/* Percentage-based OT info */}
      <Alert variant="warning" className="border-0 shadow-sm rounded-3" style={{ backgroundColor: '#fffde6' }}>
        <strong>Percentage-based OT:</strong>
        <div className="small mt-1">
          Set OT rates as a percentage of base salary. When an employee receives a raise,
          their OT pay automatically adjusts—no manual updates needed.
        </div>
      </Alert>

      {/* Search (used mainly for Employee tab) */}
      <Card className="mb-3 border-0 shadow-sm">
        <Card.Body>
          <h6 className="fw-semibold mb-3">Select Employee</h6>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="text-muted fs-14" style={{ minWidth: 130 }}>
              Search by Name
            </div>

            <div style={{ maxWidth: 320, width: "100%" }}>
              <InputGroup>
                <Form.Control
                  placeholder="Enter Employee Name or ID"
                  name="employee"
                // value={formData.employee}
                // onChange={handleChange}
                />
                <InputGroup.Text>
                  <IoSearchOutline />
                </InputGroup.Text>
              </InputGroup>
            </div>
          </div>

        </Card.Body>
      </Card>


      {/* Main Container */}
      <Card className="border-0 shadow-sm py-3 px-2" style={{ backgroundColor: '#fffde6' }}>
        <Card.Body>
          <h6 className="fw-semibold mb-3">Global OT Configuration</h6>

          <Tabs defaultActiveKey="global" className="mb-3 pb-3 warning-tabs">
            <Tab eventKey="global" title="Global Settings">
              <GlobalSettings />
            </Tab>

            <Tab eventKey="employee" title="Employee OT Configuration">
              <EmployeeOTConfig />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OvertimeRules;
