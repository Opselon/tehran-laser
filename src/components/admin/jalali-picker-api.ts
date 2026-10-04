/**
 * Contract shared by the JalaliPicker.astro island and the inline scripts that
 * drive it. Lives in its own module so pages can type `window.TLJalaliPicker`
 * without importing the component's runtime.
 */
export interface JalaliPickerApi {
  /** Set the picker day from an ISO 'YYYY-MM-DD' (null clears it). */
  set(id: string, iso: string | null): void;
  /** Set the picker day to clinic-today + N days. */
  setOffset(id: string, days: number): void;
  /** ISO 'YYYY-MM-DD' currently held by the picker ('' when unset). */
  get(id: string): string;
  /** ISO 'YYYY-MM-DD' for clinic-today + N days. */
  isoOffset(days: number): string;
  /** Jalali text for any ISO 'YYYY-MM-DD' — render Shamsi without a picker. */
  format(iso: string): string;
}
