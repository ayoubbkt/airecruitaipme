import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { questionService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import QuestionModal from '../../components/settings/QuestionModal';
import QuestionSetModal from '../../components/settings/QuestionSetModal';

const RecruitingQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const [questionSets, setQuestionSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
    const [showAddSetModal, setShowAddSetModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    // Ajout de l'état pour la modal de confirmation de suppression
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState(null);

    useEffect(() => {
        fetchQuestionsAndSets();
    }, []);

    const fetchQuestionsAndSets = async () => {
        try {
            setLoading(true);
            const [questionsData, setsData] = await Promise.all([
                questionService.getCustomQuestions(),
                questionService.getQuestionSets()
            ]);
            setQuestions(questionsData);
            setQuestionSets(setsData);
        } catch (error) {
            console.error('Erreur lors du chargement des questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = () => {
        setEditingQuestion(null);
        setShowAddQuestionModal(true);
    };

    const handleEditQuestion = (question) => {
        setEditingQuestion(question);
        setShowAddQuestionModal(true);
    };

    // Modifié pour ouvrir la modal de confirmation
    const handleDeleteQuestion = (question) => {
        setQuestionToDelete(question);
        setShowDeleteConfirmation(true);
    };

    // Nouvelle fonction pour confirmer la suppression
    const confirmDeleteQuestion = async () => {
        if (!questionToDelete) return;

        try {
            await questionService.deleteQuestion(questionToDelete.id);
            setQuestions(questions.filter(q => q.id !== questionToDelete.id));
            setShowDeleteConfirmation(false);
            setQuestionToDelete(null);
        } catch (error) {
            console.error('Erreur lors de la suppression de la question:', error);
        }
    };

    const closeModal = () => {
        setShowDeleteConfirmation(false);
        setQuestionToDelete(null);
    };

    const handleQuestionSave = async (questionData) => {
        try {
            if (editingQuestion) {
                const updatedQuestion = await questionService.updateQuestion(editingQuestion.id, questionData);
                setQuestions(questions.map(q => q.id === editingQuestion.id ? updatedQuestion : q));
            } else {
                const newQuestion = await questionService.createQuestion(questionData);
                setQuestions([...questions, newQuestion]);
            }
            setShowAddQuestionModal(false);
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de la question:', error);
        }
    };

    const handleAddQuestionSet = () => {
        setShowAddSetModal(true);
    };

    const handleQuestionSetSave = async (setData) => {
        try {
            const newSet = await questionService.createQuestionSet(setData);
            setQuestionSets([...questionSets, newSet]);
            setShowAddSetModal(false);
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de l\'ensemble de questions:', error);
        }
    };

    const getResponseTypeLabel = (type) => {
        switch (type) {
            case 'short_text': return 'Réponse courte';
            case 'paragraph': return 'Paragraphe';
            case 'yes_no': return 'Oui ou Non';
            case 'dropdown': return 'Liste déroulante';
            case 'multiple_choice': return 'Choix multiple';
            case 'number': return 'Nombre';
            case 'file': return 'Fichier';
            default: return type;
        }
    };

    const getVisibilityLabel = (visibility) => {
        switch (visibility) {
            case 'public': return 'Visible pour tous sur l\'offre';
            case 'private': return 'Visible pour les responsables du recrutement';
            default: return visibility;
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Questions & Ensembles</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Utilisez des questions personnalisées pour en savoir plus sur les candidats pendant le processus de recrutement.
                    </p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={handleAddQuestion}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        <Plus size={18} />
                        <span>Ajouter une question</span>
                    </button>

                    <button
                        onClick={handleAddQuestionSet}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        <Plus size={18} />
                        <span>Ajouter un ensemble</span>
                    </button>
                </div>
            </div>

            {/* Ensembles de questions */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Ensembles de questions</h3>
                <p className="text-sm text-slate-500 mb-4">
                    Ce sont des collections prédéfinies de questions structurées utilisées dans les formulaires de candidature.
                </p>

                {questionSets.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg">
                        Aucun ensemble de questions n'a encore été ajouté.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {questionSets.map(set => (
                            <div key={set.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium text-slate-800">{set.name}</h4>
                                    <div className="flex space-x-2">
                                        <button
                                            className="p-2 text-slate-400 hover:text-blue-500 rounded"
                                            title="Modifier"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            className="p-2 text-slate-400 hover:text-red-500 rounded"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 mt-1">{set.questions?.length || 0} questions</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Questions personnalisées */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Questions personnalisées</h3>
                <p className="text-sm text-slate-500 mb-4">
                    Ces questions sont utilisées pour filtrer les candidats.
                </p>

                <div className="space-y-4">
                    {questions.map(question => (
                        <div key={question.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium text-slate-800">{question.text}</h4>
                                    <div className="flex mt-2 text-xs">
                                        <div className="flex items-center mr-4">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                                            <span className="text-slate-600">{getResponseTypeLabel(question.responseType)}</span>
                                        </div>
                                        <div className="flex items-center">
                                            {question.visibility === 'public' ? (
                                                <Eye size={12} className="text-slate-400 mr-1" />
                                            ) : (
                                                <EyeOff size={12} className="text-slate-400 mr-1" />
                                            )}
                                            <span className="text-slate-600">{getVisibilityLabel(question.visibility)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEditQuestion(question)}
                                        className="p-2 text-slate-400 hover:text-blue-500 rounded"
                                        title="Modifier"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteQuestion(question)}
                                        className="p-2 text-slate-400 hover:text-red-500 rounded"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {questions.length === 0 && (
                        <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg">
                            Aucune question personnalisée n'a encore été ajoutée.
                        </div>
                    )}
                </div>
            </div>

            {/* Modales */}
            {showAddQuestionModal && (
                <QuestionModal
                    isOpen={showAddQuestionModal}
                    onClose={() => setShowAddQuestionModal(false)}
                    onSave={handleQuestionSave}
                    question={editingQuestion}
                />
            )}

            {showAddSetModal && (
                <QuestionSetModal
                    isOpen={showAddSetModal}
                    onClose={() => setShowAddSetModal(false)}
                    onSave={handleQuestionSetSave}
                    availableQuestions={questions}
                />
            )}

            {/* Modal de confirmation de suppression */}
            {showDeleteConfirmation && questionToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6">
                        <div className="flex justify-center mb-4 text-slate-600">
                            <Trash2 size={48} />
                        </div>
                        <h3 className="text-lg font-bold text-center text-slate-800 mb-2">Supprimer cette question ?</h3>
                        <p className="text-center text-slate-600 mb-6">
                            Vous êtes sur le point de supprimer la question "{questionToDelete.text}".
                        </p>

                        <div className="flex justify-center">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg mr-2"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmDeleteQuestion}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                            >
                                Continuer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruitingQuestions;