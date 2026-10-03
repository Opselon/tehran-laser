import { useState, useEffect } from 'react';
import type { AdminDashboardDto, AdminBookingDto } from '../../domain/api/dto.types';
import { formatJalaliDate } from '../../lib/datetime/jalali';

interface AdminDashboardProps {
  initialData?: AdminDashboardDto | undefined;
}

export function AdminDashboard({ initialData }: AdminDashboardProps) {
  const [data, setData] = useState<AdminDashboardDto | null>(initialData ?? null);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Rejection modal state
  const [rejectingBooking, setRejectingBooking] = useState<AdminBookingDto | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Fetch or refresh dashboard data (§247)
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
    if (!initialData) {
      refreshDashboard();
    }
  }, [initialData]);

  // Booking actions: accept, reject, complete, no-show
  const handleAccept = async (bookingId: string) => {
    setActionInProgress(bookingId);
    try {
      const res = await fetch(`/api/v1/admin/bookings/${bookingId}/accept`, {
        method: 'POST',
      });
      if (res.ok) {
        await refreshDashboard();
      } else {
        const err = (await res.json()) as any;
        alert(err.error?.message || 'خطا در تأیید نوبت.');
      }
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
        const err = (await res.json()) as any;
        alert(err.error?.message || 'خطا در رد نوبت.');
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
      const res = await fetch(`/api/v1/admin/bookings/${bookingId}/complete`, {
        method: 'POST',
      });
      if (res.ok) {
        await refreshDashboard();
      } else {
        const err = (await res.json()) as any;
        alert(err.error?.message || 'خطا در ثبت اتمام نوبت.');
      }
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
      const res = await fetch(`/api/v1/admin/bookings/${bookingId}/no-show`, {
        method: 'POST',
      });
      if (res.ok) {
        await refreshDashboard();
      } else {
        const err = (await res.json()) as any;
        alert(err.error?.message || 'خطا در تغییر وضعیت.');
      }
    } catch {
      alert('خطا در ارتباط با سرور.');
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="admin-section-block text-center p-5">
        <div className="empty-icon">⏳</div>
        <p className="empty-text">در حال بارگذاری اطلاعات عملیاتی روز کلینیک...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="admin-section-block text-center p-5" style={{ borderColor: 'rgba(239, 68, 68, 0.5)' }}>
        <div className="empty-icon">⚠️</div>
        <p className="empty-text text-danger mb-3">{error}</p>
        <button type="button" className="btn-3d-refresh" onClick={refreshDashboard}>
          تلاش مجدد
        </button>
      </div>
    );
  }

  const todayDateStr = data?.date || new Date().toISOString().slice(0, 10);
  const pendingBookings = data?.todayBookings.filter((b) => b.status === 'pending') || [];
  const scheduleBookings = data?.todayBookings || [];

  return (
    <div className="admin-dashboard-page">
      {/* 3D Dashboard Header Row */}
      <div className="dashboard-header-row">
        <div>
          <h1 className="admin-page-title">داشبورد عملیات کلینیک</h1>
          <div className="dashboard-date-badge">
            <span>📅 گزارش لحظه‌ای پذیرش — امروز:</span>
            <strong style={{ color: '#f5d77f' }}>{formatJalaliDate(todayDateStr)}</strong>
          </div>
        </div>
        <div className="actions">
          <button
            type="button"
            className="btn-3d-refresh"
            onClick={refreshDashboard}
            disabled={loading}
          >
            <span>{loading ? '⏳' : '🔄'}</span>
            <span>{loading ? 'در حال دریافت...' : 'تازه‌سازی داده‌ها'}</span>
          </button>
        </div>
      </div>

      {/* 3D KPI Summary Metric Cards Grid */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="metric-header">
            <span className="metric-title">نوبت‌های امروز</span>
            <div className="metric-icon-wrap">📅</div>
          </div>
          <div className="metric-number">{(data?.today.total ?? 0).toLocaleString('fa-IR')}</div>
          <div className="metric-footer">کل نوبت‌های ثبت‌شده امروز</div>
        </div>

        <div className="admin-metric-card highlight-warning">
          <div className="metric-header">
            <span className="metric-title">در انتظار تأیید</span>
            <div className="metric-icon-wrap">⏳</div>
          </div>
          <div className="metric-number">
            {(data?.counts.pendingBookings ?? 0).toLocaleString('fa-IR')}
          </div>
          <div className="metric-footer">نیازمند بررسی و تأیید منشی</div>
        </div>

        <div className="admin-metric-card highlight-success">
          <div className="metric-header">
            <span className="metric-title">نوبت‌های تأییدشده امروز</span>
            <div className="metric-icon-wrap">✅</div>
          </div>
          <div className="metric-number">
            {(data?.today.confirmed ?? 0).toLocaleString('fa-IR')}
          </div>
          <div className="metric-footer">آماده پذیرش و انجام خدمت</div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-header">
            <span className="metric-title">کل پرونده‌های مراجعین</span>
            <div className="metric-icon-wrap">👥</div>
          </div>
          <div className="metric-number">
            {(data?.counts.totalCustomers ?? 0).toLocaleString('fa-IR')}
          </div>
          <div className="metric-footer">مراجعین ثبت‌شده در سامانه</div>
        </div>
      </div>

      {/* Pending Approvals Section */}
      <div className="admin-section-block">
        <div className="section-block-header">
          <h2 className="section-block-title">
            <span>⚠️ نوبت‌های جدید در انتظار تأیید</span>
            <span style={{ fontSize: '0.85rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 10px', borderRadius: '999px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              {pendingBookings.length.toLocaleString('fa-IR')} مورد
            </span>
          </h2>
          <p className="section-block-sub">
            نوبت‌های ثبت‌شده آنلاین که پیش از مراجعه نیاز به تأیید پذیرش دارند
          </p>
        </div>

        {pendingBookings.length === 0 ? (
          <div className="empty-state-card">
            <span className="empty-icon">✨</span>
            <p className="empty-text">در حال حاضر نوبت در انتظار تأییدی وجود ندارد.</p>
          </div>
        ) : (
          <div className="pending-bookings-list">
            {pendingBookings.map((b) => {
              const timeStr = new Date(b.startsAt).toLocaleTimeString('fa-IR', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Tehran',
              });

              return (
                <div key={b.id} className="pending-booking-card">
                  <div>
                    <div className="card-top-row">
                      <div className="customer-info">
                        <span className="customer-name">{b.customer.name}</span>
                        <a href={`tel:${b.customer.phone}`} className="customer-phone" dir="ltr">
                          📞 {b.customer.phone}
                        </a>
                      </div>
                      <div className="booking-ref-badge" dir="ltr">{b.reference}</div>
                    </div>

                    <div className="card-meta-grid">
                      <div className="meta-item">
                        <strong>خدمت:</strong> {b.service.name}
                      </div>
                      <div className="meta-item">
                        <strong>بخش:</strong> {b.pricingCategory === 'female' ? 'بانوان' : 'آقایان'}
                      </div>
                      <div className="meta-item">
                        <strong>زمان:</strong> ساعت {timeStr}
                      </div>
                      <div className="meta-item">
                        <strong>مبلغ:</strong> {(b.quotedAmount * 1000).toLocaleString('fa-IR')} ت
                      </div>
                    </div>

                    {b.customerNote && (
                      <div className="customer-note-callout">
                        <strong>یادداشت مراجع:</strong> {b.customerNote}
                      </div>
                    )}
                  </div>

                  <div className="card-actions-row">
                    <button
                      type="button"
                      className="btn-3d-accept"
                      onClick={() => handleAccept(b.id)}
                      disabled={actionInProgress === b.id}
                    >
                      {actionInProgress === b.id ? 'در حال ثبت...' : '✓ تأیید نوبت'}
                    </button>
                    <button
                      type="button"
                      className="btn-3d-reject"
                      onClick={() => setRejectingBooking(b)}
                      disabled={actionInProgress === b.id}
                    >
                      ✕ رد نوبت
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Today View Timeline Table */}
      <div className="admin-section-block">
        <div className="section-block-header">
          <h2 className="section-block-title">
            <span>📋 برنامه زمانی نوبت‌های امروز</span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', background: 'rgba(148, 163, 184, 0.15)', padding: '2px 10px', borderRadius: '999px' }}>
              {scheduleBookings.length.toLocaleString('fa-IR')} نوبت
            </span>
          </h2>
          <p className="section-block-sub">لیست تمام نوبت‌های ثبت‌شده برای تاریخ امروز کلینیک</p>
        </div>

        {scheduleBookings.length === 0 ? (
          <div className="empty-state-card">
            <span className="empty-icon">🗓️</span>
            <p className="empty-text">برای امروز هنوز نوبتی ثبت نگردیده است.</p>
          </div>
        ) : (
          <div className="today-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ساعت نوبت</th>
                  <th>کد رهگیری</th>
                  <th>نام مراجع</th>
                  <th>شماره تماس</th>
                  <th>خدمت</th>
                  <th>بخش</th>
                  <th>وضعیت</th>
                  <th>عملیات پذیرش</th>
                </tr>
              </thead>
              <tbody>
                {scheduleBookings.map((b) => {
                  const timeStr = new Date(b.startsAt).toLocaleTimeString('fa-IR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Tehran',
                  });

                  return (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 800, color: '#f5d77f' }}>⏱ {timeStr}</td>
                      <td dir="ltr" style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{b.reference}</td>
                      <td style={{ fontWeight: 700 }}>{b.customer.name}</td>
                      <td dir="ltr">
                        <a href={`tel:${b.customer.phone}`} style={{ color: '#38bdf8', textDecoration: 'none' }}>
                          {b.customer.phone}
                        </a>
                      </td>
                      <td>{b.service.name}</td>
                      <td>{b.pricingCategory === 'female' ? 'بانوان' : 'آقایان'}</td>
                      <td>
                        <span className={`badge-status badge-status-${b.status}`}>
                          {b.status === 'confirmed' && 'تأییدشده'}
                          {b.status === 'pending' && 'در انتظار تأیید'}
                          {b.status === 'completed' && 'انجام‌شده'}
                          {b.status === 'cancelled' && 'لغوشده'}
                          {b.status === 'no_show' && 'عدم حضور'}
                          {b.status === 'rejected' && 'ردشده'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          {b.status === 'confirmed' && (
                            <>
                              <button
                                type="button"
                                className="btn-table-action"
                                style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}
                                onClick={() => handleComplete(b.id)}
                                disabled={actionInProgress === b.id}
                              >
                                ✓ انجام شد
                              </button>
                              <button
                                type="button"
                                className="btn-table-action"
                                style={{ borderColor: 'rgba(148, 163, 184, 0.3)', color: '#94a3b8' }}
                                onClick={() => handleNoShow(b.id)}
                                disabled={actionInProgress === b.id}
                              >
                                عدم حضور
                              </button>
                            </>
                          )}
                          {b.status === 'pending' && (
                            <button
                              type="button"
                              className="btn-table-action"
                              style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}
                              onClick={() => handleAccept(b.id)}
                              disabled={actionInProgress === b.id}
                            >
                              ✓ تأیید
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectingBooking && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <h3 className="modal-title">رد درخواست نوبت</h3>
            <p style={{ color: 'rgba(226, 232, 240, 0.7)', fontSize: '0.88rem', margin: '0 0 16px' }}>
              نوبت کد <strong dir="ltr" style={{ color: '#f5d77f' }}>{rejectingBooking.reference}</strong> مربوط به {rejectingBooking.customer.name}
            </p>

            <div>
              <label htmlFor="rejectionReasonInput" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                علت رد نوبت (اختیاری جهت درج در پرونده و پیامک):
              </label>
              <textarea
                id="rejectionReasonInput"
                className="form-control-modal"
                rows={3}
                placeholder="مثال: تکمیل ظرفیت پذیرش در این بازه زمانی..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              ></textarea>
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="btn-table-action"
                onClick={() => setRejectingBooking(null)}
              >
                انصراف
              </button>
              <button
                type="button"
                className="btn-3d-reject"
                onClick={handleConfirmReject}
                disabled={actionInProgress === rejectingBooking.id}
              >
                {actionInProgress === rejectingBooking.id ? 'در حال ثبت...' : 'تأیید و رد نوبت'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}