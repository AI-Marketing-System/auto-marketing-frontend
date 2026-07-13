import React, { useState, useEffect } from 'react';
import '../styles/SchedulePage.css';

import ScheduleTopBar   from '../components/ScheduleTopBar';
import ScheduleFilters  from '../components/ScheduleFilters';
import WeekNavigation   from '../components/WeekNavigation';
import CalendarGrid     from '../components/CalendarGrid';
import NewPostModal     from '../components/NewPostModal';
import CreatePostModal  from '../../post/components/CreatePostModal';

import {
  getWeekDays,
  getCurrentTimePercent,
  generateMockPosts,
} from '../utils/scheduleHelpers';

/**
 * Trang Lịch đăng bài (Schedule).
 *
 * Chịu trách nhiệm:
 * - Quản lý state toàn cục của trang (tuần hiện tại, bộ lọc, modal, thời gian)
 * - Gọi helpers để sinh dữ liệu / tính toán ngày
 * - Truyền props xuống các component con
 */
export default function SchedulePage() {
  // ── State tuần & dữ liệu ──
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDays, setWeekDays]       = useState([]);
  const [posts, setPosts]             = useState([]);

  // ── State bộ lọc ──
  const [campaignFilter, setCampaignFilter] = useState('Tất cả chiến dịch');
  const [topicFilter, setTopicFilter]       = useState('Tất cả chủ đề');
  const [statusFilter, setStatusFilter]     = useState('Tất cả trạng thái');

  // ── State modal ──
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  // ── State thời gian thực ──
  const [currentTimePercent, setCurrentTimePercent] = useState(getCurrentTimePercent());

  // Tính lại weekDays + mock posts mỗi khi tuần thay đổi
  useEffect(() => {
    const days = getWeekDays(currentDate);
    setWeekDays(days);
    setPosts(generateMockPosts(days));
  }, [currentDate]);

  // Cập nhật đường thời gian hiện tại mỗi phút
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimePercent(getCurrentTimePercent());
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  // ── Handlers điều hướng tuần ──
  const goToPrevWeek = () =>
    setCurrentDate((d) => { const nd = new Date(d); nd.setDate(nd.getDate() - 7); return nd; });

  const goToNextWeek = () =>
    setCurrentDate((d) => { const nd = new Date(d); nd.setDate(nd.getDate() + 7); return nd; });

  const goToToday = () => setCurrentDate(new Date());

  // ── Handler tạo bài mới ──
  const handleNewPostSubmit = (data) => {
    console.log('Bài viết mới:', data);
    // TODO: gọi API tạo bài đăng
  };

  return (
    <div className="sc-page">
      {/* 1. Thanh trên cùng */}
      <ScheduleTopBar
        workspaceName="Client - Coffee House Brand"
        onNewPost={() => setShowNewPostModal(true)}
        onPublish={() => {}}
      />

      {/* 2. Bộ lọc */}
      <ScheduleFilters
        campaignFilter={campaignFilter}
        topicFilter={topicFilter}
        statusFilter={statusFilter}
        onCampaignChange={setCampaignFilter}
        onTopicChange={setTopicFilter}
        onStatusChange={setStatusFilter}
      />

      {/* 3. Điều hướng tuần */}
      <WeekNavigation
        weekDays={weekDays}
        onPrevWeek={goToPrevWeek}
        onNextWeek={goToNextWeek}
        onToday={goToToday}
      />

      {/* 4. Lưới lịch */}
      <CalendarGrid
        weekDays={weekDays}
        posts={posts}
        currentTimePercent={currentTimePercent}
      />

      {/* 5. Modal tạo bài mới (mới – component hoá) */}
      <CreatePostModal
        isOpen={showNewPostModal}
        onClose={() => setShowNewPostModal(false)}
        onSubmit={handleNewPostSubmit}
        onDraft={(data) => console.log('Lưu nháp:', data)}
      />

      {/* Legacy modal (giữ lại để tham khảo, không render) */}
      {false && (
        <NewPostModal
          isOpen={showNewPostModal}
          onClose={() => setShowNewPostModal(false)}
          onSubmit={handleNewPostSubmit}
        />
      )}
    </div>
  );
}
