import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Check } from 'lucide-react';

const QuestionSetModal = ({ isOpen, onClose, onSave, availableQuestions, set }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    questionIds: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (set) {
      setFormData({
        name: set.name || '',
        description: set.description || '',
        questionIds: set.questions ? set.questions.map(q => q.id) : []
      });
    }
  }, [set]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      setError('Le nom de l\'ensemble est requis.');
      return;
    }
    if (formData.questionIds.length === 0) {
      setError('Veuillez sélectionner au moins une question.');
      return;
    }
    setError(null);
    onSave(formData);
  };

  const toggleQuestion = (questionId) => {
    setFormData(prev => {
      const newQuestionIds = prev.questionIds.includes(questionId)
        ? prev.questionIds.filter(id => id !== questionId)
        : [...prev.questionIds, questionId];
      return {
        ...prev,
        questionIds: newQuestionIds
      };
    });
  };

  const filteredQuestions = availableQuestions.filter(
    question => question.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {set ? 'Modifier l\'ensemble de questions' : 'Ajouter un ensemble de questions'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Nom de l'ensemble */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'ensemble <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nom de l'ensemble de questions"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description de l'ensemble de questions"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              {/* Sélection des questions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Questions à inclure <span className="text-red-600">*</span>
                </label>

                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Rechercher des questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="border border-gray-200 rounded-md max-h-60 overflow-y-auto">
                  {filteredQuestions.length > 0 ? (
                    filteredQuestions.map(question => (
                      <div
                        key={question.id}
                        className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-200 last:border-b-0 cursor-pointer"
                        onClick={() => toggleQuestion(question.id)}
                      >
                        <div className={`w-5 h-5 border rounded-md flex items-center justify-center mr-3 ${formData.questionIds.includes(question.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                          {formData.questionIds.includes(question.id) && <Check size={14} className="text-white" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{question.text}</p>
                          <p className="text-xs text-gray-500">{question.responseType}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      Aucune question trouvée
                    </div>
                  )}
                </div>

                {availableQuestions.length === 0 && (
                  <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md mt-2">
                    <p>Vous n'avez pas encore créé de questions personnalisées. Veuillez en créer avant de pouvoir les ajouter à un ensemble.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 mr-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                disabled={formData.questionIds.length === 0 || !formData.name}
              >
                <Save size={16} />
                <span>Enregistrer</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuestionSetModal;