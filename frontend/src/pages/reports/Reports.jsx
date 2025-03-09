import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Clock, Download, Filter, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [reportData, setReportData] = useState({
    hiringFunnel: [],
    sourceEfficiency: [],
    timeToHire: [],
    skillDistribution: []
  });
  
  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);
  
  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch multiple report endpoints in parallel
      const [funnelResponse, sourceResponse, timeResponse, skillResponse] = await Promise.all([
        axios.get(`/api/reports/hiring-funnel?period=${selectedPeriod}`),
        axios.get(`/api/reports/source-efficiency?period=${selectedPeriod}`),
        axios.get(`/api/reports/time-to-hire?period=${selectedPeriod}`),
        axios.get(`/api/reports/skill-distribution?period=${selectedPeriod}`)
      ]);
      
      setReportData({
        hiringFunnel: funnelResponse.data,
        sourceEfficiency: sourceResponse.data,
        timeToHire: timeResponse.data,
        skillDistribution: skillResponse.data
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Erreur lors du chargement des rapports');
    } finally {
      setLoading(false);
    }
  };
  
  const exportReport = () => {
    toast.info('Export du rapport en cours...');
    // Implement export functionality here
  };
  
  const COLORS = ['#4A6FDC', '#60A5FA', '#34D399', '#F59E0B', '#FB7185', '#A78BFA'];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rapports d'analyse</h1>
          <p className="text-slate-500 mt-1">Visualisez les performances de votre processus de recrutement</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <select
              className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="7days">7 derniers jours</option>
              <option value="30days">30 derniers jours</option>
              <option value="90days">3 derniers mois</option>
              <option value="6months">6 derniers mois</option>
              <option value="1year">Année en cours</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <ChevronDown size={16} />
            </div>
          </div>
          <button 
            onClick={exportReport}
            className="flex items-center px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50"
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="text-sm">Exporter</span>
          </button>
        </div>
      </div>
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-6">
          {/* Hiring Funnel */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Entonnoir de recrutement</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={reportData.hiringFunnel}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}`, 'Nombre']} />
                  <Legend />
                  <Bar dataKey="value" fill="#4A6FDC" name="Candidats" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {reportData.hiringFunnel.map((stage, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">{stage.name}</p>
                  <p className="text-xl font-semibold text-slate-800">{stage.value}</p>
                  {index > 0 && (
                    <p className={`text-xs ${stage.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stage.change >= 0 ? '+' : ''}{stage.change}% vs période précédente
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Source Efficiency and Time to Hire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source Efficiency */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Efficacité des sources</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportData.sourceEfficiency}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {reportData.sourceEfficiency.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} candidats`, 'Nombre']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {reportData.sourceEfficiency.map((source, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{source.name}</p>
                      <p className="text-xs text-slate-500">{source.value} candidats ({source.rate}% de conversion)</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Time to Hire */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Temps moyen d'embauche</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={reportData.timeToHire}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 'dataMax + 5']} />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip formatter={(value) => [`${value} jours`, 'Durée']} />
                    <Legend />
                    <Bar dataKey="value" name="Jours" fill="#34D399" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-between bg-green-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-green-600 mr-2" />
                  <p className="text-sm font-medium text-slate-800">Durée moyenne totale</p>
                </div>
                <p className="text-xl font-semibold text-green-600">
                  {reportData.timeToHire.reduce((sum, item) => sum + item.value, 0) / reportData.timeToHire.length} jours
                </p>
              </div>
            </div>
          </div>
          
          {/* Top Skills Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Distribution des compétences les plus recherchées</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={reportData.skillDistribution}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'Fréquence']} />
                  <Legend />
                  <Bar dataKey="demand" name="Demandé" fill="#4A6FDC" />
                  <Bar dataKey="supply" name="Disponible" fill="#34D399" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Compétences les plus demandées</h3>
                <div className="grid grid-cols-2 gap-2">
                  {reportData.skillDistribution
                    .sort((a, b) => b.demand - a.demand)
                    .slice(0, 6)
                    .map((skill, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-600 mr-2" />
                        <p className="text-xs text-slate-700">{skill.name} ({skill.demand}%)</p>
                      </div>
                    ))}
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-green-800 mb-2">Écarts de compétences</h3>
                <div className="grid grid-cols-2 gap-2">
                  {reportData.skillDistribution
                    .sort((a, b) => (b.demand - b.supply) - (a.demand - a.supply))
                    .slice(0, 6)
                    .map((skill, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-600 mr-2" />
                        <p className="text-xs text-slate-700">{skill.name} ({skill.demand - skill.supply}%)</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;