import React, { useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';

export default function AppLayout() {
  const { id: activeProjectId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#030014] text-slate-100 flex">
      {/* Developer Sidebar */}
      <Sidebar activeProjectId={activeProjectId} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <TopBar onSearch={setSearchQuery} />
        <main className="flex-1 p-6">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>
    </div>
  );
}
