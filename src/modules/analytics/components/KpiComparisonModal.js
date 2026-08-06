import React, { useState, useEffect, useCallback } from 'react';
import { KpiService } from '../services/KpiService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './KpiComparisonModal.css';

const KpiComparisonModal = ({ isOpen, onClose, postTargetId, postInfo }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Form State — stored as strings so we can clear "0" on focus
  const [formData, setFormData] = useState({
    targetLikes: '0',
    targetShares: '0',
    targetComments: '0',
    targetReach: '0',
    targetImpressions: '0',
  });

  const toFormString = useCallback((val) => {
    if (val === null || val === undefined) return '0';
    return String(val);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await KpiService.compareKpi(postTargetId);
      const kpiData = res?.data || res;

      if (kpiData) {
        setData(kpiData);
        if (kpiData.hasTarget) {
          setFormData({
            targetLikes: toFormString(kpiData.targetRaw?.likes),
            targetShares: toFormString(kpiData.targetRaw?.shares),
            targetComments: toFormString(kpiData.targetRaw?.comments),
            targetReach: toFormString(kpiData.targetRaw?.reach),
            targetImpressions: toFormString(kpiData.targetRaw?.impressions),
          });
          setIsEditing(false);
        } else {
          setIsEditing(true);
        }
      } else {
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error fetching KPI data', error);
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && postTargetId) {
      fetchData();
    }
  }, [isOpen, postTargetId]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Allow only digits
    const digitsOnly = value.replace(/\D/g, '');
    setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
  };

  const handleFocus = (name) => {
    setFocusedField(name);
    // Clear "0" on focus so user can type immediately
    if (formData[name] === '0') {
      setFormData((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (name) => {
    setFocusedField(null);
    // Restore "0" if field was left empty
    if (formData[name] === '' || formData[name] === undefined) {
      setFormData((prev) => ({ ...prev, [name]: '0' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        postTargetId,
        targetLikes: Math.max(0, parseInt(formData.targetLikes, 10) || 0),
        targetShares: Math.max(0, parseInt(formData.targetShares, 10) || 0),
        targetComments: Math.max(0, parseInt(formData.targetComments, 10) || 0),
        targetReach: Math.max(0, parseInt(formData.targetReach, 10) || 0),
        targetImpressions: Math.max(0, parseInt(formData.targetImpressions, 10) || 0),
      };
      await KpiService.saveTarget(payload);
      await fetchData();
    } catch (error) {
      console.error('Error saving KPI target', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTooltip = (props) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      const target = payload.find(p => p.dataKey === 'target')?.value || 0;
      const actual = payload.find(p => p.dataKey === 'actual')?.value || 0;

      let status = 'Đang theo dõi';
      let statusColor = '#888';

      if (target > 0) {
        const percentage = (actual / target) * 100;
        if (percentage >= 100) {
          status = 'Vượt chỉ tiêu';
          statusColor = '#4caf50';
        } else if (percentage >= 80) {
          status = 'Đúng tiến độ';
          statusColor = '#2196f3';
        } else if (percentage >= 50) {
          status = 'Cần cải thiện';
          statusColor = '#ff9800';
        } else {
          status = 'Chậm tiến độ';
          statusColor = '#f44336';
        }
      }

      return (
        <div className="kpi-tooltip">
          <p className="kpi-tooltip-title">{label}</p>
          <p style={{ color: '#8b5cf6' }}>Mục tiêu: {target.toLocaleString()}</p>
          <p style={{ color: '#34d399' }}>Thực tế: {actual.toLocaleString()}</p>
          <p style={{ color: statusColor, fontWeight: 'bold', marginTop: '8px' }}>Trạng thái: {status}</p>
        </div>
      );
    }
    return null;
  };

  if (!isOpen) return null;

  const kpiFields = [
    { name: 'targetImpressions', label: 'Mục tiêu Lượt xem' },
    { name: 'targetReach', label: 'Mục tiêu Tiếp cận' },
    { name: 'targetLikes', label: 'Mục tiêu Lượt thích' },
    { name: 'targetComments', label: 'Mục tiêu Bình luận' },
    { name: 'targetShares', label: 'Mục tiêu Chia sẻ' },
  ];

  return (
    <div className="kpi-modal-overlay" onClick={onClose}>
      <div className="kpi-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="kpi-modal-header">
          <h2>So sánh KPI Bài viết</h2>
          <button className="kpi-close-btn" onClick={onClose} aria-label="Đóng">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {postInfo && (
          <div className="kpi-modal-post-info">
            <img src={postInfo.fanpageAvatar} alt="Fanpage Avatar" className="kpi-fanpage-avatar" />
            <div className="kpi-post-details">
              <strong>{postInfo.fanpageName}</strong>
              <p>{postInfo.title}</p>
            </div>
          </div>
        )}

        <div className="kpi-modal-body">
          {loading ? (
            <div className="kpi-loading">
              <span className="kpi-loading-spinner" />
              Đang tải dữ liệu...
            </div>
          ) : isEditing ? (
            <form onSubmit={handleSubmit} className="kpi-form">
              <p className="kpi-form-instruction">Vui lòng nhập mục tiêu KPI cho bài viết này.</p>
              <div className="kpi-form-grid">
                {kpiFields.map(({ name, label }) => (
                  <div key={name} className={`kpi-form-group ${focusedField === name ? 'kpi-form-group--focused' : ''}`}>
                    <label>{label}</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name={name}
                      value={formData[name]}
                      onChange={handleInputChange}
                      onFocus={() => handleFocus(name)}
                      onBlur={() => handleBlur(name)}
                      placeholder="0"
                      required
                    />
                  </div>
                ))}
              </div>
              <div className="kpi-form-actions">
                {data && data.hasTarget && (
                  <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>Hủy</button>
                )}
                <button type="submit" className="btn-submit">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  Lưu Mục Tiêu
                </button>
              </div>
            </form>
          ) : data ? (
            <div className="kpi-chart-container">
              <div className="kpi-chart-header">
                <h3>Biểu đồ So sánh KPI</h3>
                <button className="btn-edit" onClick={() => setIsEditing(true)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Chỉnh sửa mục tiêu
                </button>
              </div>
              <div className="kpi-chart-wrapper">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={data.chartData || []}
                    margin={{ top: 16, right: 24, left: 12, bottom: 8 }}
                    barCategoryGap="22%"
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="metricName"
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={renderTooltip} cursor={{ fill: 'rgba(124, 58, 237, 0.04)' }} />
                    <Legend
                      wrapperStyle={{ paddingTop: '16px', fontSize: '13px' }}
                      iconType="circle"
                      iconSize={10}
                    />
                    <Bar
                      dataKey="target"
                      name="Mục tiêu (Target)"
                      fill="#8b5cf6"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                    <Bar
                      dataKey="actual"
                      name="Thực tế (Actual)"
                      fill="#34d399"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="kpi-loading">Không có dữ liệu</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KpiComparisonModal;
