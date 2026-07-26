import React from 'react';
import EditableField from './EditableField';
import PlanTopicCard from './PlanTopicCard';
import { ChevronDownIcon, ChevronRightIcon, FolderIcon, PlusIcon, TargetIcon, TrashIcon } from './PlannerIcons';
import { addTopic, removeCampaign, setCampaignField } from '../utils/plannerPlanModel';
import { formatDate } from '../../campaigns/utils/campaignUtils';
import { PLANNER_EMPTY_STATES, PLANNER_FIELD_LABELS, PLANNER_SECTION_LABELS } from '../utils/plannerCopy';

function PlanCampaignCard({ campaign, index, expanded, onToggleExpand, onChange }) {
  const isOpen = !!expanded[campaign.id];

  const setField = (field) => (value) => onChange(setCampaignField, campaign.id, field, value);

  const handleRemove = () => {
    if (!window.confirm(`Xoá chiến dịch "${campaign.name || 'chưa có tên'}" và toàn bộ nội dung bên trong?`)) return;
    onChange(removeCampaign, campaign.id);
  };

  const totalPosts = campaign.topics.reduce((sum, topic) => sum + topic.posts.length, 0);
  // Dùng formatDate có sẵn của module campaigns (dd/MM/yyyy) thay vì viết lại.
  const dateRange = [campaign.startDate, campaign.endDate]
    .filter(Boolean)
    .map((value) => formatDate(value))
    .join(' → ');

  return (
    <article className={`wp-campaign${isOpen ? ' wp-campaign--open' : ''}`}>
      <header className="wp-campaign__head">
        <button
          type="button"
          className="wp-campaign__toggle"
          onClick={() => onToggleExpand(campaign.id)}
          aria-expanded={isOpen}
        >
          {isOpen ? <ChevronDownIcon size={18} /> : <ChevronRightIcon size={18} />}
        </button>
        <span className="wp-campaign__badge">{index + 1}</span>
        <span className="wp-campaign__icon">
          <FolderIcon size={16} />
        </span>
        <span className="wp-campaign__name">
          {campaign.name || <em className="wp-muted">Chưa có tên chiến dịch</em>}
        </span>
        {dateRange && <span className="wp-pill wp-pill--date">{dateRange}</span>}
        <span className="wp-pill">{campaign.topics.length} chủ đề</span>
        <span className="wp-pill">{totalPosts} bài</span>
        <button
          type="button"
          className="wp-icon-btn wp-icon-btn--delete"
          onClick={handleRemove}
          title="Xoá chiến dịch"
        >
          <TrashIcon size={16} />
        </button>
      </header>

      {isOpen && (
        <div className="wp-campaign__body">
          <EditableField
            label={PLANNER_FIELD_LABELS.campaignName}
            value={campaign.name}
            onChange={setField('name')}
          />

          <div className="wp-campaign__grid">
            <EditableField
              label={PLANNER_FIELD_LABELS.startDate}
              value={campaign.startDate}
              onChange={setField('startDate')}
              as="date"
            />
            <EditableField
              label={PLANNER_FIELD_LABELS.endDate}
              value={campaign.endDate}
              onChange={setField('endDate')}
              as="date"
            />
          </div>

          <EditableField
            label={PLANNER_FIELD_LABELS.objective}
            value={campaign.objective}
            onChange={setField('objective')}
          />
          <EditableField
            label={PLANNER_FIELD_LABELS.description}
            value={campaign.description}
            onChange={setField('description')}
            as="textarea"
            rows={3}
          />

          <div className="wp-campaign__topics">
            <p className="wp-campaign__topics-title">
              <TargetIcon size={14} />
              Chủ đề &amp; bài viết
            </p>
            {campaign.topics.length === 0 ? (
              <p className="wp-empty-inline">{PLANNER_EMPTY_STATES.noTopics}</p>
            ) : (
              <ul className="wp-topic-list">
                {campaign.topics.map((topic, topicIndex) => (
                  <PlanTopicCard
                    key={topic.id}
                    topic={topic}
                    index={topicIndex}
                    campaignId={campaign.id}
                    expanded={expanded}
                    onToggleExpand={onToggleExpand}
                    onChange={onChange}
                  />
                ))}
              </ul>
            )}
            <button
              type="button"
              className="wp-btn wp-btn--dashed"
              onClick={() => onChange(addTopic, campaign.id)}
            >
              <PlusIcon size={14} />
              {PLANNER_SECTION_LABELS.addTopic}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export default PlanCampaignCard;
