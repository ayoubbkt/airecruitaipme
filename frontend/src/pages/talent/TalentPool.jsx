import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Filter, PlusCircle, ChevronDown } from 'lucide-react';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CandidateRow from '../../components/candidates/CandidateRow';

const TalentPool = () => {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minScore: 0,
    skills: [],
    experience: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/candidates');
        setCandidates(response.data);
        
        // Extract unique skills from all candidates
        const skills = new Set();
        response.data.forEach(candidate => {
          candidate.skills.forEach(skill => skills.add(skill));
        });
        setAvailableSkills(Array.from(skills));
      } catch (error) {
        console.error('Error fetching candidates:', error);
        toast.error('Erreur lors du chargement des candidats');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidates();
  }, []);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const toggleSkillFilter = (skill) => {
    setSelectedSkills(prev => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill);
      } else {
        return [...prev, skill];
      }
    });
  };
  
  const resetFilters = () => {
    setFilters({
      minScore: 0,
      skills: [],
      experience: null,
    });
    setSelectedSkills([]);
  };
  
  const filteredCandidates = React.useMemo(() => {
    return candidates.filter(candidate => {
      // Filter by search term
      if (searchTerm && !`${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by minimum score
      if (candidate.score < filters.minScore) {
        return false;
      }
      
      // Filter by skills
      if (selectedSkills.length > 0) {
        const candidateSkills = candidate.skills.map(s => s.toLowerCase());
        const hasAllSkills = selectedSkills.every(skill => 
          candidateSkills.includes(skill.toLowerCase())
        );
        if (!hasAllSkills) return false;
      }
      
      // Filter by experience
      if (filters.experience && candidate.yearsOfExperience < filters.experience) {
        return false;
      }
      
      return true;
    });
  }, [candidates, searchTerm, filters, selectedSkills]);
  
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Base de talents</h1>
          <p className="text-slate-500 mt-1">Gérez et explorez votre pool de candidats</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un candidat..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button 
            className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 text-slate-600 mr-2" />
            <span className="text-sm font-medium text-slate-700">Filtres</span>
          </button>
          <Link to="/cv-analysis" className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700">
            <PlusCircle className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Ajouter</span>
          </Link>
        </div>
      </div>
      
      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-slate-800">Filtres avancés</h2>
            <button 
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={resetFilters}
            >
              Réinitialiser
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score minimum */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Score minimum</label>
              <div className="relative">
                <select
                  className="w-full p-2 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.minScore}
                  onChange={(e) => handleFilterChange('minScore', parseInt(e.target.value))}
                >
                  <option value={0}>Tous</option>
                  <option value={50}>50% et plus</option>
                  <option value={70}>70% et plus</option>
                  <option value={85}>85% et plus</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              </div>
            </div>
            
            {/* Experience minimum */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Expérience minimum</label>
              <div className="relative">
                <select
                  className="w-full p-2 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.experience || ''}
                  onChange={(e) => handleFilterChange('experience', e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">Toute expérience</option>
                  <option value={1}>1 an et plus</option>
                  <option value={3}>3 ans et plus</option>
                  <option value={5}>5 ans et plus</option>
                  <option value={10}>10 ans et plus</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              </div>
            </div>
            
            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Compétences</label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map(skill => (
                    <span 
                      key={skill} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer"
                      onClick={() => toggleSkillFilter(skill)}
                    >
                      {skill} ×
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        toggleSkillFilter(e.target.value);
                      }
                    }}
                  >
                    <option value="">Ajouter une compétence</option>
                    {availableSkills
                      .filter(skill => !selectedSkills.includes(skill))
                      .map(skill => (
                        <option key={skill} value={skill}>{skill}</option>
                      ))
                    }
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Candidates List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 pb-3 border-b border-slate-100">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Candidats ({filteredCandidates.length})</h2>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Poste</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Compétences clés</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Score IA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCandidates.map(candidate => (
                <CandidateRow key={candidate.id} candidate={candidate} />
              ))}
              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                    Aucun candidat trouvé avec les filtres actuels
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TalentPool;