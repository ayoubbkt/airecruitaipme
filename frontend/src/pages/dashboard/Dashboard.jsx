import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Briefcase, CheckCircle, Star, Play, Users } from 'lucide-react';
import { dashboardService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DashboardCard = ({ children, className = "" }) => (
    <div className={`bg-white rounded-xl shadow-sm p-5 ${className}`}>
      {children}
    </div>
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [pinnedJobs, setPinnedJobs] = useState([]);
  const [pinnedCandidates, setPinnedCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const dashboardData = await dashboardService.getDashboardData();

        setStats(dashboardData.stats);
        setMeetings(dashboardData.meetings);
        setTasks(dashboardData.tasks);
        setPinnedJobs(dashboardData.pinnedJobs);
        setPinnedCandidates(dashboardData.pinnedCandidates);
        setJobs(dashboardData.jobs);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const formattedDateCapitalized = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
      <div className="min-h-screen bg-slate-50 text-slate-800">
        {/* Main content */}
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Calendar size={16} />
              <span>{formattedDateCapitalized}</span>
            </div>
            <div className="text-xl font-bold text-slate-800">
              Les emails s'accumulent,<br />
              Les candidats attendent un appel,<br />
              {formattedDateCapitalized.split(' ')[0]} ouvre la voie.
            </div>
          </div>

          {/* Dashboard grid */}
          <div className="grid grid-cols-12 gap-5">
            {/* Upcoming Meetings */}
            <DashboardCard className="col-span-12 md:col-span-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={16} />
                <h3 className="font-medium">Entretiens à venir</h3>
              </div>

              {meetings && meetings.length > 0 ? (
                  <div className="space-y-3">
                    {meetings.map((meeting, index) => (
                        <div key={index} className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex gap-3">
                            <div className="text-center">
                              <div className="text-lg font-bold">{new Date(meeting.date).getDate()}</div>
                              <div className="text-xs text-slate-500">
                                {new Date(meeting.date).toLocaleDateString('fr-FR', { month: 'short' })}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">{meeting.candidateName}</div>
                              <div className="text-xs text-slate-500">{meeting.time}</div>
                              <div className="text-xs text-slate-500">{meeting.position}</div>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
              ) : (
                  <div className="text-center py-6 text-slate-400">
                    <Calendar className="w-10 h-10 mx-auto mb-2" />
                    <p>Aucun entretien planifié</p>
                  </div>
              )}
            </DashboardCard>

            {/* Tasks */}
            <DashboardCard className="col-span-12 md:col-span-4">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={16} />
                <h3 className="font-medium">Évaluations</h3>
              </div>

              {tasks && tasks.length > 0 ? (
                  <div className="space-y-3">
                    {tasks.map((task, index) => (
                        <div key={index} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg">
                          <div>
                            <div className="font-medium">{task.title}</div>
                            <div className="text-xs text-slate-500">{task.subtitle}</div>
                          </div>
                          <div className={`px-3 py-1 ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'} rounded-full text-xs`}>
                            {task.status === 'completed' ? 'Terminé' : 'En attente'}
                          </div>
                        </div>
                    ))}
                  </div>
              ) : (
                  <div className="text-center py-6 text-slate-400">
                    <CheckCircle className="w-10 h-10 mx-auto mb-2" />
                    <p>Aucune évaluation en attente</p>
                  </div>
              )}
            </DashboardCard>

            {/* Pinned content */}
            <div className="col-span-12 md:col-span-4 space-y-5">
              {/* Pinned Jobs */}
              <DashboardCard>
                <div className="flex items-center gap-2 mb-3">
                  <Star size={16} />
                  <h3 className="font-medium">Offres épinglées</h3>
                </div>

                {pinnedJobs && pinnedJobs.length > 0 ? (
                    <div className="space-y-2">
                      {pinnedJobs.map((job, index) => (
                          <Link to={`/jobs/${job.id}`} key={index} className="block bg-white border border-slate-100 rounded-lg p-2 hover:border-blue-200 hover:bg-blue-50">
                            <div className="font-medium">{job.title}</div>
                            <div className="flex text-sm text-slate-500 mt-1 gap-4">
                              <div className="flex gap-1 items-center">
                                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                <span>{job.inReview} en évaluation</span>
                              </div>
                              <div className="flex gap-1 items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span>{job.inInterview} en entretien</span>
                              </div>
                            </div>
                          </Link>
                      ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-slate-400">
                      <p>Aucune offre épinglée</p>
                      <Link to="/jobs" className="text-blue-500 text-sm hover:underline mt-1 inline-block">
                        Épingler une offre
                      </Link>
                    </div>
                )}
              </DashboardCard>

              {/* Pinned Candidates */}
              <DashboardCard>
                <div className="flex items-center gap-2 mb-3">
                  <Star size={16} />
                  <h3 className="font-medium">Candidats épinglés</h3>
                </div>

                {pinnedCandidates && pinnedCandidates.length > 0 ? (
                    <div className="space-y-2">
                      {pinnedCandidates.map((candidate, index) => (
                          <Link to={`/cv/${candidate.id}`} key={index} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                              {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{candidate.firstName} {candidate.lastName}</div>
                              <div className="text-xs text-slate-500">{candidate.position}</div>
                            </div>
                          </Link>
                      ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-slate-400">
                      <p>Aucun candidat épinglé</p>
                    </div>
                )}
              </DashboardCard>
            </div>

            {/* Jobs section */}
            <DashboardCard className="col-span-12 md:col-span-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Briefcase size={16} />
                  <h3 className="font-medium">Offres d'emploi</h3>
                </div>
                <Link to="/jobs/create" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">
                  Ajouter offre
                </Link>
              </div>

              {jobs && jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.map((job, index) => (
                        <div key={index} className="flex justify-between items-center p-3 border-b border-slate-100">
                          <div>
                            <div className="font-medium">{job.title}</div>
                            <div className="text-xs text-slate-500 flex gap-3 mt-1">
                              {job.internal && (
                                  <span className="inline-flex items-center gap-1">
                            <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                            Offre interne
                          </span>
                              )}
                              <span className="inline-flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                {job.department}
                        </span>
                              <span className="inline-flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                          Créée il y a {job.daysAgo} jours
                        </span>
                            </div>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <div>{job.evaluation} en évaluation</div>
                            <div>{job.interview} en entretien</div>
                            <div>{job.hired} recrutés</div>
                            <div className="font-semibold">{job.total} total</div>
                          </div>
                        </div>
                    ))}
                  </div>
              ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Briefcase className="w-12 h-12 mx-auto mb-2" />
                    <p>Aucune offre d'emploi active</p>
                    <Link to="/jobs/create" className="text-blue-500 text-sm hover:underline mt-2 inline-block">
                      Créer une offre
                    </Link>
                  </div>
              )}
            </DashboardCard>

            {/* Getting Started */}
            <DashboardCard className="col-span-12 md:col-span-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={16} />
                <h3 className="font-medium">Démarrage</h3>
              </div>
              <div className="bg-slate-100 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-200">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Play className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Guide de démarrage</div>
                  <div className="text-xs text-slate-500">Découvrez comment utiliser RecrutPME</div>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img src="/api/placeholder/40/40" alt="User" className="w-full h-full object-cover" />
                </div>
              </div>
            </DashboardCard>
          </div>
        </div>
      </div>
  );
};

export default Dashboard;