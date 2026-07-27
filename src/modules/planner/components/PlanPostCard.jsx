import React from 'react';
import ConfidenceMeter from './ConfidenceMeter';
import EditableField from './EditableField';
import { ChevronDownIcon, ChevronRightIcon, ClockIcon, ImageIcon, SendIcon, TagIcon, TrashIcon } from './PlannerIcons';
import { parseHashtags, setPostField, removePost } from '../utils/plannerPlanModel';
import { PLANNER_FIELD_LABELS } from '../utils/plannerCopy';

/** Một bài viết dạng skeleton — CHỈ là brief, không phải caption hoàn chỉnh. */
function PlanPostCard({ post, index, campaignId, topicId, expanded, onToggleExpand, onChange }) {
  const setField = (field) => (value) =>
    onChange(setPostField, campaignId, topicId, post.id, field, value);

  const handleRemove = () => {
    if (!window.confirm(`Xoá bài viết "${post.title || 'chưa có tiêu đề'}"?`)) return;
    onChange(removePost, campaignId, topicId, post.id);
  };

  const hashtags = parseHashtags(post.hashtagsSuggestion);

  return (
    <li className={`wp-post${expanded ? ' wp-post--open' : ''}`}>
      <div className="wp-post__row">
        <button
          type="button"
          className="wp-post__toggle"
          onClick={() => onToggleExpand(post.id)}
          aria-expanded={expanded}
        >
          {expanded ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
        </button>
        <span className="wp-post__index">Bài {index + 1}</span>
        <span className="wp-post__title" title={post.title}>
          {post.title || <em className="wp-muted">Chưa có tiêu đề</em>}
        </span>
        <ConfidenceMeter value={post.confidence} size="sm" />
        {post.platformSuggestion && (
          <span className="wp-chip wp-chip--platform">
            <SendIcon size={12} />
            {post.platformSuggestion}
          </span>
        )}
        {post.scheduleSuggestion && (
          <span className="wp-chip wp-chip--schedule">
            <ClockIcon size={12} />
            {post.scheduleSuggestion}
          </span>
        )}
        <button
          type="button"
          className="wp-icon-btn wp-icon-btn--delete"
          onClick={handleRemove}
          title="Xoá bài viết"
        >
          <TrashIcon size={14} />
        </button>
      </div>

      {expanded && (
        <div className="wp-post__detail">
          <EditableField
            label={PLANNER_FIELD_LABELS.postTitle}
            value={post.title}
            onChange={setField('title')}
          />
          <EditableField
            label={PLANNER_FIELD_LABELS.objective}
            value={post.objective}
            onChange={setField('objective')}
          />
          <EditableField
            label={PLANNER_FIELD_LABELS.contentBrief}
            value={post.contentBrief}
            onChange={setField('contentBrief')}
            as="textarea"
            rows={4}
          />

          <div className="wp-post__grid">
            <EditableField
              label={PLANNER_FIELD_LABELS.mediaSuggestion}
              value={post.mediaSuggestion}
              onChange={setField('mediaSuggestion')}
            />
            <EditableField
              label={PLANNER_FIELD_LABELS.platformSuggestion}
              value={post.platformSuggestion}
              onChange={setField('platformSuggestion')}
            />
            <EditableField
              label={PLANNER_FIELD_LABELS.scheduleSuggestion}
              value={post.scheduleSuggestion}
              onChange={setField('scheduleSuggestion')}
            />
          </div>

          <div className="wp-post__hashtags">
            {hashtags.length > 0 && (
              <div className="wp-post__hashtag-chips">
                {hashtags.map((tag, tagIndex) => (
                  <span key={`${tag}-${tagIndex}`} className="wp-chip wp-chip--hashtag">
                    <TagIcon size={12} />
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {/* Chip chỉ để xem; sửa vẫn trên chuỗi gốc để không mất ký tự nào. */}
            <EditableField
              label={PLANNER_FIELD_LABELS.hashtagsSuggestion}
              value={post.hashtagsSuggestion}
              onChange={setField('hashtagsSuggestion')}
            />
          </div>

          <div className="wp-post__meta-row">
            <span className="wp-post__confidence-label">
              <ImageIcon size={14} />
              {PLANNER_FIELD_LABELS.confidence}:
            </span>
            <ConfidenceMeter value={post.confidence} size="md" />
          </div>

          {post.note && (
            <p className="wp-post__note">
              <strong>{PLANNER_FIELD_LABELS.note}:</strong> {post.note}
            </p>
          )}
        </div>
      )}
    </li>
  );
}

export default PlanPostCard;
