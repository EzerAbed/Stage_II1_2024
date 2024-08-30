import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import UserContext from '../Context/UserContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password === '' || email === '') {
      setError('Please enter correct details!');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:3001/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Something went wrong');
      }
  
      const data = await response.json();
      if (data.user_id) {
        setError('');
  
        // Store the user ID in localStorage
        localStorage.setItem('user_id', data.user_id);
  
        // Set the user context
        setUser({
          id: data.user_id,
          email: email
        });
  
        // Fetch the user role and navigate based on it
        const roleResponse = await fetch(`http://localhost:3001/user_roles/${data.user_id}`);
        const roleData = await roleResponse.json();
        const userRoleID = roleData[0]?.role_id; // Safely access the role
        
        const roleNameResponse = await fetch(`http://localhost:3001/roles/${userRoleID}`)
        const roleNameData = await roleNameResponse.json();
        const userRole = roleNameData?.name; // Safely access the role name
  
        if (userRole === 'customer') {
          navigate('/');
        } else if (userRole === 'admin') {
          window.location.href = 'http://localhost:5174/';
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError(error.message || 'Login failed');
    }
  
    setEmail('');
    setPassword('');
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleLoginSuccess = (credentialResponse) => {
    console.log(credentialResponse);
    // TODO: Send Google login request to server with credentialResponse
    setError('Google login successful');
  };

  const handleGoogleLoginFailure = (error) => {
    console.log(error);
    setError('Google login failed');
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID"> {/*Replace with your actual Google OAuth Client ID*/}
      <section className="login-wrapper p-5">
        <div className="container-xxl">
          <div className="row justify-content-center">
            <div className="col-lg-4 col-md-8 col-sm-10">
              <div className="card">
                <div className="card-body p-5">
                  <h2 className="text-center">LOGIN</h2>
                  <p className="text-center mb-4">Welcome Back!!</p>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label mb-3">
                        Enter Your Email address
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="enter email here ..."
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password" className="form-label mb-3">
                        Enter Your password
                      </label>
                      <div className="input-group">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control"
                          id="password"
                          placeholder="enter password here..."
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          required
                          style={{ height: '50px' }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={togglePasswordVisibility}
                          style={{ height: '50px' }}
                        >
                          {showPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="alert alert-danger">{error}</div>
                    )}
                    <div className="mb-3">
                      <Link to="/forgotpassword" className="form-link">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <p className='m-0'>Don't have an account?</p>
                      <Link to="/signup" className="form-link">
                        Sign up
                      </Link>
                    </div>
                    <div className="d-grid gap-2">
                      <button type="submit" className="btn btn-primary">
                        Login
                      </button>
                    </div>
                    <div className="d-grid gap-2 mt-3">
                      <GoogleLogin
                        onSuccess={handleGoogleLoginSuccess}
                        onError={handleGoogleLoginFailure}
                      />
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </GoogleOAuthProvider>
  );
};

export default Login;
