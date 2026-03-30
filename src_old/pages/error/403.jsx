import React from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { MdBlock } from "react-icons/md";

const Error403 = () => {
  const navigate = useNavigate();

  return (
    <Container
      className="d-flex align-items-center justify-content-center flex-column text-center"
      style={{ minHeight: "100vh" }}
    >
      {/* Icon */}
      <div className="mb-3">
        <MdBlock style={{ fontSize: 120, color: "#fd7e14" }} />
      </div>

      {/* 403 Heading */}
      <h1 className="fw-bold mb-1">403</h1>

      {/* Subtitle */}
      <h5 className="text-secondary mb-1">Access Denied</h5>

      {/* Description */}
      <p className="text-secondary mb-4" style={{ maxWidth: 500 }}>
        You don't have permission to access this page. Please contact your
        administrator if you believe this is an error.
      </p>

      {/* Buttons */}
      <div className="d-flex gap-2 flex-wrap justify-content-center">
        <Button
          variant="primary"
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 rounded-3 text-capitalize"
          style={{ textTransform: "none" }}
        >
          Go to Dashboard
        </Button>
        <Button
          variant="outline-primary"
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-3"
          style={{ textTransform: "none" }}
        >
          Go Back
        </Button>
      </div>

      {/* Footer */}
      <p className="text-muted mt-5 small">
        © {new Date().getFullYear()}{" "}
        <a
          href="https://techiesquad.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Techie Squad ®
        </a>
        . All rights reserved.
      </p>
    </Container>
  );
};

export default Error403;