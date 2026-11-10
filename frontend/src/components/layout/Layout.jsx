import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileMenu from './MobileMenu';
import ScrollToTop from '../ui/ScrollToTop';
import Newsletter from '../common/Newsletter';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <MobileMenu />
      <main className="flex-grow">
        <ScrollToTop />
        <Outlet />
      </main>
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Layout;
