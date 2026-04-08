import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardBody,
  CardHeader,
  Col,
  Image,
  Row,
  Badge,
  Dropdown,
  Table,
  Modal,
  Nav,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import CustomStatusSwitch from "../../components/CustomSwitch/CustomStatusSwitch.";
import CustomSwitch from "../../components/Customswitch/Customswitch";
import { LuDollarSign, LuPhone, LuEye, LuEyeOff } from "react-icons/lu";
import { FaRupeeSign } from "react-icons/fa";
import { MdAlternateEmail } from "react-icons/md";
import Select from "react-select";
import { SlGrid } from "react-icons/sl";
import { BsLayoutThreeColumns, BsShieldCheck, BsShieldX } from "react-icons/bs";
import { RiArrowDownSLine } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { getUsers, updateStatus, updateUser } from "./slice/userSlice";
import {
  fetchAllEmployees,
  toggleEmployeeStatus,
} from "../Employees/slice/employeeSlice";
import { getactiveRoles } from "../Setting/slice/roleSlice";

// ─── Reusable Avatar Component ────────────────────────────────────────────────
const Avatar = ({ name, src, size = 48, darkBg = false, className = "", style = {} }) => {
  const bg    = darkBg ? "1e3a5f" : "f3f2ff";
  const color = darkBg ? "ffffff" : "5174f3";
  const safeName = encodeURIComponent(name ?? "?");
  const fallback = `https://ui-avatars.com/api/?name=${safeName}&size=${size}&background=${bg}&color=${color}`;

  return (
    <Image
      src={src || fallback}
      roundedCircle
      alt={name ?? "avatar"}
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "cover", flexShrink: 0, ...style }}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = fallback;
      }}
    />
  );
};

/* ─── Edit User Modal ──────────────────────────────────────────────────── */
const EditUserModal = ({
  user,
  allRoles,
  show,
  onHide,
  onSavePassword,
  onSaveRoles,
  saving,
}) => {
  const [activeTab, setActiveTab] = useState("password");

  // Password tab state
  const [newPassword, setNewPassword]       = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew]               = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [pwError, setPwError]               = useState("");
  const [pwSuccess, setPwSuccess]           = useState("");

  // Role tab state
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [roleSuccess, setRoleSuccess]       = useState("");
  const [roleError, setRoleError]           = useState("");

  // Reset state when user changes
  useEffect(() => {
    if (user) {
      setSelectedRoleId(user.roles?.[0]?.id ?? null);
    }
    setNewPassword("");
    setConfirmPassword("");
    setPwError("");
    setPwSuccess("");
    setRoleSuccess("");
    setRoleError("");
    setActiveTab("password");
  }, [user]);

  if (!user) return null;

  /* ── Password submit ── */
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }

    onSavePassword({
      userId: user.id,
      password: newPassword,
      password_confirmation: confirmPassword,
    })
      .then(() => {
        setPwSuccess("Password updated successfully.");
        setNewPassword("");
        setConfirmPassword("");
      })
      .catch((err) => {
        setPwError(err?.message ?? "Failed to update password.");
      });
  };

  /* ── Role submit ── */
  const handleRolesSubmit = () => {
    setRoleSuccess("");
    setRoleError("");

    if (!selectedRoleId) {
      setRoleError("Please select a role.");
      return;
    }

    onSaveRoles({ userId: user.id, roleId: selectedRoleId })
      .then(() => setRoleSuccess("Role updated successfully."))
      .catch((err) => setRoleError(err?.message ?? "Failed to update role."));
  };

  const passwordStrength = (pw) => {
    if (!pw) return null;
    if (pw.length < 6) return { label: "Weak",   color: "#ef4444", width: "25%"  };
    if (pw.length < 10 || !/[A-Z]/.test(pw) || !/\d/.test(pw))
                          return { label: "Fair",   color: "#f59e0b", width: "55%"  };
    return                       { label: "Strong", color: "#10b981", width: "100%" };
  };
  const strength = passwordStrength(newPassword);

  return (
    <Modal show={show} onHide={onHide} centered size="md" backdrop="static">
      <Modal.Header
        closeButton
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #2d5fa6 100%)",
          borderBottom: "none",
          padding: "1rem 1.5rem",
        }}
      >
        <div className="d-flex align-items-center gap-3">
          {/* ✅ Fix 1: Avatar replaces bare <Image> in modal header */}
          <Avatar
            name={user.name}
            src={user.profile}
            size={42}
            darkBg
            style={{ border: "2px solid rgba(255,255,255,0.4)" }}
          />
          <div>
            <Modal.Title
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#fff",
                marginBottom: 0,
              }}
            >
              {user.name}
            </Modal.Title>
            <small style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.75rem" }}>
              {user.email}
            </small>
          </div>
        </div>
      </Modal.Header>

      {/* Tab nav */}
      <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <Nav variant="tabs" style={{ border: "none", padding: "0 1.5rem" }}>
          {[
            { key: "password", label: "Password" },
            { key: "roles",    label: "Roles"    },
          ].map((tab) => (
            <Nav.Item key={tab.key}>
              <Nav.Link
                active={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  borderRadius: 0,
                  borderBottom:
                    activeTab === tab.key
                      ? "2px solid #2d5fa6"
                      : "2px solid transparent",
                  color:      activeTab === tab.key ? "#2d5fa6" : "#64748b",
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  fontSize: "0.875rem",
                  padding: "0.75rem 1rem",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      </div>

      <Modal.Body style={{ padding: "1.5rem", minHeight: 280 }}>
        {/* ── PASSWORD TAB ── */}
        {activeTab === "password" && (
          <Form onSubmit={handlePasswordSubmit}>
            {pwError && (
              <Alert variant="danger" className="py-2 mb-3" style={{ fontSize: "0.825rem" }}>
                {pwError}
              </Alert>
            )}
            {pwSuccess && (
              <Alert variant="success" className="py-2 mb-3" style={{ fontSize: "0.825rem" }}>
                {pwSuccess}
              </Alert>
            )}

            {/* New Password */}
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "0.825rem", fontWeight: 600, color: "#374151" }}>
                New Password
              </Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPwError("");
                    setPwSuccess("");
                  }}
                  placeholder="Enter new password"
                  style={{ paddingRight: "2.5rem", fontSize: "0.875rem" }}
                  required
                />
                <span
                  onClick={() => setShowNew((v) => !v)}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#94a3b8",
                  }}
                >
                  {showNew ? <LuEyeOff size={16} /> : <LuEye size={16} />}
                </span>
              </div>

              {/* Strength bar */}
              {strength && (
                <div className="mt-2">
                  <div style={{ height: 4, borderRadius: 4, background: "#e2e8f0", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: strength.width,
                        background: strength.color,
                        transition: "width 0.3s ease, background 0.3s ease",
                        borderRadius: 4,
                      }}
                    />
                  </div>
                  <small style={{ color: strength.color, fontSize: "0.72rem", fontWeight: 600 }}>
                    {strength.label}
                  </small>
                </div>
              )}
            </Form.Group>

            {/* Confirm Password */}
            <Form.Group className="mb-4">
              <Form.Label style={{ fontSize: "0.825rem", fontWeight: 600, color: "#374151" }}>
                Confirm Password
              </Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPwError("");
                    setPwSuccess("");
                  }}
                  placeholder="Re-enter new password"
                  style={{
                    paddingRight: "2.5rem",
                    fontSize: "0.875rem",
                    borderColor: confirmPassword
                      ? confirmPassword === newPassword
                        ? "#10b981"
                        : "#ef4444"
                      : undefined,
                  }}
                  required
                />
                <span
                  onClick={() => setShowConfirm((v) => !v)}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#94a3b8",
                  }}
                >
                  {showConfirm ? <LuEyeOff size={16} /> : <LuEye size={16} />}
                </span>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <small style={{ color: "#ef4444", fontSize: "0.72rem" }}>
                  Passwords do not match
                </small>
              )}
              {confirmPassword && confirmPassword === newPassword && (
                <small style={{ color: "#10b981", fontSize: "0.72rem" }}>
                  ✓ Passwords match
                </small>
              )}
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="light" onClick={onHide} style={{ fontSize: "0.875rem" }}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                style={{
                  background: "linear-gradient(135deg, #1e3a5f, #2d5fa6)",
                  border: "none",
                  fontSize: "0.875rem",
                }}
              >
                {saving ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-1" />
                    Saving…
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </Form>
        )}

        {/* ── ROLES TAB ── */}
        {activeTab === "roles" && (
          <div>
            {roleError && (
              <Alert variant="danger" className="py-2 mb-3" style={{ fontSize: "0.825rem" }}>
                {roleError}
              </Alert>
            )}
            {roleSuccess && (
              <Alert variant="success" className="py-2 mb-3" style={{ fontSize: "0.825rem" }}>
                {roleSuccess}
              </Alert>
            )}

            <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "1rem" }}>
              Select a role to assign to this user.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
              {(allRoles ?? []).length === 0 && (
                <p className="text-muted text-center py-3" style={{ fontSize: "0.825rem" }}>
                  No roles available.
                </p>
              )}
              {(allRoles ?? []).map((role) => {
                const isSelected = selectedRoleId === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => {
                      setSelectedRoleId(role.id);
                      setRoleSuccess("");
                      setRoleError("");
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.625rem 0.875rem",
                      borderRadius: 8,
                      border: `1.5px solid ${isSelected ? "#2d5fa6" : "#e2e8f0"}`,
                      background: isSelected ? "#eff6ff" : "#fff",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      userSelect: "none",
                    }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      {isSelected ? (
                        <BsShieldCheck size={15} color="#2d5fa6" />
                      ) : (
                        <BsShieldX size={15} color="#94a3b8" />
                      )}
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: isSelected ? 600 : 400,
                          color: isSelected ? "#1e3a5f" : "#374151",
                        }}
                      >
                        {role.name}
                      </span>
                    </div>
                    {/* Radio-style indicator */}
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: `2px solid ${isSelected ? "#2d5fa6" : "#cbd5e1"}`,
                        background: isSelected ? "#2d5fa6" : "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s ease",
                        flexShrink: 0,
                      }}
                    >
                      {isSelected && (
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="light" onClick={onHide} style={{ fontSize: "0.875rem" }}>
                Cancel
              </Button>
              <Button
                onClick={handleRolesSubmit}
                disabled={saving}
                style={{
                  background: "linear-gradient(135deg, #1e3a5f, #2d5fa6)",
                  border: "none",
                  fontSize: "0.875rem",
                }}
              >
                {saving ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-1" />
                    Saving…
                  </>
                ) : (
                  "Update Role"
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

/* ─── Main User Component ──────────────────────────────────────────────── */
const User = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [layout, setLayout]                     = useState("card");
  const [show, setShow]                         = useState(false);
  const [selectedStatus, setSelectedStatus]     = useState(null);
  const [selectedType, setSelectedType]         = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState({
    value: "all",
    label: "All",
  });

  // Modal state
  const [editUser, setEditUser]       = useState(null);
  const [modalSaving, setModalSaving] = useState(false);

  const { data: usersData, loading: usersLoading } = useSelector(
    (state) => state.user,
  );
  const {
    employees: employeesData,
    loading: empLoading,
    searchLoading: empSearchLoading,
  } = useSelector((state) => state.employee);
  const { data: rolesData = [], loading: rolesLoading } = useSelector(
    (state) => state.role,
  );

  const MediaUrl = import.meta.env.VITE_MEDIA_URL;

  useEffect(() => {
    dispatch(getUsers());
    dispatch(fetchAllEmployees());
    dispatch(getactiveRoles());
  }, [dispatch]);

  // ─── Normalize Users ───────────────────────────────────────────────────────
  const normalizedUsers = (usersData || []).map((u) => ({
    id: u.id,
    name: u.name ?? "—",
    phone: u.phone ?? u.mobile ?? "—",
    email: u.email ?? "—",
    designation: "—",
    department: "—",
    payoutRate: "—",
    profile:
      u.profile_photo_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&size=48&background=f3f2ff&color=5174f3`,
    userType: "user",
    status: u.status === "1" || u.status === 1 ? "active" : "inactive",
    roles: u.roles ?? [],
  }));

  // ─── Normalize Employees ───────────────────────────────────────────────────
  const normalizedEmployees = (employeesData || []).map((e) => {
    const profileDoc = (e.documents ?? []).find(
      (doc) => doc.document_type === "profile_image"
    );
    const profileUrl = profileDoc
      ? `${MediaUrl}/${profileDoc.file_path}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          (e.first_name ?? "") + "+" + (e.last_name ?? "")
        )}&size=48&background=f3f2ff&color=5174f3`;

    return {
      id: e.id,
      name: `${e.first_name ?? ""} ${e.middle_name ?? ""} ${e.last_name ?? ""}`.trim() || "—",
      phone: e.mobile ?? "—",
      email: e.email ?? "—",
      designation: e.designation?.name ?? "—",
      department: e.department?.name ?? "—",
      payoutRate: e.salaries?.[0]?.basic_salary ?? "—",
      profile: profileUrl,
      userType: "employee",
      status: e.status === "active" ? "active" : "inactive",
      roles: [],
    };
  });

  // ─── Local status map ─────────────────────────────────────────────────────
  const [localStatusMap, setLocalStatusMap] = useState({});
  const seededRef = useRef(false);

  useEffect(() => {
    if (
      seededRef.current === false &&
      !usersLoading &&
      !empSearchLoading &&
      (usersData?.length > 0 || employeesData?.length > 0)
    ) {
      seededRef.current = true;
      const map = {};
      (usersData || []).forEach((u) => {
        map[`user-${u.id}`] = u.status === "1" || u.status === 1 ? "active" : "inactive";
      });
      (employeesData || []).forEach((e) => {
        map[`employee-${e.id}`] = e.status === "active" ? "active" : "inactive";
      });
      setLocalStatusMap(map);
    }
  }, [usersLoading, empSearchLoading, usersData, employeesData]);

  // ─── Merge ────────────────────────────────────────────────────────────────
  const allUsers = [...normalizedUsers, ...normalizedEmployees].map((u) => {
    const key = `${u.userType}-${u.id}`;
    return localStatusMap[key] !== undefined
      ? { ...u, status: localStatusMap[key] }
      : u;
  });

  // ─── Designation options ──────────────────────────────────────────────────
  const designationSet = new Set(
    normalizedEmployees.map((u) => u.designation).filter((d) => d && d !== "—"),
  );
  const designationOptions = [
    { value: "all", label: "All" },
    ...Array.from(designationSet).map((d) => ({
      value: d.toLowerCase(),
      label: d,
    })),
  ];

  const statusOptions = [
    { label: "Active",   color: "#0f883930" },
    { label: "Inactive", color: "#cfb00f66" },
  ];

  const layoutOptions = {
    card:  { icon: <SlGrid />,                label: "As Card"  },
    table: { icon: <BsLayoutThreeColumns />,  label: "As Table" },
  };

  const handleSelect = (eventKey) => {
    setLayout(eventKey);
    setShow(false);
  };
  const handleClick = (status) =>
    setSelectedStatus((prev) => (prev === status ? null : status));

  // ─── Toggle status ────────────────────────────────────────────────────────
  const handleToggle = (item) => {
    const key = `${item.userType}-${item.id}`;
    const currentStatus = localStatusMap[key] ?? item.status;
    const nextStatus    = currentStatus === "active" ? "inactive" : "active";

    setLocalStatusMap((prev) => ({ ...prev, [key]: nextStatus }));
    const revert = () =>
      setLocalStatusMap((prev) => ({ ...prev, [key]: currentStatus }));

    if (item.userType === "user") {
      dispatch(updateStatus({ id: item.id, status: nextStatus === "active" ? "1" : "0" }))
        .unwrap()
        .catch(revert);
    } else {
      dispatch(toggleEmployeeStatus({ id: item.id, status: nextStatus }))
        .unwrap()
        .catch(revert);
    }
  };

  // ─── Edit click ───────────────────────────────────────────────────────────
  const handleEditClick = (item) => {
    if (item.userType === "employee") {
      navigate(`/employees/edit/${item.id}`);
    } else {
      setEditUser(item);
    }
  };

  // ─── Save password ────────────────────────────────────────────────────────
  const handleSavePassword = ({ userId, password, password_confirmation }) => {
    setModalSaving(true);
    return dispatch(updateUser({ id: userId, data: { password, password_confirmation } }))
      .unwrap()
      .finally(() => setModalSaving(false));
  };

  // ─── Save role ────────────────────────────────────────────────────────────
  const handleSaveRoles = ({ userId, roleId }) => {
    setModalSaving(true);
    return dispatch(updateUser({ id: userId, data: { role_id: roleId } }))
      .unwrap()
      .then(() => dispatch(getUsers()))
      .finally(() => setModalSaving(false));
  };

  // ─── Filtering ────────────────────────────────────────────────────────────
  const filteredUsers = allUsers.filter((user) => {
    const matchStatus = selectedStatus
      ? user.status.toLowerCase() === selectedStatus.toLowerCase()
      : true;
    const matchType = selectedType ? user.userType === selectedType : true;
    const matchDesignation =
      !selectedDesignation || selectedDesignation.value === "all"
        ? true
        : user.designation.toLowerCase() === selectedDesignation.value.toLowerCase();
    return matchStatus && matchType && matchDesignation;
  });

  const isLoading = !seededRef.current && (usersLoading || empSearchLoading);

  return (
    <Container fluid className="gx-0">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center py-2">
            <div className="page-header w-100">
              <h5 className="mb-0">Users</h5>
            </div>
            <Dropdown show={show} onToggle={(isOpen) => setShow(isOpen)} onSelect={handleSelect}>
              <Dropdown.Toggle id="layout-dropdown" className="border bg-transparent text-dark">
                <div>
                  {layoutOptions[layout].icon}
                  <span className="ms-2"><RiArrowDownSLine /></span>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {Object.entries(layoutOptions).map(([key, option]) => (
                  <Dropdown.Item eventKey={key} key={key}>
                    {option.icon} <span className="ms-2">{option.label}</span>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="border-0 pt-3">
            <div className="d-flex justify-content-between align-items-center px-4 mb-2">
              {/* Type filter */}
              <div className="d-flex align-items-center filter-btn-area">
                {["", "user", "employee"].map((type) => (
                  <div
                    key={type || "all"}
                    className={`report-filter-btn btn ${selectedType === type ? "active" : ""}`}
                    onClick={() => setSelectedType(type)}
                  >
                    <p className="mb-0">
                      {type === "" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Status filter */}
              <div className="svg-container d-flex">
                {statusOptions.map(({ label, color }) => {
                  const isSelected = selectedStatus === label;
                  return (
                    <div
                      key={label}
                      className="svg-item position-relative"
                      onClick={() => handleClick(label)}
                      style={{ cursor: "pointer" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="185 358.75 450 102.5">
                        <polygon
                          fill={isSelected ? color : "#fff"}
                          stroke={color}
                          strokeWidth="3"
                          points="564 460.25 186 460.25 256 410 186 359.75 564 359.75 634 410 564 460.25"
                        />
                      </svg>
                      <p className="mb-0">{label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Designation filter */}
              <div>
                <Select
                  className="my-select"
                  classNamePrefix="custom"
                  options={designationOptions}
                  value={selectedDesignation}
                  onChange={setSelectedDesignation}
                  placeholder="Select designation..."
                />
              </div>
            </div>

            <div className="user-wrapper">
              <CardBody className="py-0">
                <div className="user-content">
                  {isLoading ? (
                    <div className="text-center py-5">Loading...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-5 text-muted">No users found.</div>
                  ) : layout === "card" ? (
                    <Row>
                      {filteredUsers.map((user) => (
                        <Col lg={3} sm={12} key={`${user.userType}-${user.id}`}>
                          <Card className="border-primary mb-3">
                            <CardHeader className="bg-white">
                              <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                  {/* ✅ Fix 2: Avatar replaces bare <Image> in card view */}
                                  <Avatar
                                    name={user.name}
                                    src={user.profile}
                                    size={48}
                                    className="border p-1 avatar"
                                  />
                                  <div className="ms-2 ps-2 border-start">
                                    <label className="ps-1 d-block">{user.name}</label>
                                    <div>
                                      <Badge pill bg="primary" className="fw-normal">
                                        {user.designation?.length > 17
                                          ? user.designation.substring(0, 17) + "..."
                                          : user.designation}
                                      </Badge>
                                      <Badge pill bg="dark" className="ms-2 fw-normal">
                                        {user.department?.length > 17
                                          ? user.department.substring(0, 17) + "..."
                                          : user.department}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <CustomStatusSwitch
                                  isOn={user.status === "active"}
                                  handleToggle={() => handleToggle(user)}
                                />
                              </div>
                            </CardHeader>
                            <CardBody>
                              <p>
                                <LuPhone />
                                <span className="ms-1">{user.phone}</span>
                              </p>
                              <p>
                                <MdAlternateEmail />
                                <span className="text-truncate ms-1">{user.email}</span>
                              </p>
                              <p>
                                <FaRupeeSign />
                                <span className="text-truncate ms-1">{user.payoutRate}</span>
                              </p>
                              <div className="d-flex justify-content-end mt-1">
                                <button
                                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                  style={{ fontSize: "0.75rem" }}
                                  onClick={() => handleEditClick(user)}
                                >
                                  <FiEdit size={13} /> Edit
                                </button>
                              </div>
                            </CardBody>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Row>
                      <Col>
                        <Table striped bordered hover responsive>
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Designation</th>
                              <th>Department</th>
                              <th>Phone</th>
                              <th>Email</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.map((user) => (
                              <tr key={`${user.userType}-${user.id}`}>
                                <td>{user.name}</td>
                                <td>{user.designation}</td>
                                <td>{user.department}</td>
                                <td>{user.phone}</td>
                                <td>{user.email}</td>
                                <td>
                                  <CustomStatusSwitch
                                    isOn={user.status === "active"}
                                    handleToggle={() => handleToggle(user)}
                                  />
                                </td>
                                <td>
                                  <FiEdit
                                    size={"1rem"}
                                    className="text-info"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleEditClick(user)}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </Col>
                    </Row>
                  )}
                </div>
              </CardBody>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ── Edit Modal ── */}
      <EditUserModal
        user={editUser}
        allRoles={rolesData}
        show={!!editUser}
        onHide={() => setEditUser(null)}
        onSavePassword={handleSavePassword}
        onSaveRoles={handleSaveRoles}
        saving={modalSaving}
      />
    </Container>
  );
};

export default User;