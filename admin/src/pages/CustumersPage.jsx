import React, { useState, useEffect } from 'react';
import '../css/loading.css';

const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editingRole, setEditingRole] = useState(null);
  const [newRole, setNewRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/users', { credentials: 'include' })
      .then(response => response.json())
      .then(users => {
        const fetchDetails = users.map(user => {
          return Promise.all([
            fetch(`http://localhost:3001/user/${user.id}/addresses`).then(res => res.json()),
            fetch(`http://localhost:3001/user/${user.id}/phone_numbers`).then(res => res.json()),
            fetch(`http://localhost:3001/user_roles/${user.id}`).then(res => res.json())
          ]).then(([addresses, phoneNumbers, roles]) => {
            const roleId = roles[0]?.role_id;
            return fetch(`http://localhost:3001/roles/${roleId}`)
              .then(res => res.json())
              .then(role => ({
                ...user,
                address1: addresses[0]?.address || '-',
                address2: addresses[1]?.address || '-',
                phoneNumber: phoneNumbers[0]?.phone_number || '-',
                role: role.name || '-',
                roleId: roleId
              }));
          });
        });

        Promise.all(fetchDetails).then(customersWithDetails => {
          setCustomers(customersWithDetails);
        });

        fetch('http://localhost:3001/roles')
          .then(response => response.json())
          .then(data => setRoles(data));
      })
      .catch(error => console.error('Error fetching data:', error));
      
  }, []);

  const handleEditRole = (customerId, roleId) => {
    setEditingRole(customerId);
    setNewRole(roleId);
  };

  const handleRoleChange = (e) => {
    setNewRole(e.target.value);
  };

  const handleSaveRole = (customer) => {
    setLoading(true);
    fetch(`http://localhost:3001/user_roles/${customer.id}/${customer.roleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role_id: newRole }),
    })
      .then(response => {
        if (response.ok) {
          setCustomers(customers.map(c => c.id === customer.id ? { ...c, role: roles.find(r => r.id === parseInt(newRole)).name } : c));
          setEditingRole(null);
        } else {
          console.error('Failed to update role');
        }
      })
      .catch(error => console.error('Error updating role:', error))
      .finally(() => setLoading(false));
  };

  const handleDelete = (customer) => {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setLoading(true);
    fetch(`http://localhost:3001/users/${selectedCustomer.id}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (response.ok) {
          setCustomers(customers.filter(c => c.id !== selectedCustomer.id));
          setShowDeleteModal(false);
        } else {
          console.error('Failed to delete customer');
        }
      })
      .catch(error => console.error('Error deleting customer:', error))
      .finally(() => setLoading(false));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Users List</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 border border-gray-300">Username</th>
              <th className="py-2 border border-gray-300">Address 1</th>
              <th className="py-2 border border-gray-300">Address 2</th>
              <th className="py-2 border border-gray-300">Phone Number</th>
              <th className="py-2 border border-gray-300">Email</th>
              <th className="py-2 border border-gray-300">Role</th>
              <th className="py-2 border border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id} className="text-center">
                <td className="py-2 border border-gray-300">{customer.username}</td>
                <td className="py-2 border border-gray-300">{customer.address1}</td>
                <td className="py-2 border border-gray-300">{customer.address2}</td>
                <td className="py-2 border border-gray-300">{customer.phoneNumber}</td>
                <td className="py-2 border border-gray-300">{customer.email}</td>
                <td className="py-2 border border-gray-300">
                  {editingRole === customer.id ? (
                    <select
                      value={newRole}
                      onChange={handleRoleChange}
                      className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring focus:border-blue-500"
                    >
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  ) : (
                    customer.role
                  )}
                </td>
                <td className="py-2 border border-gray-300 flex justify-around">
                  {editingRole === customer.id ? (
                    <button
                      onClick={() => handleSaveRole(customer)}
                      className="bg-blue-500 text-white px-4 py-2 rounded w-full sm:w-auto"
                    >
                      Save
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditRole(customer.id, customer.roleId)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded w-full sm:w-auto"
                      >
                        Edit Role
                      </button>
                      <button
                        onClick={() => handleDelete(customer)}
                        className="bg-red-500 text-white px-4 py-2 rounded w-full sm:w-auto"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p className="mb-4">Are you sure you want to delete this customer?</p>
            <div className="flex justify-end">
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded mr-2"
              >
                Yes
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
};

export default CustomerPage;
