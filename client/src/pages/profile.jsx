import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [addressId, setAddressId] = useState(null);
    const [phoneId, setPhoneId] = useState(null);

    useEffect(() => {
        const userId = localStorage.getItem('user_id');
        
        if (!userId) {
            alert("You need to be connected to access this page.");
            window.location.href = '/login'; // Redirect to login page
            return;
        }

        const fetchUserData = async () => {
            try {
                // Fetch user information
                const userResponse = await axios.get(`http://localhost:3001/users/${userId}`);
                setUsername(userResponse.data.username);
                setEmail(userResponse.data.email);

                // Fetch user address
                const addressResponse = await axios.get(`http://localhost:3001/user/${userId}/addresses`);
                if (addressResponse.data.length > 0) {
                    setAddress(addressResponse.data[0].address);
                    setAddressId(addressResponse.data[0].id);
                }

                // Fetch user phone number
                const phoneResponse = await axios.get(`http://localhost:3001/user/${userId}/phone_numbers`);
                if (phoneResponse.data.length > 0) {
                    setPhone(phoneResponse.data[0].phone_number);
                    setPhoneId(phoneResponse.data[0].id);
                }

            } catch (error) {
                console.error('Error fetching user data:', error);
                alert('Failed to load user data.');
            }
        };

        fetchUserData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('user_id');

        try {
            // Update user information
            await axios.put(`http://localhost:3001/users/${userId}`, { username, email });

            // Update or add address
            if (addressId) {
                await axios.put(`http://localhost:3001/user/${userId}/addresses/${addressId}`, { address });
            } else {
                await axios.post(`http://localhost:3001/user/${userId}/addresses`, { address });
            }

            // Update or add phone number
            if (phoneId) {
                await axios.put(`http://localhost:3001/user/${userId}/phone_number/${phoneId}`, { phone_number: phone });
            } else {
                await axios.post(`http://localhost:3001/user/${userId}/phone_numbers`, { phone_number: phone });
            }

            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        }
    };

    return (
        <section className="login-wrapper p-5">
            <div className="container-xxl">
                <div className="row justify-content-center">
                    <div className="col-lg-4 col-md-8 col-sm-10">
                        <div className="card">
                            <div className="card-body p-5">
                                <h2 className="text-center">Complete Your Profile</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label mb-3">Username :</label>
                                        <input
                                            id="username"
                                            className="form-control"
                                            type="text"
                                            placeholder="New Username"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label mb-3">Email :</label>
                                        <input
                                            id="email"
                                            className="form-control"
                                            type="email"
                                            placeholder="New Email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="address" className="form-label mb-3">Address :</label>
                                        <input
                                            id="address"
                                            className="form-control"
                                            type="text"
                                            placeholder="New Address"
                                            required
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="phone" className="form-label mb-3">Phone Number :</label>
                                        <input
                                            id="phone"
                                            className="form-control"
                                            type="text"
                                            placeholder="New Phone Number"
                                            required
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>

                                    <button type="submit" className="btn btn-outline-secondary">Save</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Profile;
