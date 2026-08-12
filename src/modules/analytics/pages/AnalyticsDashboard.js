import React, { useEffect, useMemo, useState } from 'react';
import HeatmapChart from '../components/HeatmapChart';
import LineChartComponent from '../components/LineChartComponent';
import MetricCard from '../components/MetricCard';
import { ViewsAreaChart, ReachAreaChart } from '../components/AreaChartComponent';
import TopPostsList, { normalizeTopPosts } from '../components/TopPostsList';
import {
  workspaceApi,
  parseWorkspacesResponse,
  campaignApi,
  parsePaginatedResponse,
} from '../../campaigns/api/campaignApi';
import { getWorkspaceFanpages } from '../../campaigns/api/workspaceFanpageApi';
import { DashboardService } from '../services/DashboardService';
import '../styles/AnalyticsDashboardV2.css';

const getFanpageId = (fanpage) => String(fanpage?.fanpageId || fanpage?.id || '');
const getFanpageName = (fanpage) => fanpage?.fanpageName || fanpage?.name || 'Fanpage';
const getFanpageAvatar = (fanpage) =>
  fanpage?.fanpageAvatarUrl || fanpage?.avatarUrl || fanpage?.pictureUrl || '/logo192.png';

const formatGrowth = (growth) => {
  if (growth === undefined || growth === null) return 'Chưa đủ dữ liệu';
  return `${growth > 0 ? '+' : ''}${growth}% so với kỳ trước`;
};

const extractHour = (value) => {
  const match = String(value ?? '').match(/(?:T|\s|^)(\d{1,2})(?::\d{2})?/);
  return match ? Number(match[1]) : null;
};

const normalizeHourlyLabels = (labels) => {
  if (labels.length === 0) return labels;

  const endHour = new Date().getHours();

  return labels.map((_, index) => {
    const hoursFromEnd = labels.length - index - 1;
    const hour = (endHour - hoursFromEnd + 24) % 24;
    return `${String(hour).padStart(2, '0')}:00`;
  });
};

const AnalyticsDashboard = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [fanpages, setFanpages] = useState([]);
  const [selectedFanpageIds, setSelectedFanpageIds] = useState([]);
  const [dashboardData, setDashboardData] = useState([]);
  const [summaryData, setSummaryData] = useState({});
  const [followerSummaryData, setFollowerSummaryData] = useState({});
  const [heatmapData, setHeatmapData] = useState([]);
  const [publishedPostCounts, setPublishedPostCounts] = useState({});
  const [topPosts, setTopPosts] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingPublishedPosts, setLoadingPublishedPosts] = useState(false);
  const [loadingTopPosts, setLoadingTopPosts] = useState(false);
  const [dateRange, setDateRange] = useState('month');
  const [postSortBy, setPostSortBy] = useState('engagement');
  const [postPage, setPostPage] = useState(0);
  const [postTotalPages, setPostTotalPages] = useState(0);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const [myWs, memberWs] = await Promise.all([
          workspaceApi.myWorkspaces(),
          workspaceApi.memberWorkspaces(),
        ]);
        const allWs = [...parseWorkspacesResponse(myWs), ...parseWorkspacesResponse(memberWs)];
        const uniqueWs = Array.from(new Map(allWs.map((item) => [item.id, item])).values());

        setWorkspaces(uniqueWs);
        if (uniqueWs.length > 0) setSelectedWorkspaceId(String(uniqueWs[0].id));
      } catch (err) {
        console.error('Error fetching workspaces:', err);
      }
    };

    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (!selectedWorkspaceId) return;

    const fetchCampaigns = async () => {
      try {
        const response = await campaignApi.list(undefined, {
          workspaceId: selectedWorkspaceId,
          size: 100,
        });
        const parsed = parsePaginatedResponse(response);
        setCampaigns(parsed.content || []);
        setSelectedCampaignId('');
      } catch (err) {
        console.error('Error fetching campaigns:', err);
      }
    };

    fetchCampaigns();
  }, [selectedWorkspaceId]);

  useEffect(() => {
    if (!selectedWorkspaceId) return;

    const fetchFanpages = async () => {
      try {
        const pages = await getWorkspaceFanpages(selectedWorkspaceId);
        setFanpages(pages || []);
        setSelectedFanpageIds((pages || []).map(getFanpageId).filter(Boolean));
      } catch (err) {
        console.error('Error fetching fanpages:', err);
      }
    };

    fetchFanpages();
  }, [selectedWorkspaceId]);

  useEffect(() => {
    if (!selectedWorkspaceId) {
      setPublishedPostCounts({});
      return;
    }

    const fetchPublishedPostCounts = async () => {
      setLoadingPublishedPosts(true);
      try {
        const counts = await DashboardService.getPublishedPostCounts(selectedWorkspaceId);
        setPublishedPostCounts(counts);
      } catch (err) {
        console.error('Error fetching published post counts:', err);
        setPublishedPostCounts({});
      } finally {
        setLoadingPublishedPosts(false);
      }
    };

    fetchPublishedPostCounts();
  }, [selectedWorkspaceId]);

  useEffect(() => {
    if (!selectedWorkspaceId || selectedFanpageIds.length === 0) {
      setTopPosts([]);
      return;
    }

    const fetchTopPosts = async () => {
      setLoadingTopPosts(true);
      try {
        const response = await DashboardService.getTopPosts({
          workspaceId: selectedWorkspaceId,
          fanpageIds: selectedFanpageIds,
          campaignIds: selectedCampaignId ? [selectedCampaignId] : undefined,
          period: dateRange,
          limit: 5,
          page: postPage,
          sortBy: postSortBy,
        });
        setTopPosts(normalizeTopPosts(response.data || []));
        setPostTotalPages(response.totalPages || 0);
      } catch (err) {
        console.error('Error fetching top posts:', err);
        setTopPosts([]);
        setPostTotalPages(0);
      } finally {
        setLoadingTopPosts(false);
      }
    };

    fetchTopPosts();
  }, [dateRange, selectedCampaignId, selectedFanpageIds, selectedWorkspaceId, postPage, postSortBy]);

  useEffect(() => {
    if (!selectedWorkspaceId || selectedFanpageIds.length === 0) {
      setHeatmapData([]);
      return;
    }

    const fetchHeatmap = async () => {
      try {
        const response = await DashboardService.getHeatmapData({
          workspaceId: selectedWorkspaceId,
          fanpageIds: selectedFanpageIds,
          campaignIds: selectedCampaignId ? [selectedCampaignId] : undefined,
        });
        setHeatmapData(response);
      } catch (err) {
        setHeatmapData([]);
      }
    };
    fetchHeatmap();
  }, [selectedWorkspaceId, selectedFanpageIds, selectedCampaignId]);

  useEffect(() => {
    if (!selectedWorkspaceId || selectedFanpageIds.length === 0) {
      setDashboardData([]);
      return;
    }

    const fetchDashboard = async () => {
      setLoadingData(true);
      try {
        const isHourlyRange = dateRange === 'day';
        const params = {
          workspaceId: selectedWorkspaceId,
          groupBy: isHourlyRange ? 'hour' : 'day',
          limit: isHourlyRange ? 24 : dateRange === 'week' ? 7 : 30,
          fanpageIds: selectedFanpageIds,
        };

        if (selectedCampaignId) params.campaignIds = [selectedCampaignId];

        const response = await DashboardService.getDashboardData(params);
        const chartDataRaw = response.chartData || {};
        const rawLabels = chartDataRaw.labels || [];
        const labels = isHourlyRange ? normalizeHourlyLabels(rawLabels) : rawLabels;

        const followerSummaryRaw = response.followerSummary || {};
        const followerChartDataRaw = followerSummaryRaw.chartData || {};

        setDashboardData(
          labels.map((label, index) => ({
            date: label,
            followers: followerChartDataRaw.newFollowers ? followerChartDataRaw.newFollowers[index] || 0 : 0,
            value: (chartDataRaw.shares ? chartDataRaw.shares[index] || 0 : 0) +
                   (chartDataRaw.comments ? chartDataRaw.comments[index] || 0 : 0) +
                   (chartDataRaw.likes ? chartDataRaw.likes[index] || 0 : 0),
            likes: chartDataRaw.likes ? chartDataRaw.likes[index] || 0 : 0,
            comments: chartDataRaw.comments ? chartDataRaw.comments[index] || 0 : 0,
            shares: chartDataRaw.shares ? chartDataRaw.shares[index] || 0 : 0,
            reach: chartDataRaw.reach ? chartDataRaw.reach[index] || 0 : 0,
            views: chartDataRaw.impressions ? chartDataRaw.impressions[index] || 0 : 0,
          }))
        );
        setSummaryData(response.summary || {});
        setFollowerSummaryData(response.followerSummary || {});
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setDashboardData([]);
        setSummaryData({});
        setFollowerSummaryData({});
      } finally {
        setLoadingData(false);
      }
    };

    fetchDashboard();
  }, [dateRange, selectedCampaignId, selectedFanpageIds, selectedWorkspaceId]);

  const totals = useMemo(
    () =>
      dashboardData.reduce(
        (result, point) => ({
          views: result.views + point.views,
          reach: result.reach + point.reach,
          followers: result.followers + point.followers,
          engagement: result.engagement + point.value,
          likes: result.likes + point.likes,
          comments: result.comments + point.comments,
          shares: result.shares + point.shares,
        }),
        { views: 0, reach: 0, followers: 0, engagement: 0, likes: 0, comments: 0, shares: 0 }
      ),
    [dashboardData]
  );

  const displayedFanpages = useMemo(
    () => fanpages.filter((fanpage) => selectedFanpageIds.includes(getFanpageId(fanpage))),
    [fanpages, selectedFanpageIds]
  );

  const chartGranularity = dateRange === 'day' ? 'hour' : 'day';
  const selectedPointUnit = chartGranularity === 'hour' ? 'giờ' : 'ngày';

  const toggleFanpage = (fanpageId) => {
    const stringId = String(fanpageId);
    setSelectedFanpageIds((current) =>
      current.includes(stringId)
        ? current.filter((id) => id !== stringId)
        : [...current, stringId]
    );
  };

  const metricCards = [
    {
      label: 'Lượt xem nội dung',
      value: totals.views,
      helper: 'Tổng trong kỳ',
      trend: formatGrowth(summaryData.viewsGrowth),
      tone: 'views',
      icon: 'views',
      sparkline: dashboardData.map((point) => point.views),
    },
    {
      label: 'Lượt tiếp cận',
      value: totals.reach,
      helper: 'Người duy nhất',
      trend: formatGrowth(summaryData.reachGrowth),
      tone: 'blue',
      icon: 'reach',
      sparkline: dashboardData.map((point) => point.reach),
    },
    {
      label: 'Người theo dõi',
      value: followerSummaryData.totalNewFollowers || 0,
      helper: 'Tín hiệu tăng trưởng',
      trend: formatGrowth(followerSummaryData.growthRate || 0),
      tone: 'coral',
      icon: 'followers',
      sparkline: dashboardData.map((point) => point.followers),
    },
    {
      label: 'Tương tác',
      value: totals.engagement,
      helper: `${totals.likes} Thích • ${totals.comments} Bình luận • ${totals.shares} Chia sẻ`,
      trend: formatGrowth(summaryData.engagementGrowth),
      tone: 'pine',
      icon: 'engagement',
      sparkline: dashboardData.map((point) => point.value),
    },
  ];

  return (
    <div className="analytics-v2-container" aria-busy={loadingData}>
      <section className="analytics-hero" aria-labelledby="analytics-title">
        <div className="analytics-hero__copy">
          <h1 id="analytics-title">Phân tích hiệu suất</h1>
          <p>
            Đọc nhanh nhịp tăng trưởng của các kênh và tìm ra thời điểm nội dung tạo ra nhiều tác động nhất.
          </p>
        </div>
        <div className="analytics-hero__status">
          <span className={`analytics-status-dot${loadingData ? ' analytics-status-dot--loading' : ''}`} />
          <span>{loadingData ? 'Đang đồng bộ dữ liệu' : 'Dữ liệu đã cập nhật'}</span>
        </div>
      </section>

      <section className="analytics-toolbar" aria-label="Bộ lọc phân tích">
        <div className="analytics-toolbar__filters">
          <div className="analytics-filter-field">
            <label className="analytics-filter-label" htmlFor="analytics-workspace">
              Không gian làm việc
            </label>
            <div className="analytics-select-wrap">
              <svg className="analytics-filter-icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01M8 16h8" />
              </svg>
              <select
                id="analytics-workspace"
                className="analytics-select analytics-select--strong"
                value={selectedWorkspaceId}
                onChange={(event) => setSelectedWorkspaceId(event.target.value)}
              >
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
                {workspaces.length === 0 && <option value="">Đang tải không gian làm việc...</option>}
              </select>
              <span className="analytics-select-chevron" aria-hidden="true">⌄</span>
            </div>
          </div>

          <div className="analytics-filter-field">
            <label className="analytics-filter-label" htmlFor="analytics-campaign">
              Chiến dịch
            </label>
            <div className="analytics-select-wrap">
              <svg className="analytics-filter-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 7h10l6 3v4l-6 3H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
                <path d="m14 7 2-3M14 17l2 3M6 11v2" />
              </svg>
              <select
                id="analytics-campaign"
                className="analytics-select"
                value={selectedCampaignId}
                onChange={(event) => setSelectedCampaignId(event.target.value)}
              >
                <option value="">Tất cả chiến dịch</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name || campaign.title}
                  </option>
                ))}
              </select>
              <span className="analytics-select-chevron" aria-hidden="true">⌄</span>
            </div>
          </div>

          <div className="analytics-filter-field analytics-filter-field--range">
            <label className="analytics-filter-label" htmlFor="analytics-date-range">
              Khoảng thời gian
            </label>
            <div className="analytics-select-wrap">
              <svg className="analytics-filter-icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18" />
              </svg>
              <select
                id="analytics-date-range"
                className="analytics-select"
                value={dateRange}
                onChange={(event) => setDateRange(event.target.value)}
              >
                <option value="month">30 ngày gần nhất</option>
                <option value="week">7 ngày gần nhất</option>
                <option value="day">1 ngày gần nhất</option>
              </select>
              <span className="analytics-select-chevron" aria-hidden="true">⌄</span>
            </div>
          </div>
        </div>

        <div className="analytics-toolbar__channels">
          <span className="analytics-filter-label">Kênh đang xem</span>
          <div className="analytics-channel-list">
            {fanpages.map((fanpage) => {
              const fanpageId = getFanpageId(fanpage);
              const isSelected = selectedFanpageIds.includes(fanpageId);
              const name = getFanpageName(fanpage);

              return (
                <button
                  type="button"
                  key={fanpageId}
                  className={`analytics-channel${isSelected ? ' analytics-channel--selected' : ''}`}
                  aria-pressed={isSelected}
                  aria-label={`${isSelected ? 'Bỏ chọn' : 'Chọn'} ${name}`}
                  title={name}
                  onClick={() => toggleFanpage(fanpageId)}
                >
                  <img
                    src={getFanpageAvatar(fanpage)}
                    alt=""
                  />
                  <span className="analytics-channel__badge" aria-hidden="true">f</span>
                </button>
              );
            })}
            <button
              type="button"
              className="analytics-channel analytics-channel--add"
              title="Thêm fanpage"
              onClick={() => alert('Vui lòng thêm Fanpage trong mục cài đặt không gian làm việc')}
            >
              <span aria-hidden="true">+</span>
              <span className="sr-only">Thêm fanpage</span>
            </button>
          </div>
          <span className="analytics-toolbar__timezone">GMT+07 · Hanoi</span>
        </div>
      </section>

      {displayedFanpages.length > 0 && (
        <section className="analytics-published-posts" aria-labelledby="analytics-published-posts-title">
          <div className="analytics-published-posts__heading">
            <div>
              <h2 id="analytics-published-posts-title">Bài đã đăng theo kênh</h2>
              <p>Số bài đăng thành công của từng fanpage đang được xem.</p>
            </div>
            <span className="analytics-published-posts__status" role="status" aria-live="polite">
              {loadingPublishedPosts ? 'Đang cập nhật' : 'Đã cập nhật'}
            </span>
          </div>
          <div className="analytics-published-posts__grid">
            {displayedFanpages.map((fanpage) => {
              const fanpageId = getFanpageId(fanpage);
              const postCount = publishedPostCounts[fanpageId] || 0;

              return (
                <article className="analytics-published-post-card" key={fanpageId}>
                  <div className="analytics-published-post-card__identity">
                    <img src={getFanpageAvatar(fanpage)} alt="" />
                    <span>{getFanpageName(fanpage)}</span>
                  </div>
                  <div className="analytics-published-post-card__metric">
                    <strong>{loadingPublishedPosts ? '—' : postCount.toLocaleString('vi-VN')}</strong>
                    <span>bài đã đăng</span>
                  </div>
                  <svg className="analytics-published-post-card__icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                    <path d="M14 3v5h5M8 13h6M8 17h6" />
                  </svg>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {selectedWorkspaceId && fanpages.length > 0 && selectedFanpageIds.length === 0 && (
        <div className="analytics-selection-note" role="status">
          Chọn ít nhất một kênh để xem dữ liệu phân tích.
        </div>
      )}

      <section className="analytics-section" aria-labelledby="analytics-highlights-title">
        <div className="analytics-section-heading">
          <div>
            <h2 id="analytics-highlights-title">Tín hiệu chính</h2>
          </div>
          <span className="analytics-section-meta">
            {dashboardData.length > 0
              ? `${dashboardData.length} ${selectedPointUnit} được chọn`
              : 'Chờ dữ liệu từ kênh'}
          </span>
        </div>
        <div className="metric-grid">
          {metricCards.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <section className="analytics-section analytics-section--visuals" aria-labelledby="analytics-visuals-title">
        <div className="analytics-section-heading">
          <div>
            <h2 id="analytics-visuals-title">Nhịp độ và tác động</h2>
          </div>
          <span className="analytics-section-meta">
            Dữ liệu theo {chartGranularity === 'hour' ? 'giờ' : 'ngày'}
          </span>
        </div>
        {loadingData && (
          <div className="analytics-loading" role="status">
            <span className="analytics-loading__spinner" aria-hidden="true" />
            Đang tải dữ liệu biểu đồ...
          </div>
        )}
        <div className="charts-grid">
          <HeatmapChart customData={heatmapData} />
          <ViewsAreaChart customData={dashboardData} timeGranularity={chartGranularity} />
          <LineChartComponent customData={dashboardData} timeGranularity={chartGranularity} />
          <ReachAreaChart customData={dashboardData} timeGranularity={chartGranularity} />
        </div>
      </section>

      <section className="analytics-section analytics-top-posts" aria-labelledby="analytics-top-posts-title">
        <div className="analytics-section-heading">
          <div>
            <h2 id="analytics-top-posts-title">Danh sách bài viết nổi bật</h2>
            <p className="analytics-top-posts__description">
              Nội dung nổi bật nhất trong khoảng thời gian và các kênh đang xem.
            </p>
          </div>
          <div className="analytics-sort-container">
            <span className="analytics-sort-label">Sắp xếp theo:</span>
            <select
              className="analytics-sort-select"
              value={postSortBy}
              onChange={(e) => {
                setPostSortBy(e.target.value);
                setPostPage(0);
              }}
            >
              <option value="engagement">Điểm tương tác</option>
              <option value="likes">Lượt thích cao nhất</option>
              <option value="comments">Lượt bình luận cao nhất</option>
              <option value="shares">Lượt chia sẻ cao nhất</option>
            </select>
          </div>
        </div>
        <div className="analytics-top-posts__card">
          <TopPostsList 
            posts={topPosts} 
            loading={loadingTopPosts} 
            page={postPage}
            totalPages={postTotalPages}
            onPageChange={setPostPage}
            sortBy={postSortBy}
          />
        </div>
      </section>
    </div>
  );
};

export default AnalyticsDashboard;
