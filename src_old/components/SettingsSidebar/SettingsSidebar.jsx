import React from 'react';
import { Container, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
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

const settingsLinks = [
  { to: '/company/general-settings', icon: <GoGear/>, label: 'General Settings', active: true },
  // { to: 'task-settings', icon: 'icon-check-circle', label: 'Task Settings', active: false },
  { to: '/company/payout-settings', icon: <TbCurrencyDollarCanadian/>, label: 'Payout Settings' },
  // { to: 'custom-fields', icon: 'icon-border_color', label: 'Custom Settings' },
  { to: '/company/report-settings', icon: <FaRegFileLines/>, label: 'Report Settings' },
  { to: '/company/break-settings', icon: <CiCalculator1/>, label: 'Calculations' },
  { to: '/company/category-settings', icon: <AiOutlineFolderAdd/>, label: 'Category Settings' },
  { to: '/company/fixed_expenses', icon: <TbCurrencyDollarCanadian/>, label: 'Fixed Expense Settings' },
  { to: '/company/items', icon: <FiLayers/>, label: 'Items' },
  { to: '/company/work-type', icon: <GrUserWorker/>, label: 'Work Type' },
  // { to: 'employees', icon: 'icon-users', label: 'Employees' },
  // { to: 'tasks', icon: 'icon-check-circle', label: 'Task' },
  { to: '/company/status-settings', icon: <TbSettingsCheck/>, label: 'Status Setting' },
  { to: '/company/label-settings', icon: <MdOutlineNewLabel/>, label: 'Manage Label' },
  { to: '/company/roles', icon: <FaRegIdBadge/>, label: 'Roles & Permissions' },
  { to: '/company/manadatory', icon: <ImInfo/>, label: 'Manadatory' },
  { to: '/company/manage-comment', icon: <ImInfo/>, label: 'Leave Comment' },
  { to: '/company/manage-offbreak', icon: <ImInfo/>, label: 'Offday Type' }
];

const SettingsSidebar = () => {
  return (
    <Container className="bg-white p-3 docs-type-container rounded-3">
      <h6 className="mb-3">Settings</h6>
      <ListGroup variant="flush" className="doc-labels">
        {settingsLinks.map(({ to, icon, label, active }, idx) => (
          <ListGroup.Item key={idx} className="border-0 p-0">
            <Link
              to={to}
              className={`d-block py-2 px-2 ${active ? 'active text-white' : 'text-dark'}`}
            >
              <i className="me-1">{icon}</i> {label}
            </Link>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};

export default SettingsSidebar;
