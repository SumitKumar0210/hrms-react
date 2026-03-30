import React from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { MdErrorOutline } from "react-icons/md";

const Error404 = () => {
  const navigate = useNavigate();

  return (
    <Container
      className="d-flex align-items-center justify-content-center flex-column text-center"
      style={{ minHeight: "100vh" }}
    >
      {/* Icon */}
      <div className="mb-3">
        <MdErrorOutline style={{ fontSize: 120, color: "#dc3545" }} />
      </div>

      {/* 404 Heading */}
      <h1 className="fw-bold mb-1">404</h1>

      {/* Subtitle */}
      <h5 className="text-secondary mb-4">
        Oops! The page you're looking for doesn't exist.
      </h5>

      {/* Button */}
      <Button
        variant="primary"
        onClick={() => navigate("/dashboard")}
        className="px-4 py-2 rounded-3"
        style={{ textTransform: "none" }}
      >
        Go Back Home
      </Button>

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

export default Error404;