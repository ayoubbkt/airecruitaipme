import React, { useState } from 'react';
import { Modal, Box, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';

const ModalCandidate = ({ open, handleClose, companyId }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    resumeUrl: '',
    coverLetterText: '',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/companies/${companyId}/candidates`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      handleClose();
      window.location.reload(); // Refresh to reflect new candidate
    } catch (error) {
      console.error('Error creating candidate:', error);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" gutterBottom>Add New Candidate</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            name="firstName"
            label="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            name="lastName"
            label="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            name="phoneNumber"
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="resumeUrl"
            label="Resume URL"
            value={formData.resumeUrl}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="coverLetterText"
            label="Cover Letter"
            multiline
            rows={4}
            value={formData.coverLetterText}
            onChange={handleChange}
          />
          <Button type="submit" variant="contained" color="primary" style={{ marginTop: '20px' }}>
            Save
          </Button>
          <Button onClick={handleClose} style={{ marginTop: '20px', marginLeft: '10px' }}>
            Cancel
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default ModalCandidate;