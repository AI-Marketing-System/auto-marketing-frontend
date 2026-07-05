import React, { useEffect, useState } from 'react';
import { normalizePlan } from '../utils/planHelpers';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  billingCycleDays: '',
  maxWorkspaces: '',
  maxSocialAccounts: '',
  aiTokenLimit: '',
  isActive: true,
};

function normalizePlanForm(plan) {
  const normalizedPlan = normalizePlan(plan);

  if (!normalizedPlan) {
    return EMPTY_FORM;
  }

  return {
    name: normalizedPlan.name || '',
    description: normalizedPlan.description || '',
    price: normalizedPlan.price ?? '',
    billingCycleDays: normalizedPlan.billingCycleDays ?? '',
    maxWorkspaces: normalizedPlan.maxWorkspaces ?? '',
    maxSocialAccounts: normalizedPlan.maxSocialAccounts ?? '',
    aiTokenLimit: normalizedPlan.aiTokenLimit ?? '',
    isActive: typeof normalizedPlan.isActive === 'boolean' ? normalizedPlan.isActive : true,
  };
}

function PlanFormModal({ isOpen, mode, plan, onClose, onSubmit, isSaving }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (isOpen) {
      setForm(normalizePlanForm(plan));
    }
  }, [isOpen, plan]);

  if (!isOpen) {
    return null;
  }

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.price === '' ? '' : Number(form.price),
      billingCycleDays: form.billingCycleDays === '' ? '' : Number(form.billingCycleDays),
      maxWorkspaces: form.maxWorkspaces === '' ? '' : Number(form.maxWorkspaces),
      maxSocialAccounts: form.maxSocialAccounts === '' ? '' : Number(form.maxSocialAccounts),
      aiTokenLimit: form.aiTokenLimit === '' ? '' : Number(form.aiTokenLimit),
      isActive: form.isActive,
    });
  };

  const title = mode === 'create' ? 'Tạo plan mới' : 'Chỉnh sửa plan';

  return (
    <div className="plan-modal-overlay" onClick={onClose}>
      <div className="plan-modal" onClick={(event) => event.stopPropagation()}>
        <div className="plan-modal__header">
          <div>
            <p className="plan-modal__eyebrow">Admin / Plans</p>
            <h3 className="plan-modal__title">{title}</h3>
          </div>
          <button type="button" className="plan-icon-btn" onClick={onClose} aria-label="Đóng">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className="plan-modal__form" onSubmit={handleSubmit}>
          <div className="plan-field-grid">
            <label className="plan-field">
              <span className="plan-field__label">Tên plan</span>
              <input
                className="plan-input"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="Starter"
                maxLength={50}
                required
              />
            </label>

            <label className="plan-field">
              <span className="plan-field__label">Giá</span>
              <input
                className="plan-input"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => updateField('price', event.target.value)}
                placeholder="99"
                required
              />
            </label>
          </div>

          <label className="plan-field">
            <span className="plan-field__label">Mô tả</span>
            <textarea
              className="plan-textarea"
              rows="3"
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Basic plan for beginners"
              maxLength={500}
            />
          </label>

          <div className="plan-field-grid">
            <label className="plan-field">
              <span className="plan-field__label">Chu kỳ tính phí (ngày)</span>
              <input
                className="plan-input"
                type="number"
                min="1"
                step="1"
                value={form.billingCycleDays}
                onChange={(event) => updateField('billingCycleDays', event.target.value)}
                placeholder="30"
                required
              />
            </label>

            <label className="plan-field">
              <span className="plan-field__label">Trạng thái</span>
              <select
                className="plan-select"
                value={String(form.isActive)}
                onChange={(event) => updateField('isActive', event.target.value === 'true')}
              >
                <option value="true">Đang hoạt động</option>
                <option value="false">Tạm ngưng</option>
              </select>
            </label>
          </div>

          <div className="plan-field-grid">
            <label className="plan-field">
              <span className="plan-field__label">Số workspace tối đa</span>
              <input
                className="plan-input"
                type="number"
                min="1"
                step="1"
                value={form.maxWorkspaces}
                onChange={(event) => updateField('maxWorkspaces', event.target.value)}
                placeholder="1"
                required
              />
            </label>

            <label className="plan-field">
              <span className="plan-field__label">Số social accounts tối đa</span>
              <input
                className="plan-input"
                type="number"
                min="1"
                step="1"
                value={form.maxSocialAccounts}
                onChange={(event) => updateField('maxSocialAccounts', event.target.value)}
                placeholder="3"
                required
              />
            </label>
          </div>

          <label className="plan-field">
            <span className="plan-field__label">Giới hạn AI token</span>
            <input
              className="plan-input"
              type="number"
              min="0"
              step="1"
              value={form.aiTokenLimit}
              onChange={(event) => updateField('aiTokenLimit', event.target.value)}
              placeholder="10000"
              required
            />
          </label>

          <div className="plan-modal__actions">
            <button type="button" className="plan-button plan-button--ghost" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="plan-button plan-button--primary" disabled={isSaving}>
              {isSaving ? 'Đang lưu...' : mode === 'create' ? 'Tạo plan' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PlanFormModal;
