import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import ScrollToTop from '../ui/ScrollToTop';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col lg:ml-0">
          {/* Header */}
          <AdminHeader />
          
          {/* Content */}
          <main className="flex-grow p-4 sm:p-6 lg:p-8">
            <ScrollToTop />
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
