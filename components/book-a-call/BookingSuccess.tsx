'use client';

import { useEffect, useRef } from 'react';

import type { BookingSummary } from './BookingForm';

/**
 * THE CONFIRMATION (2026-11-12). Shown IN PLACE on /book-a-call once the
 * consultation profile is accepted; the page does not navigate.
 *
 * The two headline sentences are the client's own copy, with one grammar
 * fix ("in next" -> "within the next"):
 *   "We have received your payment for 1:1 Consultation Call.
 *    Our Senior Consultant will get in touch with you in next 24-48 hours,
 *    to schedule this call for you."
 *
 * Motion, in order: the seal pops in, its ring draws, the tick draws, two
 * soft ripples spread from it, a small burst of gold and garnet flecks, then
 * the text and the "what happens next" rows rise in one after another. All
 * of it is CSS (bookacall.css, "THE CONFIRMATION"), and all of it is switched
 * off under prefers-reduced-motion.
 */

const NEXT = [
  {
    title: 'Payment and details received',
    body: 'Your call booking form is with our team.',
  },
  {
    title: 'Our Senior Consultant reaches out',
    body: 'Within the next 24 to 48 hours, to schedule your call with you.',
  },
  {
    title: 'Your 1:1 Consultation Call',
    body: 'Keep your latest blood reports handy. You do not need perfect data.',
  },
] as const;

export function BookingSuccess({ summary }: { summary: BookingSummary }) {
  const ref = useRef<HTMLDivElement>(null);

  /* Land the reader on the confirmation, and move focus to it so a screen
     reader announces it rather than staying on a button that is gone. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.focus({ preventScroll: true });
  }, []);

  return (
    <div className="bk-done" ref={ref} tabIndex={-1} role="status" aria-live="polite">
      <div className="bk-done-seal" aria-hidden>
        <span className="bk-done-ripple" />
        <span className="bk-done-ripple two" />
        <span className="bk-done-burst">
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} style={{ '--i': i } as React.CSSProperties} />
          ))}
        </span>
        <svg viewBox="0 0 64 64" className="bk-done-mark">
          <circle className="bk-done-ring" cx="32" cy="32" r="29" />
          <path className="bk-done-tick" d="M19 33.5l8.5 8.5L45.5 24" />
        </svg>
      </div>

      <span className="bk-done-badge bk-rise" style={{ '--d': 0 } as React.CSSProperties}>
        You&rsquo;re all set{summary.firstName ? `, ${summary.firstName}` : ''}
      </span>

      <h2 className="bk-rise" style={{ '--d': 1 } as React.CSSProperties}>
        We have received your payment for <em>1:1 Consultation Call.</em>
      </h2>

      <p className="bk-done-lede bk-rise" style={{ '--d': 2 } as React.CSSProperties}>
        Our <strong>Senior Consultant</strong> will get in touch with you within the next{' '}
        <strong>24&ndash;48 hours</strong> to schedule this call for you.
      </p>

      <div className="bk-done-chips bk-rise" style={{ '--d': 3 } as React.CSSProperties}>
        {summary.preferredLanguage && (
          <span className="bk-done-chip">
            <small>Call language</small>
            {summary.preferredLanguage}
          </span>
        )}
        {summary.whatsapp.trim() && (
          <span className="bk-done-chip">
            <small>We&rsquo;ll reach you on</small>
            {summary.whatsapp}
          </span>
        )}
      </div>

      <ol className="bk-done-next">
        {NEXT.map((n, i) => (
          <li
            key={n.title}
            className={i === 0 ? 'bk-rise is-done' : 'bk-rise'}
            style={{ '--d': 4 + i } as React.CSSProperties}
          >
            <span className="bk-done-step" aria-hidden>
              {i === 0 ? '✓' : i + 1}
            </span>
            <span>
              <b>{n.title}</b>
              {n.body}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
