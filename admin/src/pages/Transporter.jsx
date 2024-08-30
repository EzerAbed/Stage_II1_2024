import React, { useState, useEffect } from 'react';

const Transporter = () => {
  const [transporters, setTransporters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    address: '',
    email: ''
  });
  const [editData, setEditData] = useState(null);

  // Fetch all transporters on component mount
  useEffect(() => {
    fetchTransporters();
  }, []);

  const fetchTransporters = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3015/shipment/transporters');
      const data = await response.json();
      setTransporters(data);
    } catch (error) {
      console.error('Error fetching transporters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestOptions = {
        method: editData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      };

      const url = editData
        ? `http://localhost:3015/shipment/transporters/${editData.id}`
        : 'http://localhost:3015/shipment/transporter';

      const response = await fetch(url, requestOptions);

      if (response.ok) {
        fetchTransporters(); // Refresh the transporter list
        setShowForm(false); // Hide the form after submission
        setFormData({ name: '', phone_number: '', address: '', email: '' });
        setEditData(null);
      } else {
        console.error('Error submitting form:', await response.text());
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete this transporter (ID: ${id}, Name: ${name})?`)) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3015/shipment/transporters/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchTransporters(); // Refresh the transporter list
        } else {
          console.error('Error deleting transporter:', await response.text());
        }
      } catch (error) {
        console.error('Error deleting transporter:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (transporter) => {
    setEditData(transporter);
    setFormData(transporter);
    setShowForm(true);
  };

  return (
    <div className="p-6">
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 bg-blue-500 text-white py-2 px-4 rounded"
      >
        {showForm ? 'Close Form' : 'Add Transporter'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 rounded shadow-md bg-white dark:bg-gray-800">
          <div className="mb-4">
            <label className="block">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block">Phone Number</label>
            <input
              type="text"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white py-2 px-4 rounded"
            disabled={loading}
          >
            {editData ? 'Update Transporter' : 'Add Transporter'}
          </button>
        </form>
      )}

      {loading && <p>Loading...</p>}

      {!loading && transporters.length === 0 && (
        <p className="text-red-500">You didn't add any transporter yet</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {transporters.map((transporter) => (
          <div key={transporter.id} className=" bg-white dark:bg-gray-800 p-4 rounded shadow-md">
            <p><strong>Name:</strong> {transporter.name}</p>
            <p><strong>Phone Number:</strong> {transporter.phone_number}</p>
            <p><strong>Email:</strong> {transporter.email}</p>
            <p><strong>Address:</strong> {transporter.address}</p>
            <button
              onClick={() => handleEdit(transporter)}
              className="mr-2 mt-4 bg-yellow-500 text-white py-1 px-3 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(transporter.id, transporter.name)}
              className="mt-4 bg-red-500 text-white py-1 px-3 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transporter;
