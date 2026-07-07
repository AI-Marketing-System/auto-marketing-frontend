import React from 'react';
import AdminHomeHeader from '../components/AdminHomeHeader';
import AdminHomeStats from '../components/AdminHomeStats';
import AdminHomeModules from '../components/AdminHomeModules';
import '../styles/AdminHomePage.css';

function AdminHomePage() {
  return (
      <div className="admin-home-page">
        <AdminHomeHeader />

        <main className="admin-home-main">
          <section className="admin-home-hero">
            <h1 className="admin-home-hero__title">Tổng quan hệ thống</h1>
            <p className="admin-home-hero__subtitle">
              Chào mừng trở lại! Dưới đây là tóm tắt tình hình vận hành hôm nay.
            </p>
          </section>

          <AdminHomeStats />
          <AdminHomeModules />
        </main>
      </div>
  );
}

export default AdminHomePage;