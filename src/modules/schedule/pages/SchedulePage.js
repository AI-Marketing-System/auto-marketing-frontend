import React, { useState, useEffect } from 'react';
import '../styles/SchedulePage.css';

import ScheduleTopBar   from '../components/ScheduleTopBar';
import ScheduleFilters  from '../components/ScheduleFilters';
import WeekNavigation   from '../components/WeekNavigation';
import CalendarGrid     from '../components/CalendarGrid';
import CreatePostModal  from '../../post/components/CreatePostModal';
import SelectPostToScheduleModal from '../components/SelectPostToScheduleModal';
import ScheduleDetailModal from '../components/ScheduleDetailModal';
import { postApi } from '../../post/api/postApi';
import { topicApi } from '../../topic/api/topicApi';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

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
function mapSchedulesToCalendarPosts(schedules, weekDays, fanpagesMap = {}, topics = [], campaigns = []) {

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

    const targetFanpages = (sch.targets || []).map((t) => {
      const fp = fanpagesMap[t.fanpageId];
      return {
        fanpageId: t.fanpageId,
        fanpageName: fp?.fanpageName || `Fanpage #${t.fanpageId}`,
        fanpageAvatarUrl: fp?.fanpageAvatarUrl || null,
        targetStatus: t.status,
      };
    });

    const topic = topics.find(t => t.id == sch.topicId);
    const campaign = topic ? campaigns.find(c => c.id == topic.campaignId) : null;

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
      campaignName: campaign ? campaign.title : null,
      topicName: topic ? topic.title : null,
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

  // State topics của cả workspace
  const [topics, setTopics] = useState([]);

  // Load tất cả topics từ các campaigns của workspace hiện tại
  useEffect(() => {
    if (!campaigns || campaigns.length === 0) {
      setTopics([]);
      return;
    }
    const loadAllTopics = async () => {
      try {
        const promises = campaigns.map(c =>
          topicApi.listByCampaignId(c.id, 0, 100, 'createdAt', 'desc', API_BASE_URL)
            .then(res => {
              if (res?.success) {
                return res.data?.content || res.data || [];
              }
              return [];
            })
            .catch(() => [])
        );
        const results = await Promise.all(promises);
        const flatTopics = results.flat();
        // Lọc trùng theo id
        const uniqueTopics = [];
        const seen = new Set();
        flatTopics.forEach(t => {
          if (t && t.id && !seen.has(t.id)) {
            seen.add(t.id);
            uniqueTopics.push(t);
          }
        });
        setTopics(uniqueTopics);
      } catch (err) {
        console.error('Failed to load workspace topics:', err);
      }
    };
    loadAllTopics();
  }, [campaigns]);

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
  const triggerFetchSchedules = React.useCallback(async () => {
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
  }, [workspaceId, campaignFilter]);

  // Fetch schedules from backend when workspaceId or campaignFilter changes
  useEffect(() => {
    triggerFetchSchedules();
  },  [workspaceId, campaignFilter]);

  // Establish WebSocket connection to listen for schedule status updates
  useEffect(() => {
    if (!workspaceId) return;

    // Remove /api/v1 from API_BASE_URL to get the root URL for websocket
    const wsUrl = API_BASE_URL.replace('/api/v1', '') + '/ws-marketing';

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('Connected to WebSocket');
      client.subscribe(`/topic/workspace/${workspaceId}/schedules`, (message) => {
        if (message.body) {
          console.log('Received schedule update:', message.body);
          // Trigger a refresh of schedules
          triggerFetchSchedules();
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [workspaceId, triggerFetchSchedules]);

  useEffect(() => {
    if (schedules.length > 0 && weekDays.length > 0) {
      const mapped = mapSchedulesToCalendarPosts(schedules, weekDays, fanpagesMap, topics, campaigns);
      setPosts(mapped);
    } else {
      setPosts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedules, weekDays, fanpages, topics, campaigns]); // re-map khi fanpages/topics/campaigns được tải xong

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
      campaignName: post.campaignName,
      topicName: post.topicName,
      image: post.image,
    });
    setShowDetailModal(true);
  };

  // ── Handler tạo bài mới (Hoàn tất & Lên lịch/Đăng ngay) ──
  const handleNewPostSubmit = async (modalData) => {
    if (!modalData.content.trim()) return;

    try {
      const extractedTags = [];
      const hashtagRegex = /#(\w+)/g;
      let match;
      while ((match = hashtagRegex.exec(modalData.content)) !== null) {
        extractedTags.push(match[1]);
      }
      const modalTags = (modalData.hashtags || []).map((t) => t.replace(/^#+/, ''));
      const hashtagsList = Array.from(new Set([...modalTags, ...extractedTags])).filter(Boolean);

      const isAiGenerated = modalData.content.includes('✨') || modalData.content.includes('[AI');
      const isScheduled = modalData.scheduleMode === 'schedule' && modalData.scheduledAt;
      const isPublishNow = modalData.scheduleMode === 'now';

      const chosenTopicId = modalData.topicId ? Number(modalData.topicId) : (topicFilter && topicFilter !== 'Tất cả chủ đề' ? Number(topicFilter) : null);
      const foundTopic = topics.find(t => t.id === chosenTopicId);
      const chosenCampaignId = foundTopic ? foundTopic.campaignId : (campaignFilter && campaignFilter !== 'Tất cả chiến dịch' ? Number(campaignFilter) : null);

      const payload = {
        workspaceId: Number(workspaceId),
        campaignId: chosenCampaignId,
        topicId: chosenTopicId,
        title: modalData.content.slice(0, 50).trim() || 'Bài đăng mới',
        content: modalData.content,
        hashtags: hashtagsList,
        status: isScheduled ? 'SCHEDULED' : 'DRAFT',
        generatedByAi: isAiGenerated,
        aiModel: isAiGenerated ? 'gemini-3.5-flash' : null,
      };

      const res = await postApi.create(payload, modalData.mediaFiles, API_BASE_URL);
      if (res.success && res.data?.id) {
        const newPostId = res.data.id;
        if (isScheduled) {
          try {
            await scheduleApi.createSchedule(API_BASE_URL, {
              postId: newPostId,
              workspaceId: Number(workspaceId),
              publishTime: modalData.scheduledAt,
              fanpageIds: modalData.fanpageIds || [],
            });
          } catch (e) {
            console.warn('Schedule create error:', e);
          }
        } else if (isPublishNow) {
          try {
            await scheduleApi.publishImmediately(API_BASE_URL, {
              postId: newPostId,
              fanpageIds: modalData.fanpageIds || [],
            });
            window.alert('Bài viết đang được đăng ngay lên các Fanpage đã chọn!');
          } catch (e) {
            console.error('Publish immediately fail:', e);
            window.alert('Đăng bài thất bại: ' + (e.message || 'Lỗi hệ thống'));
          }
        }
        await triggerFetchSchedules();
      }
    } catch (err) {
      window.alert(err.message || 'Không thể tạo bài viết. Vui lòng thử lại.');
    }
  };

  // ── Handler lưu nháp bài viết mới ──
  const handleDraftPost = async (modalData) => {
    if (!modalData.content.trim()) return;

    try {
      const extractedTags = [];
      const hashtagRegex = /#(\w+)/g;
      let match;
      while ((match = hashtagRegex.exec(modalData.content)) !== null) {
        extractedTags.push(match[1]);
      }
      const modalTags = (modalData.hashtags || []).map((t) => t.replace(/^#+/, ''));
      const hashtagsList = Array.from(new Set([...modalTags, ...extractedTags])).filter(Boolean);

      const chosenTopicId = modalData.topicId ? Number(modalData.topicId) : (topicFilter && topicFilter !== 'Tất cả chủ đề' ? Number(topicFilter) : null);
      const foundTopic = topics.find(t => t.id === chosenTopicId);
      const chosenCampaignId = foundTopic ? foundTopic.campaignId : (campaignFilter && campaignFilter !== 'Tất cả chiến dịch' ? Number(campaignFilter) : null);

      const payload = {
        workspaceId: Number(workspaceId),
        campaignId: chosenCampaignId,
        topicId: chosenTopicId,
        title: modalData.content.slice(0, 50).trim() || 'Bài đăng mới',
        content: modalData.content,
        hashtags: hashtagsList,
        status: 'DRAFT',
        generatedByAi: false,
      };

      await postApi.create(payload, modalData.mediaFiles, API_BASE_URL);
      window.alert('Lưu nháp bài viết thành công!');
    } catch (err) {
      window.alert(err.message || 'Không thể lưu nháp bài viết.');
    }
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

      <CreatePostModal
        isOpen={showNewPostModal}
        onClose={() => setShowNewPostModal(false)}
        onSubmit={handleNewPostSubmit}
        onDraft={handleDraftPost}
        workspaceId={workspaceId}
        topics={topics}
        brandTone={selectedWorkspace?.brandTone || ''}
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

      {/* 7. Modal chi tiết lịch đăng */}
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
