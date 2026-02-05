import { useState, useMemo } from "react";
import { Badge, Button, Card } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { FaEdit, FaPlus } from "react-icons/fa";

const EmployeeOTConfig = () => {
  const [search, setSearch] = useState("");

  const data = [
    {
      id: "EMP001",
      name: "Sarah Johnson",
      dept: "Front Desk",
      rate: 50,
      min: 30,
      max: 4,
    },
    {
      id: "EMP002",
      name: "Priya Singh",
      dept: "Housekeeping",
      rate: 50,
      min: 30,
      max: 4,
    },
    {
      id: "EMP004",
      name: "Amit Sharma",
      dept: "Kitchen",
      rate: 50,
      min: 30,
      max: 4,
    },
  ];

  const filtered = useMemo(
    () =>
      data.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.id.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const columns = [
    {
      name: "Employee ID & Name",
      cell: (row) => (
        <>
            <div>
                <div className="fw-semibold">{row.name}</div>
                <small className="text-muted">{row.id}</small>
            </div>
        </>
      ),
      grow: 2,
    },
    { name: "Department", selector: (row) => row.dept },
    {
      name: "OT Rate (%)",
      cell: (row) => (
        <>
          {row.rate} <FaEdit className="ms-2 text-muted" />
        </>
      ),
    },
    {
      name: "Min OT Time (mins)",
      cell: (row) => (
        <>
          {row.min} <FaEdit className="ms-2 text-muted" />
        </>
      ),
    },
    {
      name: "Max OT/Day (hrs)",
      cell: (row) => (
        <>
          {row.max} <FaEdit className="ms-2 text-muted" />
        </>
      ),
    },
    {
      name: "Status",
      cell: () => (
        <Badge bg="success" pill className="px-3 fw-semibold">
          Active
        </Badge>
      ),
    },
  ];

  return (
    <>
    <Card className="custom-data-table p-0 border-0 shadow-sm">
        <Card.Body className="p-0">
                 <DataTable
        columns={columns}
        data={filtered}
        highlightOnHover
        responsive
        
      />
        </Card.Body>
    </Card>
     

      <div className="d-flex justify-content-end gap-3 mt-4">
        <Button variant="secondary" size="sm">
          Add Employee
        </Button>
        <Button variant="primary" size="sm">Save All Employee Settings</Button>
      </div>
    </>
  );
};

export default EmployeeOTConfig;
