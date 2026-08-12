import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ConfidenceMeter from './ConfidenceMeter';
import PlanCampaignCard from './PlanCampaignCard';
import PlanMissingInfoPanel from './PlanMissingInfoPanel';
import PlanOverviewCard from './PlanOverviewCard';
import PlannerAlert from './PlannerAlert';
import PlannerNotAppliedNotice from './PlannerNotAppliedNotice';
import { CopyIcon, DownloadIcon, PlusIcon } from './PlannerIcons';
import { addCampaign, countPlan, toExportJson } from '../utils/plannerPlanModel';
import { PLANNER_EMPTY_STATES, PLANNER_SECTION_LABELS } from '../utils/plannerCopy';

/** Bản nháp kế hoạch: tổng quan, thông tin thiếu, và cây Chiến dịch → Chủ đề → Bài viết. */
function PlannerResultView({
  plan,
  workspaceId,
  expanded,
  onToggleExpand,
  onExpandAll,
  onCollapseAll,
  onChange,
  draftSavedAt,
  draftSaveState,
  onReanalyze,
  onDiscardDraft,
}) {
  const stats = useMemo(() => countPlan(plan), [plan]);

  const copyPlanJson = async () => {
    const json = JSON.stringify(toExportJson(plan), null, 2);
    try {
      await navigator.clipboard.writeText(json);
      window.alert('Đã sao chép kế hoạch dạng JSON vào clipboard.');
    } catch (err) {
      // Clipboard API cần HTTPS hoặc localhost; nếu không dùng được thì vẫn phải có đường thoát.
      window.alert('Trình duyệt không cho phép sao chép tự động. Hãy dùng "Tải xuống .json" thay thế.');
    }
  };

  const downloadPlanJson = () => {
    const json = JSON.stringify(toExportJson(plan), null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workspace-plan-${workspaceId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="wp-result">
      <PlanOverviewCard
        plan={plan}
        onChange={onChange}
        draftSavedAt={draftSavedAt}
        draftSaveState={draftSaveState}
        onReanalyze={onReanalyze}
        onDiscardDraft={onDiscardDraft}
      />

      <PlanMissingInfoPanel items={plan.missingInformation} />

      <section className="wp-card wp-tree">
        <header className="wp-tree__head">
          <div>
            <h2 className="wp-card__title">{PLANNER_SECTION_LABELS.result}</h2>
            <div className="wp-stats">
              <span className="wp-stats__item">
                <strong>{stats.campaigns}</strong> chiến dịch
              </span>
              <span className="wp-stats__item">
                <strong>{stats.topics}</strong> chủ đề
              </span>
              <span className="wp-stats__item">
                <strong>{stats.posts}</strong> bài viết
              </span>
              <span className="wp-stats__item wp-stats__item--conf">
                Độ tin cậy TB: <ConfidenceMeter value={stats.avgConfidence} size="sm" />
              </span>
            </div>
          </div>
          <div className="wp-tree__actions">
            <button type="button" className="wp-btn wp-btn--ghost" onClick={onExpandAll}>
              {PLANNER_SECTION_LABELS.expandAll}
            </button>
            <button type="button" className="wp-btn wp-btn--ghost" onClick={onCollapseAll}>
              {PLANNER_SECTION_LABELS.collapseAll}
            </button>
          </div>
        </header>

        {plan.campaigns.length === 0 ? (
          <PlannerAlert tone="warning" message={PLANNER_EMPTY_STATES.noCampaigns} />
        ) : (
          <div className="wp-campaign-list">
            {plan.campaigns.map((campaign, index) => (
              <PlanCampaignCard
                key={campaign.id}
                campaign={campaign}
                index={index}
                expanded={expanded}
                onToggleExpand={onToggleExpand}
                onChange={onChange}
              />
            ))}
          </div>
        )}

        <button type="button" className="wp-btn wp-btn--dashed" onClick={() => onChange(addCampaign)}>
          <PlusIcon size={14} />
          {PLANNER_SECTION_LABELS.addCampaign}
        </button>
      </section>

      <footer className="wp-result__footer">
        <PlannerNotAppliedNotice variant="result" />
        <div className="wp-result__footer-actions">
          {/* TODO(planner-apply): nút "Tạo Campaign thật" chèn vào đây khi có
              POST /api/v1/workspaces/{id}/planner/apply. Khi đó cập nhật
              PLANNER_NOT_APPLIED_NOTICE và bỏ futureNote. */}
          <button type="button" className="wp-btn wp-btn--ghost" onClick={copyPlanJson}>
            <CopyIcon size={14} />
            {PLANNER_SECTION_LABELS.copyJson}
          </button>
          <button type="button" className="wp-btn wp-btn--ghost" onClick={downloadPlanJson}>
            <DownloadIcon size={14} />
            {PLANNER_SECTION_LABELS.downloadJson}
          </button>
          <Link className="wp-btn wp-btn--primary" to={`/workspaces/${workspaceId}/campaigns`}>
            {PLANNER_SECTION_LABELS.backToCampaigns}
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default PlannerResultView;
