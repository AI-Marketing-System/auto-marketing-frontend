import React, { useState, useEffect } from 'react';
import '../styles/SchedulePage.css';

import ScheduleTopBar   from '../components/ScheduleTopBar';
import ScheduleFilters  from '../components/ScheduleFilters';
import WeekNavigation   from '../components/WeekNavigation';
import CalendarGrid     from '../components/CalendarGrid';
import CreatePostModal  from '../../post/components/CreatePostModal';
import SelectPostToScheduleModal from '../components/SelectPostToScheduleModal';
import ScheduleDetailModal from '../components/ScheduleDetailModal';

import {
  getWeekDays,
  getCurrentTimePercent,
  isSameDay,
} from '../utils/scheduleHelpers';

import { scheduleApi } from '../api/scheduleApi';
import { getWorkspaceFanpages } from '../../campaigns/api/workspaceFanpageApi';
import { API_BASE_URL } from '../../../config/env';

/**
 * Maps the API schedules data list to the calendar posts structure
 */
function mapSchedulesToCalendarPosts(schedules, weekDays, fanpagesMap = {}) {

  return schedules.map((sch) => {
    let dateStr = sch.publishTime;
    if (typeof dateStr === 'string' && !dateStr.endsWith('Z') && !dateStr.includes('+')) {
      dateStr += 'Z';
    }
    const publishDate = new Date(dateStr);
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

    // Determine color based on status
    let color = '#7c3aed'; // default Purple
    switch (sch.status) {
      case 'WAITING':
        color = '#3b82f6'; // Xanh dương (Blue) - Chờ đăng
        break;
      case 'RUNNING':
        color = '#f59e0b'; // Vàng cam (Amber) - Đang đăng
        break;
      case 'SUCCESS':
        color = '#10b981'; // Xanh lá (Green) - Thành công
        break;
      case 'FAILED':
        color = '#ef4444'; // Đỏ (Red) - Lỗi
        break;
      case 'CANCELLED':
        color = '#94a3b8'; // Xám (Gray) - Hủy
        break;
      case 'DELETED':
        color = '#64748b'; // Xám đậm (Slate Gray) - Đã xóa
        break;
      default:
        color = '#7c3aed';
    }

    // Thu thập danh sách fanpage được lên lịch và map thông tin từ fanpagesMap
    const targetFanpages = (sch.targets || []).map((t) => {
      const fp = fanpagesMap[t.fanpageId];
      return {
        fanpageId: t.fanpageId,
        fanpageName: fp?.fanpageName || `Fanpage #${t.fanpageId}`,
        fanpageAvatarUrl: fp?.fanpageAvatarUrl || null,
        targetStatus: t.status,
      };
    });

    return {
      id: sch.scheduleId,
      dayIdx, // will be -1 if it's not in the current visible week
      hour,
      minute,
      title: sch.postTitle || 'Bài viết không có tiêu đề',
      postContent: sch.postContent || '',
      targetFanpages, // danh sách fanpage được lên lịch
      color,
      image: sch.postImageUrl || null,
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
  // ── State dữ liệu ──
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDays, setWeekDays]       = useState([]);
  const [posts, setPosts]             = useState([]);
  const [schedules, setSchedules]     = useState([]);
  const [fanpages, setFanpages]       = useState([]);   // fanpage của workspace hiện tại

  // ── State bộ lọc ──
  const [campaignFilter, setCampaignFilter] = useState('Tất cả chiến dịch');
  const [topicFilter, setTopicFilter]       = useState('Tất cả chủ đề');
  const [statusFilter, setStatusFilter]     = useState('Tất cả trạng thái');

  // ── State modal ──
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showSelectPostModal, setShowSelectPostModal] = useState(false);
  const [selectedCellDate, setSelectedCellDate] = useState(null);
  const [selectedCellHour, setSelectedCellHour] = useState(null);

  // ── State detail modal (US-36/37/38) ──
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // ── State thời gian thực ──
  const [currentTimePercent, setCurrentTimePercent] = useState(getCurrentTimePercent());

  const selectedWorkspace = workspaces.find((ws) => ws.id === workspaceId);
  const workspaceName = selectedWorkspace ? selectedWorkspace.name : 'Chọn Workspace';

  // Build fanpagesMap {[fanpageId]: fanpage} để PostCard tra cứu thông tin avatar
  const fanpagesMap = fanpages.reduce((acc, fp) => {
    acc[fp.fanpageId] = fp;
    return acc;
  }, {});

  // Fetch fanpages khi workspace thay đổi
  useEffect(() => {
    if (!workspaceId) return;
    getWorkspaceFanpages(workspaceId)
      .then((list) => setFanpages(list || []))
      .catch(() => {});
  }, [workspaceId]);

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

  // Fetch function reused across schedule listings and creation successes
  const triggerFetchSchedules = async () => {
    if (!workspaceId) return;
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
  };

  // Fetch schedules from backend when workspaceId or campaignFilter changes
  useEffect(() => {
    triggerFetchSchedules();
  },  [workspaceId, campaignFilter]);

  // Map schedules to posts inside current week view
  useEffect(() => {
    if (weekDays.length > 0) {
      const mapped = mapSchedulesToCalendarPosts(schedules, weekDays, fanpagesMap);
      setPosts(mapped);
    }
  }, [schedules, weekDays, fanpages]); // re-map khi fanpages được tải xong

  // ── Handlers điều hướng tuần ──
  const goToPrevWeek = () =>
    setCurrentDate((d) => { const nd = new Date(d); nd.setDate(nd.getDate() - 7); return nd; });

  const goToNextWeek = () =>
    setCurrentDate((d) => { const nd = new Date(d); nd.setDate(nd.getDate() + 7); return nd; });

  const goToToday = () => setCurrentDate(new Date());

  // ── Handler click ô lịch (tạo lịch mới) ──
  const handleCellClick = (date, hour) => {
    setSelectedCellDate(date);
    setSelectedCellHour(hour);
    setShowSelectPostModal(true);
  };

  // ── Handler click PostCard (xem chi tiết / US-36/37/38) ──
  const handleCardClick = (post) => {
    setSelectedSchedule({
      id: post.id,
      postTitle: post.title,
      postContent: post.postContent,
      publishTime: post.publishTime,
      status: post.status,
    });
    setShowDetailModal(true);
  };

  // ── Handler tạo bài mới ──
  const handleNewPostSubmit = (data) => {
    console.log('Bài viết mới:', data);
  };

  return (
    <div className="sc-page">
      {/* 1. Thanh trên cùng */}
      <ScheduleTopBar
        workspaceId={workspaceId}
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
        onCellClick={handleCellClick}
        onCardClick={handleCardClick}
      />

      {/* 5. Modal tạo bài mới */}
      <CreatePostModal
        isOpen={showNewPostModal}
        onClose={() => setShowNewPostModal(false)}
        onSubmit={handleNewPostSubmit}
        onDraft={(data) => console.log('Lưu nháp:', data)}
      />

      {/* 6. Modal lên lịch bài viết có sẵn khi click vào ô lịch */}
      <SelectPostToScheduleModal
        isOpen={showSelectPostModal}
        onClose={() => setShowSelectPostModal(false)}
        workspaceId={workspaceId}
        campaignId={campaignFilter && campaignFilter !== 'Tất cả chiến dịch' ? Number(campaignFilter) : null}
        selectedDate={selectedCellDate}
        selectedHour={selectedCellHour}
        onSuccess={triggerFetchSchedules}
      />

      {/* 7. Modal chi tiết lịch đăng (US-36/37/38) */}
      <ScheduleDetailModal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedSchedule(null); }}
        schedule={selectedSchedule}
        workspaceId={workspaceId}
        onSuccess={triggerFetchSchedules}
      />
    </div>
  );
}
