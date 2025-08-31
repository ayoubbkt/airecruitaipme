import React, { useState } from 'react';
import { X, Send, Clock, CheckCircle } from 'lucide-react';
import axios from '../../utils/axios';

const NewEmailModal = ({ isOpen, onClose, candidate }) => {
    const [formData, setFormData] = useState({
        subject: '',
        content: '',
        schedule: null,
        template: 'default',
    });
    const [sending, setSending] = useState(false);

    if (!isOpen || !candidate) return null;

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleScheduleChange = (e) => setFormData({ ...formData, schedule: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await axios.post(`/api/candidates/${candidate.id}/messages`, {
                ...formData,
                recipientEmail: candidate.email,
                recipientName: `${candidate.firstName} ${candidate.lastName}`,
                status: formData.schedule ? 'pending' : 'sent',
            });
            onClose();
            // Ajouter une notification de succès ici si nécessaire
        } catch (error) {
            console.error('Error sending email:', error);
            // Ajouter une notification d'erreur ici si nécessaire
        } finally {
            setSending(false);
        }
    };

    const templates = {
        default: `Bonjour ${candidate.firstName},\n\nMerci pour votre candidature. Nous sommes en train d'examiner votre profil et reviendrons vers vous prochainement.\n\nCordialement,\nVotre équipe RecrutPME`,
        interview: `Bonjour ${candidate.firstName},\n\nNous serions ravis de vous inviter à un entretien pour le poste de ${candidate.title}. Veuillez nous indiquer vos disponibilités.\n\nCordialement,\nVotre équipe RecrutPME`,
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-1/3">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">Nouveau message</h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full">
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Objet"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        name="template"
                        value={formData.template}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="default">Modèle par défaut</option>
                        <option value="interview">Invitation à un entretien</option>
                    </select>
                    <textarea
                        name="content"
                        value={formData.content || templates[formData.template]}
                        onChange={handleChange}
                        placeholder="Contenu du message"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-40"
                    />
                    <div className="flex items-center space-x-2">
                        <input
                            type="datetime-local"
                            name="schedule"
                            value={formData.schedule || ''}
                            onChange={handleScheduleChange}
                            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-600">Envoyer plus tard</span>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={sending}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 flex items-center"
                        >
                            {sending ? (
                                <span className="flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2 animate-spin" />
                                    Envoi en cours...
                                </span>
                            ) : formData.schedule ? (
                                <span className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2" />
                                    Planifier
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <Send className="w-4 h-4 mr-2" />
                                    Envoyer
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewEmailModal;