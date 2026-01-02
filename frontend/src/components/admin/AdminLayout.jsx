import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Navbar from '../Shared/Navbar';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Mobile Navbar (or top navbar if needed globally) */}
      <div className="lg:hidden">
        <Navbar />
      </div>

      <div className="flex flex-1">
        {/* Sidebar - Desktop Only */}
        <AdminSidebar />

        {/* Main Content Area */}
        <main className="flex-1 w-full overflow-x-hidden">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto animation-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
