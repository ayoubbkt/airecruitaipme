import React, { useState } from 'react';
import { 
 
  X,
 
} from 'lucide-react';

import { cvService } from '../../services/api.js';
 

const EditContactModal = ({ isOpen, candidate, companyId, onClose, onSave }) => {
 
  const [form, setForm] = useState({
    email: candidate.email || '',
    phone: candidate.phone || '',
    address: candidate.address || '',
    country: candidate.country || '',
    city: candidate.city || '',
    postalCode: candidate.postalCode || '',
    linkedin: candidate.linkedin || '',
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
const handleSubmit = async e => {
  e.preventDefault();
  try {
    // Optionnel : filtrer les champs vides
    const payload = Object.fromEntries(
      Object.entries(form).filter(([_, v]) => v !== undefined)
    );
    await cvService.updateCandidate(companyId, candidate.id, payload);
    onSave();
    onClose();
  } catch (error) {
    alert("Erreur lors de la mise à jour du candidat");
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-xl mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Edit Contact Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="w-full border rounded px-3 py-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Street address</label>
              <input name="address" value={form.address} onChange={handleChange} placeholder="e.g. 18144 El Camino Real" className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input name="country" value={form.country} onChange={handleChange} placeholder="Select the country" className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input name="city" value={form.city} onChange={handleChange} placeholder="e.g. Sunnyvale" className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal code</label>
              <input name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="Zip/Postal code" className="w-full border rounded px-3 py-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Social Profiles</label>
              <input name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="LinkedIn" className="w-full border rounded px-3 py-2" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-8">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContactModal;