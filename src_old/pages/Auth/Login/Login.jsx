import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authLogin } from '../authSlice';
import { useAuth } from '../../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { login: authContextLogin } = useAuth();

  // Get loading and error state from Redux
  const { loading, error } = useSelector((state) => state.auth || { loading: false, error: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(''); // Clear any previous errors

    try {
      // Dispatch login action and get the result
      const result = await dispatch(authLogin({ email, password })).unwrap();

      // If login successful, trigger AuthContext to validate and fetch user details
      if (result.access_token) {
        await authContextLogin(result.access_token);
        
        // Get redirect path or default to dashboard
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
        sessionStorage.removeItem('redirectAfterLogin');
        
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      // Handle error - it might not be in Redux state yet
      setLocalError(err || 'Login failed. Please try again.');
      console.error('Login error:', err);
    }
  };

  // Use local error or Redux error
  const displayError = localError || error;

  return (
    <Card className="shadow-lg login-card">
      <Card.Body className="p-5">
        <div className="text-center mb-4">
          <h2 className="fw-bold">Welcome Back</h2>
          <p className="text-muted">Sign in to your account</p>
        </div>

        {displayError && <Alert variant="danger">{displayError}</Alert>}

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
              disabled={loading}
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
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formCheckbox">
            <Form.Check 
              type="checkbox" 
              label="Remember me"
              disabled={loading}
            />
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
            <a href="/forgot-password" className="text-decoration-none">
              Forgot password?
            </a>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default Login;