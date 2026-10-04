globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as toJalaali } from "./dist_DQmtns5G.mjs";
import { r as localDateOf } from "./timezone_DL81nGWL.mjs";
//#region src/lib/datetime/jalali.ts
/** Persian (Jalali) presentation helpers. Canonical data stays ISO/Gregorian —
*  these are used only at presentation boundaries (src/lib/datetime/timezone.ts rule). */
var PERSIAN_DIGITS = [
	"۰",
	"۱",
	"۲",
	"۳",
	"۴",
	"۵",
	"۶",
	"۷",
	"۸",
	"۹"
];
function toPersianDigits(value) {
	return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit);
}
/** Gregorian 'YYYY-MM-DD' (or ISO string) → Jalali parts. */
function toJalali(localDate) {
	if (!localDate) return {
		jy: 1405,
		jm: 1,
		jd: 1
	};
	const parts = (localDate.includes("T") ? localDate.slice(0, 10) : localDate.slice(0, 10)).split("-");
	const y = Number(parts[0]) || 2026;
	const m = Number(parts[1]) || 1;
	const d = Number(parts[2]) || 1;
	return toJalaali(y, m, d);
}
/** 'YYYY-MM-DD' or ISO instant → '۱۴۰۵/۰۷/۱۲' */
function formatJalaliDate(localDate) {
	if (!localDate) return "-";
	const { jy, jm, jd } = toJalali(localDate);
	return toPersianDigits(`${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`);
}
/** ISO instant → '۱۴۰۵/۰۷/۱۲' in the clinic timezone. */
function formatJalaliOfInstant(instantIso, timeZone) {
	return formatJalaliDate(localDateOf(instantIso, timeZone));
}
//#endregion
export { formatJalaliOfInstant as n, formatJalaliDate as t };
