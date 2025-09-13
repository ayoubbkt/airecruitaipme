import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, LayoutGrid, List, SplitSquareHorizontal, Loader2, Star, Clock, Calendar } from 'lucide-react';
import { jobService, workflowService, cvService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import AddCandidateModal from '../../components/candidates/AddCandidateModal';
import { toast } from 'react-toastify';

/*
  JobPipeline Views:
  - board: Kanban columns per workflow stage (first deliverable)
  - list: (placeholder for next iteration)
  - split: (placeholder for next iteration)
*/

// Enhanced implementation with DnD + placeholders
const EnhancedJobPipeline = () => {
  // Route is defined as /jobs/:id so we map id -> jobId
  const { id } = useParams();
  const jobId = id; // keep semantic name
  const { companyId } = useAuth();
  const [job, setJob] = useState(null);
  const [stages, setStages] = useState([]);
  const [candidatesByStage, setCandidatesByStage] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('board');
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetStage, setTargetStage] = useState(null);
  const [dragCandidate, setDragCandidate] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const loadData = useCallback(async () => {
    if (!companyId || !jobId) { setLoading(false); return; }
    setLoading(true);
    try {
  const j = await jobService.getJobById(companyId, jobId);
      setJob(j);
      // get workflow stages (job may already have workflowStages field)
      let ws = j?.workflowStages || [];
      if (!ws.length) {
        const workflows = await workflowService.getWorkflows(companyId);
        const active = Array.isArray(workflows) ? workflows.find(w => w.isDefault || w.status === 'ACTIVE') : null;
        if (active) {
          const stagesResp = await workflowService.getWorkflowStages(active.id);
          ws = stagesResp || [];
        }
      }
      const ordered = [...ws].sort((a,b)=> (a.order||0) - (b.order||0));
      setStages(ordered);

      // fetch candidates for this job
      const candidatesResp = await cvService.getCandidates(companyId, { jobId });
      const list = candidatesResp?.data || candidatesResp || [];
      // group by currentStage.id or status fallback
      const grouped = {};
      for (const st of ordered) grouped[st.id] = [];
      list.forEach(c => {
        const stageId = c.applications?.[0]?.currentStage?.id;
        if (stageId && grouped[stageId]) grouped[stageId].push(c); else {
          // put in first stage if unknown
          if (ordered[0]) grouped[ordered[0].id].push(c);
        }
      });
      setCandidatesByStage(grouped);
    } catch (err) {
      console.error(err);
      toast.error("Erreur chargement pipeline");
    } finally {
      setLoading(false);
    }
  }, [companyId, jobId, refreshKey]);

  useEffect(()=>{ loadData(); }, [loadData]);

  const handleOpenAdd = (stage) => {
    setTargetStage(stage);
    setShowAddModal(true);
  };

  const handleAddCandidate = async (formData) => {
    try {
      // adapt modal to current simple modal signature (firstName,lastName,email...)
      // We need job and stage
      const payload = { ...formData, job: jobId, stageId: targetStage?.id };
      const formPayload = new FormData();
      Object.keys(payload).forEach(key => formPayload.append(key, payload[key]));
      await cvService.createCandidate(companyId, formPayload);
      toast.success('Candidat ajouté');
      setShowAddModal(false);
      setTargetStage(null);
      setRefreshKey(k=>k+1);
    } catch (e) {
      console.error(e);
      toast.error("Erreur ajout candidat");
    }
  };

  const moveCandidate = async (candidate, toStage) => {
    try {
      // optimistic
      setCandidatesByStage(prev => {
        const copy = JSON.parse(JSON.stringify(prev));
        for (const sid of Object.keys(copy)) copy[sid] = copy[sid].filter(c=>c.id!==candidate.id);
        copy[toStage.id] = [...(copy[toStage.id]||[]), { ...candidate, applications:[{ ...(candidate.applications?.[0]||{}), currentStage:{ id: toStage.id, name: toStage.name }}]}];
        return copy;
      });
      await cvService.updateCandidateStage(companyId, candidate.id, toStage.id);
      toast.success('Stage mis à jour');
    } catch (e) {
      console.error(e);
      toast.error('Echec déplacement');
      loadData();
    }
  };

  const handleSelectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const colorFromName = (first='', last='') => {
    const seed = (first+last).split('').reduce((a,c)=>a+c.charCodeAt(0),0);
    const colors = ['bg-teal-500','bg-blue-500','bg-indigo-500','bg-rose-500','bg-amber-500','bg-emerald-500','bg-fuchsia-500'];
    return colors[seed % colors.length];
  };

  const timeInStageLabel = (c) => {
    const entered = c.stageEnteredAt || c.updatedAt || c.createdAt;
    if(!entered) return 'just now';
    const diffH = Math.max(1, Math.floor((Date.now() - new Date(entered).getTime())/3600000));
    if (diffH < 48) return `in stage ${diffH} hour${diffH>1?'s':''}`;
    const days = Math.floor(diffH/24);
    return `in stage ${days} day${days>1?'s':''}`;
  };

  const renderStatusBadge = (c) => {
    const status = c.status || c.pipelineStatus;
    if(!status) return null;
    if (/waiting_on_feedback/i.test(status)) return <div className="w-full mt-2 text-[11px] font-medium text-center rounded-md bg-amber-100 text-amber-700 py-1">Waiting on Feedback</div>;
    if (/needs_scheduling/i.test(status)) return <div className="w-full mt-2 text-[11px] font-medium text-center rounded-md bg-blue-100 text-blue-700 py-1 flex items-center justify-center gap-1"><Calendar className="w-3 h-3"/>Needs scheduling</div>;
    if (/feedback_received/i.test(status)) return <div className="w-full mt-2 text-[11px] font-medium text-center rounded-md bg-emerald-500 text-white py-1">Feedback received</div>;
    return null;
  };

  const renderRating = (c) => {
    const rating = c.averageRating || c.rating;
    const count = c.ratingCount || c.ratingsCount || (rating ? 1 : 0);
    if(!rating) return null;
    const full = Math.round(rating);
    return (
      <div className="flex items-center gap-1 text-[11px] text-gray-600 mt-1">
        {[...Array(5)].map((_,i)=> <Star key={i} className={`w-3 h-3 ${i<full?'text-amber-400 fill-amber-400':'text-gray-300'}`} />)}
        <span className="font-medium">{Number(rating).toFixed(1)}</span>
        <span className="text-gray-400">({count})</span>
      </div>
    );
  };

  const renderCandidateCard = (c, stage) => {
    return (
      <div key={c.id}
        draggable
        onDragStart={()=>setDragCandidate(c)}
        className="group bg-white border border-gray-200 rounded-md px-4 py-3 shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing flex flex-col">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 ${colorFromName(c.firstName,c.lastName)} rounded-full flex items-center justify-center text-white text-xs font-semibold`}> {(c.firstName||'?')[0]}{(c.lastName||'')[0]} </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate leading-tight">{c.firstName} {c.lastName}</p>
            <div className="flex items-center gap-1 text-[11px] text-gray-500"><Clock className="w-3 h-3"/>{timeInStageLabel(c)}</div>
            {renderRating(c)}
            {renderStatusBadge(c)}
          </div>
        </div>
      </div>
    );
  };

  const renderBoard = () => (
    <div className="flex gap-6 overflow-x-auto pb-8">
      {stages.map(stage => {
        const list = candidatesByStage[stage.id] || [];
        return (
          <div key={stage.id}
            onDragOver={(e)=>e.preventDefault()}
            onDrop={(e)=>{ e.preventDefault(); if (dragCandidate) moveCandidate(dragCandidate, stage); setDragCandidate(null); }}
            className="min-w-[250px] flex flex-col">
            <div className="flex items-center gap-2 mb-2 pl-1 pr-1">
              <h3 className="text-sm font-semibold text-gray-800 tracking-tight">{stage.name}</h3>
              <span className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{list.length}</span>
              <button onClick={()=>handleOpenAdd(stage)} className="ml-auto w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 text-gray-600"><Plus className="w-3 h-3"/></button>
            </div>
            <div className="flex flex-col gap-3">
              {list.map(c => renderCandidateCard(c, stage))}
              {list.length === 0 && (
                <button onClick={()=>handleOpenAdd(stage)} className="h-[84px] flex items-center justify-center border border-dashed border-gray-300 rounded-md text-[13px] font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600 transition flex-col gap-1 bg-white">
                  <Plus className="w-4 h-4" />
                  Stage Empty
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderList = () => (
    <div className="bg-white rounded-xl border shadow divide-y">
      <div className="grid grid-cols-5 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <span>Nom</span><span>Email</span><span>Stage</span><span>Rating</span><span>Actions</span>
      </div>
      {stages.flatMap(s => (candidatesByStage[s.id]||[]).map(c => (
        <div key={c.id} className="grid grid-cols-5 px-4 py-2 text-sm items-center hover:bg-gray-50">
          <span className="font-medium">{c.firstName} {c.lastName}</span>
            <span className="text-gray-600 truncate">{c.email||'—'}</span>
            <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-1 rounded">{c.applications?.[0]?.currentStage?.name || '—'}</span>
            <span>{c.averageRating?`⭐ ${c.averageRating}`:'—'}</span>
            <div className="flex gap-2">
              <button className="text-xs text-blue-600 hover:underline">Détails</button>
            </div>
        </div>
      )))}
    </div>
  );

  const renderSplit = () => (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-4 bg-white rounded-xl border shadow p-3 overflow-y-auto max-h-[75vh]">
        {stages.flatMap(s => (candidatesByStage[s.id]||[])).map(c => (
          <div key={c.id} onClick={() => handleSelectCandidate(c)} className={`p-3 border-b last:border-none cursor-pointer hover:bg-gray-50 text-sm ${selectedCandidate?.id === c.id ? 'bg-blue-50' : ''}`}>
            {c.firstName} {c.lastName}
            {selectedCandidate?.id === c.id && (
              <div className="flex gap-2 mt-2">
                <button onClick={(e)=>{ e.stopPropagation(); handleOpenAdd(candidatesByStage[c.currentStage.id]?.[0]); }} className="text-xs bg-green-50 text-green-600 rounded-md px-3 py-1 hover:bg-green-100 transition">Voir</button>
                <button onClick={(e)=>{ e.stopPropagation(); moveCandidate(c, stages.find(s=>s.id!==c.currentStage.id)); }} className="text-xs bg-yellow-50 text-yellow-600 rounded-md px-3 py-1 hover:bg-yellow-100 transition">Déplacer</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="col-span-8 bg-white rounded-xl border shadow p-6 flex flex-col">
        {selectedCandidate ? (
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{selectedCandidate.firstName} {selectedCandidate.lastName}</h3>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-800">{selectedCandidate.email}</p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Téléphone</p>
                <p className="text-sm font-medium text-gray-800">{selectedCandidate.phone || '—'}</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Stage actuel</p>
              <span className="text-xs uppercase tracking-wide bg-blue-50 text-blue-600 px-2 py-1 rounded">{selectedCandidate.applications?.[0]?.currentStage?.name}</span>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Rating</p>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-800">{selectedCandidate.averageRating || '—'}</span>
                <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded">⭐</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>moveCandidate(selectedCandidate, stages.find(s=>s.id!==selectedCandidate.applications?.[0]?.currentStage?.id))} className="flex-1 bg-yellow-50 text-yellow-600 rounded-md px-4 py-2 text-sm hover:bg-yellow-100 transition">
                Déplacer vers une autre étape
              </button>
              <button onClick={()=>handleOpenAdd(candidatesByStage[selectedCandidate.applications?.[0]?.currentStage?.id]?.[0])} className="flex-1 bg-green-50 text-green-600 rounded-md px-4 py-2 text-sm hover:bg-green-100 transition">
                Ajouter un commentaire
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
            Sélectionnez un candidat pour voir les détails
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="px-10 pt-6 pb-8 bg-[#F3FBFE] min-h-screen">
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-gray-800 tracking-tight flex items-center gap-3">
            {job?.title || 'Job'}
            {job?.status && (
              <span className="flex items-center gap-1 text-[11px] font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Published on your jobs page
              </span>
            )}
          </h1>
          <div className="flex flex-wrap items-center gap-5 text-[12px] text-gray-600 font-medium">
            {job?.department && <span>{job.department}</span>}
            {job?.team && <span>{job.team}</span>}
            {job?.location && <span>{job.location}</span>}
          </div>
        </div>
        <div className="flex gap-2 mt-1">
          <button onClick={()=>setView('board')} className={`w-8 h-8 flex items-center justify-center rounded-md border ${view==='board'?'bg-blue-600 border-blue-600 text-white':'bg-white text-gray-600 hover:bg-gray-50'}`}><LayoutGrid className="w-4 h-4" /></button>
          <button onClick={()=>setView('list')} className={`w-8 h-8 flex items-center justify-center rounded-md border ${view==='list'?'bg-blue-600 border-blue-600 text-white':'bg-white text-gray-600 hover:bg-gray-50'}`}><List className="w-4 h-4" /></button>
          <button onClick={()=>setView('split')} className={`w-8 h-8 flex items-center justify-center rounded-md border ${view==='split'?'bg-blue-600 border-blue-600 text-white':'bg-white text-gray-600 hover:bg-gray-50'}`}><SplitSquareHorizontal className="w-4 h-4" /></button>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Chargement...</div>
      ) : (
        view==='board'?renderBoard():view==='list'?renderList():renderSplit()
      )}
      <AddCandidateModal isOpen={showAddModal} onClose={()=>setShowAddModal(false)} onSubmit={handleAddCandidate} />
    </div>
  );
};

export default EnhancedJobPipeline;
