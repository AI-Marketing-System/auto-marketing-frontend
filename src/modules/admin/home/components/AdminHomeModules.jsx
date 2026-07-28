import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminHomeModules.css';

const adminModules = [
    {
        title: 'Quản lý Users',
        description: 'Kiểm soát tài khoản, phân quyền và trạng thái hoạt động.',
        href: '/admin/users',
        icon: (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        ),
        colorClass: 'is-blue'
    },
    {
        title: 'Quản lý Plans',
        description: 'Cấu hình giá, tính năng và giới hạn của các gói dịch vụ.',
        href: '/admin/plans',
        icon: (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
        ),
        colorClass: 'is-purple'
    },
    {
        title: 'Giao dịch & Thanh toán',
        description: 'Đối soát doanh thu, lịch sử nâng cấp và hoàn tiền.',
        href: '/admin/transactions',
        icon: (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
        ),
        colorClass: 'is-green'
    },
    {
        title: 'System Dashboard',
        description: 'Giám sát tài nguyên máy chủ, log lỗi và hiệu suất.',
        href: '/admin/dashboard',
        icon: (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
        ),
        colorClass: 'is-orange'
    },
];

function AdminHomeModules() {
    return (
        <section className="admin-home-modules">
            <h2 className="admin-home-section-title">Quản trị phân hệ</h2>
            <div className="admin-home-modules-grid">
                {adminModules.map((item) => (
                    <Link key={item.title} className="admin-home-module-card" to={item.href}>
                        <div className={`admin-home-module-card__icon ${item.colorClass}`}>
                            {item.icon}
                        </div>
                        <div className="admin-home-module-card__content">
                            <h3 className="admin-home-module-card__title">{item.title}</h3>
                            <p className="admin-home-module-card__desc">{item.description}</p>
                        </div>
                        <div className="admin-home-module-card__arrow">
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

export default AdminHomeModules;