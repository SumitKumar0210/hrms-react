import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Container, Row, Col, Button, Badge, Alert, Card, Form, Spinner,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getDataByModule, getModulePermission } from "./slice/userPermissionsSlice";
import { successMessage, errorMessage } from "../../toast";
import { capitalize } from "lodash";
import { assignPermission } from "../settings/slices/roleSlice";
import { useParams } from "react-router-dom";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";

const PermissionGroupManager = () => {
  const { id } = useParams();
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});
  const [initialPermissions, setInitialPermissions] = useState([]);

  const {
    permissions = {},
    rolePermissions = null,
    loading = false,
  } = useSelector((state) => state.userPermissions);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getDataByModule());
    if (id) dispatch(getModulePermission(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (rolePermissions?.permissions && Array.isArray(rolePermissions.permissions)) {
      const existingIds = rolePermissions.permissions.map((p) => p.id);
      setSelectedPermissions(existingIds);
      setInitialPermissions(existingIds);
    }
  }, [rolePermissions]);

  // ─── Grouped & sorted permissions ────────────────────────────────────────
  const groupedPermissions = useMemo(() => {
    if (permissions && typeof permissions === "object" && !Array.isArray(permissions)) {
      const sorted = {};
      Object.keys(permissions).forEach((module) => {
        sorted[module] = [...permissions[module]].sort((a, b) => a.name.localeCompare(b.name));
      });
      return sorted;
    }
    if (Array.isArray(permissions)) {
      const grouped = {};
      permissions.forEach((p) => {
        const mod = p.module || "other";
        if (!grouped[mod]) grouped[mod] = [];
        grouped[mod].push(p);
      });
      Object.keys(grouped).forEach((mod) => grouped[mod].sort((a, b) => a.name.localeCompare(b.name)));
      return grouped;
    }
    return {};
  }, [permissions]);

  const sortedModules = useMemo(() => Object.keys(groupedPermissions).sort(), [groupedPermissions]);

  const allPermissionIds = useMemo(() => {
    const ids = [];
    Object.values(groupedPermissions).forEach((perms) => perms.forEach((p) => ids.push(p.id)));
    return ids;
  }, [groupedPermissions]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handlePermissionToggle = useCallback((permissionId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId) ? prev.filter((i) => i !== permissionId) : [...prev, permissionId]
    );
  }, []);

  const handleModuleSelectAll = useCallback(
    (module, isChecked) => {
      const moduleIds = groupedPermissions[module]?.map((p) => p.id) || [];
      setSelectedPermissions((prev) =>
        isChecked
          ? [...prev, ...moduleIds.filter((i) => !prev.includes(i))]
          : prev.filter((i) => !moduleIds.includes(i))
      );
    },
    [groupedPermissions]
  );

  const isModuleFullySelected = useCallback(
    (module) => {
      const perms = groupedPermissions[module];
      return perms?.length > 0 && perms.every((p) => selectedPermissions.includes(p.id));
    },
    [groupedPermissions, selectedPermissions]
  );

  const isModulePartiallySelected = useCallback(
    (module) => {
      const perms = groupedPermissions[module];
      if (!perms?.length) return false;
      const count = perms.filter((p) => selectedPermissions.includes(p.id)).length;
      return count > 0 && count < perms.length;
    },
    [groupedPermissions, selectedPermissions]
  );

  const toggleAccordion = useCallback((module) => {
    setExpandedModules((prev) => ({ ...prev, [module]: !prev[module] }));
  }, []);

  const handleExpandAll = useCallback(() => {
    const all = {};
    sortedModules.forEach((m) => (all[m] = true));
    setExpandedModules(all);
  }, [sortedModules]);

  const handleCollapseAll = useCallback(() => setExpandedModules({}), []);
  const handleSelectAll = useCallback(() => setSelectedPermissions(allPermissionIds), [allPermissionIds]);
  const handleDeselectAll = useCallback(() => setSelectedPermissions([]), []);

  const isInitiallyAssigned = useCallback(
    (permissionId) => initialPermissions.includes(permissionId),
    [initialPermissions]
  );

  const getChangesSummary = useMemo(() => {
    const added = selectedPermissions.filter((i) => !initialPermissions.includes(i));
    const removed = initialPermissions.filter((i) => !selectedPermissions.includes(i));
    return { added, removed, hasChanges: added.length > 0 || removed.length > 0 };
  }, [selectedPermissions, initialPermissions]);

  const getPermissionAction = useCallback((name) => {
    if (!name) return "";
    const parts = name.split(".");
    return parts[1] ? capitalize(parts[1].replace(/_/g, " ")) : "";
  }, []);

  const getSelectedPermissionNames = useCallback(() => {
    const names = [];
    Object.values(groupedPermissions).forEach((perms) =>
      perms.forEach((p) => { if (selectedPermissions.includes(p.id)) names.push(p.name); })
    );
    return names;
  }, [groupedPermissions, selectedPermissions]);

  const handleUpdatePermissions = useCallback(() => {
    if (selectedPermissions.length === 0) {
      errorMessage("Please select at least one permission");
      return;
    }
    const run = async () => {
      await dispatch(assignPermission({
        id,
        permissionIds: selectedPermissions,
        permissionNames: getSelectedPermissionNames(),
      }));
      await dispatch(getModulePermission(id));
      successMessage(`${selectedPermissions.length} permission(s) assigned`);
    };
    run();
  }, [selectedPermissions, id, dispatch, getSelectedPermissionNames]);

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <Spinner animation="border" size="sm" className="me-2" />
        <span>Loading permissions...</span>
      </div>
    );
  }

  return (
    <Container fluid className="p-3">
      {/* Header */}
      <div className="mb-3">
        <h5 className="mb-1 d-flex align-items-center gap-2">
          Permission Management
          {rolePermissions && (
            <Badge bg="primary" className="fw-normal fs-6">
              {rolePermissions.name}
            </Badge>
          )}
        </h5>
        <small className="text-muted">Select permissions and click update to assign them</small>
      </div>

      {/* Action Bar */}
      <Card className="border-0 shadow-sm mb-3">
        <Card.Body className="py-2">
          <Row className="align-items-center g-2">
            <Col xs={12} md={6}>
              <div className="d-flex gap-2 flex-wrap">
                <Button variant="outline-secondary" size="sm" onClick={handleExpandAll}>Expand All</Button>
                <Button variant="outline-secondary" size="sm" onClick={handleCollapseAll}>Collapse All</Button>
                <Button variant="outline-secondary" size="sm" onClick={handleSelectAll}>Select All</Button>
                <Button variant="outline-secondary" size="sm" onClick={handleDeselectAll}>Deselect All</Button>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="d-flex gap-2 justify-content-md-end align-items-center flex-wrap">
                <Badge
                  bg={selectedPermissions.length > 0 ? "primary" : "secondary"}
                  className="fw-normal py-2 px-3 fs-6"
                >
                  {selectedPermissions.length} selected
                </Badge>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleUpdatePermissions}
                  disabled={selectedPermissions.length === 0 || !getChangesSummary.hasChanges}
                >
                  Update Permissions
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Change Alerts */}
      {getChangesSummary.hasChanges && (
        <Alert variant="warning" className="mb-3 py-2">
          <strong className="d-block mb-1">Changes detected:</strong>
          {getChangesSummary.added.length > 0 && (
            <div className="text-success">+ {getChangesSummary.added.length} permission(s) will be added</div>
          )}
          {getChangesSummary.removed.length > 0 && (
            <div className="text-danger">- {getChangesSummary.removed.length} permission(s) will be removed</div>
          )}
        </Alert>
      )}

      {selectedPermissions.length > 0 && !getChangesSummary.hasChanges && (
        <Alert variant="info" className="mb-3 py-2">
          Currently {selectedPermissions.length} permission(s) assigned. Make changes and click Update to save.
        </Alert>
      )}

      {/* Permissions Accordion */}
      {sortedModules.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-4 text-muted">
            No permissions available
          </Card.Body>
        </Card>
      ) : (
        <div className="d-flex flex-column gap-2">
          {sortedModules.map((module) => {
            const modulePermissions = groupedPermissions[module];
            const isFullySelected = isModuleFullySelected(module);
            const isPartial = isModulePartiallySelected(module);
            const isExpanded = expandedModules[module] || false;

            return (
              <Card key={module} className="border shadow-sm overflow-hidden">
                {/* Accordion Header */}
                <div
                  className="d-flex align-items-center px-3 py-2 bg-light"
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleAccordion(module)}
                >
                  {/* Checkbox — stop propagation so click doesn't toggle accordion */}
                  <div onClick={(e) => e.stopPropagation()} className="me-2">
                    <Form.Check
                      type="checkbox"
                      checked={isFullySelected}
                      ref={(el) => { if (el) el.indeterminate = isPartial && !isFullySelected; }}
                      onChange={(e) => handleModuleSelectAll(module, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <span className="fw-semibold flex-grow-1" style={{ fontSize: "0.95rem" }}>
                    {capitalize(module.replace(/_/g, " "))}
                  </span>

                  <Badge bg="primary" className="fw-normal me-3" style={{ fontSize: "0.75rem" }}>
                    {modulePermissions.length} permission{modulePermissions.length !== 1 ? "s" : ""}
                  </Badge>

                  {isExpanded ? <RiArrowUpSLine size={18} /> : <RiArrowDownSLine size={18} />}
                </div>

                {/* Accordion Body */}
                {isExpanded && (
                  <Card.Body className="pt-3">
                    <Row className="g-2">
                      {modulePermissions.map((permission) => {
                        const isChecked = selectedPermissions.includes(permission.id);
                        const wasInitial = isInitiallyAssigned(permission.id);
                        const isNewlyAdded = isChecked && !wasInitial;
                        const isRemoved = !isChecked && wasInitial;

                        return (
                          <Col xs={12} sm={6} md={4} key={permission.id}>
                            <div className="d-flex align-items-start gap-2">
                              <Form.Check
                                type="checkbox"
                                id={`perm-${permission.id}`}
                                checked={isChecked}
                                onChange={() => handlePermissionToggle(permission.id)}
                                className={
                                  isNewlyAdded ? "text-success" : isRemoved ? "text-danger" : ""
                                }
                              />
                              <label
                                htmlFor={`perm-${permission.id}`}
                                style={{ cursor: "pointer", lineHeight: 1.3 }}
                              >
                                <div className="d-flex align-items-center gap-1 flex-wrap">
                                  <span className="fw-medium" style={{ fontSize: "0.875rem" }}>
                                    {getPermissionAction(permission.name)}
                                  </span>
                                  {wasInitial && (
                                    <Badge
                                      bg="secondary"
                                      className="fw-normal"
                                      style={{ fontSize: "0.65rem", padding: "2px 5px" }}
                                    >
                                      Current
                                    </Badge>
                                  )}
                                  {isNewlyAdded && (
                                    <Badge
                                      bg="success"
                                      className="fw-normal"
                                      style={{ fontSize: "0.65rem", padding: "2px 5px" }}
                                    >
                                      New
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                  {permission.name}
                                </div>
                              </label>
                            </div>
                          </Col>
                        );
                      })}
                    </Row>
                  </Card.Body>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary Footer */}
      {selectedPermissions.length > 0 && (
        <Card className="border-0 shadow-sm mt-3">
          <Card.Body className="py-2">
            <small className="fw-semibold">
              Summary: {selectedPermissions.length} permission(s) selected across{" "}
              {sortedModules.filter((module) =>
                groupedPermissions[module].some((p) => selectedPermissions.includes(p.id))
              ).length}{" "}
              module(s)
            </small>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default PermissionGroupManager;