/* Dial codes carry the ISO-2 alongside them, because Meta's CAPI wants the
   COUNTRY as a hashed ISO 3166-1 alpha-2 code and not a dial code.

   India first, then the countries the client's own copy names: "700+ clients
   across India, USA, Canada, UK, Australia & The Middle East". The Gulf states
   are listed individually because "Middle East" is not a dial code.

   Shared by /checkout and the /book-a-call form, so both pickers agree. */
export const COUNTRIES: { iso: string; dial: string; label: string }[] = [
  { iso: 'in', dial: '+91', label: 'India (+91)' },
  { iso: 'ae', dial: '+971', label: 'UAE (+971)' },
  { iso: 'sa', dial: '+966', label: 'Saudi Arabia (+966)' },
  { iso: 'qa', dial: '+974', label: 'Qatar (+974)' },
  { iso: 'om', dial: '+968', label: 'Oman (+968)' },
  { iso: 'kw', dial: '+965', label: 'Kuwait (+965)' },
  { iso: 'bh', dial: '+973', label: 'Bahrain (+973)' },
  { iso: 'us', dial: '+1', label: 'USA (+1)' },
  { iso: 'ca', dial: '+1', label: 'Canada (+1)' },
  { iso: 'gb', dial: '+44', label: 'UK (+44)' },
  { iso: 'au', dial: '+61', label: 'Australia (+61)' },
  { iso: 'nz', dial: '+64', label: 'New Zealand (+64)' },
  { iso: 'sg', dial: '+65', label: 'Singapore (+65)' },
  { iso: 'my', dial: '+60', label: 'Malaysia (+60)' },
  { iso: 'za', dial: '+27', label: 'South Africa (+27)' },
];
