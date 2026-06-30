import React, { useState } from "react";
import "../styles/CampaignListPage.css";
import Brand from "../../../public-site/components/Brand";
import CampaignCard from "../components/CampaignCard";
import CreateCampaignModal from "../components/CreateCampaignModal";

function CampaignListPage() {
    const [activeTab, setActiveTab] = useState("campaigns"); // "campaigns" or "schedule"
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("Tất cả");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [campaigns, setCampaigns] = useState([
        {
            id: 1,
            initials: "KT",
            initialsBg: "#f3e8ff",
            initialsColor: "#7c3aed",
            status: "Đang chạy",
            title: "Khai trương cửa hàng mới",
            dateRange: "12/06 - 30/06",
            topicsCount: 4,
            postsCount: 18
        },
        {
            id: 2,
            initials: "MS",
            initialsBg: "#ffedd5",
            initialsColor: "#ea580c",
            status: "Tạm dừng",
            title: "Mid-year sale",
            dateRange: "01/06 - 15/06",
            topicsCount: 2,
            postsCount: 9
        },
        {
            id: 3,
            initials: "TT",
            initialsBg: "#dcfce7",
            initialsColor: "#15803d",
            status: "Hoàn thành",
            title: "Tết Nguyên Đán 2026",
            dateRange: "20/01 - 10/02",
            topicsCount: 6,
            postsCount: 31
        }
    ]);

    const handleCreateCampaign = () => {
        setIsModalOpen(true);
    };

    const handleModalSubmit = (data) => {
        console.log("Creating campaign with data:", data);

        // Generate initials
        const words = data.title.trim().split(" ");
        let initials = "";
        if (words.length >= 2) {
            initials = (words[0][0] + words[1][0]).toUpperCase();
        } else if (words.length === 1) {
            initials = words[0].substring(0, 2).toUpperCase();
        } else {
            initials = "CD";
        }

        // Cycle colors
        const colorSchemes = [
            { bg: "#f3e8ff", color: "#7c3aed" },
            { bg: "#ffedd5", color: "#ea580c" },
            { bg: "#dcfce7", color: "#15803d" },
            { bg: "#e0f2fe", color: "#0369a1" }
        ];
        const scheme = colorSchemes[campaigns.length % colorSchemes.length];

        const newCampaign = {
            id: Date.now(),
            initials,
            initialsBg: scheme.bg,
            initialsColor: scheme.color,
            status: data.status,
            title: data.title,
            dateRange: data.dateRange,
            topicsCount: 0,
            postsCount: 0
        };

        setCampaigns([newCampaign, ...campaigns]);
        setIsModalOpen(false);
    };

    // Filter campaigns based on search query and status dropdown
    const filteredCampaigns = campaigns.filter((camp) => {
        const matchesSearch = camp.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "Tất cả" || camp.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="campaign-page-container">
            {/* Navigation Header */}
            <header className="campaign-header-bar">
                <div className="header-left">
                    <Brand className="campaign-brand" textClassName="brand-name" />
                </div>
                
                {/* Center Tab Selector */}
                <div className="header-center-tabs">
                    <button 
                        type="button" 
                        className={`tab-link-btn ${activeTab === "campaigns" ? "active" : ""}`}
                        onClick={() => setActiveTab("campaigns")}
                    >
                        Chiến dịch
                    </button>
                    <button 
                        type="button" 
                        className={`tab-link-btn ${activeTab === "schedule" ? "active" : ""}`}
                        onClick={() => setActiveTab("schedule")}
                    >
                        Lịch đăng
                    </button>
                </div>

                <div className="header-right">
                    <button type="button" className="help-link-btn">
                        <svg className="help-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
                        </svg>
                        <span className="help-text">Trợ giúp</span>
                    </button>
                    <div className="user-avatar-initials">
                        NK
                    </div>
                </div>
            </header>

            {/* Campaign Main Body */}
            <main className="campaign-main-content">
                
                {/* Workspace Selector Bar */}
                <div className="workspace-selector-card">
                    <div className="workspace-selector-dropdown">
                        <span className="selected-workspace-name">Client - Coffee House Brand</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>

                    {/* Connected Social Accounts */}
                    <div className="connected-accounts-section">
                        <div className="connected-avatar-wrapper">
                            <div className="avatar-img-circle bg-blue">
                                <span className="avatar-initial">CH</span>
                            </div>
                            <div className="social-badge facebook-badge">
                                <span>f</span>
                            </div>
                        </div>

                        <div className="connected-avatar-wrapper">
                            <div className="avatar-img-circle bg-orange">
                                <span className="avatar-initial">PL</span>
                            </div>
                            <div className="social-badge facebook-badge">
                                <span>f</span>
                            </div>
                        </div>

                        {/* Add Account Button */}
                        <button type="button" className="add-account-circle-btn" onClick={() => alert("Kết nối tài khoản mạng xã hội mới")}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Workspace Title & Create Campaign Button */}
                <div className="workspace-title-section">
                    <div className="title-left">
                        <span className="workspace-label">Workspace</span>
                        <h1 className="workspace-title-main">Client – Coffee House Brand</h1>
                        <h2 className="section-subtitle">Chiến dịch</h2>
                    </div>
                    <div className="title-right">
                        <button type="button" className="btn-create-campaign" onClick={handleCreateCampaign}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Tạo chiến dịch
                        </button>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="filter-search-container">
                    <div className="search-input-wrapper">
                        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input 
                            type="text" 
                            className="search-campaign-input" 
                            placeholder="Tìm chiến dịch..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="status-filter-wrapper">
                        <select 
                            className="status-filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="Tất cả">Tất cả trạng thái</option>
                            <option value="Đang chạy">Đang chạy</option>
                            <option value="Tạm dừng">Tạm dừng</option>
                            <option value="Hoàn thành">Hoàn thành</option>
                        </select>
                    </div>
                </div>

                {/* Campaigns Grid */}
                {filteredCampaigns.length > 0 ? (
                    <div className="campaigns-cards-grid">
                        {filteredCampaigns.map((camp) => (
                            <CampaignCard
                                key={camp.id}
                                initials={camp.initials}
                                initialsBg={camp.initialsBg}
                                initialsColor={camp.initialsColor} // passed in style internally
                                status={camp.status}
                                title={camp.title}
                                dateRange={camp.dateRange}
                                topicsCount={camp.topicsCount}
                                postsCount={camp.postsCount}
                                onClick={() => alert(`Truy cập chiến dịch: ${camp.title}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="empty-campaigns-state">
                        <p className="empty-text">Không tìm thấy chiến dịch nào phù hợp.</p>
                    </div>
                )}

            </main>

            <CreateCampaignModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
            />
        </div>
    );
}

export default CampaignListPage;
