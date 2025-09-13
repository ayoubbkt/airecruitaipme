import React, { useEffect, useMemo, useState } from 'react';
import { MoreHorizontal, Plus, Clock, Star, GripVertical } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { jobService, getCandidates, cvService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import AddCandidateModalJob from './AddCandidateModalJob.jsx';

const JobCandidatePipelineView = () => {
  const { id: jobId } = useParams();
  const { companyId } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stageOrder, setStageOrder] = useState([]); // [{id, name, order}]
  const [stageBuckets, setStageBuckets] = useState({}); // stageId -> candidates[]
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetStage, setTargetStage] = useState(null); // {id,name,order}
  const [dragCandidate, setDragCandidate] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!companyId || !jobId) return;
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Job details (includes workflow stages)
        const j = await jobService.getJobById(companyId, jobId);
        if (!mounted) return;
        setJob(j);

        const stages = (j?.jobWorkflow?.stages || [])
          .map(s => ({ id: s.id, name: s.name, order: s.order }))
          .sort((a,b) => a.order - b.order);
        setStageOrder(stages);

        // Fetch candidates for this job
        const res = await getCandidates(companyId, { jobId, limit: 200, sortBy: 'updatedAt', sortOrder: 'desc' });
        if (!mounted) return;
        const list = res?.data || [];

        // Group by current stage name for this job's application
  const buckets = {};
  for (const s of stages) buckets[s.id] = [];
  buckets['unassigned'] = [];

        list.forEach(c => {
          const app = (c.applications || []).find(a => String(a.jobId) === String(jobId));
          const stageId = app?.currentStage?.id;
          const name = [c.firstName, c.lastName].filter(Boolean).join(' ');
          const initials = `${c.firstName?.[0] || ''}${c.lastName?.[0] || ''}`.toUpperCase();
          const uiCandidate = {
            id: c.id,
            name,
            initials,
            duration: '-',
            status: undefined,
            color: 'bg-blue-500',
            rating: undefined,
          };
          if (stageId && buckets[stageId] !== undefined) buckets[stageId].push(uiCandidate);
          else buckets['unassigned'].push(uiCandidate);
        });
        setStageBuckets(buckets);
      } catch (e) {
        console.error(e);
        setError(e?.response?.data?.message || e.message || 'Failed to load pipeline');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [companyId, jobId, refreshKey]);

  const columns = useMemo(() => {
    const cols = stageOrder.map(s => ({ stage: s, key: s.id, title: s.name, data: stageBuckets[s.id] || [] }));
    // If some candidates have no stage, show an extra column
    if ((stageBuckets['unassigned'] || []).length > 0) {
      cols.unshift({ stage: { id: 'unassigned', name: 'Unassigned', order: -1 }, key: 'unassigned', title: 'Unassigned', data: stageBuckets['unassigned'] });
    }
    return cols.map(c => ({ ...c, count: c.data.length }));
  }, [stageOrder, stageBuckets]);

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Waiting on Feedback':
        return 'bg-orange-200 text-orange-800 border border-orange-300';
      case 'Needs scheduling':
        return 'bg-blue-100 text-blue-700';
      case 'Feedback received':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const CandidateCard = ({ candidate }) => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-3 mb-2">
          <button
            title="Drag"
            draggable
            onDragStart={()=>setDragCandidate(candidate)}
            onDragEnd={()=>setDragCandidate(null)}
            className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${candidate.color}`}>
            {candidate.initials}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 text-sm">{candidate.name}</h4>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Clock className="w-3 h-3 mr-1" />
              In stage {candidate.duration}
            </div>
          </div>
        </div>

        {candidate.rating && (
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[1, 2, 3, 4].map((star) => (
                <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              ))}
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            </div>
            <span className="text-xs text-gray-600 ml-1">{candidate.rating} (1)</span>
          </div>
        )}

        {candidate.status && (
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(candidate.status)}`}>
            {candidate.status}
          </div>
        )}
      </div>
    );
  };

  const EmptyStage = ({ onClick }) => (
    <button onClick={onClick} className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white hover:border-blue-400 hover:text-blue-600 transition">
      <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
      <p className="text-sm text-gray-500 font-medium">Stage Empty</p>
    </button>
  );

  const handleOpenAdd = (stage) => {
    setTargetStage(stage);
    setShowAddModal(true);
  };

  const moveCandidate = async (candidate, toStage) => {
    if (!toStage || toStage.id === 'unassigned') return; // ignore dropping to Unassigned
    try {
      // optimistic move
      setStageBuckets(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => { next[k] = (next[k] || []).filter(c => c.id !== candidate.id); });
        const key = toStage.id;
        next[key] = [...(next[key] || []), candidate];
        return next;
      });
      await cvService.updateCandidateStage(companyId, candidate.id, toStage.id);
    } catch (e) {
      console.error(e);
      setRefreshKey(k=>k+1); // reload to rollback
    }
  };

  const Column = ({ column }) => (
    <div className="flex-shrink-0 w-72"
      onDragOver={(e)=>e.preventDefault()}
      onDrop={(e)=>{ e.preventDefault(); if (dragCandidate) moveCandidate(dragCandidate, column.stage); setDragCandidate(null); }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-gray-800">{column.title}</h3>
          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full font-medium">
            {column.count}
          </span>
        </div>
      </div>

      <div className="space-y-3 min-h-[500px]">
        {column.data.length > 0 ? (
          column.data.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))
        ) : (
          <EmptyStage onClick={()=> handleOpenAdd(column.stage)} />
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {loading && (
        <div className="p-6"><LoadingSpinner /></div>
      )}
      {!loading && error && (
        <div className="p-6 text-sm text-red-600">{error}</div>
      )}
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job?.title || 'Job'}</h1>
            {(() => {
              const departmentLabel = job?.department && typeof job.department === 'object'
                ? (job.department.name || '—')
                : (job?.department || '—');
              const locationLabel = job?.location && typeof job.location === 'object'
                ? [job.location.city, job.location.country].filter(Boolean).join(', ')
                : (job?.location || '—');
              return (
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{job?.status === 'PUBLISHED' ? 'Published on your jobs page' : job?.status || 'Draft'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-4 h-4 bg-gray-400 rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs">🏢</span>
                </div>
                  <span>{departmentLabel}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-4 h-4 bg-gray-400 rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs">📍</span>
                </div>
                  <span>{locationLabel}</span>
              </div>
              </div>
              );
            })()}
          </div>
          
          <div className="flex items-center space-x-3">
            {/* List view */}
            <button
              onClick={() => navigate(`/jobs/${jobId}/list`)}
              title="List view"
              className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            {/* Kanban view */}
            <button
              onClick={() => navigate(`/jobs/${jobId}/candidates/kanban`)}
              title="Kanban view"
              className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h4v12H4zM10 6h4v12h-4zM16 6h4v12h-4z" />
              </svg>
            </button>
            {/* Pipeline view (current) */}
            <button
              onClick={() => navigate(`/jobs/${jobId}`)}
              title="Pipeline view"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h6v10H3zM11 7h10v4H11zM11 13h10v4H11z" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      {!loading && !error && (
        <div className="p-6">
          <div className="flex space-x-6 overflow-x-auto">
            {columns.map((column) => (
              <Column key={column.key || column.stage?.id} column={column} />
            ))}
          </div>
        </div>
      )}
      <AddCandidateModalJob
        isOpen={showAddModal}
        onClose={()=>{ setShowAddModal(false); setTargetStage(null); }}
        companyId={companyId}
        defaultJobId={jobId}
        defaultStageId={targetStage?.id}
        onCandidateAdded={()=> setRefreshKey(k=>k+1)}
      />
    </div>
  );
};

export default JobCandidatePipelineView;