import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const Signup = () => {
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Step 1: Create the new user
      const userResponse = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
        credentials: 'include',
      });

      const userData = await userResponse.json();

      if (userResponse.ok) {
        // Step 2: Fetch roles
        const rolesResponse = await fetch('http://localhost:3001/roles', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const roles = await rolesResponse.json();

        // Step 3: Find the "customer" role ID
        const customerRole = roles.find(role => role.name.toLowerCase() === 'customer');
        if (!customerRole) {
          throw new Error('Customer role not found');
        }

        // Step 4: Assign the "customer" role to the new user
        const assignRoleResponse = await fetch('http://localhost:3001/user_roles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userData.id, role_id: customerRole.id }),
        });

        //Setp 5 save the addresse of the new user 
        const addressResponse = await fetch(`http://localhost:3001/user/${userData.id}/address`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ address }),
        })

        const phoneResponse = await fetch(`http://localhost:3001/user/${userData.id}/phone_number`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone }),
        })


        // Setp 6  : Creating a new cart for the customer
        const createCartResponse = await fetch('http://localhost:3007/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userData.id }),
        })

        const assignRoleData = await assignRoleResponse.json();

        if (assignRoleResponse.ok) {
          // Clear the form and navigate to the login page
          setUsername('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          navigate('/login');
        } else {
          throw new Error(assignRoleData.error || 'Failed to assign role to user');
        }
      } else {
        setError(userData.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An error occurred');
    }
  };

  const handleGoogleLoginSuccess = (credentialResponse) => {
    console.log(credentialResponse);
    setError('Google login successful');
  };

  const handleGoogleLoginFailure = (error) => {
    console.log(error);
    setError('Google login failed');
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <section className="login-wrapper p-5">
        <div className="container-xxl">
          <div className="row justify-content-center">
            <div className="col-lg-4 col-md-8 col-sm-10">
                <div className="card">
                  <div className="card-body p-5">
                    <h2 className="text-center">Sign Up</h2>
                    <p className="text-center mb-3">Join us in shopping!!</p>
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label htmlFor="username" className="form-label mb-3">
                          Enter Your Username
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="username"
                          placeholder="enter username here ..."
                          value={username}
                          onChange={(event) => setUsername(event.target.value)}
                          required
                        />
                      </div>
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
                        <label htmlFor="address" className="form-label mb-3">
                          Enter Your Physical Address
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="address"
                          placeholder="enter physical address here ..."
                          value={address}
                          onChange={(event) => setAddress(event.target.value)}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="phone" className="form-label mb-3">
                          Enter Your Phone Number
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          id="phone"
                          placeholder="enter phone number here ..."
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="password" className="form-label mb-3">
                          Enter Your password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="password"
                          placeholder="enter password here..."
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="confirmPassword"
                          className="form-label mb-3"
                        >
                          Confirm Your password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="confirmPassword"
                          placeholder="rewrite password here..."
                          value={confirmPassword}
                          onChange={(event) =>
                            setConfirmPassword(event.target.value)
                          }
                          required
                        />
                      </div>
                      {error && (
                        <div className="alert alert-danger">{error}</div>
                      )}
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <p>
                          Have an account?
                        </p>
                        <Link to="/login" className="form-link">
                          Log In
                        </Link>
                      </div>
                      <div className="d-grid gap-2">
                        <button type="submit">Sign Up</button>
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

export default Signup;
