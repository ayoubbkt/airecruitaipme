import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Clock, Star, ChevronDown } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { jobService, getCandidates } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'Waiting on Feedback':
      return 'bg-orange-100 text-orange-700 border border-orange-200';
    case 'Needs scheduling':
      return 'bg-blue-100 text-blue-700 border border-blue-200';
    case 'Feedback received':
      return 'bg-green-100 text-green-700 border border-green-200';
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-200';
  }
};

const timeSince = (date) => {
  if (!date) return 'recently';
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.max(0, Math.floor((now - then) / 1000));
  const day = 86400, hour = 3600, minute = 60;
  if (diff < minute) return 'just now';
  if (diff < hour) return `${Math.floor(diff / minute)} min ago`;
  if (diff < day) return `${Math.floor(diff / hour)} h ago`;
  return `${Math.floor(diff / day)} days ago`;
};

const JobListetemp = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { companyId } = useAuth();
  const [job, setJob] = useState(null);
  const [stageNames, setStageNames] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState(null);
  const [sortDesc, setSortDesc] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId || !jobId) return;
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const j = await jobService.getJobById(companyId, jobId);
        if (!mounted) return;
        setJob(j);
        const stages = (j?.jobWorkflow?.stages || []).sort((a,b) => a.order - b.order).map(s => s.name);
        setStageNames(stages);
        const res = await getCandidates(companyId, { jobId, limit: 200, sortBy: 'updatedAt', sortOrder: 'desc' });
        if (!mounted) return;
        const list = (res?.data || []).map(c => ({
          id: c.id,
          name: [c.firstName, c.lastName].filter(Boolean).join(' '),
          initials: `${c.firstName?.[0] || ''}${c.lastName?.[0] || ''}`.toUpperCase(),
          stage: (c.applications || []).find(a => String(a.jobId) === String(jobId))?.currentStage?.name || 'Unassigned',
          added: timeSince(c.createdAt),
          color: 'bg-blue-500',
          status: undefined,
          rating: undefined
        }));
        setCandidates(list);
      } catch (e) {
        console.error(e);
      } finally { if (mounted) setLoading(false); }
    };
    load();
    return () => { mounted = false; };
  }, [companyId, jobId]);

  const filtered = useMemo(() => {
    let list = [...candidates];
    if (stageFilter) list = list.filter((c) => c.stage === stageFilter);
    if (query) list = list.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
    list.sort((a, b) => {
      if (sortDesc) return (b.added || '').localeCompare(a.added || '');
      return (a.added || '').localeCompare(b.added || '');
    });
    return list;
  }, [candidates, query, stageFilter, sortDesc]);

  const CandidateRow = ({ candidate }) => (
    <div className="flex items-center py-4 px-6 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="w-6 mr-4">
        <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
      </div>
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${candidate.color}`}>
          {candidate.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-gray-900 text-sm truncate">{candidate.name}</h4>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
              {candidate.stage}
            </span>
            {candidate.status && (
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusBadgeStyle(candidate.status)}`}>
                {candidate.status}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="w-24 text-center">
        {candidate.rating ? (
          <div className="flex items-center justify-center space-x-1">
            <div className="flex items-center">
              {[1, 2, 3, 4].map((star) => (
                <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm text-gray-700 ml-1">{candidate.rating}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </div>
      <div className="w-32 text-center">
        <div className="flex items-center justify-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          Added {candidate.added}
        </div>
      </div>
      <div className="flex items-center space-x-2 ml-4">
        <button className="text-sm px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors">
          ✕ Disqualify
        </button>
        <button className="text-sm px-3 py-1 bg-green-500 text-white hover:bg-green-600 rounded transition-colors">
          ✓ Advance
        </button>
      </div>
    </div>
  );

  if (loading) return <div className="p-6"><LoadingSpinner /></div>;

  return (
    <div className="p-6">
      <div className="bg-white border-b border-gray-200 px-6 py-4 mb-4 rounded">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{job?.title || 'Job'}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => navigate(`/jobs/${jobId}/list`)} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700" title="List view">
              <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
            </button>
            <button onClick={() => navigate(`/jobs/${jobId}/candidates/kanban`)} className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded" title="Kanban view">
              <div className="w-4 h-4 bg-current rounded-sm"></div>
            </button>
            <button onClick={() => navigate(`/jobs/${jobId}`)} className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded" title="Pipeline view">
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-160px)]">
        <div className="w-48 bg-white border-r border-gray-200 p-4">
          <div className="mb-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Search candidates..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center mb-3">
              <div className="w-4 h-4 mr-2 bg-gray-400 rounded-sm"></div>
              <h3 className="text-sm font-medium text-gray-700">Stages</h3>
            </div>
            <div className="space-y-1">
              {stageNames.map((stage) => (
                <button
                  key={stage}
                  className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${stageFilter === stage ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setStageFilter(stageFilter === stage ? null : stage)}
                >
                  {stage}
                </button>
              ))}
              {stageNames.length === 0 && (
                <div className="text-xs text-gray-400">No stages</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <select className="text-sm border border-gray-300 rounded px-3 py-1 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none">
                  <option>Created date</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 -ml-6 pointer-events-none" />
              </div>
              <div className="flex items-center space-x-2">
                <select 
                  value={sortDesc ? 'Desc' : 'Asc'}
                  onChange={(e) => setSortDesc(e.target.value === 'Desc')}
                  className="text-sm border border-gray-300 rounded px-3 py-1 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="Desc">Desc</option>
                  <option value="Asc">Asc</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 -ml-6 pointer-events-none" />
              </div>
            </div>
            <button className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add Candidate</span>
            </button>
          </div>

          <div className="overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((candidate) => (
                <CandidateRow key={candidate.id} candidate={candidate} />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No candidates found</h3>
                <p className="text-sm text-gray-500">
                  {query ? 'Try adjusting your search terms' : 'No candidates match the selected criteria'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobListetemp;