# Nielsen's 10 Heuristics — Homepage Walkthrough
paulojuri.com
Date: 2026-05-22

---

## 1. Visibility of System Status

**Observation:** The contact form (ContactCTA, homepage) shows real-time status feedback: the submit button changes to "Sending…" while the POST is in-flight, and transitions to a success state ("Message sent." with a "Send another →" button) or an error state with a red error message (`role="alert"`, `aria-live="assertive"`). A visual progress bar (2px height, accent color, aria-hidden) fills as the user completes Name/Email/Message fields. The loading state disables the submit button (`disabled:opacity-40 disabled:cursor-not-allowed`).

**Assessment:** Pass. Status is communicated through multiple channels. The progress bar is a nice touch, though it tracks only 3 fields and ignores the Subject field.

---

## 2. Match Between System and the Real World

**Observation:** The NowStrip uses a diamond separator character (◆) between items in a scrolling ticker. The copy language is natural and colloquial: "I turn ambiguous ideas into software people actually want to use," "I care about the details most people ship past." The work list uses plain status labels ("Live," "Building," "Shipped") rather than technical terms. The services page uses plain-English "good for" context lines ("You have an idea but no product yet").

**Assessment:** Pass. The content speaks in plain language. The ◆ separator is decorative but readable. The only oddity is "label-caps" metadata at 0.6rem — this is a UI affordance that breaks the plain-language pattern because it reduces text to near-unreadable labels.

---

## 3. User Control and Freedom

**Observation:** The mobile nav overlay (full-screen, fixed) does not have an obvious close button visible in the overlay layer itself — the hamburger button in the header toggles it, but the header sits behind the overlay at z-index 200 vs the overlay's z-index 200 (same layer). The close button is the same hamburger button, now rendered as an X. The overlay links include `onClick={() => setMenuOpen(false)}`, so tapping any link closes the menu. There is no Escape key handler to close the overlay. The contact form has no "Cancel" or "Clear" action, but the page navigation serves as an escape hatch.

**Assessment:** Partial fail. No Escape key handler on the mobile menu overlay. If a user opens the menu and wants to close it without navigating, they must find and tap the X button — there is no keyboard escape. The overlay `aria-hidden={!menuOpen}` is correct, but tab focus is not trapped inside the overlay when open, so keyboard users may navigate behind the overlay.

---

## 4. Consistency and Standards

**Observation:** The accent color #C8553D is used for: CTAs, the "intersection" and "in mind?" heading highlights, active hover states, selection color (::selection), focus outlines, progress bar, and status dot animation. This creates a consistent visual language. However, the Alfera project's accent color is defined as `#1D4ED8` in `SelectedWork.tsx` and `#C9A84C` in `work/page.tsx` — the same project appears in different colors depending on which page you're on. Additionally, the contact form on the homepage (ContactCTA) and the form on /contact (ContactForm) have different field styles: the homepage version uses bottom-border-only underline inputs on dark bg; the /contact version uses bordered inputs on cream bg. They look and feel like different products.

**Assessment:** Fail for project accent consistency. The two contact forms looking like different UI systems violates the consistency principle.

---

## 5. Error Prevention

**Observation:** Both contact forms use `type="email"` for the email field, which provides browser-native validation. Both have `required` attributes on key fields. Both include a honeypot input (`name="_h"`, `display:none`, `tabIndex={-1}`, `autoComplete="off"`) for spam prevention. However, both forms use `noValidate` on the `<form>` element, disabling native browser validation bubbles. This means field-level validation errors are handled server-side and surfaced only via the top-level error message (`<p role="alert">`), with no inline field-level error messages indicating which specific field failed. A user who submits an invalid email will get a generic error from the API, not an inline "please enter a valid email" on the field itself.

**Assessment:** Partial fail. `noValidate` without client-side field validation means some error states require a server round-trip to discover, and the error message doesn't point the user to the specific field.

---

## 6. Recognition Rather Than Recall

**Observation:** The work list on the homepage shows the project name, tagline, category, and year inline. Visitors do not need to remember context from a previous page. The nav is always visible (fixed header). The services page row titles are text-based — there is no icon or visual thumbnail system that would require recognition of symbols. The floating cursor preview card in ServicesShowcase provides an "at-a-glance" summary of a service row without requiring the user to hover and then remember what each service row title means.

**Assessment:** Pass. The site generally shows content inline rather than requiring recall. The NowStrip ticker is the only element where content cycles past and may not be readable before it loops — but it loops continuously so users can wait.

---

## 7. Flexibility and Efficiency of Use

**Observation:** The library page has a jump navigation (`<nav aria-label="Jump to category">`) allowing direct anchor links to any of the 11 shelves — a genuine efficiency affordance for repeat visitors who know what they're looking for. The journal page includes tag filtering (via JournalMasthead), allowing filtering by topic. Work pages presumably have previous/next navigation (WorkPostNav exists as a component). The homepage places the full contact form inline, so a motivated visitor can reach out without navigating to a separate page. There are no keyboard shortcuts.

**Assessment:** Pass with minor gaps. No expert shortcuts or keyboard shortcuts, but anchor navigation and tag filtering are sensible efficiency tools for the most content-heavy sections.

---

## 8. Aesthetic and Minimalist Design

**Observation:** The homepage has zero images — all visual interest comes from typography, color blocks, and micro-interactions. The hero section is almost entirely whitespace + one heading + one subheading + two buttons. The work rows are text-only with colored stripes and status dots. This is a strong minimalist position. However, some elements undercut the minimalism: the ghost decorative numbers (the "6+" at opacity 0.04 in AboutTeaser, the "01" at opacity 0.07 in the work hero) are trendy but add visual noise with no information value. The NowStrip runs continuously even after the user has read all four items, adding perpetual motion to a section that has nothing new to say after one loop.

**Assessment:** Strong aesthetic execution with a few overcrowded decorative elements that don't earn their space.

---

## 9. Help Users Recognize, Diagnose, and Recover from Errors

**Observation:** The contact form error state shows a `<p role="alert" aria-live="assertive">` with the error message text (e.g. "Network error. Please try again." or the API error string). The success state shows `<p>Message sent.</p>` with a "Send another →" button to reset. The error message is visible in red (color #F87171 in ContactCTA, Tailwind `text-red-600` in ContactForm). Neither form shows which specific field caused the failure — the error floats above the submit button without anchoring to a specific field. On network errors the user sees a generic message with no guidance on alternative contact methods, though `hello@paulojuri.com` is visible nearby.

**Assessment:** Partial pass. Error messages are present, announced to assistive technology, and generally legible. Field-level error attribution is missing.

---

## 10. Help and Documentation

**Observation:** The contact page includes a 4-question FAQ section (dl/dt/dd structure) covering: response time, international clients, minimum engagement, and equity/deferred payment. These address the four most likely pre-contact anxiety points for a potential client. There is no FAQ on the services page (where the questions would be most relevant), and no onboarding guidance for any of the tools mentioned on the about page. The work case studies (not fully read) would function as the primary documentation of what working with Paul Ojuri looks like in practice.

**Assessment:** Pass on /contact. The FAQ is well-targeted at actual client questions. Gap: the FAQ would be more valuable if it also appeared on (or was linked from) the services page, which is where pre-hire questions typically arise.
