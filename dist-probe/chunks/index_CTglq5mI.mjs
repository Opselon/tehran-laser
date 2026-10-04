globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll, r as __toESM } from "./rolldown-runtime_BDykq6kg.mjs";
import { h as maybeRenderHead, m as renderTemplate, s as renderComponent } from "./console_B-OutPbu.mjs";
import { t as require_react } from "./react_BpCRmogb.mjs";
import { t as createComponent } from "./compiler_DMFKJ3NJ.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CnBsXFHB.mjs";
import { t as formatJalaliDate } from "./jalali_Dqia3IuY.mjs";
import { i as getAdminDashboard } from "./repositories_B3hzhjEm.mjs";
import { n as require_jsx_runtime, t as IconReact } from "./IconReact_dVhAhHG5.mjs";
import { env } from "cloudflare:workers";
//#region src/components/admin/AdminDashboard.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var QUICK_ACTIONS = [
	{
		href: "/admin/walkin",
		icon: "walkin",
		label: "پذیرش فوری و جلسه بعد",
		sub: "ثبت حضوری سریع"
	},
	{
		href: "/admin/calendar",
		icon: "calendar",
		label: "تقویم جامع نوبت‌ها",
		sub: "برنامه روزانه و شیفت"
	},
	{
		href: "/admin/bookings",
		icon: "bookings",
		label: "مدیریت کل نوبت‌ها",
		sub: "جستجو، لغو و ویرایش"
	},
	{
		href: "/admin/crm",
		icon: "crm",
		label: "پرونده بالینی و CRM",
		sub: "سوابق جلسات و درمان"
	},
	{
		href: "/admin/customers",
		icon: "customers",
		label: "بانک مراجعین",
		sub: "اطلاعات بیماران و نوت"
	},
	{
		href: "/admin/accounting",
		icon: "accounting",
		label: "حسابداری و صندوق",
		sub: "تراکنش‌ها و دخل روز"
	},
	{
		href: "/admin/sms",
		icon: "sms",
		label: "پنل پیامک اطلاع‌رسانی",
		sub: "یادآوری و پیامک نوبت"
	}
];
function getStatusBadge(status) {
	switch (status) {
		case "confirmed": return {
			text: "تأییدشده",
			icon: "checkCircle",
			cls: "badge-status-confirmed"
		};
		case "pending": return {
			text: "در انتظار تأیید",
			icon: "clock",
			cls: "badge-status-pending"
		};
		case "completed": return {
			text: "انجام‌شده",
			icon: "check",
			cls: "badge-status-completed"
		};
		case "cancelled": return {
			text: "لغوشده",
			icon: "close",
			cls: "badge-status-cancelled"
		};
		case "no_show": return {
			text: "عدم حضور",
			icon: "x",
			cls: "badge-status-no_show"
		};
		case "rejected": return {
			text: "ردشده",
			icon: "close",
			cls: "badge-status-rejected"
		};
		default: return {
			text: status,
			icon: "clock",
			cls: "badge-status-pending"
		};
	}
}
function AdminDashboard({ initialData }) {
	const [data, setData] = (0, import_react.useState)(initialData ?? null);
	const [loading, setLoading] = (0, import_react.useState)(!initialData);
	const [error, setError] = (0, import_react.useState)(null);
	const [actionInProgress, setActionInProgress] = (0, import_react.useState)(null);
	const [rejectingBooking, setRejectingBooking] = (0, import_react.useState)(null);
	const [rejectionReason, setRejectionReason] = (0, import_react.useState)("");
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [viewMode, setViewMode] = (0, import_react.useState)("table");
	const refreshDashboard = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/v1/admin/dashboard");
			const json = await res.json();
			if (res.ok && json.data) setData(json.data);
			else setError(json.error?.message || "خطا در دریافت اطلاعات داشبورد.");
		} catch {
			setError("خطای ارتباط با سرور.");
		} finally {
			setLoading(false);
		}
	};
	(0, import_react.useEffect)(() => {
		if (!initialData) refreshDashboard();
	}, [initialData]);
	const handleAccept = async (bookingId) => {
		setActionInProgress(bookingId);
		try {
			const res = await fetch(`/api/v1/admin/bookings/${bookingId}/accept`, { method: "POST" });
			if (res.ok) await refreshDashboard();
			else alert((await res.json()).error?.message || "خطا در تأیید نوبت.");
		} catch {
			alert("خطا در برقراری ارتباط با سرور.");
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
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ reason: rejectionReason.trim() || void 0 })
			});
			if (res.ok) {
				setRejectingBooking(null);
				setRejectionReason("");
				await refreshDashboard();
			} else alert((await res.json()).error?.message || "خطا در رد نوبت.");
		} catch {
			alert("خطا در ارتباط با سرور.");
		} finally {
			setActionInProgress(null);
		}
	};
	const handleComplete = async (bookingId) => {
		setActionInProgress(bookingId);
		try {
			const res = await fetch(`/api/v1/admin/bookings/${bookingId}/complete`, { method: "POST" });
			if (res.ok) await refreshDashboard();
			else alert((await res.json()).error?.message || "خطا در ثبت اتمام نوبت.");
		} catch {
			alert("خطا در ارتباط با سرور.");
		} finally {
			setActionInProgress(null);
		}
	};
	const handleNoShow = async (bookingId) => {
		if (!confirm("آیا وضعیت این نوبت به عدم حضور تغییر یابد؟")) return;
		setActionInProgress(bookingId);
		try {
			const res = await fetch(`/api/v1/admin/bookings/${bookingId}/no-show`, { method: "POST" });
			if (res.ok) await refreshDashboard();
			else alert((await res.json()).error?.message || "خطا در تغییر وضعیت.");
		} catch {
			alert("خطا در ارتباط با سرور.");
		} finally {
			setActionInProgress(null);
		}
	};
	const scheduleBookings = data?.todayBookings || [];
	const pendingBookings = (0, import_react.useMemo)(() => scheduleBookings.filter((b) => b.status === "pending"), [scheduleBookings]);
	const metrics = (0, import_react.useMemo)(() => {
		const total = data?.today.total ?? scheduleBookings.length;
		const confirmed = data?.today.confirmed ?? scheduleBookings.filter((b) => b.status === "confirmed").length;
		const pending = data?.counts.pendingBookings ?? data?.today.pending ?? pendingBookings.length;
		const completed = scheduleBookings.filter((b) => b.status === "completed").length;
		const totalCustomers = data?.counts.totalCustomers ?? 0;
		const activeServices = data?.counts.activeServices ?? 0;
		const fulfillmentRate = total > 0 ? Math.min(100, Math.round((confirmed + completed) / total * 100)) : 0;
		const serviceCounts = {};
		scheduleBookings.forEach((b) => {
			const sName = b.service.name || "سایر";
			serviceCounts[sName] = (serviceCounts[sName] || 0) + 1;
		});
		const topServices = Object.entries(serviceCounts).map(([name, count]) => ({
			name,
			count,
			pct: total > 0 ? Math.round(count / total * 100) : 0
		})).sort((a, b) => b.count - a.count).slice(0, 4);
		const femaleCount = scheduleBookings.filter((b) => b.pricingCategory === "female").length;
		const maleCount = scheduleBookings.filter((b) => b.pricingCategory === "male").length;
		return {
			total,
			confirmed,
			pending,
			completed,
			totalCustomers,
			activeServices,
			fulfillmentRate,
			topServices,
			femaleCount,
			maleCount,
			femalePct: total > 0 ? Math.round(femaleCount / total * 100) : 50,
			malePct: total > 0 ? Math.round(maleCount / total * 100) : 50
		};
	}, [
		data,
		scheduleBookings,
		pendingBookings
	]);
	const filteredBookings = (0, import_react.useMemo)(() => {
		return scheduleBookings.filter((b) => {
			if (statusFilter === "pending" && b.status !== "pending") return false;
			if (statusFilter === "confirmed" && b.status !== "confirmed") return false;
			if (statusFilter === "completed" && b.status !== "completed") return false;
			if (statusFilter === "other" && ![
				"cancelled",
				"no_show",
				"rejected"
			].includes(b.status)) return false;
			if (searchQuery.trim()) {
				const q = searchQuery.trim().toLowerCase();
				return b.customer.name.toLowerCase().includes(q) || b.customer.phone.toLowerCase().includes(q) || b.reference.toLowerCase().includes(q) || b.service.name.toLowerCase().includes(q);
			}
			return true;
		});
	}, [
		scheduleBookings,
		statusFilter,
		searchQuery
	]);
	if (loading && !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "admin-section-block",
		"aria-busy": "true",
		"aria-live": "polite",
		style: {
			display: "flex",
			flexDirection: "column",
			gap: 16,
			padding: "22px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "skeleton-line skeleton-line-title" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "skeleton-metrics-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "skeleton-card" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "skeleton-card" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "skeleton-card" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "skeleton-line skeleton-line-wide" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "skeleton-line skeleton-line-narrow" })
		]
	});
	if (error && !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "admin-section-block text-center p-5",
		style: { borderColor: "rgba(239, 68, 68, 0.5)" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "flex",
					justifyContent: "center",
					marginBottom: 12
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
					name: "warning",
					size: 36,
					style: { color: "#ef4444" }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "empty-text text-danger mb-3",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "btn-3d-refresh",
				onClick: refreshDashboard,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
					name: "refresh",
					size: 16
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "تلاش مجدد" })]
			})
		]
	});
	const todayDateStr = data?.date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const metricCards = [
		{
			title: "نوبت‌های امروز",
			val: metrics.total,
			sub: "کل نوبت‌های ثبت‌شده امروز",
			icon: "calendar",
			color: "#f5d77f",
			cls: ""
		},
		{
			title: "در انتظار تأیید",
			val: metrics.pending,
			sub: "نیازمند بررسی و تأیید منشی",
			icon: "clock",
			color: "#f59e0b",
			cls: metrics.pending > 0 ? "highlight-amber" : ""
		},
		{
			title: "نوبت‌های تأییدشده",
			val: metrics.confirmed,
			sub: "آماده پذیرش و انجام خدمت",
			icon: "checkCircle",
			color: "#10b981",
			cls: "highlight-emerald"
		},
		{
			title: "کل پرونده‌ها",
			val: metrics.totalCustomers,
			sub: "مراجعین ثبت‌شده در سامانه",
			icon: "users",
			color: "#38bdf8",
			cls: ""
		},
		{
			title: "خدمات فعال",
			val: metrics.activeServices,
			sub: "پکیج‌ها و خدمات کلینیک",
			icon: "sparkles",
			color: "#a78bfa",
			cls: ""
		}
	];
	const renderActions = (b, isCompact = false) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "table-actions",
		children: [b.status === "confirmed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "btn-table-action",
			style: {
				borderColor: "rgba(16,185,129,0.4)",
				color: "#34d399",
				display: "inline-flex",
				alignItems: "center",
				gap: 4
			},
			onClick: () => handleComplete(b.id),
			disabled: actionInProgress === b.id,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
				name: "check",
				size: isCompact ? 12 : 13
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isCompact ? "اتمام" : "انجام شد" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "btn-table-action",
			style: {
				borderColor: "rgba(148,163,184,0.3)",
				color: "#94a3b8",
				display: "inline-flex",
				alignItems: "center",
				gap: 4
			},
			onClick: () => handleNoShow(b.id),
			disabled: actionInProgress === b.id,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
				name: "close",
				size: isCompact ? 12 : 13
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "عدم حضور" })]
		})] }), b.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "btn-table-action",
			style: {
				borderColor: "rgba(245,158,11,0.4)",
				color: "#fbbf24",
				display: "inline-flex",
				alignItems: "center",
				gap: 4
			},
			onClick: () => handleAccept(b.id),
			disabled: actionInProgress === b.id,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
				name: "check",
				size: isCompact ? 12 : 13
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "تأیید" })]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "admin-dashboard-page",
		children: [
			error && data && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "dashboard-inline-error",
				role: "alert",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
						name: "warning",
						size: 16
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [error, " آخرین داده‌های نمایش‌داده‌شده مربوط به آخرین دریافت موفق است."] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: refreshDashboard,
						disabled: loading,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
							name: "refresh",
							size: 14,
							className: loading ? "spin-icon" : ""
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: loading ? "در حال تازه‌سازی..." : "تلاش مجدد" })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "dashboard-header-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						flexWrap: "wrap",
						gap: 6
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "admin-page-title",
						style: { margin: 0 },
						children: "داشبورد عملیات کلینیک"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "dashboard-live-indicator",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "live-dot-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "سیستم آنلاین" })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "dashboard-date-badge",
					style: { marginTop: 8 },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: {
							display: "inline-flex",
							alignItems: "center",
							gap: 6
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
							name: "calendar",
							size: 15,
							style: { color: "#d4af37" }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "گزارش لحظه‌ای پذیرش — امروز:" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
						style: { color: "#f5d77f" },
						children: formatJalaliDate(todayDateStr)
					})]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "actions",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "btn-3d-refresh",
						onClick: refreshDashboard,
						disabled: loading,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
							name: "refresh",
							size: 16,
							className: loading ? "spin-icon" : ""
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: loading ? "در حال دریافت..." : "تازه‌سازی داده‌ها" })]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "quick-actions-section",
				"aria-label": "دسترسی سریع به بخش‌ها",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "quick-actions-header",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "quick-actions-title",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
							name: "lightning",
							size: 18
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "دسترسی سریع به عملیات کلینیک" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							fontSize: "0.78rem",
							color: "#94a3b8"
						},
						children: "میانبرهای پرتکرار منشی و پذیرش"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "quick-actions-grid",
					children: QUICK_ACTIONS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: a.href,
						className: "quick-action-card-3d",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "quick-action-icon-wrap",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
								name: a.icon,
								size: 18
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "quick-action-texts",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "quick-action-label",
								children: a.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "quick-action-sub",
								children: a.sub
							})]
						})]
					}, a.href))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "admin-metrics-grid-5",
				"aria-label": "شاخص‌های کلیدی",
				children: metricCards.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `admin-metric-card-3d ${m.cls}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-header",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "metric-title",
								children: m.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "metric-icon-wrap",
								style: { color: m.color },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
									name: m.icon,
									size: 20
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "metric-number",
							style: { color: m.color !== "#f5d77f" ? m.color : void 0 },
							dir: "ltr",
							children: m.val.toLocaleString("fa-IR")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "metric-footer",
							children: m.sub
						})
					]
				}, m.title))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "analytics-section-grid",
				"aria-label": "تحلیل و توزیع ظرفیت",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "analytics-card-3d",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "quick-actions-header",
							style: { marginBottom: 0 },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "analytics-card-title",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
									name: "chart",
									size: 18,
									style: { color: "#f5d77f" }
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "پیشرفت و نرخ تکمیل ظرفیت روز" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									fontSize: "0.85rem",
									fontWeight: 800,
									color: "#f5d77f"
								},
								children: [metrics.fulfillmentRate.toLocaleString("fa-IR"), "٪"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "gauge-track-3d",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "gauge-fill-3d",
								style: { width: `${metrics.fulfillmentRate}%` }
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "gauge-stats-row",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["تأییدشده: ", metrics.confirmed.toLocaleString("fa-IR")] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["انجام‌شده: ", metrics.completed.toLocaleString("fa-IR")] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["در انتظار: ", metrics.pending.toLocaleString("fa-IR")] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"کل: ",
									metrics.total.toLocaleString("fa-IR"),
									" نوبت"
								] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								borderTop: "1px solid rgba(255,255,255,0.08)",
								paddingTop: 10
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "0.78rem",
									color: "#94a3b8",
									display: "block",
									marginBottom: 8
								},
								children: "تفکیک مراجعین بر اساس بخش:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "demographics-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "demographic-pill female",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "بخش بانوان:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
										metrics.femaleCount.toLocaleString("fa-IR"),
										" (",
										metrics.femalePct.toLocaleString("fa-IR"),
										"٪)"
									] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "demographic-pill male",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "بخش آقایان:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
										metrics.maleCount.toLocaleString("fa-IR"),
										" (",
										metrics.malePct.toLocaleString("fa-IR"),
										"٪)"
									] })]
								})]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "analytics-card-3d",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "quick-actions-header",
						style: { marginBottom: 0 },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "analytics-card-title",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
								name: "sparkles",
								size: 18,
								style: { color: "#38bdf8" }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "توزیع خدمات نوبت‌های امروز" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "0.75rem",
								color: "#94a3b8"
							},
							children: "حجم درخواست"
						})]
					}), metrics.topServices.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							fontSize: "0.82rem",
							color: "#64748b",
							textAlign: "center",
							margin: "auto 0"
						},
						children: "هنوز داده‌ای برای خدمات امروز ثبت نشده است."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "service-breakdown-list",
						children: metrics.topServices.map((srv) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "service-item-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "service-item-header",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "service-item-name",
									children: srv.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "service-item-count",
									children: [
										srv.count.toLocaleString("fa-IR"),
										" نوبت (",
										srv.pct.toLocaleString("fa-IR"),
										"٪)"
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "service-bar-track",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "service-bar-fill",
									style: { width: `${Math.max(8, srv.pct)}%` }
								})
							})]
						}, srv.name))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "admin-section-block",
				"aria-label": "کارتابل تأیید نوبت‌ها",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "section-block-header",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "section-block-title",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								display: "inline-flex",
								alignItems: "center",
								gap: 6
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
								name: "warning",
								size: 20,
								style: { color: "#f59e0b" }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "نوبت‌های جدید در انتظار تأیید" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								fontSize: "0.82rem",
								color: "#f59e0b",
								background: "rgba(245, 158, 11, 0.15)",
								padding: "2px 10px",
								borderRadius: "999px",
								border: "1px solid rgba(245, 158, 11, 0.3)"
							},
							children: [pendingBookings.length.toLocaleString("fa-IR"), " مورد"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-block-sub",
						children: "نوبت‌های ثبت‌شده آنلاین که پیش از مراجعه نیاز به تأیید پذیرش دارند"
					})]
				}), pendingBookings.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "empty-state-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "empty-icon",
							style: {
								display: "flex",
								justifyContent: "center"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
								name: "checkCircle",
								size: 32,
								style: { color: "#10b981" }
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "empty-text",
							children: "همه نوبت‌های آنلاین امروز تأیید شده‌اند — هیچ موردی در صف پذیرش باقی نمانده است."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								flexWrap: "wrap",
								gap: 8,
								justifyContent: "center",
								marginTop: 14
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "/admin/calendar",
								className: "filter-chip-btn",
								style: { textDecoration: "none" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
									name: "calendar",
									size: 14
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "برنامه کامل تقویم" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "/admin/walkin",
								className: "filter-chip-btn",
								style: { textDecoration: "none" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
									name: "walkin",
									size: 14
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ثبت پذیرش حضوری" })]
							})]
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pending-bookings-list",
					children: pendingBookings.map((b) => {
						const timeStr = new Date(b.startsAt).toLocaleTimeString("fa-IR", {
							hour: "2-digit",
							minute: "2-digit",
							timeZone: "Asia/Tehran"
						});
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pending-booking-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "card-top-row",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "customer-info",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "customer-name",
											children: b.customer.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: `tel:${b.customer.phone}`,
											className: "customer-phone",
											dir: "ltr",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
												name: "phone",
												size: 13
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: b.customer.phone })]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "booking-ref-badge",
										dir: "ltr",
										children: b.reference
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "card-meta-grid",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "meta-item",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "خدمت:" }),
												" ",
												b.service.name
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "meta-item",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "بخش:" }),
												" ",
												b.pricingCategory === "female" ? "بانوان" : "آقایان"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "meta-item",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "زمان:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												style: {
													display: "inline-flex",
													alignItems: "center",
													gap: 4
												},
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
														name: "clock",
														size: 13
													}),
													" ساعت ",
													timeStr
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "meta-item",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "مبلغ:" }),
												" ",
												(b.quotedAmount * 1e3).toLocaleString("fa-IR"),
												" ت"
											]
										})
									]
								}),
								b.customerNote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "customer-note-callout",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "یادداشت مراجع:" }),
										" ",
										b.customerNote
									]
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "card-actions-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "btn-3d-accept",
									onClick: () => handleAccept(b.id),
									disabled: actionInProgress === b.id,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
										name: "check",
										size: 15
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: actionInProgress === b.id ? "در حال ثبت..." : "تأیید نوبت" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "btn-3d-reject",
									onClick: () => setRejectingBooking(b),
									disabled: actionInProgress === b.id,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
										name: "x",
										size: 15
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "رد نوبت" })]
								})]
							})]
						}, b.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "admin-section-block",
				"aria-label": "برنامه نوبت‌های امروز",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "section-block-header",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "section-block-title",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									display: "inline-flex",
									alignItems: "center",
									gap: 6
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
									name: "bookings",
									size: 20,
									style: { color: "#d4af37" }
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "برنامه زمانی نوبت‌های امروز" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									fontSize: "0.82rem",
									color: "#94a3b8",
									background: "rgba(148, 163, 184, 0.15)",
									padding: "2px 10px",
									borderRadius: "999px"
								},
								children: [filteredBookings.length.toLocaleString("fa-IR"), " نوبت"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "section-block-sub",
							children: "لیست کامل نوبت‌های ثبت‌شده برای شیفت‌های امروز کلینیک تهران لیزر"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "schedule-toolbar",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "schedule-search-box",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "schedule-search-icon",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
										name: "search",
										size: 16
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									className: "schedule-search-input",
									placeholder: "جستجو بر اساس نام، موبایل، کد رهگیری یا خدمت...",
									value: searchQuery,
									onChange: (e) => setSearchQuery(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "schedule-filter-tabs",
								children: [
									{
										id: "all",
										label: "همه"
									},
									{
										id: "pending",
										label: "در انتظار"
									},
									{
										id: "confirmed",
										label: "تأییدشده"
									},
									{
										id: "completed",
										label: "انجام‌شده"
									},
									{
										id: "other",
										label: "لغو / عدم حضور"
									}
								].map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: `filter-chip-btn ${statusFilter === tab.id ? "active" : ""}`,
									onClick: () => setStatusFilter(tab.id),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tab.label })
								}, tab.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "view-switch-btn",
								onClick: () => setViewMode(viewMode === "table" ? "cards" : "table"),
								title: "تغییر نمای جدول / کارت",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
									name: viewMode === "table" ? "list" : "desktop",
									size: 15
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: viewMode === "table" ? "نمای کارتی" : "نمای جدولی" })]
							})
						]
					}),
					filteredBookings.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "empty-state-card",
						style: { marginTop: 14 },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "empty-icon",
							style: {
								display: "flex",
								justifyContent: "center"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
								name: "calendar",
								size: 32,
								style: { color: "#d4af37" }
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "empty-text",
							children: searchQuery || statusFilter !== "all" ? "موردی متناسب با فیلترهای جستجوی شما یافت نشد." : "برای امروز هنوز نوبتی ثبت نگردیده است."
						})]
					}) : viewMode === "table" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "today-table-wrapper",
						style: { marginTop: 14 },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "admin-table",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "ساعت" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "کد رهگیری" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "نام مراجع" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "شماره تماس" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "خدمت" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "بخش" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "وضعیت" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "عملیات" })
							] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredBookings.map((b) => {
								const timeStr = new Date(b.startsAt).toLocaleTimeString("fa-IR", {
									hour: "2-digit",
									minute: "2-digit",
									timeZone: "Asia/Tehran"
								});
								const badge = getStatusBadge(b.status);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										style: {
											fontWeight: 800,
											color: "#f5d77f",
											whiteSpace: "nowrap"
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												display: "inline-flex",
												alignItems: "center",
												gap: 4
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
												name: "clock",
												size: 13
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: timeStr })]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										dir: "ltr",
										style: {
											fontFamily: "monospace",
											color: "#94a3b8"
										},
										children: b.reference
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										style: { fontWeight: 700 },
										children: b.customer.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										dir: "ltr",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: `tel:${b.customer.phone}`,
											style: {
												color: "#38bdf8",
												textDecoration: "none",
												display: "inline-flex",
												alignItems: "center",
												gap: 4
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
												name: "phone",
												size: 12
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: b.customer.phone })]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: b.service.name }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: b.pricingCategory === "female" ? "بانوان" : "آقایان" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: `badge-status ${badge.cls}`,
										style: {
											display: "inline-flex",
											alignItems: "center",
											gap: 5
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
											name: badge.icon,
											size: 13
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: badge.text })]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: renderActions(b) })
								] }, b.id);
							}) })]
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "schedule-cards-grid",
						children: filteredBookings.map((b) => {
							const timeStr = new Date(b.startsAt).toLocaleTimeString("fa-IR", {
								hour: "2-digit",
								minute: "2-digit",
								timeZone: "Asia/Tehran"
							});
							const badge = getStatusBadge(b.status);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "schedule-card-item",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												fontWeight: 800,
												color: "#f5d77f",
												display: "inline-flex",
												alignItems: "center",
												gap: 4
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
													name: "clock",
													size: 14
												}),
												" ساعت ",
												timeStr
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: `badge-status ${badge.cls}`,
											style: {
												display: "inline-flex",
												alignItems: "center",
												gap: 4
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
												name: badge.icon,
												size: 12
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: badge.text })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: {
											fontSize: "0.95rem",
											display: "block",
											marginBottom: 2
										},
										children: b.customer.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											justifyContent: "space-between",
											fontSize: "0.8rem",
											color: "#94a3b8"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											b.service.name,
											" (",
											b.pricingCategory === "female" ? "بانوان" : "آقایان",
											")"
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											href: `tel:${b.customer.phone}`,
											style: {
												color: "#38bdf8",
												textDecoration: "none"
											},
											dir: "ltr",
											children: b.customer.phone
										})]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											paddingTop: 8,
											borderTop: "1px solid rgba(255,255,255,0.08)"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											dir: "ltr",
											style: {
												fontFamily: "monospace",
												fontSize: "0.78rem",
												color: "#64748b"
											},
											children: b.reference
										}), renderActions(b, true)]
									})
								]
							}, b.id);
						})
					})
				]
			}),
			rejectingBooking && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "modal-backdrop",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "modal-dialog",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "modal-title",
							style: {
								display: "flex",
								alignItems: "center",
								gap: 8
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
								name: "warning",
								size: 20,
								style: { color: "#ef4444" }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "رد درخواست نوبت" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							style: {
								color: "rgba(226, 232, 240, 0.7)",
								fontSize: "0.88rem",
								margin: "0 0 16px"
							},
							children: [
								"نوبت کد ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									dir: "ltr",
									style: { color: "#f5d77f" },
									children: rejectingBooking.reference
								}),
								" مربوط به ",
								rejectingBooking.customer.name
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "rejectionReasonInput",
							style: {
								display: "block",
								fontSize: "0.85rem",
								fontWeight: 700,
								color: "#e2e8f0",
								marginBottom: "6px"
							},
							children: "علت رد نوبت (اختیاری جهت درج در پرونده و اطلاع‌رسانی):"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							id: "rejectionReasonInput",
							className: "form-control-modal",
							rows: 3,
							placeholder: "مثال: تکمیل ظرفیت پذیرش در این بازه زمانی...",
							value: rejectionReason,
							onChange: (e) => setRejectionReason(e.target.value)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-actions-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn-table-action",
								onClick: () => setRejectingBooking(null),
								children: "انصراف"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "btn-3d-reject",
								onClick: handleConfirmReject,
								disabled: actionInProgress === rejectingBooking.id,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconReact, {
									name: "x",
									size: 15
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: actionInProgress === rejectingBooking.id ? "در حال ثبت..." : "تأیید و رد نوبت" })]
							})]
						})
					]
				})
			})
		]
	});
}
//#endregion
//#region src/pages/admin/index.astro
var admin_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const todayStartIso = `${todayStr}T00:00:00.000Z`;
	const todayEndIso = `${todayStr}T23:59:59.999Z`;
	let initialDashboard = void 0;
	try {
		initialDashboard = await getAdminDashboard(env.DB, todayStartIso, todayEndIso);
	} catch (e) {
		console.error("Failed to load initial admin dashboard data:", e);
	}
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "داشبورد و وضعیت امروز",
		"activeNav": "dashboard"
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="admin-content-pad">${renderComponent($$result, "AdminDashboard", AdminDashboard, {
		"client:load": true,
		"initialData": initialDashboard,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/Capsizer/Desktop/TehranLasser/src/components/admin/AdminDashboard.tsx",
		"client:component-export": "AdminDashboard"
	})}</div>` })}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/index.astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/index.astro";
var $$url = "/admin";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/index@_@astro
var page = () => admin_exports;
//#endregion
export { page };
