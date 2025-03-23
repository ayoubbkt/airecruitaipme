import React, { useState, useEffect } from 'react';
import { Edit2, Plus, X } from 'lucide-react';
import { ratingCardService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import RatingCardModal from "../../components/settings/RatingCardModal";

const RecruitingRatingCards = () => {
    const [ratingCards, setRatingCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);

    useEffect(() => {
        fetchRatingCards();
    }, []);

    const fetchRatingCards = async () => {
        try {
            setLoading(true);
            const data = await ratingCardService.getRatingCards();
            setRatingCards(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des fiches d\'évaluation:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRatingCard = () => {
        setShowAddModal(true);
    };

    const handleEditRatingCard = (card) => {
        setSelectedCard(card);
        setShowEditModal(true);
    };

    const handleCloseModals = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedCard(null);
    };

    const handleRatingCardCreated = (newCard) => {
        setRatingCards([...ratingCards, newCard]);
        handleCloseModals();
    };

    const handleRatingCardUpdated = (updatedCard) => {
        setRatingCards(ratingCards.map(card =>
            card.id === updatedCard.id ? updatedCard : card
        ));
        handleCloseModals();
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Fiches d'évaluation</h2>
                    <p className="text-sm text-slate-500">
                        Les fiches d'évaluation sont utilisées pour évaluer les candidats à différentes étapes du processus de recrutement.
                    </p>
                </div>
                <button
                    onClick={handleAddRatingCard}
                    className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center hover:bg-green-600"
                >
                    <Plus size={18} className="mr-2" />
                    Ajouter une fiche d'évaluation
                </button>
            </div>

            <div className="space-y-4">
                {ratingCards.map(card => (
                    <div
                        key={card.id}
                        className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-medium text-lg text-slate-800">{card.name}</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {card.isDefault
                                        ? "Utilisée par défaut si vous n'avez pas spécifié une fiche personnalisée dans une étape de type Évaluation."
                                        : card.description || "Aucune description"}
                                </p>
                            </div>
                            <button
                                onClick={() => handleEditRatingCard(card)}
                                className="p-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-100"
                                disabled={card.isDefault && card.name === "Default Rating Card"}
                            >
                                <Edit2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {ratingCards.length === 0 && (
                    <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                        <p className="text-slate-500 mb-4">Aucune fiche d'évaluation trouvée.</p>
                        <button
                            onClick={handleAddRatingCard}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md"
                        >
                            Créer votre première fiche d'évaluation
                        </button>
                    </div>
                )}
            </div>

            {/* Modal pour ajouter une fiche d'évaluation */}
            {showAddModal && (
                <RatingCardModal
                    onClose={handleCloseModals}
                    onSave={handleRatingCardCreated}
                />
            )}

            {/* Modal pour modifier une fiche d'évaluation */}
            {showEditModal && selectedCard && (
                <RatingCardModal
                    ratingCard={selectedCard}
                    onClose={handleCloseModals}
                    onSave={handleRatingCardUpdated}
                    isEditing={true}
                />
            )}
        </div>
    );
};

export default RecruitingRatingCards;