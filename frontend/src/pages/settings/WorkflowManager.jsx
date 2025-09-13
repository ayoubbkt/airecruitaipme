import React, { useEffect, useMemo, useState } from 'react';
import { workflowService } from '../../services/api';
import axios from '../../utils/axios';
import {
  Plus,
  Edit3,
  X,
  ChevronUp,
  ChevronDown,
  Clock,
  Tag,
  User,
  Users,
  Phone,
  FileCheck,
  Gift,
  Archive,
  UserX,
} from 'lucide-react';

const STAGE_TYPES = [
  { value: 'Applied', label: 'Applied', icon: User },
  { value: 'Review', label: 'Review', icon: FileCheck },
  { value: 'Interview', label: 'Interview', icon: Users },
  { value: 'Background Check', label: 'Background Check', icon: FileCheck },
  { value: 'Phone Screen', label: 'Phone Screen', icon: Phone },
  { value: 'Offer', label: 'Offer', icon: Gift },
  { value: 'Other', label: 'Other', icon: Tag },
];

const DUE_DATE_OPTIONS = [
  { value: '1', label: '1 day' },
  { value: '2', label: '2 days' },
  { value: '3', label: '3 days' },
  { value: '7', label: '7 days' },
  { value: '14', label: '14 days' },
  { value: '30', label: '30 days' },
];

const DEFAULT_STAGES = [
  { id: 1, name: 'Leads', type: 'Lead', dueDate: null, icon: User, canEdit: false, canDelete: false },
  { id: 2, name: 'Applicants', type: 'Applied', dueDate: 3, icon: User, canEdit: true, canDelete: false },
  { id: 3, name: 'Short List', type: 'Review', dueDate: 2, icon: Users, canEdit: true, canDelete: true },
  { id: 4, name: 'Screening Call', type: 'Interview', dueDate: 14, icon: Phone, canEdit: true, canDelete: true },
  { id: 5, name: 'Initial Interview', type: 'Interview', dueDate: 14, icon: Users, canEdit: true, canDelete: true },
  { id: 6, name: 'Review', type: 'Review', dueDate: 14, icon: FileCheck, canEdit: true, canDelete: true },
  { id: 7, name: 'Offer', type: 'Offer', dueDate: 14, icon: Gift, canEdit: true, canDelete: true },
  { id: 8, name: 'Disqualified', type: 'Other', dueDate: null, icon: UserX, canEdit: false, canDelete: false },
  { id: 9, name: 'Archived', type: 'Other', dueDate: null, icon: Archive, canEdit: false, canDelete: false },
];

const WORKFLOWS = [
  {
    id: 1,
    name: 'Default Workflow',
    stages: 10,
    addedDate: 'Mar 15, 2025',
    isDefault: true,
    stagesList: DEFAULT_STAGES,
  },
  {
    id: 2,
    name: 'New Workflow 2',
    stages: 11,
    addedDate: 'Mar 15, 2025',
    isDefault: false,
    stagesList: DEFAULT_STAGES,
  },
  {
    id: 3,
    name: 'New Workflow 3',
    stages: 11,
    addedDate: 'Mar 15, 2025',
    isDefault: false,
    stagesList: DEFAULT_STAGES,
  },
];

const Pill = ({ children }) => (
  <span className="inline-flex items-center text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">{children}</span>
);

const WorkflowManager = () => {
  const [companyId, setCompanyId] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [workflowName, setWorkflowName] = useState('');
  const [stages, setStages] = useState([]);
  const [showAddStage, setShowAddStage] = useState(null); // index after which to add
  const [showStageTypeDropdown, setShowStageTypeDropdown] = useState(false);
  const [editingStage, setEditingStage] = useState(null);

  const [newStage, setNewStage] = useState({
    name: '',
    type: '',
    dueDate: '3',
    visibility: 'all',
  });

  // Map UI label to backend enum StageType
  const mapStageTypeToEnum = (label) => {
    const map = {
      'Applied': 'APPLIED',
      'Review': 'REVIEW',
      'Interview': 'INTERVIEW',
      'Background Check': 'BACKGROUND_CHECK',
      'Phone Screen': 'INTERVIEW',
      'Offer': 'OFFER',
      'Other': 'OTHER',
      'Leads': 'LEADS',
      'Lead': 'LEADS',
    };
    return map[label] || label?.toUpperCase().replace(/\s+/g, '_');
  };

  const getStageIcon = (type) => {
    const st = STAGE_TYPES.find((s) => s.value === type);
    return st ? st.icon : Tag;
  };

  // Load company and workflows
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      const resp = await axios.get('/companies/my-companies');
      const companies = resp.data?.data || [];
      if (!companies.length) return;
      const cid = companies[0].id;
      setCompanyId(cid);
      // Ensure default exists then load all
      await workflowService.ensureDefaultWorkflow(cid).catch(() => {});
      const templates = await workflowService.getWorkflows(cid);
      setWorkflows(templates);
      if (templates.length) {
        setSelectedWorkflow(templates[0]);
        setWorkflowName(templates[0].name);
        const st = await workflowService.getWorkflowStages(cid, templates[0].id);
        setStages(st);
      }
    };
    init();
  }, []);

  const handleAddStage = (afterIndex) => {
    setShowAddStage(afterIndex);
    setNewStage({ name: '', type: '', dueDate: '3', visibility: 'all' });
    setShowStageTypeDropdown(false);
  };

  const handleSaveStage = async () => {
    if (!newStage.name || !newStage.type || !companyId || !selectedWorkflow) return;
    // Compute insert position: after index
    const insertIndex = showAddStage !== null && showAddStage >= 0 ? showAddStage + 1 : stages.length;
    try {
      await workflowService.createWorkflowStage(companyId, selectedWorkflow.id, {
        name: newStage.name,
        type: mapStageTypeToEnum(newStage.type),
        order: insertIndex,
        settings: { dueDays: parseInt(newStage.dueDate, 10) }
      });
      const st = await workflowService.getWorkflowStages(companyId, selectedWorkflow.id);
      setStages(st);
      setShowAddStage(null);
      setNewStage({ name: '', type: '', dueDate: '3', visibility: 'all' });
    } catch (e) {
      alert(e?.message || e?.data?.message || 'Failed to add stage');
    }
  };

  const handleDeleteStage = async (stageId) => {
    if (!window.confirm('Are you sure you want to delete this stage?')) return;
    try {
      if (companyId && selectedWorkflow) {
        await workflowService.deleteWorkflowStage(companyId, selectedWorkflow.id, stageId);
        const st = await workflowService.getWorkflowStages(companyId, selectedWorkflow.id);
        setStages(st);
      } else {
        setStages((prev) => prev.filter((s) => s.id !== stageId));
      }
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || 'Failed to delete stage');
    }
  };

  const handleMoveStage = async (stageId, direction) => {
    const idx = stages.findIndex((s) => s.id === stageId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === stages.length - 1) return;
    const next = [...stages];
    const [item] = next.splice(idx, 1);
    const newIndex = direction === 'up' ? idx - 1 : idx + 1;
    next.splice(newIndex, 0, item);
    // Persist new order
    const orderedIds = next.map((s) => s.id);
    if (companyId && selectedWorkflow) {
      try {
        await workflowService.reorderWorkflowStages(companyId, selectedWorkflow.id, orderedIds);
        const st = await workflowService.getWorkflowStages(companyId, selectedWorkflow.id);
        setStages(st);
      } catch (e) {
        alert(e?.message || e?.data?.message || 'Failed to reorder stages');
      }
    } else {
      setStages(next);
    }
  };

  const StageCard = ({ stage, index }) => {
    const Icon = stage.icon || Tag;
    const isAddingAfter = showAddStage === index;
    const isFirst = index === 0;
    const isLast = index === stages.length - 1;

    const content = (
      <div className="bg-white border-2 border-blue-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Icon className="w-6 h-6 text-blue-500" />
          <div>
            <div className="font-semibold text-gray-900 text-base">{stage.name}</div>
            <div className="flex items-center space-x-6 text-sm text-gray-500 mt-1">
              {stage.dueDate ? (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Due Date</span>
                  <span className="ml-1">{stage.dueDate} days</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Due Date</span>
                  <span className="ml-1">—</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Tag className="w-4 h-4" />
                <span>Type</span>
                <span className="ml-1">{stage.type}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setEditingStage(stage.id)}
            className="p-2 text-gray-400 hover:text-blue-600"
            title="Edit stage"
          >
            <Edit3 className="w-5 h-5" />
          </button>
          {(stage.canBeDeleted !== false) && (
            <button
              onClick={() => handleDeleteStage(stage.id)}
              className="p-2 text-gray-400 hover:text-red-600"
              title="Delete stage"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );

    return (
      <div className="relative group">
        {/* Move controls on the left */}
        <div className="absolute -left-8 top-6 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => handleMoveStage(stage.id, 'up')}
            className="bg-white border border-gray-300 rounded-full p-1 text-gray-400 hover:text-blue-600 hover:border-blue-400 disabled:opacity-30"
            disabled={isFirst}
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleMoveStage(stage.id, 'down')}
            className="bg-white border border-gray-300 rounded-full p-1 text-gray-400 hover:text-blue-600 hover:border-blue-400 disabled:opacity-30"
            disabled={isLast}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Stage content */}
        {editingStage === stage.id ? (
          <EditStageInline
            stage={stage}
            onCancel={() => setEditingStage(null)}
    onSave={async (updates) => {
              try {
                if (companyId && selectedWorkflow) {
      const payload = { ...updates };
      if (payload.type) payload.type = mapStageTypeToEnum(payload.type);
      await workflowService.updateWorkflowStage(companyId, selectedWorkflow.id, stage.id, payload);
                  const st = await workflowService.getWorkflowStages(companyId, selectedWorkflow.id);
                  setStages(st);
                } else {
                  setStages((prev) => prev.map((s) => (s.id === stage.id ? { ...s, ...updates } : s)));
                }
              } catch (e) {
                alert(e?.response?.data?.message || e?.message || 'Failed to update stage');
              } finally {
                setEditingStage(null);
              }
            }}
          />
        ) : (
          content
        )}

        {/* Between + button */}
        <div className="flex justify-center my-3">
          <button
            onClick={() => handleAddStage(index)}
            className="p-2 bg-white border-2 border-blue-200 rounded-full text-blue-400 hover:text-blue-600 hover:border-blue-400 transition-colors shadow"
            title="Add stage here"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Add form at this position */}
        {showAddStage === index && (
          <div className="mb-6">
            <AddStageForm
              newStage={newStage}
              setNewStage={setNewStage}
              showStageTypeDropdown={showStageTypeDropdown}
              setShowStageTypeDropdown={setShowStageTypeDropdown}
              onCancel={() => setShowAddStage(null)}
              onSave={handleSaveStage}
            />
          </div>
        )}
      </div>
    );
  };

  const EditStageInline = ({ stage, onCancel, onSave }) => {
    const [name, setName] = useState(stage.name);
    const [type, setType] = useState(stage.type || '');
    const [due, setDue] = useState(stage.dueDate ? String(stage.dueDate) : '3');
    const [open, setOpen] = useState(false);

    return (
      <div className="bg-white border-2 border-blue-100 rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Stage Name <Pill>Required</Pill>
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Stage name"
            />

            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stage Type <Pill>Required</Pill>
              </label>
              <p className="text-sm text-gray-500 mb-2">The primary focus of this stage.</p>
              <div className="relative">
                <button
                  onClick={() => setOpen((v) => !v)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none flex items-center justify-between"
                >
                  <span className={type ? 'text-gray-900' : 'text-gray-500'}>
                    {type || 'Choose stage type'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {open && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
                    {STAGE_TYPES.map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.value}
                          onClick={() => {
                            setType(t.value);
                            setOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left hover:bg-gray-700 flex items-center space-x-2 text-white ${
                            type === t.value ? 'bg-gray-700' : ''
                          }`}
                        >
                          <Icon className="w-4 h-4 text-white" />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Due date</label>
              <p className="text-sm text-gray-500 mb-2">
                The maximum time a candidate should be in this stage before raising alarms.
              </p>
              <select
                value={due}
                onChange={(e) => setDue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {DUE_DATE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Stage Visibility</label>
            <div className="flex items-center space-x-2 mt-2">
              <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
              <span className="text-sm text-gray-700 font-medium">Visible to all job members</span>
            </div>
          </div>
        </div>
        <div className="flex justify-start space-x-3 mt-8">
          <button
            onClick={() => onSave({ name, type, dueDate: parseInt(due, 10) })}
            disabled={!name || !type}
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2 text-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Save</span>
          </button>
          <button onClick={onCancel} className="px-6 py-2 text-gray-700 hover:text-gray-900 text-lg">
            × Cancel
          </button>
        </div>
      </div>
    );
  };

  const AddStageForm = ({
    newStage,
    setNewStage,
    showStageTypeDropdown,
    setShowStageTypeDropdown,
    onSave,
    onCancel,
  }) => {
    return (
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Stage Name <Pill>Required</Pill>
            </label>
            <input
              type="text"
              value={newStage.name || ''}
              onChange={(e) => setNewStage((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Stage name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />

            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stage Type <Pill>Required</Pill>
              </label>
              <p className="text-sm text-gray-500 mb-2">The primary focus of this stage.</p>
              <div className="relative">
                <button
                  onClick={() => setShowStageTypeDropdown(!showStageTypeDropdown)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none flex items-center justify-between"
                >
                  <span className={newStage.type ? 'text-gray-900' : 'text-gray-500'}>
                    {newStage.type || 'Choose stage type'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {showStageTypeDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
                    {STAGE_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => {
                            setNewStage((prev) => ({ ...prev, type: type.value }));
                            setShowStageTypeDropdown(false);
                          }}
                          className={`w-full px-3 py-2 text-left hover:bg-gray-700 flex items-center space-x-2 text-white ${
                            newStage.type === type.value ? 'bg-gray-700' : ''
                          }`}
                        >
                          <Icon className="w-4 h-4 text-white" />
                          <span>{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Due date</label>
              <p className="text-sm text-gray-500 mb-2">
                The maximum time a candidate should be in this stage before raising alarms.
              </p>
              <select
                value={newStage.dueDate}
                onChange={(e) => setNewStage({ ...newStage, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {DUE_DATE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Stage Visibility</label>
            <div className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                id="visible-all"
                name="visibility"
                checked={newStage.visibility === 'all'}
                onChange={() => setNewStage({ ...newStage, visibility: 'all' })}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <label htmlFor="visible-all" className="text-sm text-gray-700 font-medium">
                Visible to all job members
              </label>
            </div>
          </div>
        </div>
        <div className="flex justify-start space-x-3 mt-8">
          <button
            onClick={onSave}
            disabled={!newStage.name || !newStage.type}
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2 text-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Stage</span>
          </button>
          <button onClick={onCancel} className="px-6 py-2 text-gray-700 hover:text-gray-900 text-lg">
            × Cancel
          </button>
        </div>
      </div>
    );
  };

  const WorkflowListItem = ({ wf, active, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-lg border ${
        active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'
      }`}
    >
      <div className="font-medium">{wf.name}</div>
      <div className={`text-sm mt-1 flex items-center space-x-3 ${active ? 'text-blue-100' : 'text-gray-500'}`}>
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4" />
          <span>{Array.isArray(wf.stages) ? wf.stages.length : (wf._count?.stages ?? 0)} Stages</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4" />
          <span>Added {wf.addedDate}</span>
        </div>
      </div>
    </button>
  );

  return (
    <div className="p-6">
      <div className="text-2xl font-semibold text-gray-900 mb-4">Recruiting Preferences</div>
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-3">
          <div className="bg-white border border-gray-200 rounded-xl p-3">
            <div className="px-2 py-2 text-gray-900 font-semibold">Templates & Workflows</div>
            <div className="px-2">
              <div className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-700">Workflows</div>
                  <button
                    className="p-2 rounded-md border border-gray-200 hover:bg-gray-50"
                    title="New workflow"
                    onClick={async () => {
                      if (!companyId) return;
                      try {
                        // Auto-generate a base name like "New Workflow"; backend will ensure uniqueness
                        const created = await workflowService.createWorkflow(companyId, { name: 'New Workflow' });
                        const list = await workflowService.getWorkflows(companyId);
                        setWorkflows(list);
                        setSelectedWorkflow(created);
                        setWorkflowName(created.name);
                        const st = await workflowService.getWorkflowStages(companyId, created.id);
                        setStages(st);
                        setShowAddStage(null);
                      } catch (e) {
                        alert(e?.response?.data?.message || e?.message || 'Failed to create workflow');
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="space-y-2">
                  {workflows.map((wf) => (
                    <WorkflowListItem
                      key={wf.id}
                      wf={wf}
                      active={selectedWorkflow && wf.id === selectedWorkflow.id}
                      onClick={async () => {
                        setSelectedWorkflow(wf);
                        setWorkflowName(wf.name);
                        const st = await workflowService.getWorkflowStages(companyId, wf.id);
                        setStages(st);
                        setShowAddStage(null);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="col-span-9">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="text-xl font-semibold text-gray-900 mb-6">{selectedWorkflow?.name || 'Workflow'}</div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Workflow name <Pill>Required</Pill>
              </label>
              <input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                onBlur={async () => {
                  if (!companyId || !selectedWorkflow) return;
                  if (!workflowName || workflowName === selectedWorkflow.name) return;
                  const updated = await workflowService.updateWorkflow(companyId, selectedWorkflow.id, { name: workflowName });
                  // Refresh list
                  const templates = await workflowService.getWorkflows(companyId);
                  setWorkflows(templates);
                  const st = await workflowService.getWorkflowStages(companyId, selectedWorkflow.id);
                  setStages(st);
                  setSelectedWorkflow(updated);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="space-y-0">
              {stages.map((stage, index) => (
                <div key={stage.id} className="mb-6">
                  <StageCard stage={stage} index={index} />
                </div>
              ))}

              {/* Trailing + and optional form at end */}
              <div className="flex justify-center my-3">
                <button
                  onClick={() => handleAddStage(stages.length - 1)}
                  className="p-2 bg-white border-2 border-blue-200 rounded-full text-blue-400 hover:text-blue-600 hover:border-blue-400 transition-colors shadow"
                  title="Add stage at end"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {showAddStage === stages.length - 1 && (
                <div className="mb-6">
                  <AddStageForm
                    newStage={newStage}
                    setNewStage={setNewStage}
                    showStageTypeDropdown={showStageTypeDropdown}
                    setShowStageTypeDropdown={setShowStageTypeDropdown}
                    onCancel={() => setShowAddStage(null)}
                    onSave={handleSaveStage}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowManager;
