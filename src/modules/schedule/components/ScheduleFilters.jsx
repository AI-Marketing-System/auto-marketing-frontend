import React from 'react';

/**
 * Thanh lọc bài đăng: chiến dịch, chủ đề, trạng thái
 *
 * @param {{
 *   campaignFilter: string,
 *   topicFilter: string,
 *   statusFilter: string,
 *   onCampaignChange: (v: string) => void,
 *   onTopicChange: (v: string) => void,
 *   onStatusChange: (v: string) => void,
 * }} props
 */
export default function ScheduleFilters({
  campaignFilter,
  topicFilter,
  statusFilter,
  onCampaignChange,
  onTopicChange,
  onStatusChange,
}) {
  return (
    <div className="sc-filters">
      {/* Lọc theo chiến dịch */}
      <div className="sc-filter-group">
        <input
          id="filter-campaign"
          className="sc-filter-input"
          type="text"
          value={campaignFilter}
          onChange={(e) => onCampaignChange(e.target.value)}
          placeholder="Tất cả chiến dịch"
          readOnly
        />
      </div>

      {/* Lọc theo chủ đề */}
      <div className="sc-filter-group">
        <select
          id="filter-topic"
          className="sc-filter-select"
          value={topicFilter}
          onChange={(e) => onTopicChange(e.target.value)}
        >
          <option value="Tất cả chủ đề">Tất cả chủ đề</option>
          <option value="Khuyến mãi">Khuyến mãi</option>
          <option value="Sản phẩm">Sản phẩm</option>
          <option value="Sự kiện">Sự kiện</option>
        </select>
      </div>

      {/* Lọc theo trạng thái */}
      <div className="sc-filter-group">
        <select
          id="filter-status"
          className="sc-filter-select"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="Tất cả trạng thái">Tất cả trạng thái</option>
          <option value="Đã đăng">Đã đăng</option>
          <option value="Lên lịch">Lên lịch</option>
          <option value="Nháp">Nháp</option>
        </select>
      </div>
    </div>
  );
}
