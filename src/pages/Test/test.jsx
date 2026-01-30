import { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Form, Button } from 'react-bootstrap';
// import './users-table.css';

const mockData = [
  { id: 1, name: 'Amit Kumar', email: 'amit@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Ravi Sharma', email: 'ravi@example.com', role: 'User', status: 'Inactive' },
  { id: 3, name: 'Pooja Singh', email: 'pooja@example.com', role: 'Manager', status: 'Active' },
];

export default function UsersDataTable() {
  const [data, setData] = useState(mockData);
  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState(mockData);
  const [loading, setLoading] = useState(false);
  // const [selectedRows, setSelectedRows] = useState([]);

  // 🔍 Search filter
  useEffect(() => {
    const result = data.filter(row =>
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.email.toLowerCase().includes(search.toLowerCase()) ||
      row.role.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredData(result);
  }, [search, data]);

  // 🧱 Columns
  const columns = useMemo(() => [
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
    },
    {
      name: 'Email',
      selector: row => row.email,
      sortable: true,
    },
    {
      name: 'Role',
      selector: row => row.role,
      sortable: true,
    },
    {
      name: 'Status',
      cell: row => (
        <span className={`badge ${row.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
          {row.status}
        </span>
      ),
    },
    {
      name: 'Actions',
      cell: row => (
        <div className="d-flex gap-2">
          <Button size="sm" variant="primary" onClick={() => handleEdit(row)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ], []);

  // ✏️ Edit
  const handleEdit = (row) => {
    alert(`Edit user: ${row.name}`);
  };

  // 🗑 Delete
  const handleDelete = (id) => {
    if (window.confirm('Are you sure?')) {
      setData(prev => prev.filter(item => item.id !== id));
    }
  };

  // ☑️ Selected rows
  // const handleSelectedRows = ({ selectedRows }) => {
  //   setSelectedRows(selectedRows);
  // };

  return (
    <div className="card shadow-sm custom-data-table mt-4 border-0">
      <div className="card-body">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Users</h5>

          <Form.Control
            type="text"
            placeholder="Search..."
            style={{ maxWidth: 250 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          // selectableRows
          // onSelectedRowsChange={handleSelectedRows}
          progressPending={loading}
          highlightOnHover
          // striped
          responsive
          persistTableHead
        />
      </div>
    </div>
  );
}
