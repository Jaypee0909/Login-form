import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/Auth.css';

function Signup() {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  
  // Validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState('');
  
  const navigate = useNavigate();

  // Check if user is already logged in on component mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Validate email as user types
  useEffect(() => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  }, [email]);

  // Validate password as user types and check strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength('');
      setPasswordError('');
      return;
    }
    
    let strength = '';
    let error = '';
    
    // Check length
    if (password.length < 8) {
      error = 'Password must be at least 8 characters long';
      strength = 'weak';
    } 
    // Check for number
    else if (!/\d/.test(password)) {
      error = 'Password must contain at least one number';
      strength = 'weak';
    } 
    // Check for special character
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      error = 'Password must contain at least one special character';
      strength = 'medium';
    } else {
      strength = 'strong';
    }
    
    setPasswordStrength(strength);
    setPasswordError(error);
  }, [password]);

  // Check if passwords match
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordMatchError('Passwords do not match');
    } else {
      setPasswordMatchError('');
    }
  }, [password, confirmPassword]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Check for any validation errors before submission
    if (emailError || passwordError || passwordMatchError) {
      setError('Please fix the errors before submitting');
      return;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      // Save the new user
      const saveResult = authService.saveUser({
        username,
        firstName,
        lastName,
        email,
        password,
        createdAt: new Date().toISOString()
      });
      
      if (!saveResult) {
        setError('Failed to create account');
        return;
      }
      
      // Auto login the user
      const loginResult = authService.login(username, password);
      
      if (loginResult) {
        console.log('Login successful, redirecting to dashboard');
        navigate('/dashboard'); // Note: using lowercase to match conventional routing
      } else {
        setError('Account created but automatic login failed');
      }
    } catch (err) {
      console.error('Error during signup:', err);
      setError(err.message || 'An unexpected error occurred');
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-left">
          <h1>Create an Account</h1>
          
          <p className="auth-social-text">Sign up using social networks</p>
          <div className="social-icons">
            <button className="social-btn facebook" type="button">f</button>
            <button className="social-btn google" type="button">G+</button>
            <button className="social-btn linkedin" type="button">in</button>
          </div>
          
          <div className="divider">
            <span>OR</span>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={emailError ? 'input-error' : ''}
              />
              {emailError && <div className="field-error">{emailError}</div>}
            </div>
            
            <div className="form-group">
              <input
                type={passwordVisible ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={passwordError ? 'input-error' : ''}
              />
              <span 
                className="password-icon" 
                onClick={togglePasswordVisibility}
              >
                {passwordVisible ? '👁️' : '👁️‍🗨️'}
              </span>
              {passwordStrength && (
                <div className={`password-strength ${passwordStrength}`}>
                  Password strength: {passwordStrength}
                </div>
              )}
              {passwordError && <div className="field-error">{passwordError}</div>}
            </div>
            
            <div className="form-group">
              <input
                type={passwordVisible ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={passwordMatchError ? 'input-error' : ''}
              />
              {passwordMatchError && <div className="field-error">{passwordMatchError}</div>}
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={emailError || passwordError || passwordMatchError}
            >
              Sign Up
            </button>
          </form>
        </div>
        
        <div className="auth-right">
          <h2>Already Have an Account?</h2>
          <p>Log in and continue your journey with us!</p>
          <Link to="/" className="auth-redirect-button">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;