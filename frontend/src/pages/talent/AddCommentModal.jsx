import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cvService } from '../../services/api';

const visibilityOptions = [
  { value: 'Public', label: 'Public', desc: 'Visible to everyone on job', color: 'bg-green-100 text-green-700' },
  { value: 'Private', label: 'Private', desc: 'Visible to Hiring Manager and above', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'Confidential', label: 'Confidential', desc: 'Visible to you and Company admins', color: 'bg-red-100 text-red-700' },
];

const AddCommentModal = ({ isOpen, onClose, candidateId, companyId, onCommentAdded }) => {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('Public');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await cvService.addComment(companyId, candidateId, { content, visibility });
      setContent('');
      setVisibility('Public');
      onCommentAdded();
      onClose();
    } catch (err) {
      alert("Erreur lors de l'ajout du commentaire");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedOption = visibilityOptions.find(opt => opt.value === visibility);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-xl mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">New Comment</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Toolbar */}
          <div className="flex items-center gap-2 mb-2">
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 text-xs font-bold border border-gray-200">H1</button>
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 text-xs font-bold border border-gray-200">H2</button>
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 text-xs font-bold border border-gray-200">H3</button>
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 text-xs font-bold border border-gray-200">B</button>
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 text-xs italic border border-gray-200">I</button>
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 text-xs underline border border-gray-200">S</button>
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 text-xs border border-gray-200">•</button>
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 text-xs border border-gray-200">1.</button>
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 text-xs border border-gray-200">🔗</button>
          </div>
          {/* Textarea */}
          <textarea
            className="w-full border rounded px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500"
            rows={6}
            placeholder="Write your comment..."
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          />
          {/* Visibility selector */}
          <div className="flex items-center gap-2 mb-4 relative">
            <button
              type="button"
              onClick={() => setShowDropdown(v => !v)}
              className={`flex items-center px-3 py-1 rounded border ${selectedOption.color} text-xs font-medium focus:outline-none`}
            >
              {selectedOption.label}
              <span className="ml-2 text-gray-500">&#9662;</span>
            </button>
            <span className="text-sm text-gray-500">{selectedOption.desc}</span>
            {showDropdown && (
              <div className="absolute left-0 top-8 w-80 bg-white rounded-xl shadow-lg border z-30">
                {visibilityOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setVisibility(opt.value); setShowDropdown(false); }}
                    className={`flex items-center w-full px-4 py-2 text-left gap-2 hover:bg-gray-50 ${opt.value === visibility ? 'font-semibold' : ''}`}
                  >
                    <span className={`inline-block w-20 text-center rounded ${opt.color} py-1 text-xs`}>{opt.label}</span>
                    <span className="text-xs text-gray-600">{opt.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Actions */}
          <div className="flex justify-end gap-4 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold">
              {loading ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCommentModal;