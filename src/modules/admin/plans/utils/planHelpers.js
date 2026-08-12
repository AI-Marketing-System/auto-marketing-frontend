export function formatCurrency(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(number);
}

export function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function resolvePlanBoolean(plan, keys) {
  for (const key of keys) {
    if (typeof plan?.[key] === 'boolean') {
      return plan[key];
    }
  }

  return true;
}

function resolvePlanDate(plan, keys) {
  for (const key of keys) {
    if (plan?.[key]) {
      return plan[key];
    }
  }

  return null;
}

export function normalizePlan(plan) {
  if (!plan) {
    return plan;
  }

  const createdAt = resolvePlanDate(plan, ['createdAt', 'created_at', 'createdDate', 'created_date']);

  return {
    ...plan,
    isActive: resolvePlanBoolean(plan, ['isActive', 'active', 'enabled']),
    createdAt,
  };
}

export function normalizePlanList(plans) {
  return Array.isArray(plans) ? plans.map(normalizePlan) : [];
}

export function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'PL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function buildPlanPayload(payload) {
  return {
    name: payload.name,
    description: payload.description,
    price: Number(payload.price),
    billingCycleDays: Number(payload.billingCycleDays),
    maxWorkspaces: Number(payload.maxWorkspaces),
    maxSocialAccounts: Number(payload.maxSocialAccounts),
    aiTokenLimit: Number(payload.aiTokenLimit),
    isActive: payload.isActive,
  };
}
