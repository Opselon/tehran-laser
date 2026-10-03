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
      <div className="admin-loading-state p-5 text-center">
        <div className="spinner mb-3"></div>
        <p className="text-muted">در حال فراخوانی اطلاعات روز کلینیک...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="alert alert-danger m-4">
        <span>{error}</span>
        <button type="button" className="btn btn-outline btn-sm mr-auto" onClick={refreshDashboard}>
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
      {/* Top Header Row */}
      <div className="dashboard-header-row mb-4">
        <div>
          <h1 className="admin-page-title text-xl font-bold">داشبورد عملیات کلینیک</h1>
          <p className="text-muted small">
            گزارش لحظه‌ای پذیرش — امروز: {formatJalaliDate(todayDateStr)}
          </p>
        </div>
        <div className="actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={refreshDashboard}
            disabled={loading}
          >
            {loading ? 'در حال به‌روزرسانی...' : '🔄 تازه‌سازی داده‌ها'}
          </button>
        </div>
      </div>

      {/* KPI Summary Metric Cards (§22) */}
      <div className="admin-metrics-grid mb-5">
        <div className="admin-metric-card">
          <div className="metric-header">
            <span className="metric-title">نوبت‌های امروز</span>
            <span className="metric-icon">📅</span>
          </div>
          <div className="metric-number">{(data?.today.total ?? 0).toLocaleString('fa-IR')}</div>
          <div className="metric-footer text-muted small">کل نوبت‌های ثبت‌شده امروز</div>
        </div>

        <div className="admin-metric-card highlight-warning">
          <div className="metric-header">
            <span className="metric-title">در انتظار تأیید</span>
            <span className="metric-icon">⏳</span>
          </div>
          <div className="metric-number text-warning">
            {(data?.counts.pendingBookings ?? 0).toLocaleString('fa-IR')}
          </div>
          <div className="metric-footer text-muted small">نیازمند بررسی و تأیید منشی</div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-header">
            <span className="metric-title">نوبت‌های تأییدشده امروز</span>
            <span className="metric-icon">✅</span>
          </div>
          <div className="metric-number text-success">
            {(data?.today.confirmed ?? 0).toLocaleString('fa-IR')}
          </div>
          <div className="metric-footer text-muted small">آماده پذیرش و انجام خدمت</div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-header">
            <span className="metric-title">کل پرونده‌های مراجعین</span>
            <span className="metric-icon">👥</span>
          </div>
          <div className="metric-number">
            {(data?.counts.totalCustomers ?? 0).toLocaleString('fa-IR')}
          </div>
          <div className="metric-footer text-muted small">مراجعین ثبت‌شده در سامانه</div>
        </div>
      </div>

      {/* Pending Approvals Section (§25) */}
      <div className="admin-section-block mb-5">
        <div className="section-block-header">
          <h2 className="section-block-title font-bold text-lg">
            ⚠️ نوبت‌های جدید در انتظار تأیید ({pendingBookings.length.toLocaleString('fa-IR')})
          </h2>
          <p className="text-muted small">
            نوبت‌های ثبت‌شده آنلاین که پیش از مراجعه نیاز به تأیید پذیرش دارند
          </p>
        </div>

        {pendingBookings.length === 0 ? (
          <div className="empty-state-card text-center p-4">
            <span className="empty-icon text-2xl">✨</span>
            <p className="text-muted mt-2 mb-0">در حال حاضر نوبت در انتظار تأییدی وجود ندارد.</p>
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
                  <div className="card-top-row">
                    <div className="customer-info">
                      <span className="customer-name font-bold">{b.customer.name}</span>
                      <a href={`tel:${b.customer.phone}`} className="customer-phone" dir="ltr">
                        {b.customer.phone}
                      </a>
                    </div>
                    <div className="booking-ref-badge" dir="ltr">{b.reference}</div>
                  </div>

                  <div className="card-meta-row mt-2">
                    <span className="meta-item">
                      <strong>خدمت:</strong> {b.service.name}
                    </span>
                    <span className="meta-item">
                      <strong>بخش:</strong> {b.pricingCategory === 'female' ? 'بانوان' : 'آقایان'}
                    </span>
                    <span className="meta-item">
                      <strong>زمان:</strong> {formatJalaliDate(b.startsAt.slice(0, 10))} ساعت {timeStr}
                    </span>
                    <span className="meta-item">
                      <strong>مبلغ:</strong> {(b.quotedAmount * 1000).toLocaleString('fa-IR')} تومان
                      {b.discountAmount > 0 && ` (تخفیف: ${(b.discountAmount * 1000).toLocaleString('fa-IR')})`}
                    </span>
                  </div>

                  {b.customerNote && (
                    <div className="customer-note-callout mt-2">
                      <span className="note-label">یادداشت مراجع:</span> {b.customerNote}
                    </div>
                  )}

                  <div className="card-actions-row mt-3">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm ml-2"
                      onClick={() => handleAccept(b.id)}
                      disabled={actionInProgress === b.id}
                    >
                      {actionInProgress === b.id ? 'در حال ثبت...' : '✓ تأیید نوبت'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm btn-danger ml-2"
                      onClick={() => setRejectingBooking(b)}
                      disabled={actionInProgress === b.id}
                    >
                      ✕ رد درخواست
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Today View Timeline (§24) */}
      <div className="admin-section-block">
        <div className="section-block-header">
          <h2 className="section-block-title font-bold text-lg">
            📋 برنامه زمانی نوبت‌های امروز ({scheduleBookings.length.toLocaleString('fa-IR')})
          </h2>
          <p className="text-muted small">لیست تمام نوبت‌های ثبت‌شده برای تاریخ امروز</p>
        </div>

        {scheduleBookings.length === 0 ? (
          <div className="empty-state-card text-center p-4">
            <p className="text-muted mb-0">برای امروز هنوز نوبتی ثبت نگردیده است.</p>
          </div>
        ) : (
          <div className="today-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ساعت</th>
                  <th>کد رزرو</th>
                  <th>نام مراجع</th>
                  <th>شماره تماس</th>
                  <th>خدمت</th>
                  <th>بخش</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
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
                      <td className="font-bold">⏱ {timeStr}</td>
                      <td dir="ltr" className="font-mono small">{b.reference}</td>
                      <td>{b.customer.name}</td>
                      <td dir="ltr">
                        <a href={`tel:${b.customer.phone}`}>{b.customer.phone}</a>
                      </td>
                      <td>{b.service.name}</td>
                      <td>{b.pricingCategory === 'female' ? 'بانوان' : 'آقایان'}</td>
                      <td>
                        <span className={`badge badge-status-${b.status}`}>
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
                                className="btn btn-outline btn-sm ml-1"
                                onClick={() => handleComplete(b.id)}
                                disabled={actionInProgress === b.id}
                              >
                                انجام شد
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm btn-muted"
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
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAccept(b.id)}
                              disabled={actionInProgress === b.id}
                            >
                              تأیید
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
            <h3 className="modal-title font-bold text-lg mb-2">رد درخواست نوبت</h3>
            <p className="text-muted small mb-3">
              نوبت کد <strong dir="ltr">{rejectingBooking.reference}</strong> مربوط به {rejectingBooking.customer.name}
            </p>

            <div className="form-group mb-3">
              <label htmlFor="rejectionReasonInput" className="form-label">
                علت رد نوبت (اختیاری جهت درج در پرونده و پیامک):
              </label>
              <textarea
                id="rejectionReasonInput"
                className="form-control"
                rows={3}
                placeholder="مثال: تکمیل ظرفیت پذیرش در این بازه زمانی..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              ></textarea>
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="btn btn-outline ml-2"
                onClick={() => setRejectingBooking(null)}
              >
                انصراف
              </button>
              <button
                type="button"
                className="btn btn-primary btn-danger"
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
