import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Filter, ChevronDown, Search, User, Video, Phone, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import { interviewService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Interviews = () => {
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  
  useEffect(() => {
    fetchInterviews();
  }, [selectedStatus, selectedDateRange]);
  
  const fetchInterviews = async () => {
    try {
      setLoading(true);
      
      // Prepare filters
      const filters = {};
      if (selectedStatus) {
        filters.status = selectedStatus;
      }
      
      if (selectedDateRange !== 'all') {
        const today = new Date();
        const from = new Date();
        
        if (selectedDateRange === 'today') {
          // No change to 'from', it's today
        } else if (selectedDateRange === 'week') {
          from.setDate(today.getDate() - 7);
        } else if (selectedDateRange === 'month') {
          from.setMonth(today.getMonth() - 1);
        }
        
        filters.from = from.toISOString().split('T')[0];
        filters.to = new Date(today.getTime() + 86400000).toISOString().split('T')[0]; // Tomorrow
      }
      
      const response = await interviewService.getInterviews(filters);
      setInterviews(response);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast.error('Erreur lors du chargement des entretiens');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'NO_SHOW':
        return 'bg-yellow-100 text-yellow-800';
      case 'FEEDBACK_COMPLETE':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };
  
  const getStatusLabel = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Planifié';
      case 'COMPLETED':
        return 'Terminé';
      case 'CANCELLED':
        return 'Annulé';
      case 'NO_SHOW':
        return 'Absence';
      case 'FEEDBACK_COMPLETE':
        return 'Feedback complété';
      default:
        return status;
    }
  };
  
  const getInterviewTypeIcon = (type) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="w-4 h-4 text-blue-500" />;
      case 'PHONE':
        return <Phone className="w-4 h-4 text-green-500" />;
      case 'IN_PERSON':
        return <MapPin className="w-4 h-4 text-purple-500" />;
      default:
        return <Calendar className="w-4 h-4 text-slate-500" />;
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Entretiens</h1>
          <p className="text-slate-500 mt-1">Gérez vos entretiens avec les candidats</p>
        </div>
        <Link 
          to="/interviews/schedule" 
          className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-sm hover:from-blue-700 hover:to-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Planifier un entretien</span>
        </Link>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Rechercher un candidat..."
              />
            </div>
          </div>
          
          <div className="w-48">
            <div className="relative">
              <select
                className="block w-full pl-3 pr-10 py-2 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="SCHEDULED">Planifiés</option>
                <option value="COMPLETED">Terminés</option>
                <option value="FEEDBACK_COMPLETE">Feedback complété</option>
                <option value="CANCELLED">Annulés</option>
                <option value="NO_SHOW">Absences</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
          
          <div className="w-48">
            <div className="relative">
              <select
                className="block w-full pl-3 pr-10 py-2 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
              >
                <option value="all">Toutes les dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
          
          <button 
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 flex items-center text-sm"
            onClick={() => {
              setSelectedStatus('');
              setSelectedDateRange('all');
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Réinitialiser
          </button>
        </div>
      </div>
      
      {/* Interviews List */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {interviews.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">Aucun entretien trouvé</h3>
              <p className="text-slate-500 mb-6">Aucun entretien ne correspond à vos critères de recherche</p>
              <Link 
                to="/interviews/schedule" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Planifier un entretien
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Candidat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Heure</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Poste</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {interviews.map((interview) => (
                    <tr key={interview.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium">
                            {interview.candidateName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-slate-800">{interview.candidateName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getInterviewTypeIcon(interview.interviewType)}
                          <span className="ml-2 text-sm text-slate-700">
                            {interview.interviewType === 'VIDEO' ? 'Vidéo' : 
                             interview.interviewType === 'PHONE' ? 'Téléphone' : 
                             'En personne'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">{formatDate(interview.scheduledTime)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {interview.jobTitle ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {interview.jobTitle}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                          {getStatusLabel(interview.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/interviews/${interview.id}`}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100"
                        >
                          Voir détails
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Interviews;