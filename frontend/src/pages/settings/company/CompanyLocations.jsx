import React, { useState, useEffect } from 'react';
import { MapPin, Edit2, Trash2, Plus, X } from 'lucide-react';
import { companyService } from '../../../services/api';
import { toast } from 'react-toastify';
import LocationFormModal from '../../../components/settings/LocationFormModal';
import ConfirmModal from '../../../components/common/ConfirmModal';


const CompanyLocations = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            setLoading(true);
            const data = await companyService.getCompanyLocations();
            setLocations(data);
        } catch (error) {
            console.error('Erreur lors du chargement des emplacements:', error);
            toast.error('Impossible de charger les emplacements');
        } finally {
            setLoading(false);
        }
    };

    const handleAddLocation = () => {
        setCurrentLocation(null);
        setIsAddModalOpen(true);
    };

    const handleEditLocation = (location) => {
        setCurrentLocation(location);
        setIsEditModalOpen(true);
    };

    const handleDeleteLocation = (location) => {
        setCurrentLocation(location);
        setIsDeleteModalOpen(true);
    };

    const handleSaveLocation = async (locationData) => {
        try {
            if (currentLocation && isEditModalOpen) {
                // Mise à jour d'un emplacement existant
                await companyService.updateCompanyLocation(currentLocation.id, locationData);
                toast.success('Emplacement mis à jour avec succès');
            } else {
                // Ajout d'un nouvel emplacement
                await companyService.addCompanyLocation(locationData);
                toast.success('Nouvel emplacement ajouté avec succès');
            }

            // Rafraîchir la liste des emplacements
            fetchLocations();

            // Fermer les modales
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de l\'emplacement:', error);
            toast.error('Échec de l\'enregistrement de l\'emplacement');
        }
    };

    const handleConfirmDelete = async () => {
        try {
            await companyService.deleteCompanyLocation(currentLocation.id);
            toast.success('Emplacement supprimé avec succès');

            // Rafraîchir la liste des emplacements
            fetchLocations();
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'emplacement:', error);
            toast.error('Échec de la suppression de l\'emplacement');
        }
    };

    if (loading && locations.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <MapPin className="h-6 w-6 text-blue-600 mr-2" />
                        <h2 className="text-xl font-semibold text-slate-800">Emplacements de bureau</h2>
                    </div>
                    <button
                        onClick={handleAddLocation}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md shadow-sm hover:from-blue-700 hover:to-indigo-700 flex items-center"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un emplacement
                    </button>
                </div>

                <p className="text-sm text-slate-500 mb-6">
                    Les emplacements sont utilisés avec vos offres d'emploi et apparaîtront également comme options filtrables sur votre site carrières.
                </p>

                {locations.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-lg">
                        <MapPin className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-500">Aucun emplacement ajouté</p>
                        <button
                            onClick={handleAddLocation}
                            className="mt-3 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                        >
                            Ajouter votre premier emplacement
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {locations.map((location) => (
                            <div key={location.id} className="flex justify-between items-center p-4 border border-slate-200 rounded-lg">
                                <div>
                                    <p className="font-medium text-slate-800">{location.city}, {location.country}</p>
                                    {location.address && <p className="text-sm text-slate-500">{location.address}</p>}
                                    {location.postalCode && <p className="text-sm text-slate-500">{location.postalCode}</p>}
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEditLocation(location)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteLocation(location)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal d'ajout d'emplacement */}
            <LocationFormModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSaveLocation}
                title="Ajouter un emplacement"
            />

            {/* Modal d'édition d'emplacement */}
            <LocationFormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveLocation}
                location={currentLocation}
                title="Modifier l'emplacement"
            />

            {/* Modal de confirmation de suppression */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Supprimer cet emplacement ?"
                message={`Êtes-vous sûr de vouloir supprimer l'emplacement ${currentLocation?.city}, ${currentLocation?.country} ?`}
                confirmText="Continuer"
                cancelText="Annuler"
                icon={<Trash2 className="h-6 w-6 text-red-500" />}
            />
        </>
    );
};

export default CompanyLocations;