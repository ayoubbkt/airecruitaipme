import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, X, Check } from 'lucide-react';
import { companyService } from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmModal from '../../../components/common/ConfirmModal';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newDepartment, setNewDepartment] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const data = await companyService.getDepartments();
            setDepartments(data);
        } catch (error) {
            console.error('Erreur lors du chargement des départements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddDepartment = async () => {
        if (!newDepartment.trim()) return;

        try {
            const addedDepartment = await companyService.createDepartment({
                name: newDepartment.trim()
            });

            setDepartments([...departments, addedDepartment]);
            setNewDepartment('');
            setIsAdding(false);
        } catch (error) {
            console.error('Erreur lors de l\'ajout du département:', error);
        }
    };

    const handleUpdateDepartment = async (id, newName) => {
        try {
            await companyService.updateDepartment(id, { name: newName });
            setDepartments(departments.map(dept =>
                dept.id === id ? { ...dept, name: newName } : dept
            ));
            setEditingDepartment(null);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du département:', error);
        }
    };

    const handleDeleteDepartment = async (id) => {
        try {
            await companyService.deleteDepartment(id);
            setDepartments(departments.filter(dept => dept.id !== id));
            setConfirmDelete(null);
        } catch (error) {
            console.error('Erreur lors de la suppression du département:', error);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Départements</h2>
                    <p className="text-slate-500 mt-1">
                        Les départements sont utilisés avec les offres d'emploi et apparaîtront comme options filtrables sur votre site carrière.
                        RecrutPME utilisera également les départements pour recommander les membres que vous pourriez vouloir inclure dans les équipes de recrutement.
                    </p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center"
                >
                    <Plus size={18} className="mr-2" />
                    Ajouter un département
                </button>
            </div>

            {/* Liste des départements */}
            <div className="border rounded-lg overflow-hidden">
                {isAdding && (
                    <div className="border-b border-slate-200 p-4 bg-blue-50">
                        <div className="flex">
                            <input
                                type="text"
                                value={newDepartment}
                                onChange={(e) => setNewDepartment(e.target.value)}
                                placeholder="Nom du département"
                                className="flex-1 p-2 border border-slate-300 rounded-md mr-2"
                                autoFocus
                            />
                            <div className="flex">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="p-2 text-slate-500 hover:text-slate-700 rounded-md mr-2"
                                >
                                    <X size={20} />
                                </button>
                                <button
                                    onClick={handleAddDepartment}
                                    className="p-2 bg-green-500 text-white rounded-md"
                                    disabled={!newDepartment.trim()}
                                >
                                    <Check size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {departments.length === 0 && !isAdding ? (
                    <div className="p-6 text-center text-slate-500">
                        Aucun département n'a été ajouté. Cliquez sur "Ajouter un département" pour commencer.
                    </div>
                ) : (
                    departments.map((department) => (
                        <div
                            key={department.id}
                            className="border-b last:border-b-0 border-slate-200 p-4 flex justify-between items-center"
                        >
                            {editingDepartment === department.id ? (
                                <div className="flex flex-1">
                                    <input
                                        type="text"
                                        value={department.name}
                                        onChange={(e) => setDepartments(departments.map(d =>
                                            d.id === department.id ? { ...d, name: e.target.value } : d
                                        ))}
                                        className="flex-1 p-2 border border-slate-300 rounded-md mr-2"
                                        autoFocus
                                    />
                                    <div className="flex">
                                        <button
                                            onClick={() => setEditingDepartment(null)}
                                            className="p-2 text-slate-500 hover:text-slate-700 rounded-md mr-2"
                                        >
                                            <X size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleUpdateDepartment(department.id, department.name)}
                                            className="p-2 bg-green-500 text-white rounded-md"
                                            disabled={!department.name.trim()}
                                        >
                                            <Check size={20} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <span className="text-slate-800">{department.name}</span>
                                    <div className="flex">
                                        <button
                                            onClick={() => setEditingDepartment(department.id)}
                                            className="p-2 text-slate-400 hover:text-blue-600 rounded-md mr-1"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => setConfirmDelete(department)}
                                            className="p-2 text-slate-400 hover:text-red-600 rounded-md"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Modal de confirmation de suppression */}
            {confirmDelete && (
                <ConfirmModal

                    onClose={() => setConfirmDelete(null)}
                    onConfirm={() => handleDeleteDepartment(confirmDelete.id)}
                    title="Supprimer le département ?"
                    message={`${confirmDelete.name}`}
                    confirmText="Continuer"
                    cancelText="Annuler"
                    icon={<Trash2 className="h-6 w-6 text-red-500" />}
                />
            )}
        </div>
    );
};

export default Departments;