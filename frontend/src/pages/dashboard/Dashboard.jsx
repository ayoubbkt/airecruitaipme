import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Bell, PlusCircle, Filter, Brain, Award, Calendar, Clock, PieChart } from 'lucide-react';

const Dashboard = () => {
  const [cvCount, setCvCount] = useState(0);
  const [candidateCount, setCandidateCount] = useState(0);
  const [interviews, setInterviews] = useState(0);
  const [avgHireTime, setAvgHireTime] = useState('0j');
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch CV count
        const cvResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/cv/count`);
        setCvCount(cvResponse.data.count || 0);

        // Fetch candidate count
        const candidateResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/candidates/count`);
        setCandidateCount(candidateResponse.data.count || 0);

        // Fetch recent candidates
        const recentResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/candidates/recent`);
        setRecentCandidates(recentResponse.data || []);

        // Mock data for interviews and hire time (replace with actual API calls)
        setInterviews(8);
        setAvgHireTime('18j');
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <p className="p-6 text-slate-600">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tableau de bord</h1>
          <p className="text-slate-500 mt-1">Bienvenue, Julie. Voici votre activité de recrutement.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50">
            <Filter className="h-4 w-4 text-slate-600 mr-2" />
            <span className="text-sm font-medium text-slate-700">Filtres</span>
          </button>
          <button className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-sm hover:from-blue-700 hover:to-indigo-700">
            <PlusCircle className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Nouvelle offre</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="CV analysés"
          value={cvCount.toString()}
          trend="+23%"
          trendUp={true}
          icon={<Brain className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Candidats qualifiés"
          value={candidateCount.toString()}
          trend="+12%"
          trendUp={true}
          icon={<Award className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard
          title="Entretiens planifiés"
          value={interviews.toString()}
          trend="+5%"
          trendUp={true}
          icon={<Calendar className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Temps moyen embauche"
          value={avgHireTime}
          trend="-3j"
          trendUp={false}
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
              <button className="text-sm text-blue-600 font-medium hover:text-blue-700">
                Voir tous
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Poste
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Compétences clés
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Score IA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentCandidates.length > 0 ? (
                  recentCandidates.map((candidate, idx) => (
                    <CandidateRow
                      key={idx}
                      name={candidate.name || 'N/A'}
                      position={candidate.position || 'N/A'}
                      skills={candidate.skills || []}
                      score={candidate.score || 0}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-slate-500">
                      No recent candidates found.
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
                  <PieChart className="w-32 h-32 text-blue-500 opacity-20" />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-xs text-slate-600">LinkedIn (42%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                    <span className="text-xs text-slate-600">Site web (24%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                    <span className="text-xs text-slate-600">Candidatures (21%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-xs text-slate-600">Recommandations (13%)</span>
                  </div>
                </div>
              </div>
              <button className="w-full py-3 flex items-center justify-center bg-slate-50 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-100">
                <PlusCircle className="w-4 h-4 mr-2 text-slate-500" />
                Importer des CV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, trendUp, icon, color }) => {
  const bgColors = {
    blue: 'bg-blue-50',
    indigo: 'bg-indigo-50',
    purple: 'bg-purple-50',
    green: 'bg-green-50',
  };

  const textColors = {
    blue: 'text-blue-600',
    indigo: 'text-indigo-600',
    purple: 'text-purple-600',
    green: 'text-green-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
          <div className={`flex items-center mt-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            <span className="text-xs font-medium">{trend}</span>
          </div>
        </div>
        <div className={`p-3 rounded-full ${bgColors[color]}`}>
          <div className={`w-5 h-5 ${textColors[color]}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

const CandidateRow = ({ name, position, skills, score }) => {
  let scoreColor = 'bg-red-100 text-red-800';
  if (score >= 90) {
    scoreColor = 'bg-green-100 text-green-800';
  } else if (score >= 75) {
    scoreColor = 'bg-yellow-100 text-yellow-800';
  } else if (score >= 60) {
    scoreColor = 'bg-orange-100 text-orange-800';
  }

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium">
            {name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-slate-900">{name}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <p className="text-sm text-slate-600">{position}</p>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-wrap gap-1">
          {skills.map((skill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
            >
              {skill}
            </span>
          ))}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${scoreColor}`}>
          {score}%
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100">
          Voir
        </button>
      </td>
    </tr>
  );
};

export default Dashboard;