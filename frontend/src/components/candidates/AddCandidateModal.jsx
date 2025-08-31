import React, { useState } from 'react';

const AddCandidateModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    resumeUrl: '',
    coverLetterText: '',
  });

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-1/3">
        <h2 className="text-xl font-bold mb-4">Add Candidate</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name"
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            name="resumeUrl"
            value={formData.resumeUrl}
            onChange={handleChange}
            placeholder="Resume URL"
            className="w-full p-2 mb-2 border rounded"
          />
          <textarea
            name="coverLetterText"
            value={formData.coverLetterText}
            onChange={handleChange}
            placeholder="Cover Letter"
            className="w-full p-2 mb-4 border rounded"
          />
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-2 bg-gray-300 px-4 py-2 rounded">
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCandidateModal;