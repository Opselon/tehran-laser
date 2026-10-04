globalThis.process ??= {};
globalThis.process.env ??= {};
//#region src/lib/datetime/timezone.ts
/** Timezone-correct wall-clock math for the clinic timezone (no Node APIs — works in workerd).
*
*  Conventions:
*   * instants are ISO-8601 UTC strings
*   * local dates are 'YYYY-MM-DD' in the clinic timezone
*   * times of day are 'HH:MM' wall clock
*/
var MS_PER_MINUTE = 6e4;
var formatterCache = /* @__PURE__ */ new Map();
function formatterFor(timeZone) {
	let formatter = formatterCache.get(timeZone);
	if (!formatter) {
		formatter = new Intl.DateTimeFormat("en-US", {
			timeZone,
			hour12: false,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit"
		});
		formatterCache.set(timeZone, formatter);
	}
	return formatter;
}
/** Wall-clock parts of an instant in the given timezone. */
function wallClockOf(instantIso, timeZone) {
	const instant = new Date(instantIso);
	if (Number.isNaN(instant.getTime())) throw new Error(`Invalid instant: ${instantIso}`);
	const parts = formatterFor(timeZone).formatToParts(instant);
	const read = (type) => {
		const part = parts.find((p) => p.type === type);
		return part ? Number.parseInt(part.value, 10) : 0;
	};
	return {
		year: read("year"),
		month: read("month"),
		day: read("day"),
		hour: read("hour") % 24,
		minute: read("minute")
	};
}
/** Offset (ms) of `timeZone` from UTC at the given instant. */
function timezoneOffsetMs(instant, timeZone) {
	const wall = wallClockOf(instant.toISOString(), timeZone);
	return Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, instant.getUTCSeconds(), instant.getUTCMilliseconds()) - instant.getTime();
}
/** 'YYYY-MM-DD' local date of an instant. */
function localDateOf(instantIso, timeZone) {
	const wall = wallClockOf(instantIso, timeZone);
	return `${String(wall.year).padStart(4, "0")}-${String(wall.month).padStart(2, "0")}-${String(wall.day).padStart(2, "0")}`;
}
/** Iranian weekday for a local date: 0 = Saturday … 6 = Friday. */
function weekdayOf(localDate) {
	const [y, m, d] = localDate.split("-").map(Number);
	return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 1) % 7;
}
/** Minutes since the local midnight of 1970-01-01, in wall-clock terms.
*  Slot grids are built on this axis so alignment never depends on UTC offsets. */
function localMinutesOf(instantIso, timeZone) {
	const wall = wallClockOf(instantIso, timeZone);
	return Math.round(Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute) / MS_PER_MINUTE);
}
/** Inverse of localMinutesOf: the instant whose wall clock equals those minutes. */
function instantFromLocalMinutes(minutes, timeZone) {
	const wallMs = minutes * MS_PER_MINUTE;
	const firstOffset = timezoneOffsetMs(new Date(wallMs), timeZone);
	let result = wallMs - firstOffset;
	const secondOffset = timezoneOffsetMs(new Date(result), timeZone);
	if (secondOffset !== firstOffset) result = wallMs - secondOffset;
	return new Date(result).toISOString();
}
/** Convert a local date + 'HH:MM' wall time into an ISO instant. */
function zonedTimeToUtc(localDate, timeOfDay, timeZone) {
	const [y, m, d] = localDate.split("-").map(Number);
	const [hh, mm] = timeOfDay.split(":").map(Number);
	return instantFromLocalMinutes(Math.round(Date.UTC(y, m - 1, d, hh, mm) / MS_PER_MINUTE), timeZone);
}
/** Add minutes to an instant. */
function addMinutes(instantIso, minutes) {
	return new Date(Date.parse(instantIso) + minutes * MS_PER_MINUTE).toISOString();
}
/** True when [aStart, aEnd) overlaps [bStart, bEnd). */
function overlaps(aStart, aEnd, bStart, bEnd) {
	return Date.parse(aStart) < Date.parse(bEnd) && Date.parse(bStart) < Date.parse(aEnd);
}
//#endregion
export { overlaps as a, localMinutesOf as i, instantFromLocalMinutes as n, weekdayOf as o, localDateOf as r, zonedTimeToUtc as s, addMinutes as t };
