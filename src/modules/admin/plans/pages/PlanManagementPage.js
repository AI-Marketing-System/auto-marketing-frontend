import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../../../../config/env';
import { plansApi } from '../api/plansApi';
import PlanHeader from '../components/PlanHeader';
import PlanHero from '../components/PlanHero';
import PlanToolbar from '../components/PlanToolbar';
import PlanPlansTable from '../components/PlanPlansTable';
import PlanDetailPanel from '../components/PlanDetailPanel';
import PlanFormModal from '../components/PlanFormModal';
import { buildPlanPayload, normalizePlanList } from '../utils/planHelpers';
import '../styles/PlanManagementPage.css';
const EMPTY_PLAN = null;

function PlanManagementPage() {
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt-desc');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingPlan, setEditingPlan] = useState(EMPTY_PLAN);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await plansApi.getAll(API_BASE_URL);
      const loadedPlans = normalizePlanList(response?.data);
      setPlans(loadedPlans);
      setSelectedPlanId((current) => current || (loadedPlans[0]?.id ?? null));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) || plans[0] || null,
    [plans, selectedPlanId]
  );

  const stats = useMemo(() => {
    const activeCount = plans.filter((plan) => plan.isActive).length;
    const inactiveCount = plans.length - activeCount;
    const maxWorkspaces = plans.reduce((max, plan) => Math.max(max, Number(plan.maxWorkspaces || 0)), 0);

    return {
      total: plans.length,
      activeCount,
      inactiveCount,
      maxWorkspaces,
    };
  }, [plans]);

  const filteredPlans = useMemo(() => {
    const query = search.trim().toLowerCase();
    const sorted = [...plans].filter((plan) => {
      const matchesSearch =
        !query ||
        [plan.name, plan.description, String(plan.price), String(plan.billingCycleDays)]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && plan.isActive) ||
        (statusFilter === 'inactive' && !plan.isActive);

      return matchesSearch && matchesStatus;
    });

    sorted.sort((a, b) => {
      if (sortBy === 'price-asc') return Number(a.price || 0) - Number(b.price || 0);
      if (sortBy === 'price-desc') return Number(b.price || 0) - Number(a.price || 0);
      if (sortBy === 'name-asc') return String(a.name || '').localeCompare(String(b.name || ''));
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return sorted;
  }, [plans, search, statusFilter, sortBy]);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingPlan(EMPTY_PLAN);
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setModalMode('edit');
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleSavePlan = async (payload) => {
    setSaving(true);
    setErrorMessage('');

    try {
      if (modalMode === 'create') {
        await plansApi.create(buildPlanPayload(payload), API_BASE_URL);
      } else if (editingPlan) {
        await plansApi.update(editingPlan.id, buildPlanPayload(payload), API_BASE_URL);
      }

      setIsModalOpen(false);
      setEditingPlan(EMPTY_PLAN);
      await loadPlans();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (plan) => {
    const confirmed = window.confirm(`Xóa plan "${plan.name}"?`);
    if (!confirmed) {
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      await plansApi.remove(plan.id, API_BASE_URL);
      await loadPlans();
      if (selectedPlanId === plan.id) {
        setSelectedPlanId(null);
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="plan-page">
      <PlanHeader onRefresh={loadPlans} onCreatePlan={openCreateModal} />

      <main className="plan-shell">
        <PlanHero stats={stats} />

        {errorMessage ? <div className="plan-alert">{errorMessage}</div> : null}

        <PlanToolbar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />

        <section className="plan-content">
          {loading ? (
            <div className="plan-table-card">
              <div className="plan-empty-state">Đang tải dữ liệu...</div>
            </div>
          ) : (
            <>
              <PlanPlansTable
                plans={filteredPlans}
                selectedPlanId={selectedPlan?.id || null}
                onSelectPlan={setSelectedPlanId}
                onEditPlan={openEditModal}
                onDeletePlan={handleDeletePlan}
                isBusy={saving}
              />
              <PlanDetailPanel plan={selectedPlan} onEditPlan={openEditModal} />
            </>
          )}
        </section>
      </main>

      <PlanFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        plan={editingPlan}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSavePlan}
        isSaving={saving}
      />
    </div>
  );
}

export default PlanManagementPage;
