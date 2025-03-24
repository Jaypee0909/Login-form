import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/Auth.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Attempt to login
    const loggedIn = authService.login(username, password);
    
    if (loggedIn) {
      navigate('/Dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-left">
          <h1>Login to Your Account</h1>
          
          <p className="auth-social-text">Login using social networks</p>
          <div className="social-icons">
            <button className="social-btn facebook">f</button>
            <button className="social-btn google">G+</button>
            <button className="social-btn linkedin">in</button>
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
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span 
                className="password-icon" 
                onClick={togglePasswordVisibility}
                role="button"
                tabIndex="0"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️‍🗨️" : "👁️"}
              </span>
            </div>
            <button type="submit" className="auth-button">Sign In</button>
          </form>
        </div>
        
        <div className="auth-right">
          <h2>New Here?</h2>
          <p>Sign up and discover a great amount of new opportunities!</p>
          <Link to="/signup" className="auth-redirect-button">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;