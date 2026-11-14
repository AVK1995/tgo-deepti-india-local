'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SiteFooter } from '@/components/shared/SiteFooter';
import { business } from '@/lib/site';
import { asset } from '@/components/shared/asset-version';
import { WhatsappIcon } from '@/components/shared/icons';
import { trackPurchase } from '@/lib/track';
import { BookingForm, type BookingSummary } from '@/components/book-a-call/BookingForm';
import { BookingSuccess } from '@/components/book-a-call/BookingSuccess';

/**
 * THE SIXTH SURFACE · /book-a-call
 *
 * ── WHERE THIS SITS IN THE FLOW ────────────────────────────────────────
 *   landing -> checkout -> PAYMENT -> /book-a-call?p=<payment_id> -> PROFILE -> confirmation (same page)
 *
 * ── CALENDAR REPLACED BY A STEPPED FORM (2026-11-12) ───────────────────
 * The Cal.com embed is gone. The buyer completes a four-step consultation
 * profile (About you · Your health · Your commitment · Your preferred time).
 * The answers go to /api/booking, which forwards them to BOOKING_WEBHOOK_URL,
 * and a Senior Consultant then reaches out within 24-48 hours to schedule
 * the call.
 *
 * ── THE COPY'S ONE RULE ────────────────────────────────────────────────
 * The buyer is NOT booking a slot here, and the page must not say they are.
 * But it must not read as a "request" either, which sounds like it could be
 * refused after they have paid. So the framing is: the call is theirs, this
 * is the profile that prepares it, and the team schedules it for them.
 *
 * ── AFTER SUBMIT ───────────────────────────────────────────────────────
 * No navigation. The page swaps the form for the animated confirmation
 * (components/book-a-call/BookingSuccess.tsx) and drops every "complete
 * your profile" push below it, because on a page whose job is done those
 * buttons are bugs. /thank-you is no longer reached from this flow.
 *
 * Still the FIRST page after a payment, so it still fires the browser-side
 * GA4 purchase, keyed on the payment id. Meta's Purchase is the webhook's.
 */

/* wa.me wants bare digits with no plus and no spaces; phoneE164 carries the
   plus, so it is stripped here rather than a second literal being kept. */
const WA_DIGITS = business.phoneE164.replace(/\D/g, '');

/* Under the form: the three things a buyer hesitating over it is wondering. */
const REASSURANCES = [
  ['Read by a Senior Consultant', 'Your answers are reviewed before the call, so the call is spent on you.'],
  ['Scheduled for you', 'Our team gets in touch within 24–48 hours to fix your call.'],
  ['Your time, respected', 'We plan your call around the date and time you choose.'],
] as const;

/* Verbatim from FAQ 1 of the landing copy, split at the source's own seams. */
const WALK_AWAY = [
  {
    title: 'A proper read of your reports',
    body: 'Your weight, health reports, symptoms, eating habits, lifestyle and medical history, looked at together instead of one condition at a time.',
  },
  {
    title: 'What may be keeping you stuck',
    body: 'The previous weight-loss efforts that did not hold, and the specific reasons they did not, in your body rather than in general.',
  },
  {
    title: 'An honest yes or no',
    body: 'Whether the programme is the right next step for you. If it genuinely is not the right fit, we will tell you honestly.',
  },
] as const;

const PROOF_ROW_1 = ['1.webp','2.webp','3.webp','4.webp','5.webp','6.webp','7.webp','8.webp','9.webp','10.webp','11.webp','12.webp'];
const PROOF_ROW_2 = ['13.webp','14.webp','15.webp','16.webp','17.webp','18.webp','19.webp','20.webp','21(1).webp','21.webp','22.webp','23.webp'];

const FAQS = [
  {
    q: 'Is this a sales call?',
    a: 'No. This is a personalised health assessment. Deepti and her team will understand your current weight, health reports, symptoms, eating habits, lifestyle, medical history and previous weight-loss efforts to identify what may be keeping you stuck. The goal is to help you understand your current health picture and whether Deepti’s programme is the right next step for you. If the programme genuinely isn’t the right fit, we’ll tell you honestly. No pressure. No unnecessary selling.',
  },
  {
    q: 'What should I have ready?',
    a: 'Your most recent blood reports, however old they feel, and bring them even if you think they are normal. The medication and supplements you currently take, with doses if you know them. And a rough sense of what a normal day of eating looks like for you. If you do not have recent reports, come anyway and we will tell you which ones are worth doing.',
  },
] as const;

export default function BookACallPage() {
  return (
    <Suspense fallback={null}>
      <BookACall />
    </Suspense>
  );
}

function BookACall() {
  const params = useSearchParams();
  const paymentId = params.get('p') ?? '';
  /* Set by the checkout when the order bump was in the paid order, so the
     GA4 purchase reports the real total and the profile row carries it. */
  const withBump = params.get('b') === '1';
  const [done, setDoneState] = useState<BookingSummary | null>(null);

  /* ── THE CONFIRMATION SURVIVES A RELOAD (2026-11-12) ────────────────────
     Once submitted, the summary is kept for this tab session, keyed on the
     payment id. A refresh, a back-forward, or a dev-server reload then shows
     the confirmation again instead of an empty form, which would read as
     "it did not go through" and invite a duplicate submission. */
  const doneKey = `dp_booked_${paymentId || 'anon'}`;
  const setDone = (s: BookingSummary) => {
    try {
      sessionStorage.setItem(doneKey, JSON.stringify(s));
    } catch {
      /* storage blocked: the confirmation still shows for this page view */
    }
    setDoneState(s);
  };
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(doneKey);
      if (saved) setDoneState(JSON.parse(saved) as BookingSummary);
    } catch {
      /* nothing saved, or unreadable: show the form */
    }
  }, [doneKey]);

  /* GA4 only, and only with a payment id to key it on. */
  useEffect(() => {
    if (paymentId) trackPurchase(paymentId, withBump);
  }, [paymentId, withBump]);

  return (
    <div className={done ? 'dp-book is-done' : 'dp-book'}>
      {/* 1 · confirmation strip */}
      <div className="bk-strip">
        <span className="bk-strip-tick" aria-hidden>
          ✓
        </span>
        Payment received
        <span className="bk-strip-sep" aria-hidden>
          ·
        </span>
        {done ? (
          <>
            <span className="bk-strip-tick" aria-hidden>
              ✓
            </span>
            Details received
          </>
        ) : (
          <>
            1 step left
            <span className="bk-strip-sep" aria-hidden>
              ·
            </span>
            Takes about 2 minutes
          </>
        )}
      </div>

      <section className="bk-body">
        <div className="wrap">
          {/* 2 · step dots */}
          <ol className="bk-steps" aria-label="Progress">
            <li className="done">
              <span className="bk-dot" aria-hidden>
                ✓
              </span>
              Paid
            </li>
            <li className={done ? 'done' : 'now'} aria-current={done ? undefined : 'step'}>
              <span className="bk-dot" aria-hidden>
                {done ? '✓' : '2'}
              </span>
              {done ? 'Form submitted' : 'Call booking form'}
            </li>
          </ol>

          {done ? (
            <BookingSuccess summary={done} />
          ) : (
            <>
              <div className="bk-mast">
                <span className="bk-pill">One step left</span>
                <h1>
                  Your payment is in. Now tell us about you.
                  <br />
                  <em>So your consultation starts from your story.</em>
                </h1>
                <p className="bk-deck">
                  Four short steps. Your answers go straight to the Senior
                  Consultant who will speak with you, so your call is spent on
                  you, not on paperwork.
                </p>
              </div>

              {/* 3 · THE FORM CARD */}
              <div className="bk-card" id="profile">
                <div className="bk-card-head">
                  <h2>Your call booking form</h2>
                  <p>4 short steps · about 2 minutes. Questions marked * are required.</p>
                </div>

                <BookingForm paymentId={paymentId} withBump={withBump} onDone={setDone} />

                <ul className="bk-reassure">
                  {REASSURANCES.map(([t, b]) => (
                    <li key={t}>
                      <span className="bk-check" aria-hidden>
                        ✓
                      </span>
                      <span>
                        <b>{t}.</b> {b}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* 4 · proof */}
        <div className="bk-proof">
          <div className="wrap">
            <h2 className="bk-h2">
              They started with the same reports. <em>Then they told us their story.</em>
            </h2>
            <p className="bk-h2-sub">Real clients, mid-programme, in their own words.</p>
          </div>
          <div className="bk-strips">
            {[PROOF_ROW_1, PROOF_ROW_2].map((row, r) => (
              <div className={r === 0 ? 'bk-marquee ltr' : 'bk-marquee rtl'} key={r}>
                <div className="bk-track">
                  {[0, 1].map((copy) =>
                    row.map((src) => (
                      <div className="bk-shot" key={`${copy}-${src}`} aria-hidden={copy === 1 ? true : undefined}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={asset(`/testimonials/${src}`)}
                          alt=""
                          width={739}
                          height={1314}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="wrap">
          {/* 5 · what the 30 minutes gets you */}
          <h2 className="bk-h2">
            What you walk away with in <em>30 minutes</em>
          </h2>
          <ol className="bk-value">
            {WALK_AWAY.map((w, i) => (
              <li key={w.title}>
                <span className="bk-ord">{String(i + 1).padStart(2, '0')}</span>
                <h3>{w.title}</h3>
                <p>{w.body}</p>
              </li>
            ))}
          </ol>

          {/* 6 · the nudge. Only while there is still something to do. Its
              button lives in the sticky bar now, not inline. */}
          {!done && (
            <div className="bk-nudge">
              <h2>
                This is the part people leave <em>for Monday.</em>
              </h2>
              <p>
                Paying was the decision. These answers are what let us prepare
                for you. They take about two minutes, and then our team takes it
                from there.
              </p>
            </div>
          )}

          {/* 7 · objections before, preparation after */}
          <h2 className="bk-h2">
            {done ? 'Before your call' : 'Two quick questions before you continue'}
          </h2>
          <div className="bk-faq">
            {FAQS.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>

          <p className="bk-help">
            {done ? 'Questions in the meantime?' : 'Need help?'}{' '}
            <a href={`https://wa.me/${WA_DIGITS}`} target="_blank" rel="noopener noreferrer">
              <WhatsappIcon size={13} /> WhatsApp us
            </a>
            , write to <a href={`mailto:${business.email}`}>{business.email}</a> or call{' '}
            <a href={`tel:${business.phoneE164}`}>{business.phone}</a>.
          </p>
        </div>
      </section>

      <SiteFooter />

      {/* The one call to action below the form, on every screen size. A
          spacer keeps it from covering the footer's last lines. */}
      {!done && (
        <>
          <div className="bk-sticky-spacer" aria-hidden />
          <StickyFormCta />
        </>
      )}
    </div>
  );
}

/**
 * THE STICKY "FILL CALL BOOKING FORM" BAR (2026-11-12)
 *
 * Replaces the buttons that used to sit in the proof, nudge and closing
 * sections. Hidden while any part of the form card is on screen (the buyer
 * is looking at or filling it, and a bar over the form's own buttons would
 * be in the way), and slides up once the form has scrolled fully out of
 * view ABOVE. Above-only: on first load the form sits below the masthead,
 * and a bar pointing at something already about to be read is noise.
 */
function StickyFormCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const card = document.getElementById('profile');
    if (!card) return;
    const io = new IntersectionObserver(
      ([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    io.observe(card);
    return () => io.disconnect();
  }, []);

  const go = () => {
    const card = document.getElementById('profile');
    card?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    /* hand focus to the first field once there, for keyboard users */
    window.setTimeout(() => {
      card?.querySelector<HTMLElement>('input, button[role="radio"], .bk-sel-btn')?.focus({ preventScroll: true });
    }, 600);
  };

  return (
    <div className={show ? 'bk-sticky on' : 'bk-sticky'} aria-hidden={!show}>
      <div className="bk-sticky-in">
        <p className="bk-sticky-text">
          <span className="bk-sticky-dot" aria-hidden />
          <span>
            <b>1 step left.</b> Takes about 2 minutes.
          </span>
        </p>
        <button type="button" className="bk-btn bk-sticky-btn" onClick={go} tabIndex={show ? 0 : -1}>
          Fill Call Booking Form
          <span aria-hidden>&nbsp;&rarr;</span>
        </button>
      </div>
    </div>
  );
}
