import React, { useState } from 'react';
import CandidateManagement from './CandidateManagement';
import CandidatePipelineView from './CandidatePipelineView';
import CandidateKanbanView from './CandidateKanbanView';
import { List, KanbanSquare, Columns3 } from 'lucide-react';

const CandidatesPage = () => {
  const [view, setView] = useState('list'); // 'list', 'pipeline', 'kanban'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex justify-end items-center max-w-7xl mx-auto px-6 py-4">
        <button
          onClick={() => setView('list')}
          className={`p-2 rounded-lg mr-2 ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border'}`}
          title="Vue Liste"
        >
          <List className="w-5 h-5" />
        </button>
        <button
          onClick={() => setView('pipeline')}
          className={`p-2 rounded-lg mr-2 ${view === 'pipeline' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border'}`}
          title="Vue Pipeline"
        >
          <Columns3 className="w-5 h-5" />
        </button>
        <button
          onClick={() => setView('kanban')}
          className={`p-2 rounded-lg ${view === 'kanban' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border'}`}
          title="Vue Kanban"
        >
          <KanbanSquare className="w-5 h-5" />
        </button>
      </div>
      {view === 'list' && <CandidateManagement />}
      {view === 'pipeline' && <CandidatePipelineView />}
      {view === 'kanban' && <CandidateKanbanView />}
    </div>
  );
};

export default CandidatesPage;