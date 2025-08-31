import React, { useState, useEffect } from 'react';
import { X, Plus, ChevronDown, Trash2 } from 'lucide-react';
import { ratingCardService } from '../../services/api';

const RatingCardModal = ({ ratingCard, onClose, onSave, isEditing = false, companyId }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'BASIC',
    categories: [],
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  useEffect(() => {
    if (ratingCard) {
      setFormData({
        name: ratingCard.name || '',
        description: ratingCard.description || '',
        type: ratingCard.type || 'BASIC',
        categories: ratingCard.categories?.map((cat, index) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || '',
          order: cat.order ?? index,
          criteria: cat.criteria || [],
        })) || [],
      });
    }
  }, [ratingCard]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (value) => {
    setFormData((prev) => {
      let newFormData = { ...prev, type: value };

      if (value === 'BASIC') {
        newFormData.categories = [];
      } else if (value === 'CATEGORIZED' && (!prev.categories || prev.categories.length === 0)) {
        newFormData.categories = [
          {
            id: 1,
            name: 'Catégorie 1',
            description: '',
            order: 0,
            criteria: [{ id: 1, name: 'Critère 1' }],
          },
        ];
      }

      return newFormData;
    });
    setShowTypeDropdown(false);
  };

  const handleAddCategory = () => {
    setFormData((prev) => {
      const newId = prev.categories.length > 0 ? Math.max(...prev.categories.map((c) => c.id)) + 1 : 1;
      const newOrder = prev.categories.length;

      return {
        ...prev,
        categories: [
          ...prev.categories,
          {
            id: newId,
            name: `Catégorie ${newId}`,
            description: '',
            order: newOrder,
            criteria: [{ id: 1, name: 'Critère 1' }],
          },
        ],
      };
    });
  };

  const handleRemoveCategory = (categoryId) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((cat) => cat.id !== categoryId),
    }));
  };

  const handleCategoryChange = (categoryId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) =>
        cat.id === categoryId ? { ...cat, [field]: field === 'name' && !value.trim() ? cat[field] : value } : cat
      ),
    }));
  };

  const handleAddCriteria = (categoryId) => {
    setFormData((prev) => {
      const updatedCategories = prev.categories.map((cat) => {
        if (cat.id === categoryId) {
          const newId = cat.criteria.length > 0 ? Math.max(...cat.criteria.map((c) => c.id)) + 1 : 1;
          return {
            ...cat,
            criteria: [...cat.criteria, { id: newId, name: `Critère ${newId}` }],
          };
        }
        return cat;
      });

      return {
        ...prev,
        categories: updatedCategories,
      };
    });
  };

  const handleRemoveCriteria = (categoryId, criteriaId) => {
    setFormData((prev) => {
      const updatedCategories = prev.categories.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            criteria: cat.criteria.filter((crit) => crit.id !== criteriaId),
          };
        }
        return cat;
      });

      return {
        ...prev,
        categories: updatedCategories,
      };
    });
  };

  const handleCriteriaChange = (categoryId, criteriaId, value) => {
    setFormData((prev) => {
      const updatedCategories = prev.categories.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            criteria: cat.criteria.map((crit) =>
              crit.id === criteriaId ? { ...crit, name: value } : crit
            ),
          };
        }
        return cat;
      });

      return {
        ...prev,
        categories: updatedCategories,
      };
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Le nom de la fiche d\'évaluation est obligatoire');
      return;
    }
  
    try {
      setIsSubmitting(true);
      if (!companyId || typeof companyId !== 'string') {
        throw new Error('Identifiant de l\'entreprise invalide');
      }
  
      if (formData.type === 'CATEGORIZED') {
        if (!formData.categories || formData.categories.length === 0) {
          throw new Error('Au moins une catégorie est requise pour une fiche catégorisée');
        }
        for (const category of formData.categories) {
          if (!category.name || category.name.trim() === '') {
            throw new Error('Chaque catégorie doit avoir un nom non vide');
          }
          if (category.order == null || typeof category.order !== 'number') {
            throw new Error('Chaque catégorie doit avoir un ordre valide');
          }
        }
      }
  
      const payload = {
        ...formData,
        type: formData.type // Envoie directement formData.type ('BASIC' ou 'CATEGORIZED')
      };
  
      let response;
      if (isEditing) {
        response = await ratingCardService.updateRatingCard(companyId, ratingCard.id, payload);
      } else {
        console.log('Création avec companyId:', companyId, 'et payload:', payload);
        response = await ratingCardService.createRatingCard(companyId, payload);
      }
  
      onSave(response);
    } catch (error) {
      console.error(`Erreur lors de ${isEditing ? 'la modification' : 'l\'ajout'} de la fiche d'évaluation:`, error);
      setError(`Une erreur est survenue lors de ${isEditing ? 'la modification' : 'l\'ajout'} de la fiche d'évaluation: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-800">
              {isEditing ? 'Modifier la fiche d\'évaluation' : 'Ajouter une fiche d\'évaluation'}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">{error}</div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nom de la fiche d'évaluation
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Évaluation technique développeur"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description supplémentaire
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Informations complémentaires sur l'utilisation de cette fiche"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type de fiche d'évaluation
              </label>
              <div className="relative">
                <div
                  className="w-full p-2 border border-slate-300 rounded-md flex items-center justify-between cursor-pointer"
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                >
                  <span>{formData.type === 'BASIC' ? 'Simple' : 'Catégorisée'}</span>
                  <ChevronDown size={16} className="text-slate-400" />
                </div>

                {showTypeDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg">
                    <div
                      className="p-2 hover:bg-blue-50 cursor-pointer"
                      onClick={() => handleTypeChange('BASIC')}
                    >
                      Simple
                    </div>
                    <div
                      className="p-2 hover:bg-blue-50 cursor-pointer"
                      onClick={() => handleTypeChange('CATEGORIZED')}
                    >
                      Catégorisée
                    </div>
                  </div>
                )}
              </div>
            </div>

            {formData.type === 'CATEGORIZED' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Catégories d'évaluation
                </label>

                <div className="space-y-4">
                  {formData.categories.map((category) => (
                    <div key={category.id} className="border border-slate-200 rounded-md p-4">
                      <div className="flex justify-between items-center mb-3">
                        <input
                          type="text"
                          value={category.name}
                          onChange={(e) => {
                            const newName = e.target.value;
                            if (newName.trim() !== '') {
                              handleCategoryChange(category.id, 'name', newName);
                            }
                          }}
                          className="p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nom de la catégorie"
                        />
                        <button
                          onClick={() => handleRemoveCategory(category.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-full"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="space-y-2 ml-4">
                        {category.criteria.map((criteria) => (
                          <div key={criteria.id} className="flex items-center justify-between">
                            <input
                              type="text"
                              value={criteria.name}
                              onChange={(e) =>
                                handleCriteriaChange(category.id, criteria.id, e.target.value)
                              }
                              className="p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Nom du critère"
                            />
                            <button
                              onClick={() => handleRemoveCriteria(category.id, criteria.id)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded-full ml-2"
                              disabled={category.criteria.length <= 1}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => handleAddCriteria(category.id)}
                          className="flex items-center text-blue-600 hover:text-blue-800 text-sm mt-2"
                        >
                          <Plus size={16} className="mr-1" />
                          Ajouter un critère
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleAddCategory}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Plus size={18} className="mr-1" />
                    Ajouter une catégorie
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Enregistrement...'
                : isEditing
                ? 'Enregistrer les modifications'
                : 'Ajouter la fiche'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingCardModal;