import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Award, Calendar, Clock, PlusCircle, Filter, Users } from 'lucide-react';
import axios from '../../utils/axios';
import StatCard from '../../components/dashboard/StatCard';
import CandidateRow from '../../components/candidates/CandidateRow';
import SourcesChart from '../../components/charts/SourcesChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    analyzedCVs: 0,
    qualifiedCandidates: 0,
    scheduledInterviews: 0,
    timeToHire: 0
  });
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [sourcesData, setSourcesData] = useState([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch multiple resources in parallel
        const [statsResponse, candidatesResponse, sourcesResponse] = await Promise.all([
          axios.get('/api/dashboard/stats'),
          axios.get('/api/candidates/recent'),
          axios.get('/api/dashboard/sources')
        ]);
        
        setStats(statsResponse.data);
        setRecentCandidates(candidatesResponse.data);
        setSourcesData(sourcesResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tableau de bord</h1>
          <p className="text-slate-500 mt-1">Bienvenue sur votre tableau de bord de recrutement.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50">
            <Filter className="h-4 w-4 text-slate-600 mr-2" />
            <span className="text-sm font-medium text-slate-700">Filtres</span>
          </button>
          <Link to="/jobs/create" className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-sm hover:from-blue-700 hover:to-indigo-700">
            <PlusCircle className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Nouvelle offre</span>
          </Link>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="CV analysés" 
          value={stats.analyzedCVs} 
          trend={`+${stats.analyzedCVsPercentChange}%`} 
          trendUp={stats.analyzedCVsPercentChange > 0}
          icon={<Brain className="w-5 h-5" />}
          color="blue"
        />
        <StatCard 
          title="Candidats qualifiés" 
          value={stats.qualifiedCandidates} 
          trend={`+${stats.qualifiedCandidatesPercentChange}%`} 
          trendUp={stats.qualifiedCandidatesPercentChange > 0}
          icon={<Award className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard 
          title="Entretiens planifiés" 
          value={stats.scheduledInterviews} 
          trend={`+${stats.scheduledInterviewsPercentChange}%`} 
          trendUp={stats.scheduledInterviewsPercentChange > 0}
          icon={<Calendar className="w-5 h-5" />}
          color="purple"
        />
        <StatCard 
          title="Temps moyen embauche" 
          value={`${stats.timeToHire}j`} 
          trend={`${stats.timeToHireChange}j`} 
          trendUp={stats.timeToHireChange < 0}
          icon={<Clock className="w-5 h-5" />}
          color="green"
        />
      </div>
      
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Candidates */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 pb-3 border-b border-slate-100">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">Candidats récemment analysés</h2>
              <Link to="/talent-pool" className="text-sm text-blue-600 font-medium hover:text-blue-700">Voir tous</Link>
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
                {recentCandidates.map(candidate => (
                  <CandidateRow key={candidate.id} candidate={candidate} />
                ))}
                {recentCandidates.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-slate-500">
                      Aucun candidat récemment analysé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Talent Acquisition */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 pb-3 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">Acquisition de talents</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-slate-700">Sources de recrutement</p>
                </div>
                <div className="h-48 flex items-center justify-center">
                  <SourcesChart data={sourcesData} />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {sourcesData.map(source => (
                    <div key={source.id} className="flex items-center">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                      <span className="text-xs text-slate-600 ml-2">{source.name} ({source.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Link to="/cv-analysis" className="w-full py-3 flex items-center justify-center bg-slate-50 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-100">
                <PlusCircle className="w-4 h-4 mr-2 text-slate-500" />
                Importer des CV
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;