import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, BriefcaseBusiness, ChevronDown, Brain, Filter, CheckCircle, Star, Activity } from 'lucide-react';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import AnalysisCard from '../../components/analysis/AnalysisCard';
import CandidateAnalysisRow from '../../components/analysis/CandidateAnalysisRow';
import { cvService, jobService } from '../../services/api';


const CVAnalysis = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [analysisInProgress, setAnalysisInProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [candidates, setCandidates] = useState([]);
  const [analyzedStats, setAnalyzedStats] = useState({
    skillsDetected: 0,
    recommendedCandidates: 0,
    topCandidateName: '',
    topCandidateScore: 0
  });
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await jobService.getJobs({ status: 'ACTIVE' });
        setJobs(response);
        if (response.length > 0) {
          setSelectedJobId(response[0].id);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast.error('Erreur lors du chargement des offres d\'emploi');
      }
    };
    
    fetchJobs();
  }, []);
  
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setFiles(Array.from(e.dataTransfer.files));
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };
  
  const handleAnalyzeClick = async () => {
    if (!selectedJobId) {
      toast.warning('Veuillez sélectionner une offre d\'emploi');
      return;
    }
    
    if (files.length === 0) {
      toast.warning('Veuillez ajouter au moins un CV');
      return;
    }
    
    try {
      setAnalysisInProgress(true);
      setProgress(0);
      
      // Start batch analysis
      const analysisId = await cvService.analyzeBatch(files, selectedJobId);
      
      // Poll for analysis progress
      const progressInterval = setInterval(async () => {
        try {
          const progressResponse = await cvService.getAnalysisProgress(analysisId);
          const { progress, completed, results, stats } = progressResponse;
          
          setProgress(progress);
          
          if (completed) {
            clearInterval(progressInterval);
            setAnalysisInProgress(false);
            setCandidates(results);
            setAnalyzedStats(stats);
            toast.success('Analyse des CV terminée avec succès');
          }
        } catch (error) {
          console.error('Error checking analysis progress:', error);
          clearInterval(progressInterval);
          setAnalysisInProgress(false);
          toast.error('Erreur lors de la vérification de la progression de l\'analyse');
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error analyzing CVs:', error);
      setAnalysisInProgress(false);
      toast.error('Erreur lors de l\'analyse des CV');
    }
  };
  
  const filteredCandidates = React.useMemo(() => {
    switch (activeTab) {
      case 'recommended':
        return candidates.filter(candidate => candidate.score >= 85);
      case 'consider':
        return candidates.filter(candidate => candidate.score >= 70 && candidate.score < 85);
      case 'rejected':
        return candidates.filter(candidate => candidate.score < 70);
      default:
        return candidates;
    }
  }, [activeTab, candidates]);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Analyse des CV par IA</h1>
          <p className="text-slate-500 mt-1">Importez des CV et notre IA identifiera les meilleurs candidats pour vos postes</p>
        </div>
      </div>

      {/* Upload and Job Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* CV Upload */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-slate-800 mb-4">Importer des CV</h2>
          <div 
            className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-blue-50 rounded-full mb-4">
              <Upload className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-slate-600 mb-2">
              {files.length > 0 
                ? `${files.length} fichier${files.length > 1 ? 's' : ''} sélectionné${files.length > 1 ? 's' : ''}`
                : 'Glissez-déposez vos fichiers CV ici'
              }
            </p>
            <p className="text-slate-400 text-sm mb-4">ou</p>
            <button 
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 transition font-medium"
              onClick={handleBrowseClick}
            >
              Parcourir les fichiers
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.txt,.rtf"
            />
          </div>
        </div>
        
        {/* Job selection */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-slate-800 mb-4">Sélectionner le poste</h2>
          <p className="text-slate-500 text-sm mb-4">Choisissez l'offre pour laquelle analyser les CV</p>
          
          <div className="relative mb-4">
            <select
              className="w-full p-3 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedJobId || ''}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              <option value="" disabled>Sélectionnez une offre</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronDown className="h-5 w-5 text-slate-400" />
            </div>
          </div>
          
          <button 
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 transition font-medium flex items-center justify-center"
            onClick={handleAnalyzeClick}
            disabled={analysisInProgress || !selectedJobId || files.length === 0}
          >
            <Brain className="h-5 w-5 mr-2" />
            Analyser
          </button>
        </div>
      </div>
      
      {/* Analysis Results */}
      {(analysisInProgress || candidates.length > 0) && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="p-6 pb-3 border-b border-slate-100">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">Résultats de l'analyse</h2>
              <div className="flex items-center space-x-2 text-slate-600">
                <Filter className="h-4 w-4" />
                <span className="text-sm">Filtrer</span>
              </div>
            </div>
          </div>
          
          {/* Progress bar if analysis is in progress */}
          {analysisInProgress && (
            <div className="p-6 bg-blue-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-blue-600 mr-2" />
                  <p className="text-sm font-medium text-slate-700">Analyse en cours: {Math.round(progress * files.length / 100)}/{files.length} CV traités</p>
                </div>
                <p className="text-sm font-medium text-blue-600">{progress}%</p>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Tab navigation */}
          {!analysisInProgress && candidates.length > 0 && (
            <>
              <div className="flex border-b border-slate-100">
                <button 
                  className={`px-6 py-4 text-sm font-medium ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-slate-800'}`}
                  onClick={() => setActiveTab('all')}
                >
                  Tous ({candidates.length})
                </button>
                <button 
                  className={`px-6 py-4 text-sm font-medium ${activeTab === 'recommended' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-slate-800'}`}
                  onClick={() => setActiveTab('recommended')}
                >
                  Recommandés ({candidates.filter(c => c.score >= 85).length})
                </button>
                <button 
                  className={`px-6 py-4 text-sm font-medium ${activeTab === 'consider' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-slate-800'}`}
                  onClick={() => setActiveTab('consider')}
                >
                  À considérer ({candidates.filter(c => c.score >= 70 && c.score < 85).length})
                </button>
                <button 
                  className={`px-6 py-4 text-sm font-medium ${activeTab === 'rejected' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-slate-800'}`}
                  onClick={() => setActiveTab('rejected')}
                >
                  Écartés ({candidates.filter(c => c.score < 70).length})
                </button>
              </div>
              
              {/* Candidates table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Compétences détectées</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Expérience</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Score IA</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Correspondance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCandidates.map((candidate) => (
                      <CandidateAnalysisRow
                        key={candidate.id}
                        candidate={candidate}
                        onViewDetails={() => navigate(`/cv/${candidate.id}`)}
                      />
                    ))}
                    {filteredCandidates.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                          Aucun candidat dans cette catégorie
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* AI Analysis Highlights */}
      {!analysisInProgress && candidates.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 pb-3 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">Points forts de l'analyse IA</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnalysisCard
                icon={<Brain className="h-6 w-6 text-blue-600" />}
                title="Détection des compétences"
                description={`Notre IA a identifié ${analyzedStats.skillsDetected} compétences différentes dans les ${files.length} CV analysés.`}
              />
              <AnalysisCard
                icon={<CheckCircle className="h-6 w-6 text-green-600" />}
                title="Candidats recommandés"
                description={`${analyzedStats.recommendedCandidates} candidat${analyzedStats.recommendedCandidates > 1 ? 's ont' : ' a'} un excellent score de correspondance (>85%).`}
              />
              <AnalysisCard
                icon={<Star className="h-6 w-6 text-amber-500" />}
                title="Candidat exceptionnel"
                description={analyzedStats.topCandidateName ? `${analyzedStats.topCandidateName} se démarque avec ${analyzedStats.topCandidateScore}% de correspondance.` : 'Aucun candidat exceptionnel identifié.'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVAnalysis;