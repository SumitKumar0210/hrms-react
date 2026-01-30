import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Add your authentication logic here
      // Example:
      // const response = await loginAPI(email, password);
      
      // Simulated login
      if (email && password) {
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setError('Please enter valid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg login-card">
      <Card.Body className="p-5">
        <div className="text-center mb-4">
          <h2 className="fw-bold">Welcome Back</h2>
          <p className="text-muted">Sign in to your account</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              size="lg"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              size="lg"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formCheckbox">
            <Form.Check type="checkbox" label="Remember me" />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100 py-2"
            size="lg"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="text-center mt-3">
            <a href="#forgot" className="text-decoration-none">
              Forgot password?
            </a>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default Login;