import type { JalaliPickerApi } from '../components/admin/jalali-picker-api';

declare global {
  interface Window {
    /** Vanilla Jalali (Shamsi) day picker bridge installed by JalaliPicker.astro.
     *  Pages call `.set()` / `.get()` / `.isoOffset()` from inline scripts — see
     *  src/components/admin/jalali-picker-api.ts for the contract. */
    TLJalaliPicker?: JalaliPickerApi;
  }
}

export {};
