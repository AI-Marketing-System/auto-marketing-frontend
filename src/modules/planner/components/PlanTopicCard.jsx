import React from 'react';
import EditableField from './EditableField';
import PlanPostCard from './PlanPostCard';
import { ChevronDownIcon, ChevronRightIcon, PlusIcon, TrashIcon } from './PlannerIcons';
import { addPost, removeTopic, setTopicField } from '../utils/plannerPlanModel';
import { PLANNER_EMPTY_STATES, PLANNER_FIELD_LABELS, PLANNER_SECTION_LABELS } from '../utils/plannerCopy';

function PlanTopicCard({ topic, index, campaignId, expanded, onToggleExpand, onChange }) {
  const isOpen = !!expanded[topic.id];

  const setField = (field) => (value) => onChange(setTopicField, campaignId, topic.id, field, value);

  const handleRemove = () => {
    if (!window.confirm(`Xoá chủ đề "${topic.name || 'chưa có tên'}" và toàn bộ bài viết bên trong?`)) return;
    onChange(removeTopic, campaignId, topic.id);
  };

  return (
    <li className={`wp-topic${isOpen ? ' wp-topic--open' : ''}`}>
      <div className="wp-topic__row">
        <button
          type="button"
          className="wp-topic__toggle"
          onClick={() => onToggleExpand(topic.id)}
          aria-expanded={isOpen}
        >
          {isOpen ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
        </button>
        <span className="wp-topic__index">Chủ đề {index + 1}</span>
        <span className="wp-topic__name">{topic.name || <em className="wp-muted">Chưa có tên</em>}</span>
        <span className="wp-pill">{topic.posts.length} bài</span>
        <button
          type="button"
          className="wp-icon-btn wp-icon-btn--delete"
          onClick={handleRemove}
          title="Xoá chủ đề"
        >
          <TrashIcon size={14} />
        </button>
      </div>

      {isOpen && (
        <div className="wp-topic__detail">
          <EditableField
            label={PLANNER_FIELD_LABELS.topicName}
            value={topic.name}
            onChange={setField('name')}
          />
          <EditableField
            label={PLANNER_FIELD_LABELS.description}
            value={topic.description}
            onChange={setField('description')}
            as="textarea"
            rows={2}
          />

          {topic.posts.length === 0 ? (
            <p className="wp-empty-inline">{PLANNER_EMPTY_STATES.noPosts}</p>
          ) : (
            <ul className="wp-post-list">
              {topic.posts.map((post, postIndex) => (
                <PlanPostCard
                  key={post.id}
                  post={post}
                  index={postIndex}
                  campaignId={campaignId}
                  topicId={topic.id}
                  expanded={!!expanded[post.id]}
                  onToggleExpand={onToggleExpand}
                  onChange={onChange}
                />
              ))}
            </ul>
          )}

          <button
            type="button"
            className="wp-btn wp-btn--dashed"
            onClick={() => onChange(addPost, campaignId, topic.id)}
          >
            <PlusIcon size={14} />
            {PLANNER_SECTION_LABELS.addPost}
          </button>
        </div>
      )}
    </li>
  );
}

export default PlanTopicCard;
