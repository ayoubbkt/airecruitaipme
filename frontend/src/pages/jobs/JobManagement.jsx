import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Calendar, Tag, Building, MapPin, UserPlus, ChevronDown, Clock, Edit, Trash2, Eye, Copy } from 'lucide-react';
import { jobService } from '../../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const JobManagement = () => {
  const { companyId } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState([
    { name: "PUBLISHED", checked: true, label: "Published" },
    { name: "INTERNAL", checked: true, label: "Internal" },
    { name: "CONFIDENTIAL", checked: true, label: "Confidential" },
    { name: "DRAFT", checked: true, label: "Draft" },
    { name: "ARCHIVED", checked: false, label: "Archived" }
  ]);

  const [filterLocations, setFilterLocations] = useState([
    { name: "Paris, France", checked: false },
    { name: "Lyon, France", checked: false }
  ]);

  const [filterDepartments, setFilterDepartments] = useState([
    { name: "Customer Support", checked: false },
    { name: "Finance", checked: false },
    { name: "Human Resources", checked: false },
    { name: "Information Technology", checked: false },
    { name: "Legal", checked: false },
    { name: "Marketing", checked: false }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchJobs();
  }, [companyId]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const jobsData = await jobService.getJobs(companyId);
       
      setJobs(jobsData || []);
    } catch (error) {
      
      setError('Erreur lors de la récupération des offres d\'emploi.');
      toast.error('Erreur lors de la récupération des offres d\'emploi.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterStatusChange = (index) => {
    const newFilterStatus = [...filterStatus];
    newFilterStatus[index].checked = !newFilterStatus[index].checked;
    setFilterStatus(newFilterStatus);
  };

  const handleFilterLocationChange = (index) => {
    const newFilterLocations = [...filterLocations];
    newFilterLocations[index].checked = !newFilterLocations[index].checked;
    setFilterLocations(newFilterLocations);
  };

  const handleFilterDepartmentChange = (index) => {
    const newFilterDepartments = [...filterDepartments];
    newFilterDepartments[index].checked = !newFilterDepartments[index].checked;
    setFilterDepartments(newFilterDepartments);
  };

  const filteredJobs = jobs.filter(job => {
    const activeStatuses = filterStatus.filter(s => s.checked).map(s => s.name);
    
    if (!activeStatuses.includes(job.status)) return false;

    const jobLocation = job.location ? `${job.location.city}, ${job.location.country}` : '';
    if (filterLocations.some(l => l.checked)) {
      const activeLocations = filterLocations.filter(l => l.checked).map(l => l.name);
      if (jobLocation && !activeLocations.includes(jobLocation)) return false;
    }

    const jobDepartment = job.department?.name || '';
    if (filterDepartments.some(d => d.checked)) {
      const activeDepartments = filterDepartments.filter(d => d.checked).map(d => d.name);
      if (jobDepartment && !activeDepartments.includes(jobDepartment)) return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return job.title.toLowerCase().includes(query) ||
        (jobDepartment && jobDepartment.toLowerCase().includes(query)) ||
        (jobLocation && jobLocation.toLowerCase().includes(query));
    }

    return true;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'updatedAt') {
      const dateA = new Date(a.updatedAt);
      const dateB = new Date(b.updatedAt);
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    }
    return 0;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200 py-4 px-6">
        <h1 className="text-2xl font-semibold text-gray-800">Offres d'emploi</h1>
        {error && (
          <div className="mt-2 p-2 bg-red-50 text-red-600 rounded-md">{error}</div>
        )}
      </div>

      <div className="flex flex-1">
        <div className="w-64 border-r border-gray-200 bg-white p-4">
          <div className="mb-6">
            <h2 className="text-xs text-gray-500 uppercase font-semibold mb-2">État de l'offre</h2>
            <div className="space-y-1">
              {filterStatus.map((status, index) => (
                <div key={status.name} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`status-${status.name}`}
                    className="mr-2 h-4 w-4 text-blue-500"
                    checked={status.checked}
                    onChange={() => handleFilterStatusChange(index)}
                  />
                  <label htmlFor={`status-${status.name}`} className="text-sm text-gray-700">{status.label}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xs text-gray-500 uppercase font-semibold mb-2">Emplacements</h2>
            <div className="space-y-1">
              {filterLocations.map((location, index) => (
                <div key={location.name} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`location-${index}`}
                    className="mr-2 h-4 w-4 text-blue-500"
                    checked={location.checked}
                    onChange={() => handleFilterLocationChange(index)}
                  />
                  <label htmlFor={`location-${index}`} className="text-sm text-gray-700 truncate">{location.name}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xs text-gray-500 uppercase font-semibold mb-2">Départements</h2>
            <div className="space-y-1">
              {filterDepartments.map((dept, index) => (
                <div key={dept.name} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`dept-${index}`}
                    className="mr-2 h-4 w-4 text-blue-500"
                    checked={dept.checked}
                    onChange={() => handleFilterDepartmentChange(index)}
                  />
                  <label htmlFor={`dept-${index}`} className="text-sm text-gray-700">{dept.name}</label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="flex justify-between mb-4">
            <div className="relative w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search size={18} className="text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Rechercher des offres..."
                className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex space-x-2">
              <div className="relative inline-block">
                <select
                  className="border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="updatedAt">Date de modification</option>
                  <option value="createdAt">Date de création</option>
                </select>
              </div>

              <div className="relative inline-block">
                <select
                  className="border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sortDirection}
                  onChange={(e) => setSortDirection(e.target.value)}
                >
                  <option value="desc">Plus récent</option>
                  <option value="asc">Plus ancien</option>
                </select>
              </div>

              <Link
                to="/jobs/create"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 flex items-center"
              >
                <Plus size={18} className="mr-2" />
                <span>Ajouter une offre</span>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-md shadow">
            {sortedJobs.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <p>Aucune offre d'emploi ne correspond à vos critères.</p>
              </div>
            ) : (
              sortedJobs.map(job => (
                <div key={job.id} className="border-b border-gray-200 hover:bg-gray-50 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        <Link to={`/jobs/${job.id}`} className="hover:text-blue-600">
                          {job.title}
                        </Link>
                      </h3>
                      <div className="flex items-center mt-1 text-sm text-gray-500 space-x-4">
                        {job.status === 'PUBLISHED' && (
                          <span className="flex items-center text-emerald-600">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 mr-1.5"></span>
                            Publiée
                          </span>
                        )}
                        {job.status === 'DRAFT' && (
                          <span className="flex items-center">
                            <Edit size={14} className="mr-1" />
                            Brouillon
                          </span>
                        )}
                        {job.status === 'ARCHIVED' && (
                          <span className="flex items-center">
                            <Eye size={14} className="mr-1" />
                            Archivée
                          </span>
                        )}

                        {job.department?.name && (
                          <span className="flex items-center">
                            <Building size={14} className="mr-1" />
                            {job.department.name}
                          </span>
                        )}

                        {job.location && (
                          <span className="flex items-center">
                            <MapPin size={14} className="mr-1" />
                            {job.location.city}, {job.location.country}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-1">
                      <div className="text-center px-2">
                        <div className="text-gray-700 font-semibold">{job._count?.applications || 0}</div>
                        <div className="text-xs text-gray-500">Candidatures</div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-700 ml-2">
                        <ChevronDown size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-500 flex space-x-4">
                    <span className="flex items-center">
                      <Calendar size={12} className="mr-1" />
                      Créée {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                    <span className="flex items-center">
                      <Clock size={12} className="mr-1" />
                      Mise à jour {job.updatedAt ? new Date(job.updatedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobManagement;