import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, ChevronDown, Bell, MoreHorizontal, ExternalLink, Star, Clock, Building2, MapPin, Calendar } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { jobService, getCandidates } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

// Will be populated from backend
const initialCandidates = [];

const CandidateItem = ({ candidate, selected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`p-3 mb-2 cursor-pointer transition-all duration-200 ${
        selected 
          ? "bg-blue-500 text-white rounded-lg shadow-md" 
          : "hover:bg-gray-50 rounded-lg"
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
          selected ? 'bg-white/20' : candidate.color
        }`}>
          {selected ? candidate.initials : candidate.initials}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className={`font-medium text-sm ${selected ? 'text-white' : 'text-gray-900'}`}>
              {candidate.name}
            </h4>
            <div className={`text-xs ${selected ? 'text-white/80' : 'text-gray-500'}`}>
              {candidate.tags[0]}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${selected ? 'text-white/80' : 'text-gray-600'}`}>
              {candidate.stage}
            </span>
            {candidate.rating && (
              <div className="flex items-center">
                <Star className={`w-3 h-3 ${selected ? 'text-white/80' : 'fill-yellow-400 text-yellow-400'}`} />
                <span className={`text-xs ml-1 ${selected ? 'text-white/80' : 'text-gray-600'}`}>
                  {candidate.rating} (1)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

 const JobCandidateKanbanView = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { companyId } = useAuth();
  const [job, setJob] = useState(null);
  const [stages, setStages] = useState([]); // stage names in order
  const [candidates, setCandidates] = useState(initialCandidates);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    if (!companyId || !jobId) return;
    let mounted = true;
    const load = async () => {
      try {
        // load job + stages
        const j = await jobService.getJobById(companyId, jobId);
        if (!mounted) return;
        setJob(j);
        const st = (j?.jobWorkflow?.stages || [])
          .sort((a,b) => a.order - b.order)
          .map(s => s.name);
        setStages(st);

        // load candidates
        const res = await getCandidates(companyId, { jobId, limit: 200, sortBy: 'updatedAt', sortOrder: 'desc' });
        if (!mounted) return;
        const list = (res?.data || []).map(c => {
          const app = (c.applications || []).find(a => a.jobId === jobId);
          const name = [c.firstName, c.lastName].filter(Boolean).join(' ');
          const initials = `${c.firstName?.[0] || ''}${c.lastName?.[0] || ''}`.toUpperCase();
          return {
            id: c.id,
            name,
            initials,
            stage: app?.currentStage?.name || 'Unassigned',
            tags: [''],
            added: '—',
            title: j?.title,
            color: 'bg-blue-500',
            status: undefined,
            rating: undefined,
            experience: [],
            education: []
          };
        });
        setCandidates(list);
        if (list.length) setSelectedId(list[0].id);
      } catch (e) {
        console.error(e);
      }
    };
    load();
    return () => { mounted = false; };
  }, [companyId, jobId]);

  const selected = useMemo(() => 
    candidates.find((c) => c.id === selectedId), 
    [candidates, selectedId]
  );

  const filtered = useMemo(() => {
    let list = candidates.filter((c) => 
      c.name.toLowerCase().includes(query.toLowerCase())
    );
    list.sort((a, b) => (sortDesc ? b.id - a.id : a.id - b.id));
    return list;
  }, [candidates, query, sortDesc]);

  const stageCounts = useMemo(() => {
    return stages.reduce((acc, stage) => {
      acc[stage] = candidates.filter(c => c.stage === stage).length;
      return acc;
    }, {});
  }, [candidates, stages]);

  const tabs = [
    { name: "Overview", icon: "👤" },
    { name: "Resume", icon: "📄" },
    { name: "Messages", icon: "💬" },
    { name: "Files", icon: "📁" },
    { name: "Ratings", icon: "⭐" },
    { name: "Activity", icon: "📊" }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{job?.title || 'Job'}</h1>
            <div className="flex items-center space-x-4 mt-1">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Published on your jobs page</span>
              </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Building2 className="w-4 h-4" />
          <span>{job?.department?.name || '—'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
          <span>{job?.location ? `${job.location.city}, ${job.location.country}` : '—'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* List */}
            <button onClick={() => navigate(`/jobs/${jobId}/list`)} className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded" title="List view">
              <div className="w-4 h-4 border-2 border-current rounded-sm"></div>
            </button>
            {/* Kanban (current) */}
            <button onClick={() => navigate(`/jobs/${jobId}/candidates/kanban`)} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700" title="Kanban view">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </button>
            {/* Pipeline */}
            <button onClick={() => navigate(`/jobs/${jobId}`)} className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded" title="Pipeline view">
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Sidebar */}
        <div className="w-48 bg-white border-r border-gray-200 p-4">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for candidates..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Stages */}
          <div>
            <div className="flex items-center mb-3">
              <div className="w-4 h-4 mr-2 bg-gray-400 rounded-sm"></div>
              <h3 className="text-sm font-medium text-gray-700">Stages</h3>
            </div>
            <div className="space-y-1">
              {stages.map((stage) => (
                <div
                  key={stage}
                  className="px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                >
                  {stage}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Candidates List */}
        <div className="w-80 bg-white border-r border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-900">Candidates</h2>
            <div className="flex items-center space-x-2">
              <button className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-4 text-sm">
            <div className="flex items-center space-x-1 bg-gray-100 rounded px-2 py-1">
              <Calendar className="w-3 h-3 text-gray-500" />
              <span className="text-gray-700">Created date</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </div>
            <div className="flex items-center space-x-1 bg-gray-100 rounded px-2 py-1">
              <span className="text-gray-700">Descending</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </div>
          </div>

          <div className="space-y-1 overflow-y-auto">
            {filtered.map((candidate) => (
              <CandidateItem
                key={candidate.id}
                candidate={candidate}
                selected={candidate.id === selectedId}
                onClick={() => setSelectedId(candidate.id)}
              />
            ))}
          </div>
        </div>

        {/* Details Panel */}
        <div className="flex-1 p-6 bg-gray-50">
          <div className="bg-white rounded-lg p-6 h-full">
            {/* Candidate Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${selected?.color}`}>
                  {selected?.initials}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selected?.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-600">{selected?.title}</span>
                    <span className="text-sm text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                      {selected?.stage}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    Added {selected?.added}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="text-sm text-red-600 hover:text-red-700">
                  ✕ Disqualify
                </button>
                <button className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600">
                  ✓ Advance
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-1 ${
                      activeTab === tab.name
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "Overview" && (
              <div className="space-y-6">
                {/* Experience */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Experience</h4>
                  <div className="space-y-4">
                    {selected?.experience?.map((exp, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                          <span className="text-lg font-bold text-blue-600">G</span>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{exp.role}</h5>
                          <p className="text-gray-600">{exp.company}</p>
                          <p className="text-sm text-gray-500">{exp.period}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Education</h4>
                  <div className="space-y-4">
                    {selected?.education?.map((edu, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                          <span className="text-lg">🎓</span>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{edu.school}</h5>
                          <p className="text-gray-600">{edu.degree}</p>
                          <p className="text-sm text-gray-500">{edu.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Questions/Answers */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Questions / Answers</h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">No questions available yet.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs content */}
            {activeTab !== "Overview" && (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-xl">
                    {tabs.find(t => t.name === activeTab)?.icon}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">{activeTab} Content</h3>
                <p className="text-sm text-gray-500">Content for {activeTab} tab will be displayed here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCandidateKanbanView;