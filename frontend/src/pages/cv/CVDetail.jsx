import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Download, Share2, Mail, Phone, Calendar, Brain, BriefcaseBusiness, CheckCircle, Star, ArrowUpRight, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SkillMatch from '../../components/analysis/SkillMatch';
import { cvService } from '../../services/api';


const CVDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);
  const [activeTab, setActiveTab] = useState('resume');
  
  useEffect(() => {
    const fetchCandidateDetails = async () => {
      try {
        setLoading(true);
        const response = await cvService.getCVById(id);
        setCandidate(response);
      } catch (error) {
        console.error('Error fetching candidate details:', error);
        toast.error('Erreur lors du chargement des détails du candidat');
        navigate('/cv-analysis');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidateDetails();
  }, [id, navigate]);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!candidate) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Candidat non trouvé</h2>
        <p className="text-slate-600 mb-6">Le candidat que vous recherchez n'existe pas ou a été supprimé.</p>
        <Link to="/cv-analysis" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Retour à l'analyse des CV
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Candidate Header */}
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <button 
            className="p-2 rounded-full hover:bg-slate-100 mr-2"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Profil du candidat</h1>
        </div>
        
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-medium">
              {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-slate-800">{candidate.firstName} {candidate.lastName}</h1>
              <p className="text-lg text-slate-600">{candidate.title}</p>
              <div className="flex items-center mt-2">
                {candidate.email && (
                  <div className="flex items-center mr-4">
                    <Mail className="w-4 h-4 text-slate-500 mr-1" />
                    <span className="text-sm text-slate-600">{candidate.email}</span>
                  </div>
                )}
                {candidate.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-slate-500 mr-1" />
                    <span className="text-sm text-slate-600">{candidate.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 transition font-medium flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Contacter
            </button>
            <button className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition font-medium flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Entretien
            </button>
            <button 
              className="p-2 rounded-full hover:bg-slate-100"
              onClick={() => cvService.downloadCV(id)}
            >
              <Download className="w-5 h-5 text-slate-600" />
            </button>
            <button className="p-2 rounded-full hover:bg-slate-100">
              <Share2 className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>
      
      {/* AI Analysis Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
        <div className="flex items-start">
          <div className="flex-shrink-0 p-3 bg-white rounded-lg shadow-sm">
            <Brain className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold text-slate-800">Analyse IA</h2>
            <div className="mt-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-green-700">{candidate.score}%</span>
                </div>
                <div className="ml-3">
                  <p className="text-xs text-slate-500">Score global</p>
                  <p className="text-sm font-medium text-slate-700">
                    {candidate.score >= 85 ? 'Correspondance excellente' : 
                     candidate.score >= 70 ? 'Correspondance bonne' : 
                     candidate.score >= 50 ? 'Correspondance moyenne' : 
                     'Correspondance insuffisante'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-slate-500">Compétences</p>
                  <p className="text-sm font-medium text-slate-700">
                    {candidate.requiredSkillsMatch}/{candidate.requiredSkillsTotal} requises | {candidate.preferredSkillsMatch}/{candidate.preferredSkillsTotal} préférées
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <BriefcaseBusiness className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-slate-500">Expérience</p>
                  <p className="text-sm font-medium text-slate-700">{candidate.yearsOfExperience} ans d'expérience pertinente</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs and Content */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="border-b border-slate-200">
          <nav className="flex -mb-px">
            <button 
              onClick={() => setActiveTab('resume')} 
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'resume'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              CV analysé
            </button>
            <button 
              onClick={() => setActiveTab('aiAnalysis')} 
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'aiAnalysis'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Analyse IA détaillée
            </button>
            <button 
              onClick={() => setActiveTab('notes')} 
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'notes'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Notes
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'resume' && (
            <div className="flex">
              {/* Resume Preview */}
              <div className="w-1/2 pr-6 border-r border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-slate-800">Aperçu du CV</h3>
                  <div className="flex space-x-2">
                    <button 
                      className="p-1.5 rounded bg-slate-50 text-slate-600 hover:bg-slate-100"
                      onClick={() => window.open(`/api/cv/view/${candidate.id}`, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-1.5 rounded bg-slate-50 text-slate-600 hover:bg-slate-100"
                      onClick={() => cvService.downloadCV(candidate.id)}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4 h-[500px] overflow-auto">
                  <div className="bg-white shadow-sm rounded-lg p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">{candidate.firstName} {candidate.lastName}</h2>
                    <p className="text-slate-600 mb-4">{candidate.title} | {candidate.email} | {candidate.phone}</p>
                    
                    {/* Expérience */}
                    <div className="mb-6">
                      <h3 className="text-md font-semibold text-slate-800 border-b border-slate-200 pb-1 mb-2">Expérience professionnelle</h3>
                      {candidate.experience.map((exp, index) => (
                        <div key={index} className="mb-3">
                          <div className="flex justify-between">
                            <p className="font-medium text-slate-800">{exp.title}</p>
                            <p className="text-sm text-slate-600">{exp.startDate} - {exp.endDate || 'présent'}</p>
                          </div>
                          <p className="text-sm text-slate-700 mb-1">{exp.company}, {exp.location}</p>
                          <ul className="text-sm text-slate-600 pl-4 list-disc">
                            {exp.description.split('\n').map((line, i) => (
                              <li key={i}>{line}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    
                    {/* Éducation */}
                    <div className="mb-6">
                      <h3 className="text-md font-semibold text-slate-800 border-b border-slate-200 pb-1 mb-2">Formation</h3>
                      {candidate.education.map((edu, index) => (
                        <div key={index} className="mb-2">
                          <div className="flex justify-between">
                            <p className="font-medium text-slate-800">{edu.degree}</p>
                            <p className="text-sm text-slate-600">{edu.startYear} - {edu.endYear}</p>
                          </div>
                          <p className="text-sm text-slate-600">{edu.institution}, {edu.location}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Compétences */}
                    <div>
                      <h3 className="text-md font-semibold text-slate-800 border-b border-slate-200 pb-1 mb-2">Compétences</h3>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill, index) => (
                          <span key={index} className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* AI Annotations */}
              <div className="w-1/2 pl-6">
                <h3 className="text-lg font-medium text-slate-800 mb-4">Annotations IA</h3>
                
                <div className="space-y-6">
                  {/* Skills matching */}
                  <div>
                    <h4 className="text-md font-medium text-slate-700 mb-3">Correspondance des compétences</h4>
                    
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-slate-700 mb-3">Compétences requises</p>
                      {candidate.requiredSkillsAnalysis.map((skill, index) => (
                        <SkillMatch
                          key={index}
                          name={skill.name}
                          matched={skill.matched}
                          confidence={skill.confidence}
                        />
                      ))}
                      
                      {candidate.preferredSkillsAnalysis.length > 0 && (
                        <>
                          <p className="text-sm font-medium text-slate-700 mt-6 mb-3">Compétences préférées</p>
                          {candidate.preferredSkillsAnalysis.map((skill, index) => (
                            <SkillMatch
                              key={index}
                              name={skill.name}
                              matched={skill.matched}
                              confidence={skill.confidence}
                            />
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Experience analysis */}
                  <div>
                    <h4 className="text-md font-medium text-slate-700 mb-3">Analyse de l'expérience</h4>
                    
                    <div className="bg-slate-50 rounded-lg p-4">
                      <ul className="space-y-2">
                        {candidate.experienceInsights.map((insight, index) => (
                          <li key={index} className="flex items-start">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-blue-600" />
                            </div>
                            <p className="ml-2 text-sm text-slate-700">{insight}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Education analysis */}
                  <div>
                    <h4 className="text-md font-medium text-slate-700 mb-3">Analyse de la formation</h4>
                    
                    <div className="bg-slate-50 rounded-lg p-4">
                      <ul className="space-y-2">
                        {candidate.educationInsights.map((insight, index) => (
                          <li key={index} className="flex items-start">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-indigo-600" />
                            </div>
                            <p className="ml-2 text-sm text-slate-700">{insight}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'aiAnalysis' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-slate-800 mb-4">Analyse détaillée</h3>
                
                <div className="bg-slate-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="text-md font-medium text-green-800 mb-3 flex items-center">
                        <Star className="h-5 w-5 mr-2" />
                        Points forts
                      </h4>
                      <ul className="space-y-2">
                        {candidate.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                            <p className="text-sm text-slate-700">{strength}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Areas for improvement */}
                    <div className="bg-amber-50 rounded-lg p-4">
                      <h4 className="text-md font-medium text-amber-800 mb-3 flex items-center">
                        <Star className="h-5 w-5 mr-2" />
                        Axes d'amélioration
                      </h4>
                      <ul className="space-y-2">
                        {candidate.areasForImprovement.map((area, index) => (
                          <li key={index} className="flex items-start">
                            <Star className="h-4 w-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                            <p className="text-sm text-slate-700">{area}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Position fit */}
                  <div className="mt-6">
                    <h4 className="text-md font-medium text-slate-700 mb-3">Adéquation au poste</h4>
                    <p className="text-sm text-slate-700 mb-4">{candidate.jobFitAnalysis}</p>
                    
                    <h5 className="text-sm font-medium text-slate-700 mb-2">Score d'adéquation par catégorie</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {candidate.categoryScores.map((category, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-xs text-slate-600">{category.name}</p>
                            <p className="text-xs font-medium text-slate-700">{category.score}%</p>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full"
                              style={{ width: `${category.score}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Interview suggestions */}
              <div>
                <h3 className="text-lg font-medium text-slate-800 mb-4">Suggestions pour l'entretien</h3>
                
                <div className="bg-slate-50 rounded-lg p-6">
                  <p className="text-sm text-slate-700 mb-4">Voici quelques questions pertinentes pour explorer davantage le profil de {candidate.firstName} :</p>
                  
                  <ul className="space-y-3">
                    {candidate.interviewQuestions.map((question, index) => (
                      <li key={index} className="p-3 bg-white rounded-lg shadow-sm">
                        <p className="text-sm font-medium text-slate-800">{question.question}</p>
                        {question.rationale && (
                          <p className="text-xs text-slate-500 mt-1">{question.rationale}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                  
                  <button className="flex items-center mt-4 text-sm font-medium text-blue-600 hover:text-blue-800">
                    <span className="mr-1">Générer plus de questions</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
              </div>
          )}
          
          {activeTab === 'notes' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-800">Notes et commentaires</h3>
                <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">Ajouter une note</button>
              </div>
              
              {candidate.notes && candidate.notes.length > 0 ? (
                <div className="space-y-4">
                  {candidate.notes.map((note, index) => (
                    <div key={index} className="bg-slate-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                            {note.authorInitials}
                          </div>
                          <div className="ml-2">
                            <p className="text-sm font-medium text-slate-800">{note.authorName}</p>
                            <p className="text-xs text-slate-500">{new Date(note.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {note.type}
                        </div>
                      </div>
                      <p className="text-sm text-slate-700">{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-lg">
                  <p className="text-slate-500">Aucune note pour ce candidat</p>
                  <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                    Ajouter la première note
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CVDetail;