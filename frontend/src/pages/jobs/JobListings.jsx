import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Filter, BriefcaseBusiness, User, MapPin, Clock } from 'lucide-react';
import { jobService } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ACTIVE');


  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await jobService.getJobs({ status: statusFilter });
        setJobs(data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast.error('Erreur lors du chargement des offres d\'emploi');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [statusFilter]);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Offres d'emploi</h1>
          <p className="text-slate-500 mt-1">Gérez vos offres d'emploi et suivez les candidatures</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <select
              className="appearance-none pl-10 pr-12 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ACTIVE">Actives</option>
              <option value="DRAFT">Brouillons</option>
              <option value="ARCHIVED">Archivées</option>
              <option value="">Toutes</option>
            </select>
            <Filter className="h-4 w-4 text-slate-600 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <Link to="/jobs/create" className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-sm hover:from-blue-700 hover:to-indigo-700">
            <PlusCircle className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Nouvelle offre</span>
          </Link>
        </div>
      </div>
      
      {jobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <BriefcaseBusiness className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-800 mb-2">Aucune offre d'emploi trouvée</h3>
          <p className="text-slate-500 mb-6">Commencez par créer une nouvelle offre d'emploi pour attirer des candidats.</p>
          <Link to="/jobs/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700">
            Créer une offre
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <BriefcaseBusiness className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    job.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                    job.status === 'DRAFT' ? 'bg-slate-100 text-slate-800' : 
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {job.status === 'ACTIVE' ? 'Active' : job.status === 'DRAFT' ? 'Brouillon' : 'Archivée'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{job.title}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Clock className="h-4 w-4 mr-2 text-slate-400" />
                    {job.jobType}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <User className="h-4 w-4 mr-2 text-slate-400" />
                    {job.applicationsCount || 0} candidatures
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">
                    Créée le {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-blue-600 font-medium">Voir détails</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobListings;