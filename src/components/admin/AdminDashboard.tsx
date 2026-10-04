import { useState, useEffect, useMemo } from 'react';
import type { AdminDashboardDto, AdminBookingDto } from '../../domain/api/dto.types';
import { formatJalaliDate } from '../../lib/datetime/jalali';
import { IconReact } from '../ui/IconReact';

interface AdminDashboardProps {
  initialData?: AdminDashboardDto | undefined;
}

const QUICK_ACTIONS = [
  { href: '/admin/walkin', icon: 'walkin', label: 'پذیرش فوری و جلسه بعد', sub: 'ثبت حضوری سریع' },
  { href: '/admin/calendar', icon: 'calendar', label: 'تقویم جامع نوبت‌ها', sub: 'برنامه روزانه و شیفت' },
  { href: '/admin/bookings', icon: 'bookings', label: 'مدیریت کل نوبت‌ها', sub: 'جستجو، لغو و ویرایش' },
  { href: '/admin/crm', icon: 'crm', label: 'پرونده بالینی و CRM', sub: 'سوابق جلسات و درمان' },
  { href: '/admin/customers', icon: 'customers', label: 'بانک مراجعین', sub: 'اطلاعات بیماران و نوت' },
  { href: '/admin/accounting', icon: 'accounting', label: 'حسابداری و صندوق', sub: 'تراکنش‌ها و دخل روز' },
  { href: '/admin/sms', icon: 'sms', label: 'پنل پیامک اطلاع‌رسانی', sub: 'یادآوری و پیامک نوبت' },
] as const;

function getStatusBadge(status: string) {
  switch (status) {
    case 'confirmed': return { text: 'تأییدشده', icon: 'checkCircle' as const, cls: 'badge-status-confirmed' };
    case 'pending': return { text: 'در انتظار تأیید', icon: 'clock' as const, cls: 'badge-status-pending' };
    case 'completed': return { text: 'انجام‌شده', icon: 'check' as const, cls: 'badge-status-completed' };
    case 'cancelled': return { text: 'لغوشده', icon: 'close' as const, cls: 'badge-status-cancelled' };
    case 'no_show': return { text: 'عدم حضور', icon: 'x' as const, cls: 'badge-status-no_show' };
    case 'rejected': return { text: 'ردشده', icon: 'close' as const, cls: 'badge-status-rejected' };
    default: return { text: status, icon: 'clock' as const, cls: 'badge-status-pending' };
  }
}

export function AdminDashboard({ initialData }: AdminDashboardProps) {
  const [data, setData] = useState<AdminDashboardDto | null>(initialData ?? null);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [rejectingBooking, setRejectingBooking] = useState<AdminBookingDto | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'other'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const refreshDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/dashboard');
      const json = (await res.json()) as any;
      if (res.ok && json.data) {
        setData(json.data);
      } else {
        setError(json.error?.message || 'خطا در دریافت اطلاعات داشبورد.');
      }
    } catch {
      setError('خطای ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) refreshDashboard();
  }, [initialData]);

  const handleAccept = async (bookingId: string) => {
    setActionInProgress(bookingId);
    try {
      const res = await fetch(`/api/v1/admin/bookings/${bookingId}/accept`, { method: 'POST' });
      if (res.ok) await refreshDashboard();
      else alert(((await res.json()) as any).error?.message || 'خطا در تأیید نوبت.');
    } catch {
      alert('خطا در برقراری ارتباط با سرور.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingBooking) return;
    const bookingId = rejectingBooking.id;
    setActionInProgress(bookingId);
    try {
      const res = await fetch(`/api/v1/admin/bookings/${bookingId}/reject`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason.trim() || undefined }),
      });
      if (res.ok) {
        setRejectingBooking(null);
        setRejectionReason('');
        await refreshDashboard();
      } else {
        alert(((await res.json()) as any).error?.message || 'خطا در رد نوبت.');
      }
    } catch {
      alert('خطا در ارتباط با سرور.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleComplete = async (bookingId: string) => {
    setActionInProgress(bookingId);
    try {
      const res = await fetch(`/api/v1/admin/bookings/${bookingId}/complete`, { method: 'POST' });
      if (res.ok) await refreshDashboard();
      else alert(((await res.json()) as any).error?.message || 'خطا در ثبت اتمام نوبت.');
    } catch {
      alert('خطا در ارتباط با سرور.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleNoShow = async (bookingId: string) => {
    if (!confirm('آیا وضعیت این نوبت به عدم حضور تغییر یابد؟')) return;
    setActionInProgress(bookingId);
    try {
      const res = await fetch(`/api/v1/admin/bookings/${bookingId}/no-show`, { method: 'POST' });
      if (res.ok) await refreshDashboard();
      else alert(((await res.json()) as any).error?.message || 'خطا در تغییر وضعیت.');
    } catch {
      alert('خطا در ارتباط با سرور.');
    } finally {
      setActionInProgress(null);
    }
  };

  const scheduleBookings = data?.todayBookings || [];
  const pendingBookings = useMemo(() => scheduleBookings.filter((b) => b.status === 'pending'), [scheduleBookings]);

  const metrics = useMemo(() => {
    const total = data?.today.total ?? scheduleBookings.length;
    const confirmed = data?.today.confirmed ?? scheduleBookings.filter((b) => b.status === 'confirmed').length;
    const pending = data?.counts.pendingBookings ?? data?.today.pending ?? pendingBookings.length;
    const completed = scheduleBookings.filter((b) => b.status === 'completed').length;
    const totalCustomers = data?.counts.totalCustomers ?? 0;
    const activeServices = data?.counts.activeServices ?? 0;
    const fulfillmentRate = total > 0 ? Math.min(100, Math.round(((confirmed + completed) / total) * 100)) : 0;

    const serviceCounts: Record<string, number> = {};
    scheduleBookings.forEach((b) => {
      const sName = b.service.name || 'سایر';
      serviceCounts[sName] = (serviceCounts[sName] || 0) + 1;
    });

    const topServices = Object.entries(serviceCounts)
      .map(([name, count]) => ({ name, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    const femaleCount = scheduleBookings.filter((b) => b.pricingCategory === 'female').length;
    const maleCount = scheduleBookings.filter((b) => b.pricingCategory === 'male').length;
    const femalePct = total > 0 ? Math.round((femaleCount / total) * 100) : 50;
    const malePct = total > 0 ? Math.round((maleCount / total) * 100) : 50;

    return { total, confirmed, pending, completed, totalCustomers, activeServices, fulfillmentRate, topServices, femaleCount, maleCount, femalePct, malePct };
  }, [data, scheduleBookings, pendingBookings]);

  const filteredBookings = useMemo(() => {
    return scheduleBookings.filter((b) => {
      if (statusFilter === 'pending' && b.status !== 'pending') return false;
      if (statusFilter === 'confirmed' && b.status !== 'confirmed') return false;
      if (statusFilter === 'completed' && b.status !== 'completed') return false;
      if (statusFilter === 'other' && !['cancelled', 'no_show', 'rejected'].includes(b.status)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return b.customer.name.toLowerCase().includes(q) || b.customer.phone.toLowerCase().includes(q) || b.reference.toLowerCase().includes(q) || b.service.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [scheduleBookings, statusFilter, searchQuery]);

  if (loading && !data) {
    return (
      <div className="admin-section-block text-center p-5">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <IconReact name="refresh" size={32} className="spin-icon" style={{ color: '#d4af37' }} />
        </div>
        <p className="empty-text">در حال بارگذاری اطلاعات عملیاتی روز کلینیک...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="admin-section-block text-center p-5" style={{ borderColor: 'rgba(239, 68, 68, 0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <IconReact name="warning" size={36} style={{ color: '#ef4444' }} />
        </div>
        <p className="empty-text text-danger mb-3">{error}</p>
        <button type="button" className="btn-3d-refresh" onClick={refreshDashboard}>
          <IconReact name="refresh" size={16} />
          <span>تلاش مجدد</span>
        </button>
      </div>
    );
  }

  const todayDateStr = data?.date || new Date().toISOString().slice(0, 10);
  const metricCards = [
    { title: 'نوبت‌های امروز', val: metrics.total, sub: 'کل نوبت‌های ثبت‌شده امروز', icon: 'calendar' as const, color: '#f5d77f', cls: '' },
    { title: 'در انتظار تأیید', val: metrics.pending, sub: 'نیازمند بررسی و تأیید منشی', icon: 'clock' as const, color: '#f59e0b', cls: metrics.pending > 0 ? 'highlight-amber' : '' },
    { title: 'نوبت‌های تأییدشده', val: metrics.confirmed, sub: 'آماده پذیرش و انجام خدمت', icon: 'checkCircle' as const, color: '#10b981', cls: 'highlight-emerald' },
    { title: 'کل پرونده‌ها', val: metrics.totalCustomers, sub: 'مراجعین ثبت‌شده در سامانه', icon: 'users' as const, color: '#38bdf8', cls: '' },
    { title: 'خدمات فعال', val: metrics.activeServices, sub: 'پکیج‌ها و خدمات کلینیک', icon: 'sparkles' as const, color: '#a78bfa', cls: '' },
  ];

  const renderActions = (b: AdminBookingDto, isCompact = false) => (
    <div className="table-actions">
      {b.status === 'confirmed' && (
        <>
          <button type="button" className="btn-table-action" style={{ borderColor: 'rgba(16,185,129,0.4)', color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: 4 }} onClick={() => handleComplete(b.id)} disabled={actionInProgress === b.id}>
            <IconReact name="check" size={isCompact ? 12 : 13} />
            <span>{isCompact ? 'اتمام' : 'انجام شد'}</span>
          </button>
          <button type="button" className="btn-table-action" style={{ borderColor: 'rgba(148,163,184,0.3)', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: 4 }} onClick={() => handleNoShow(b.id)} disabled={actionInProgress === b.id}>
            <IconReact name="close" size={isCompact ? 12 : 13} />
            <span>عدم حضور</span>
          </button>
        </>
      )}
      {b.status === 'pending' && (
        <button type="button" className="btn-table-action" style={{ borderColor: 'rgba(245,158,11,0.4)', color: '#fbbf24', display: 'inline-flex', alignItems: 'center', gap: 4 }} onClick={() => handleAccept(b.id)} disabled={actionInProgress === b.id}>
          <IconReact name="check" size={isCompact ? 12 : 13} />
          <span>تأیید</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="admin-dashboard-page">
      {/* 3D Dashboard Header Row */}
      <div className="dashboard-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <h1 className="admin-page-title" style={{ margin: 0 }}>داشبورد عملیات کلینیک</h1>
            <span className="dashboard-live-indicator"><span className="live-dot-pulse" /><span>سیستم آنلاین</span></span>
          </div>
          <div className="dashboard-date-badge" style={{ marginTop: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <IconReact name="calendar" size={15} style={{ color: '#d4af37' }} />
              <span>گزارش لحظه‌ای پذیرش — امروز:</span>
            </span>
            <strong style={{ color: '#f5d77f' }}>{formatJalaliDate(todayDateStr)}</strong>
          </div>
        </div>
        <div className="actions">
          <button type="button" className="btn-3d-refresh" onClick={refreshDashboard} disabled={loading}>
            <IconReact name="refresh" size={16} className={loading ? 'spin-icon' : ''} />
            <span>{loading ? 'در حال دریافت...' : 'تازه‌سازی داده‌ها'}</span>
          </button>
        </div>
      </div>

      {/* 3D Quick Actions Hub */}
      <section className="quick-actions-section" aria-label="دسترسی سریع به بخش‌ها">
        <div className="quick-actions-header">
          <h2 className="quick-actions-title"><IconReact name="lightning" size={18} /><span>دسترسی سریع به عملیات کلینیک</span></h2>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>میانبرهای پرتکرار منشی و پذیرش</span>
        </div>
        <div className="quick-actions-grid">
          {QUICK_ACTIONS.map((a) => (
            <a key={a.href} href={a.href} className="quick-action-card-3d">
              <div className="quick-action-icon-wrap"><IconReact name={a.icon as any} size={18} /></div>
              <div className="quick-action-texts"><span className="quick-action-label">{a.label}</span><span className="quick-action-sub">{a.sub}</span></div>
            </a>
          ))}
        </div>
      </section>

      {/* 3D KPI Summary Metric Cards Grid */}
      <section className="admin-metrics-grid-5" aria-label="شاخص‌های کلیدی">
        {metricCards.map((m) => (
          <div key={m.title} className={`admin-metric-card-3d ${m.cls}`}>
            <div className="metric-header"><span className="metric-title">{m.title}</span><div className="metric-icon-wrap" style={{ color: m.color }}><IconReact name={m.icon} size={20} /></div></div>
            <div className="metric-number" style={{ color: m.color !== '#f5d77f' ? m.color : undefined }}>{m.val.toLocaleString('fa-IR')}</div>
            <div className="metric-footer">{m.sub}</div>
          </div>
        ))}
      </section>

      {/* 3D Analytics & Distribution */}
      <section className="analytics-section-grid" aria-label="تحلیل و توزیع ظرفیت">
        <div className="analytics-card-3d">
          <div className="quick-actions-header" style={{ marginBottom: 0 }}>
            <h3 className="analytics-card-title"><IconReact name="chart" size={18} style={{ color: '#f5d77f' }} /><span>پیشرفت و نرخ تکمیل ظرفیت روز</span></h3>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f5d77f' }}>{metrics.fulfillmentRate.toLocaleString('fa-IR')}٪</span>
          </div>
          <div className="gauge-track-3d"><div className="gauge-fill-3d" style={{ width: `${metrics.fulfillmentRate}%` }} /></div>
          <div className="gauge-stats-row">
            <span>تأییدشده: {metrics.confirmed.toLocaleString('fa-IR')}</span>
            <span>انجام‌شده: {metrics.completed.toLocaleString('fa-IR')}</span>
            <span>در انتظار: {metrics.pending.toLocaleString('fa-IR')}</span>
            <span>کل: {metrics.total.toLocaleString('fa-IR')} نوبت</span>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 10 }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 8 }}>تفکیک مراجعین بر اساس بخش:</span>
            <div className="demographics-row">
              <div className="demographic-pill female"><span>بخش بانوان:</span><strong>{metrics.femaleCount.toLocaleString('fa-IR')} ({metrics.femalePct.toLocaleString('fa-IR')}٪)</strong></div>
              <div className="demographic-pill male"><span>بخش آقایان:</span><strong>{metrics.maleCount.toLocaleString('fa-IR')} ({metrics.malePct.toLocaleString('fa-IR')}٪)</strong></div>
            </div>
          </div>
        </div>

        <div className="analytics-card-3d">
          <div className="quick-actions-header" style={{ marginBottom: 0 }}>
            <h3 className="analytics-card-title"><IconReact name="sparkles" size={18} style={{ color: '#38bdf8' }} /><span>توزیع خدمات نوبت‌های امروز</span></h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>حجم درخواست</span>
          </div>
          {metrics.topServices.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: '#64748b', textAlign: 'center', margin: 'auto 0' }}>هنوز داده‌ای برای خدمات امروز ثبت نشده است.</p>
          ) : (
            <div className="service-breakdown-list">
              {metrics.topServices.map((srv) => (
                <div key={srv.name} className="service-item-row">
                  <div className="service-item-header"><span className="service-item-name">{srv.name}</span><span className="service-item-count">{srv.count.toLocaleString('fa-IR')} نوبت ({srv.pct.toLocaleString('fa-IR')}٪)</span></div>
                  <div className="service-bar-track"><div className="service-bar-fill" style={{ width: `${Math.max(8, srv.pct)}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Pending Approvals Section */}
      <section className="admin-section-block" aria-label="کارتابل تأیید نوبت‌ها">
        <div className="section-block-header">
          <h2 className="section-block-title">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <IconReact name="warning" size={20} style={{ color: '#f59e0b' }} />
              <span>نوبت‌های جدید در انتظار تأیید</span>
            </span>
            <span style={{ fontSize: '0.82rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 10px', borderRadius: '999px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              {pendingBookings.length.toLocaleString('fa-IR')} مورد
            </span>
          </h2>
          <p className="section-block-sub">نوبت‌های ثبت‌شده آنلاین که پیش از مراجعه نیاز به تأیید پذیرش دارند</p>
        </div>

        {pendingBookings.length === 0 ? (
          <div className="empty-state-card">
            <span className="empty-icon" style={{ display: 'flex', justifyContent: 'center' }}><IconReact name="sparkles" size={32} style={{ color: '#d4af37' }} /></span>
            <p className="empty-text">در حال حاضر نوبت در انتظار تأییدی وجود ندارد و همه پذیرش‌ها بررسی شده‌اند.</p>
          </div>
        ) : (
          <div className="pending-bookings-list">
            {pendingBookings.map((b) => {
              const timeStr = new Date(b.startsAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tehran' });
              return (
                <div key={b.id} className="pending-booking-card">
                  <div>
                    <div className="card-top-row">
                      <div className="customer-info"><span className="customer-name">{b.customer.name}</span><a href={`tel:${b.customer.phone}`} className="customer-phone" dir="ltr"><IconReact name="phone" size={13} /><span>{b.customer.phone}</span></a></div>
                      <div className="booking-ref-badge" dir="ltr">{b.reference}</div>
                    </div>
                    <div className="card-meta-grid">
                      <div className="meta-item"><strong>خدمت:</strong> {b.service.name}</div>
                      <div className="meta-item"><strong>بخش:</strong> {b.pricingCategory === 'female' ? 'بانوان' : 'آقایان'}</div>
                      <div className="meta-item"><strong>زمان:</strong><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconReact name="clock" size={13} /> ساعت {timeStr}</span></div>
                      <div className="meta-item"><strong>مبلغ:</strong> {(b.quotedAmount * 1000).toLocaleString('fa-IR')} ت</div>
                    </div>
                    {b.customerNote && <div className="customer-note-callout"><strong>یادداشت مراجع:</strong> {b.customerNote}</div>}
                  </div>
                  <div className="card-actions-row">
                    <button type="button" className="btn-3d-accept" onClick={() => handleAccept(b.id)} disabled={actionInProgress === b.id}><IconReact name="check" size={15} /><span>{actionInProgress === b.id ? 'در حال ثبت...' : 'تأیید نوبت'}</span></button>
                    <button type="button" className="btn-3d-reject" onClick={() => setRejectingBooking(b)} disabled={actionInProgress === b.id}><IconReact name="x" size={15} /><span>رد نوبت</span></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Today View Timeline Table & Toolbar */}
      <section className="admin-section-block" aria-label="برنامه نوبت‌های امروز">
        <div className="section-block-header">
          <h2 className="section-block-title">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconReact name="bookings" size={20} style={{ color: '#d4af37' }} /><span>برنامه زمانی نوبت‌های امروز</span></span>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8', background: 'rgba(148, 163, 184, 0.15)', padding: '2px 10px', borderRadius: '999px' }}>{filteredBookings.length.toLocaleString('fa-IR')} نوبت</span>
          </h2>
          <p className="section-block-sub">لیست کامل نوبت‌های ثبت‌شده برای شیفت‌های امروز کلینیک تهران لیزر</p>
        </div>

        {/* Interactive Filter & Search Toolbar */}
        <div className="schedule-toolbar">
          <div className="schedule-search-box">
            <div className="schedule-search-icon"><IconReact name="search" size={16} /></div>
            <input type="text" className="schedule-search-input" placeholder="جستجو بر اساس نام، موبایل، کد رهگیری یا خدمت..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <div className="schedule-filter-tabs">
            {([
              { id: 'all', label: 'همه' },
              { id: 'pending', label: 'در انتظار' },
              { id: 'confirmed', label: 'تأییدشده' },
              { id: 'completed', label: 'انجام‌شده' },
              { id: 'other', label: 'لغو / عدم حضور' },
            ] as const).map((tab) => (
              <button key={tab.id} type="button" className={`filter-chip-btn ${statusFilter === tab.id ? 'active' : ''}`} onClick={() => setStatusFilter(tab.id)}>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <button type="button" className="view-switch-btn" onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')} title="تغییر نمای جدول / کارت">
            <IconReact name={viewMode === 'table' ? 'list' : 'desktop'} size={15} />
            <span>{viewMode === 'table' ? 'نمای کارتی' : 'نمای جدولی'}</span>
          </button>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="empty-state-card" style={{ marginTop: 14 }}>
            <span className="empty-icon" style={{ display: 'flex', justifyContent: 'center' }}><IconReact name="calendar" size={32} style={{ color: '#d4af37' }} /></span>
            <p className="empty-text">{searchQuery || statusFilter !== 'all' ? 'موردی متناسب با فیلترهای جستجوی شما یافت نشد.' : 'برای امروز هنوز نوبتی ثبت نگردیده است.'}</p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="today-table-wrapper" style={{ marginTop: 14 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ساعت</th><th>کد رهگیری</th><th>نام مراجع</th><th>شماره تماس</th><th>خدمت</th><th>بخش</th><th>وضعیت</th><th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => {
                  const timeStr = new Date(b.startsAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tehran' });
                  const badge = getStatusBadge(b.status);
                  return (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 800, color: '#f5d77f', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconReact name="clock" size={13} /><span>{timeStr}</span></span>
                      </td>
                      <td dir="ltr" style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{b.reference}</td>
                      <td style={{ fontWeight: 700 }}>{b.customer.name}</td>
                      <td dir="ltr"><a href={`tel:${b.customer.phone}`} style={{ color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconReact name="phone" size={12} /><span>{b.customer.phone}</span></a></td>
                      <td>{b.service.name}</td>
                      <td>{b.pricingCategory === 'female' ? 'بانوان' : 'آقایان'}</td>
                      <td><span className={`badge-status ${badge.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><IconReact name={badge.icon} size={13} /><span>{badge.text}</span></span></td>
                      <td>{renderActions(b)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="schedule-cards-grid">
            {filteredBookings.map((b) => {
              const timeStr = new Date(b.startsAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tehran' });
              const badge = getStatusBadge(b.status);
              return (
                <div key={b.id} className="schedule-card-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: '#f5d77f', display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconReact name="clock" size={14} /> ساعت {timeStr}</span>
                    <span className={`badge-status ${badge.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconReact name={badge.icon} size={12} /><span>{badge.text}</span></span>
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.95rem', display: 'block', marginBottom: 2 }}>{b.customer.name}</strong>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
                      <span>{b.service.name} ({b.pricingCategory === 'female' ? 'بانوان' : 'آقایان'})</span>
                      <a href={`tel:${b.customer.phone}`} style={{ color: '#38bdf8', textDecoration: 'none' }} dir="ltr">{b.customer.phone}</a>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <span dir="ltr" style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#64748b' }}>{b.reference}</span>
                    {renderActions(b, true)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Reject Modal */}
      {rejectingBooking && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconReact name="warning" size={20} style={{ color: '#ef4444' }} /><span>رد درخواست نوبت</span>
            </h3>
            <p style={{ color: 'rgba(226, 232, 240, 0.7)', fontSize: '0.88rem', margin: '0 0 16px' }}>
              نوبت کد <strong dir="ltr" style={{ color: '#f5d77f' }}>{rejectingBooking.reference}</strong> مربوط به {rejectingBooking.customer.name}
            </p>
            <div>
              <label htmlFor="rejectionReasonInput" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                علت رد نوبت (اختیاری جهت درج در پرونده و اطلاع‌رسانی):
              </label>
              <textarea id="rejectionReasonInput" className="form-control-modal" rows={3} placeholder="مثال: تکمیل ظرفیت پذیرش در این بازه زمانی..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
            </div>
            <div className="modal-actions-row">
              <button type="button" className="btn-table-action" onClick={() => setRejectingBooking(null)}>انصراف</button>
              <button type="button" className="btn-3d-reject" onClick={handleConfirmReject} disabled={actionInProgress === rejectingBooking.id}>
                <IconReact name="x" size={15} /><span>{actionInProgress === rejectingBooking.id ? 'در حال ثبت...' : 'تأیید و رد نوبت'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

