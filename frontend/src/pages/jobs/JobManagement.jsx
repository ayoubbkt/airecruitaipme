import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Calendar, Tag, Building, MapPin, UserPlus, ChevronDown, Clock, Edit, Trash2, Eye, Copy } from 'lucide-react';
import { jobService } from '../../services/api';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const JobManagement = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState([
        { name: "Published", checked: true },
        { name: "Internal", checked: true },
        { name: "Confidential", checked: true },
        { name: "Draft", checked: true },
        { name: "Archived", checked: false }
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
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const jobsData = await jobService.getJobs();
            setJobs(jobsData);
        } catch (error) {
            console.error('Error fetching jobs:', error);
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
        // Filter by status
        const activeStatuses = filterStatus.filter(s => s.checked).map(s => s.name.toLowerCase());
        if (!activeStatuses.includes(job.status.toLowerCase())) return false;

        // Filter by location
        if (filterLocations.some(l => l.checked)) {
            const activeLocations = filterLocations.filter(l => l.checked).map(l => l.name);
            if (job.location && !activeLocations.includes(job.location)) return false;
        }

        // Filter by department
        if (filterDepartments.some(d => d.checked)) {
            const activeDepartments = filterDepartments.filter(d => d.checked).map(d => d.name);
            if (job.department && !activeDepartments.includes(job.department)) return false;
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return job.title.toLowerCase().includes(query) ||
                (job.department && job.department.toLowerCase().includes(query)) ||
                (job.location && job.location.toLowerCase().includes(query));
        }

        return true;
    });

    // Sort jobs
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
            {/* Header */}
            <div className="bg-white border-b border-gray-200 py-4 px-6">
                <h1 className="text-2xl font-semibold text-gray-800">Offres d'emploi</h1>
            </div>

            <div className="flex flex-1">
                {/* Left sidebar - Filters */}
                <div className="w-64 border-r border-gray-200 bg-white p-4">
                    {/* Job Status Filter */}
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
                                    <label htmlFor={`status-${status.name}`} className="text-sm text-gray-700">{status.name}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Locations Filter */}
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

                    {/* Departments Filter */}
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

                {/* Main Content */}
                <div className="flex-1 p-6">
                    {/* Search and Actions Bar */}
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
                                <button
                                    className="border border-gray-300 rounded-md px-4 py-2 flex items-center text-sm text-gray-700 bg-white hover:bg-gray-50"
                                    onClick={() => setSortBy(sortBy === 'updatedAt' ? 'createdAt' : 'updatedAt')}
                                >
                                    <span>{sortBy === 'updatedAt' ? 'Date de modification' : 'Date de création'}</span>
                                    <ChevronDown size={16} className="ml-2" />
                                </button>
                            </div>

                            <div className="relative inline-block">
                                <button
                                    className="border border-gray-300 rounded-md px-4 py-2 flex items-center text-sm text-gray-700 bg-white hover:bg-gray-50"
                                    onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
                                >
                                    <span>{sortDirection === 'desc' ? 'Plus récent' : 'Plus ancien'}</span>
                                    <ChevronDown size={16} className="ml-2" />
                                </button>
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

                    {/* Jobs List */}
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
                                                {job.isPublished && (
                                                    <span className="flex items-center text-emerald-600">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 mr-1.5"></span>
                            Publiée
                          </span>
                                                )}
                                                {job.isInternal && (
                                                    <span className="flex items-center">
                            <UserPlus size={14} className="mr-1" />
                            Interne seulement
                          </span>
                                                )}
                                                {job.isConfidential && (
                                                    <span className="flex items-center">
                            <Eye size={14} className="mr-1" />
                            Confidentiel
                          </span>
                                                )}
                                                {job.isDraft && (
                                                    <span className="flex items-center">
                            <Edit size={14} className="mr-1" />
                            Brouillon
                          </span>
                                                )}

                                                {job.department && (
                                                    <span className="flex items-center">
                            <Building size={14} className="mr-1" />
                                                        {job.department}
                          </span>
                                                )}

                                                {job.location && (
                                                    <span className="flex items-center">
                            <MapPin size={14} className="mr-1" />
                                                        {job.location}
                          </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex space-x-1">
                                            <div className="text-center px-2">
                                                <div className="text-gray-700 font-semibold">{job.metrics?.inReview || 0}</div>
                                                <div className="text-xs text-gray-500">En attente</div>
                                            </div>
                                            <div className="text-center px-2">
                                                <div className="text-gray-700 font-semibold">{job.metrics?.inProgress || 0}</div>
                                                <div className="text-xs text-gray-500">En cours</div>
                                            </div>
                                            <div className="text-center px-2">
                                                <div className="text-gray-700 font-semibold">{job.metrics?.hired || 0}</div>
                                                <div className="text-xs text-gray-500">Recrutés</div>
                                            </div>
                                            <div className="text-center px-2">
                                                <div className="text-gray-700 font-semibold">{job.metrics?.total || 0}</div>
                                                <div className="text-xs text-gray-500">Total</div>
                                            </div>
                                            <button className="text-gray-400 hover:text-gray-700 ml-2">
                                                <ChevronDown size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Time indicators */}
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