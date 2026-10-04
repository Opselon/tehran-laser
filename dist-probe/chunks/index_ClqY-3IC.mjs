globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { _ as addAttribute, h as maybeRenderHead, m as renderTemplate, s as renderComponent } from "./console_B-OutPbu.mjs";
import { t as createComponent } from "./compiler_DMFKJ3NJ.mjs";
import { t as renderScript } from "./script_BAxrbSKv.mjs";
import { t as $$Icon } from "./Icon_DVKJJmpb.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CnBsXFHB.mjs";
import { n as formatJalaliOfInstant } from "./jalali_Dqia3IuY.mjs";
import { h as listAuditLogs } from "./repositories_B3hzhjEm.mjs";
import { env } from "cloudflare:workers";
//#region src/pages/admin/audit/index.astro
var audit_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	const TZ = "Asia/Tehran";
	const CATS = {
		auth: {
			label: "احراز هویت",
			icon: "shield"
		},
		booking: {
			label: "نوبت‌دهی",
			icon: "bookings"
		},
		catalog: {
			label: "خدمات و تعرفه",
			icon: "tag"
		},
		staff: {
			label: "کارکنان",
			icon: "users"
		},
		customer: {
			label: "مراجعین",
			icon: "customers"
		},
		content: {
			label: "محتوا",
			icon: "blog"
		},
		schedule: {
			label: "زمان‌بندی",
			icon: "schedule"
		},
		config: {
			label: "پیکربندی",
			icon: "settings"
		},
		other: {
			label: "سایر",
			icon: "list"
		}
	};
	const SEVS = {
		crit: {
			label: "بحرانی",
			icon: "warning"
		},
		warn: {
			label: "حساس",
			icon: "shield"
		},
		info: {
			label: "عادی",
			icon: "info"
		}
	};
	function categoryOf(action) {
		const prefix = action.split(".")[0] ?? "";
		if (prefix === "admin") return "auth";
		if (prefix === "booking") return "booking";
		if (prefix === "service" || prefix === "pricing") return "catalog";
		if (prefix === "staff") return "staff";
		if (prefix === "customer") return "customer";
		if (prefix === "blog" || prefix === "faq") return "content";
		if (prefix === "schedule") return "schedule";
		if (prefix === "settings" || prefix === "instagram") return "config";
		return "other";
	}
	function severityOf(action) {
		if (/\.(deleted|rejected|cancelled)$/.test(action)) return "crit";
		if (/^(admin|settings|pricing|instagram|staff|customer)\./.test(action)) return "warn";
		return "info";
	}
	function ipFor(action, createdAt, windows) {
		const prefix = action.startsWith("admin.") ? "login:" : action.startsWith("booking.") ? "booking:" : null;
		if (!prefix) return null;
		const t = Date.parse(createdAt);
		if (Number.isNaN(t)) return null;
		const hit = windows.find((w) => w.key.startsWith(prefix) && w.start <= t && t <= w.end);
		if (!hit) return null;
		return hit.key.slice(prefix.length);
	}
	function relativeFa(iso) {
		const diffMs = Date.now() - Date.parse(iso);
		if (Number.isNaN(diffMs)) return "";
		const rtf = new Intl.RelativeTimeFormat("fa", { numeric: "auto" });
		const min = Math.round(diffMs / 6e4);
		if (min < 1) return "همین حالا";
		if (min < 60) return rtf.format(-min, "minute");
		const hr = Math.round(min / 60);
		if (hr < 24) return rtf.format(-hr, "hour");
		return rtf.format(-Math.round(hr / 24), "day");
	}
	async function sha256Hex(input) {
		const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
		return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
	}
	let rows = [];
	let chainHead = "";
	let recentIps = [];
	let loadError = false;
	try {
		const [logs, rl] = await Promise.all([listAuditLogs(env.DB, 50), env.DB.prepare("SELECT key, window_started_at, expires_at FROM rate_limits").all()]);
		const windows = (rl.results ?? []).map((r) => ({
			key: r.key,
			start: Date.parse(r.window_started_at),
			end: Date.parse(r.expires_at)
		}));
		recentIps = windows.filter((w) => w.key.startsWith("login:")).sort((a, b) => b.start - a.start).slice(0, 4).map((w) => ({
			ip: w.key.slice(6),
			when: relativeFa(new Date(w.start).toISOString())
		}));
		const items = logs.items ?? [];
		const total = items.length;
		const chrono = [...items].reverse();
		const seals = /* @__PURE__ */ new Map();
		let prev = "GENESIS";
		for (let i = 0; i < chrono.length; i++) {
			const r = chrono[i];
			const seal = await sha256Hex(`${prev}|${r.id}|${r.actorId ?? ""}|${r.action}|${r.entityType}|${r.entityId ?? ""}|${r.createdAt}`);
			seals.set(r.id, {
				seal,
				prev,
				idx: i
			});
			prev = seal;
		}
		chainHead = prev;
		rows = items.map((r, i) => {
			const s = seals.get(r.id);
			return {
				...r,
				cat: categoryOf(r.action),
				sev: severityOf(r.action),
				ip: ipFor(r.action, r.createdAt, windows),
				jalali: formatJalaliOfInstant(r.createdAt, TZ),
				timeFa: new Date(r.createdAt).toLocaleTimeString("fa-IR", {
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
					timeZone: TZ
				}),
				rel: relativeFa(r.createdAt),
				actorLabel: r.actorName || r.actor || "سیستم",
				seal: s.seal,
				sealShort: s.seal.slice(0, 12),
				idx: total - 1 - i,
				prev: s.prev
			};
		});
	} catch (e) {
		console.error("Failed to load audit logs:", e);
		loadError = true;
	}
	const catsPresent = [...new Set(rows.map((r) => r.cat))];
	const sevsPresent = [...new Set(rows.map((r) => r.sev))];
	const actors = new Set(rows.map((r) => r.actorId || r.actorLabel));
	const sensitiveCount = rows.filter((r) => r.sev !== "info").length;
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "گزارش وقایع و لاگ",
		"activeNav": "audit",
		"data-astro-cid-6oeoy3v5": true
	}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="admin-content-pad" data-astro-cid-6oeoy3v5><!-- 3D Header --><div class="dashboard-header-row" data-astro-cid-6oeoy3v5><div data-astro-cid-6oeoy3v5><h1 class="admin-page-title" style="display: flex; align-items: center; gap: 10px;" data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": "audit",
		"size": 26,
		"data-astro-cid-6oeoy3v5": true
	})}<span data-astro-cid-6oeoy3v5>دفتر ثبت رویدادهای امنیتی (Audit Log)</span></h1><p class="section-block-sub" data-astro-cid-6oeoy3v5>ردیابی عملیات‌های حساس پذیرش، تأییدها و تغییرات سامانه همراه با زنجیره مهر و موم SHA-256</p></div><div class="actions" data-astro-cid-6oeoy3v5><span class="audit-live-chip" data-astro-cid-6oeoy3v5><span class="live-dot" data-astro-cid-6oeoy3v5></span><span data-astro-cid-6oeoy3v5>${rows.length.toLocaleString("fa-IR")} رویداد ثبت‌شده</span></span><a href="/admin/audit" class="btn-3d-secondary" title="به‌روزرسانی لاگ" data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": "refresh",
		"size": 16,
		"data-astro-cid-6oeoy3v5": true
	})}<span data-astro-cid-6oeoy3v5>به‌روزرسانی</span></a></div></div><!-- KPI strip --><div class="kpi-grid-3d" style="grid-template-columns: repeat(auto-fit, minmax(215px, 1fr)); margin-bottom: 24px;" data-astro-cid-6oeoy3v5><div class="kpi-card-3d" data-astro-cid-6oeoy3v5><div class="kpi-header" data-astro-cid-6oeoy3v5><span class="kpi-title" data-astro-cid-6oeoy3v5>کل رویدادهای ثبت‌شده</span><span class="kpi-icon" style="color: #d4af37;" data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": "list",
		"size": 20,
		"data-astro-cid-6oeoy3v5": true
	})}</span></div><div class="kpi-value" data-astro-cid-6oeoy3v5>${rows.length.toLocaleString("fa-IR")}</div><div class="kpi-footer" data-astro-cid-6oeoy3v5>در پنجره نمایش ۵۰ رویداد اخیر</div></div><div class="kpi-card-3d" data-astro-cid-6oeoy3v5><div class="kpi-header" data-astro-cid-6oeoy3v5><span class="kpi-title" data-astro-cid-6oeoy3v5>رویدادهای حساس و بحرانی</span><span class="kpi-icon" style="color: #f87171;" data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 20,
		"data-astro-cid-6oeoy3v5": true
	})}</span></div><div class="kpi-value" data-astro-cid-6oeoy3v5>${sensitiveCount.toLocaleString("fa-IR")}</div><div class="kpi-footer" data-astro-cid-6oeoy3v5>ورود، حذف، تنظیمات و تغییر تعرفه</div></div><div class="kpi-card-3d" data-astro-cid-6oeoy3v5><div class="kpi-header" data-astro-cid-6oeoy3v5><span class="kpi-title" data-astro-cid-6oeoy3v5>عوامل فعال (Actor)</span><span class="kpi-icon" style="color: #38bdf8;" data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": "users",
		"size": 20,
		"data-astro-cid-6oeoy3v5": true
	})}</span></div><div class="kpi-value" data-astro-cid-6oeoy3v5>${actors.size.toLocaleString("fa-IR")}</div><div class="kpi-footer" data-astro-cid-6oeoy3v5>کاربران یا سیستم دخیل در رویدادها</div></div><div class="kpi-card-3d" data-astro-cid-6oeoy3v5><div class="kpi-header" data-astro-cid-6oeoy3v5><span class="kpi-title" data-astro-cid-6oeoy3v5>IPهای اخیر ورود</span><span class="kpi-icon" style="color: #34d399;" data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": "globe",
		"size": 20,
		"data-astro-cid-6oeoy3v5": true
	})}</span></div><div class="kpi-value" style="font-size: 1rem; padding-top: 6px;" data-astro-cid-6oeoy3v5>${recentIps.length > 0 ? renderTemplate`<div class="ip-stack" data-astro-cid-6oeoy3v5>${recentIps.map((r) => renderTemplate`<span class="ip-tag" dir="ltr"${addAttribute(`آخرین ورود ${r.when}`, "title")} data-astro-cid-6oeoy3v5>${r.ip}</span>`)}</div>` : renderTemplate`<span class="text-obsidian-muted" style="font-size: 0.85rem;" data-astro-cid-6oeoy3v5>رکوردی موجود نیست</span>`}</div><div class="kpi-footer" data-astro-cid-6oeoy3v5>از پنجره‌های محدودیت نرخ ورود (Rate-Limit)</div></div></div><!-- Filter bar --><div class="audit-filter-bar" data-astro-cid-6oeoy3v5><div class="audit-search-wrap" data-astro-cid-6oeoy3v5><span class="audit-search-icon" data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": "search",
		"size": 16,
		"data-astro-cid-6oeoy3v5": true
	})}</span><input type="search" id="auditSearch" class="audit-input" placeholder="جستجو در عملیات، عامل یا شناسه موجودیت…" aria-label="جستجوی رویدادها" data-astro-cid-6oeoy3v5></div><label class="audit-select-wrap" data-astro-cid-6oeoy3v5><span class="audit-select-label" data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": "filter",
		"size": 14,
		"data-astro-cid-6oeoy3v5": true
	})}</span><select id="auditCat" class="audit-select" aria-label="فیلتر دسته‌بندی" data-astro-cid-6oeoy3v5><option value="" data-astro-cid-6oeoy3v5>همه دسته‌ها</option>${catsPresent.map((c) => renderTemplate`<option${addAttribute(c, "value")} data-astro-cid-6oeoy3v5>${CATS[c]?.label ?? c}</option>`)}</select></label><label class="audit-select-wrap" data-astro-cid-6oeoy3v5><span class="audit-select-label" data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": "warning",
		"size": 14,
		"data-astro-cid-6oeoy3v5": true
	})}</span><select id="auditSev" class="audit-select" aria-label="فیلتر شدت" data-astro-cid-6oeoy3v5><option value="" data-astro-cid-6oeoy3v5>همه شدت‌ها</option>${sevsPresent.map((s) => renderTemplate`<option${addAttribute(s, "value")} data-astro-cid-6oeoy3v5>${SEVS[s]?.label ?? s}</option>`)}</select></label><label class="audit-select-wrap" data-astro-cid-6oeoy3v5><span class="audit-select-label" data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 14,
		"data-astro-cid-6oeoy3v5": true
	})}</span><select id="auditRange" class="audit-select" aria-label="بازه زمانی" data-astro-cid-6oeoy3v5><option value="" data-astro-cid-6oeoy3v5>کل بازه</option><option value="1440" data-astro-cid-6oeoy3v5>۲۴ ساعت اخیر</option><option value="10080" data-astro-cid-6oeoy3v5>۷ روز اخیر</option><option value="43200" data-astro-cid-6oeoy3v5>۳۰ روز اخیر</option></select></label><button type="button" id="auditReset" class="btn-3d-secondary audit-reset-btn" data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": "x",
		"size": 15,
		"data-astro-cid-6oeoy3v5": true
	})}<span data-astro-cid-6oeoy3v5>پاک‌کردن فیلترها</span></button><span class="audit-count" id="auditCount" data-astro-cid-6oeoy3v5>${rows.length.toLocaleString("fa-IR")} نمایش</span></div><!-- Table --><div class="card-shell-3d" data-astro-cid-6oeoy3v5>${loadError ? renderTemplate`<div class="audit-empty" data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": "warning",
		"size": 34,
		"data-astro-cid-6oeoy3v5": true
	})}<p data-astro-cid-6oeoy3v5>بارگذاری لاگ امنیتی ممکن نشد. لطفاً دوباره تلاش کنید.</p></div>` : rows.length === 0 ? renderTemplate`<div class="audit-empty" data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": "shield",
		"size": 34,
		"data-astro-cid-6oeoy3v5": true
	})}<p data-astro-cid-6oeoy3v5>رویدادی ثبت نگردیده است.</p><span class="audit-empty-hint" data-astro-cid-6oeoy3v5>پس از ورود پرسنل یا تغییر تنظیمات، رویدادها اینجا نمایش داده می‌شوند.</span></div>` : renderTemplate`<div class="table-responsive" data-astro-cid-6oeoy3v5><table class="admin-table-3d audit-table" data-astro-cid-6oeoy3v5><thead data-astro-cid-6oeoy3v5><tr data-astro-cid-6oeoy3v5><th data-astro-cid-6oeoy3v5><span class="th-with-icon" data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": "clock",
		"size": 13,
		"data-astro-cid-6oeoy3v5": true
	})} زمان وقوع</span></th><th data-astro-cid-6oeoy3v5><span class="th-with-icon" data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": "users",
		"size": 13,
		"data-astro-cid-6oeoy3v5": true
	})} کاربر / عامل</span></th><th data-astro-cid-6oeoy3v5><span class="th-with-icon" data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": "list",
		"size": 13,
		"data-astro-cid-6oeoy3v5": true
	})} عملیات و دسته</span></th><th data-astro-cid-6oeoy3v5><span class="th-with-icon" data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": "globe",
		"size": 13,
		"data-astro-cid-6oeoy3v5": true
	})} IP مبدأ</span></th><th data-astro-cid-6oeoy3v5><span class="th-with-icon" data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": "database",
		"size": 13,
		"data-astro-cid-6oeoy3v5": true
	})} موجودیت</span></th><th data-astro-cid-6oeoy3v5><span class="th-with-icon" data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lock",
		"size": 13,
		"data-astro-cid-6oeoy3v5": true
	})} مهر و موم</span></th></tr></thead><tbody id="auditBody" data-astro-cid-6oeoy3v5>${rows.map((r) => renderTemplate`<tr${addAttribute(r.idx, "data-idx")}${addAttribute(r.cat, "data-cat")}${addAttribute(r.sev, "data-sev")}${addAttribute(Date.parse(r.createdAt), "data-ts")}${addAttribute(r.seal, "data-seal")}${addAttribute(r.prev, "data-prev")}${addAttribute(r.id, "data-id")}${addAttribute(r.actorId ?? "", "data-actor")}${addAttribute(r.action, "data-action")}${addAttribute(r.entityType, "data-entity")}${addAttribute(r.entityId ?? "", "data-eid")}${addAttribute(r.createdAt, "data-created")}${addAttribute(`${r.action} ${r.actorLabel} ${r.entityType} ${r.entityId ?? ""} ${r.actorId ?? ""}`.toLowerCase(), "data-search")} data-astro-cid-6oeoy3v5><td data-astro-cid-6oeoy3v5><div class="cell-primary" data-astro-cid-6oeoy3v5>${r.jalali}</div><div class="cell-meta" data-astro-cid-6oeoy3v5><span class="time-fa" data-astro-cid-6oeoy3v5>${r.timeFa}</span><span class="dot-sep" data-astro-cid-6oeoy3v5>•</span><span data-astro-cid-6oeoy3v5>${r.rel}</span></div><div class="cell-id" dir="ltr" data-astro-cid-6oeoy3v5>${r.createdAt}</div></td><td data-astro-cid-6oeoy3v5><div class="cell-primary actor-line" data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": r.actorId ? "crm" : "settings",
		"size": 14,
		"data-astro-cid-6oeoy3v5": true
	})}<span data-astro-cid-6oeoy3v5>${r.actorLabel}</span></div><div class="cell-id" dir="ltr" data-astro-cid-6oeoy3v5>${r.actorId ?? "system"}</div></td><td data-astro-cid-6oeoy3v5><div class="badge-row" data-astro-cid-6oeoy3v5><span${addAttribute(`sev-badge sev-${r.sev}`, "class")} data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": SEVS[r.sev]?.icon ?? "info",
		"size": 12,
		"data-astro-cid-6oeoy3v5": true
	})}<span data-astro-cid-6oeoy3v5>${SEVS[r.sev]?.label ?? r.sev}</span></span><span class="cat-chip" data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": CATS[r.cat]?.icon ?? "list",
		"size": 12,
		"data-astro-cid-6oeoy3v5": true
	})}<span data-astro-cid-6oeoy3v5>${CATS[r.cat]?.label ?? r.cat}</span></span></div><div class="cell-action" dir="ltr" data-astro-cid-6oeoy3v5>${r.action}</div></td><td data-astro-cid-6oeoy3v5>${r.ip ? renderTemplate`<span class="ip-tag" dir="ltr" data-astro-cid-6oeoy3v5>${r.ip}</span>` : renderTemplate`<span class="ip-none" title="IP برای این رویداد در پایگاه داده ثبت نشده است" data-astro-cid-6oeoy3v5>—</span>`}</td><td data-astro-cid-6oeoy3v5><div class="cell-primary" data-astro-cid-6oeoy3v5>${r.entityType}</div><div class="cell-id" dir="ltr" data-astro-cid-6oeoy3v5>${r.entityId ?? "—"}</div></td><td data-astro-cid-6oeoy3v5><span class="seal-tag" dir="ltr"${addAttribute(`SHA-256: ${r.seal}`, "title")} data-astro-cid-6oeoy3v5>${r.sealShort}</span><div class="cell-id" dir="ltr" data-astro-cid-6oeoy3v5>#${r.idx}</div></td></tr>`)}</tbody></table></div>`}</div><!-- Chain footer -->${rows.length > 0 && renderTemplate`<div class="audit-chain-note" data-astro-cid-6oeoy3v5><span class="chain-line" data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": "lock",
		"size": 14,
		"data-astro-cid-6oeoy3v5": true
	})}<span data-astro-cid-6oeoy3v5>سری مهر و موم:</span><code class="seal-tag" dir="ltr" title="SHA-256 کامل آخرین مهر زنجیره" data-astro-cid-6oeoy3v5>${chainHead.slice(0, 16)}</code></span><button type="button" id="verifyChainBtn" class="btn-3d-secondary" data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": "checkCircle",
		"size": 15,
		"data-astro-cid-6oeoy3v5": true
	})}<span data-astro-cid-6oeoy3v5>بررسی سلامت زنجیره</span></button><span id="verifyResult" class="verify-result" role="status" data-astro-cid-6oeoy3v5></span></div>`}<p class="audit-footnote" data-astro-cid-6oeoy3v5>${renderComponent($$result, "Icon", $$Icon, {
		"name": "info",
		"size": 13,
		"data-astro-cid-6oeoy3v5": true
	})}<span data-astro-cid-6oeoy3v5>ستون IP از پنجره‌های محدودیت نرخ ورود قرینه‌سازی می‌شود؛ رویدادهای قدیمی‌تر از ماندن این پنجره‌ها IP ثبت‌شده ندارند. مهر و موم هر ردیف از SHA-256 زنجیره قبلی + فیلدهای همان رویداد ساخته می‌شود؛ هر ویرایشی مهر تمام ردیف‌های بعدی را می‌شکند.</span></p></div>${renderScript($$result, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/audit/index.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/audit/index.astro", void 0);
var $$file = "C:/Users/Capsizer/Desktop/TehranLasser/src/pages/admin/audit/index.astro";
var $$url = "/admin/audit";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/audit/index@_@astro
var page = () => audit_exports;
//#endregion
export { page };
