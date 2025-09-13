import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { jobService } from '../../services/api';
import { Search, ChevronDown, ChevronUp, MoreHorizontal, Building2, MapPin, Plus, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const timeSince = (date) => {
  if (!date) return '-';
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.floor((now - then) / 1000); // seconds
  const day = 86400; const hour = 3600; const minute = 60;
  if (diff < minute) return 'just now';
  if (diff < hour) return `${Math.floor(diff / minute)} min ago`;
  if (diff < day) return `${Math.floor(diff / hour)} h ago`;
  return `${Math.floor(diff / day)} days ago`;
};

// Map status -> human label + subtitle sentence
const STATUS_LABELS = {
  PUBLISHED: { label: 'Published', subtitle: 'Published on your jobs page' },
  INTERNAL: { label: 'Internal', subtitle: 'Marked internal only' },
  CONFIDENTIAL: { label: 'Confidential', subtitle: 'Marked confidential' },
  DRAFT: { label: 'Draft', subtitle: 'Draft' },
  ARCHIVED: { label: 'Archived', subtitle: 'Archived' }
};

const JobsPage = () => {
  const { companyId } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState({ departments: [], locations: [], statuses: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState({ statuses: new Set(), departments: new Set(), locations: new Set() });
  const [openJobMenu, setOpenJobMenu] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [pinSet, setPinSet] = useState(new Set());
  const navigate = useNavigate();

  const fetchJobs = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await jobService.getJobs(companyId, { page, limit });
      setJobs(res.data || []);
      if (res.meta) setMeta(res.meta);
      if (typeof res.totalPages === 'number') setTotalPages(res.totalPages);
    } catch (e) {
      console.error('Failed to load jobs', e);
      toast.error("Erreur lors du chargement des jobs");
    } finally { setLoading(false); }
  }, [companyId, page, limit]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const toggleFilter = (type, id) => {
    setFilters(prev => {
      const setCopy = new Set(prev[type]);
      setCopy.has(id) ? setCopy.delete(id) : setCopy.add(id);
      return { ...prev, [type]: setCopy };
    });
  };

  const archiveJob = async (job) => {
    try {
      await jobService.updateJob(companyId, job.id, { status: 'ARCHIVED' });
      toast.success('Job archivé');
      fetchJobs();
    } catch (e) {
      console.error(e);
      toast.error('Impossible d\'archiver le job');
    }
  };

  const pinJob = (job) => {
    setPinSet(prev => {
      const copy = new Set(prev);
      copy.has(job.id) ? copy.delete(job.id) : copy.add(job.id);
      return copy;
    });
  };

  // Compute counts for sidebar
  const statusCounts = jobs.reduce((acc,j)=>{ acc[j.status]=(acc[j.status]||0)+1; return acc; },{});
  const deptCounts = jobs.reduce((acc,j)=>{ if(j.department) acc[j.department.id]=(acc[j.department.id]||0)+1; return acc; },{});
  const locCounts = jobs.reduce((acc,j)=>{ if(j.location) acc[j.location.id]=(acc[j.location.id]||0)+1; return acc; },{});

  const filtered = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(search.toLowerCase());
    const statusOk = filters.statuses.size === 0 || filters.statuses.has(j.status);
    const depOk = filters.departments.size === 0 || (j.department && filters.departments.has(j.department.id));
    const locOk = filters.locations.size === 0 || (j.location && filters.locations.has(j.location.id));
    return matchesSearch && statusOk && depOk && locOk;
  }).sort((a,b) => {
    if (sortBy === 'updatedAt') {
      const diff = new Date(a.updatedAt) - new Date(b.updatedAt);
      return sortOrder === 'asc' ? diff : -diff;
    }
    return 0;
  });

  // Pinned at top
  const ordered = [
    ...filtered.filter(j => pinSet.has(j.id)),
    ...filtered.filter(j => !pinSet.has(j.id))
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-72 border-r bg-white p-4 overflow-y-auto space-y-6">
        {/* Status */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Job State</h2>
          <div className="space-y-2">
            {meta.statuses.map(st => {
              const info = STATUS_LABELS[st] || { label: st, subtitle: st };
              const active = filters.statuses.has(st);
              return (
                <button
                  key={st}
                  onClick={()=>toggleFilter('statuses', st)}
                  className={`w-full flex items-center justify-between text-left text-sm px-2 py-1.5 rounded-md transition ${active?'bg-blue-50 text-blue-700':'hover:bg-gray-50 text-gray-700'}`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${st==='PUBLISHED'?'bg-emerald-500':st==='INTERNAL'?'bg-blue-500':st==='CONFIDENTIAL'?'bg-purple-500':st==='DRAFT'?'bg-gray-400':'bg-gray-300'}`}></span>
                    {info.label}
                  </span>
                  <span className="text-[11px] text-gray-500">{statusCounts[st]||0}</span>
                </button>
              );
            })}
          </div>
        </div>
        {/* Locations */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Locations</h2>
          <div className="space-y-2">
            {meta.locations.map(l => {
              const active = filters.locations.has(l.id);
              return (
                <button
                  key={l.id}
                  onClick={()=>toggleFilter('locations', l.id)}
                  className={`w-full flex items-center justify-between text-left text-sm px-2 py-1.5 rounded-md transition ${active?'bg-blue-50 text-blue-700':'hover:bg-gray-50 text-gray-700'}`}
                >
                  <span className="flex items-center gap-2"><MapPin className="w-3 h-3"/>{l.city}, {l.country}</span>
                  <span className="text-[11px] text-gray-500">{locCounts[l.id]||0}</span>
                </button>
              );
            })}
            {meta.locations.length===0 && <div className="text-xs text-gray-400">No locations</div>}
          </div>
        </div>
        {/* Departments */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Departments</h2>
          <div className="space-y-2">
            {meta.departments.map(d => {
              const active = filters.departments.has(d.id);
              return (
                <button
                  key={d.id}
                  onClick={()=>toggleFilter('departments', d.id)}
                  className={`w-full flex items-center justify-between text-left text-sm px-2 py-1.5 rounded-md transition ${active?'bg-blue-50 text-blue-700':'hover:bg-gray-50 text-gray-700'}`}
                >
                  <span className="flex items-center gap-2"><Building2 className="w-3 h-3"/>{d.name}</span>
                  <span className="text-[11px] text-gray-500">{deptCounts[d.id]||0}</span>
                </button>
              );
            })}
            {meta.departments.length===0 && <div className="text-xs text-gray-400">No departments</div>}
          </div>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search jobs..." className="pl-9 pr-3 py-2 rounded-md border text-sm w-64" />
            </div>
            <div className="flex items-center gap-2">
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="border rounded px-2 py-2 text-sm">
                <option value="updatedAt">Updated date</option>
                <option value="createdAt">Created date (disabled)</option>
              </select>
              <button onClick={()=> setSortOrder(o=>o==='asc'?'desc':'asc')} className="border rounded px-3 py-2 text-sm flex items-center gap-1">
                {sortOrder==='desc' ? 'Descending' : 'Ascending'} {sortOrder==='desc'? <ChevronDown className="w-4 h-4"/>:<ChevronUp className="w-4 h-4"/>}
              </button>
            </div>
          </div>
          <button onClick={()=> navigate('/jobs/create')} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-md shadow">
            <Plus className="w-4 h-4"/> Add Job Posting
          </button>
        </div>

  {loading ? <div className="text-sm text-gray-500">Loading jobs...</div> : (
          <div className="space-y-3">
            {ordered.map(job => {
              const info = STATUS_LABELS[job.status] || { label: job.status, subtitle: job.status };
              return (
                <div key={job.id} className="bg-white border rounded-lg px-5 py-4 flex justify-between items-start relative hover:border-emerald-200 transition">
                  <div className="space-y-1">
                    <h3 className="font-medium text-gray-800 flex items-center gap-2">
                      {pinSet.has(job.id) && <span className="text-amber-500 text-xs border border-amber-200 px-1 rounded">PIN</span>}
                      <button onClick={()=>navigate(`/jobs/${job.id}`)} className="hover:text-emerald-600">{job.title}</button>
                    </h3>
                    <div className="text-xs text-gray-600 flex flex-wrap gap-3">
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${job.status==='PUBLISHED'?'bg-emerald-500':job.status==='INTERNAL'?'bg-blue-500':job.status==='CONFIDENTIAL'?'bg-purple-500':job.status==='DRAFT'?'bg-gray-400':'bg-gray-300'}`}></span>
                        {info.subtitle}
                      </span>
                      {job.department && <span className="flex items-center gap-1"><Building2 className="w-3 h-3"/> {job.department.name}</span>}
                      {job.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {job.location.city}, {job.location.country}</span>}
                    </div>
                    <div className="text-xs text-gray-700 flex gap-4 mt-1 font-medium">
                      <span>{job.stats.inReview} In-Review</span>
                      <span>{job.stats.inProgress} In-Progress</span>
                      <span>{job.stats.hired} Hired</span>
                      <span>{job.stats.total} Total</span>
                    </div>
                    <div className="text-[11px] text-gray-400 flex gap-4 mt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> Created {timeSince(job.createdAt)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> Updated {timeSince(job.updatedAt)}</span>
                    </div>
                  </div>
                  <div>
                    <button onClick={()=> setOpenJobMenu(openJobMenu === job.id ? null : job.id)} className="p-2 rounded hover:bg-gray-100">
                      <MoreHorizontal className="w-5 h-5 text-gray-500" />
                    </button>
                    {openJobMenu === job.id && (
                      <div className="absolute right-2 top-10 bg-white shadow-lg border rounded-md w-44 text-sm z-20 overflow-hidden">
                        <button onClick={()=>{navigate(`/jobs/${job.id}/edit`); setOpenJobMenu(null);}} className="w-full text-left px-3 py-2 hover:bg-gray-50">Edit job details</button>
                        <button onClick={()=>{toast.info('Feature coming soon');}} className="w-full text-left px-3 py-2 hover:bg-gray-50">Advertise job</button>
                        <button onClick={()=>{pinJob(job); setOpenJobMenu(null);}} className="w-full text-left px-3 py-2 hover:bg-gray-50">{pinSet.has(job.id)?'Unpin job':'Pin this job'}</button>
                        <button onClick={()=>{navigate(`/jobs/${job.id}`);}} className="w-full text-left px-3 py-2 hover:bg-gray-50">View on jobs page</button>
                        {job.status !== 'ARCHIVED' && <button onClick={()=>{archiveJob(job); setOpenJobMenu(null);}} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-red-600">Archive</button>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {ordered.length === 0 && <div className="text-sm text-gray-500">No jobs match filters.</div>}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2 text-sm">
                <span>Rows per page:</span>
                <select value={limit} onChange={e=>{ setPage(1); setLimit(parseInt(e.target.value) || 10); }} className="border rounded px-2 py-1">
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <button disabled={page<=1} onClick={()=> setPage(p=>Math.max(1,p-1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                <span>Page {page} of {totalPages}</span>
                <button disabled={page>=totalPages} onClick={()=> setPage(p=>Math.min(totalPages,p+1))} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default JobsPage;