import React, { useState, useEffect } from 'react';
import '../styles/SchedulePage.css';

import ScheduleTopBar   from '../components/ScheduleTopBar';
import ScheduleFilters  from '../components/ScheduleFilters';
import WeekNavigation   from '../components/WeekNavigation';
import CalendarGrid     from '../components/CalendarGrid';
import CreatePostModal  from '../../post/components/CreatePostModal';

import {
  getWeekDays,
  getCurrentTimePercent,
  isSameDay,
} from '../utils/scheduleHelpers';

import { scheduleApi } from '../api/scheduleApi';
import { API_BASE_URL } from '../../../config/env';

/**
 * Maps the API schedules data list to the calendar posts structure
 */
function mapSchedulesToCalendarPosts(schedules, weekDays) {
  const platforms = ['Facebook', 'Instagram', 'TikTok'];
  const colors = ['#7c3aed', '#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

  return schedules.map((sch) => {
    const publishDate = new Date(sch.publishTime);
    const hour = publishDate.getHours();
    const minute = publishDate.getMinutes();

    // Find which day in weekDays matches publishDate
    let dayIdx = -1;
    for (let i = 0; i < weekDays.length; i++) {
      if (isSameDay(weekDays[i], publishDate)) {
        dayIdx = i;
        break;
      }
    }

    // Determine color based on scheduleId
    const color = colors[sch.scheduleId % colors.length];

    // Determine platform (we default to Facebook as per current structure of fanpages)
    let platform = 'Facebook';
    if (sch.targets && sch.targets.length > 0) {
      // Future mapping logic from targets...
    }

    return {
      id: sch.scheduleId,
      dayIdx, // will be -1 if it's not in the current visible week
      hour,
      minute,
      title: sch.postTitle || 'Bài viết không có tiêu đề',
      platform: platform,
      color,
      image: null,
      publishTime: sch.publishTime,
      status: sch.status,
    };
  }).filter((p) => p.dayIdx !== -1);
}

/**
 * Trang Lịch đăng bài (Schedule).
 *
 * Chịu trách nhiệm:
 * - Quản lý state toàn cục của trang (tuần hiện tại, bộ lọc, modal, thời gian)
 * - Gọi helpers để sinh dữ liệu / tính toán ngày
 * - Truyền props xuống các component con
 */
export default function SchedulePage({ workspaceId, workspaces = [], campaigns = [] }) {
  // ── State tuần & dữ liệu ──
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDays, setWeekDays]       = useState([]);
  const [posts, setPosts]             = useState([]);
  const [schedules, setSchedules]     = useState([]);

  // ── State bộ lọc ──
  const [campaignFilter, setCampaignFilter] = useState('Tất cả chiến dịch');
  const [topicFilter, setTopicFilter]       = useState('Tất cả chủ đề');
  const [statusFilter, setStatusFilter]     = useState('Tất cả trạng thái');

  // ── State modal ──
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  // ── State thời gian thực ──
  const [currentTimePercent, setCurrentTimePercent] = useState(getCurrentTimePercent());

  const selectedWorkspace = workspaces.find((ws) => ws.id === workspaceId);
  const workspaceName = selectedWorkspace ? selectedWorkspace.name : 'Chọn Workspace';

  // Tính lại weekDays mỗi khi tuần thay đổi
  useEffect(() => {
    const days = getWeekDays(currentDate);
    setWeekDays(days);
  }, [currentDate]);

  // Cập nhật đường thời gian hiện tại mỗi phút
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimePercent(getCurrentTimePercent());
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  // Fetch schedules from backend when workspaceId or campaignFilter changes
  useEffect(() => {
    if (!workspaceId) return;

    async function fetchSchedules() {
      try {
        let res;
        if (campaignFilter && campaignFilter !== 'Tất cả chiến dịch') {
          res = await scheduleApi.listByCampaign(API_BASE_URL, Number(campaignFilter));
        } else {
          res = await scheduleApi.listByWorkspace(API_BASE_URL, workspaceId);
        }
        const data = Array.isArray(res) ? res : res?.data || [];
        setSchedules(data);
      } catch (err) {
        console.error('Error fetching schedules:', err);
      }
    }

    fetchSchedules();
  }, [workspaceId, campaignFilter]);

  // Map schedules to posts inside current week view
  useEffect(() => {
    if (weekDays.length > 0) {
      const mapped = mapSchedulesToCalendarPosts(schedules, weekDays);
      setPosts(mapped);
    }
  }, [schedules, weekDays]);

  // ── Handlers điều hướng tuần ──
  const goToPrevWeek = () =>
    setCurrentDate((d) => { const nd = new Date(d); nd.setDate(nd.getDate() - 7); return nd; });

  const goToNextWeek = () =>
    setCurrentDate((d) => { const nd = new Date(d); nd.setDate(nd.getDate() + 7); return nd; });

  const goToToday = () => setCurrentDate(new Date());

  // ── Handler tạo bài mới ──
  const handleNewPostSubmit = (data) => {
    console.log('Bài viết mới:', data);
  };

  return (
    <div className="sc-page">
      {/* 1. Thanh trên cùng */}
      <ScheduleTopBar
        workspaceName={workspaceName}
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
        campaigns={campaigns}
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

      {/* 5. Modal tạo bài mới */}
      <CreatePostModal
        isOpen={showNewPostModal}
        onClose={() => setShowNewPostModal(false)}
        onSubmit={handleNewPostSubmit}
        onDraft={(data) => console.log('Lưu nháp:', data)}
      />
    </div>
  );
}
