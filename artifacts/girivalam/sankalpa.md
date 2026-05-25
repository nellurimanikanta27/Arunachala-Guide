# Sankalpa — the soul of the Girivalam Pilgrim Guide

> This is not a spec. This is not a roadmap.
> This is the *why* — the backbone, the main motto, the vow.
> Whenever a decision feels confusing, come back here.
> If a feature breaks this document, the feature is wrong — not the document.

Last updated: 2026-05-24

---

## The 5 principle questions

These five questions form the spine of the app. Every feature, every screen,
every word must serve at least one of these answers.

1. **Who is your one pilgrim?** — *answered*
2. **Business or offering?** — *answered*
3. **Are you in Tiruvannamalai, or visiting?** — *answered*
4. **What is your personal sankalpa for building this app?** — *answered*
5. **What is the shape of your commitment?** — *answered*

---

## Q1 — Who is your one pilgrim?

**Answered:** It is not one person. It is **one route, three depths.**

The app must serve three kinds of pilgrim through the same surface:

- **The first-timer** — has visited 0–2 times, doesn't know the route, the
  rituals, the lingams, where to eat, where to stay. Alone, googling on
  the road, no one to ask.
- **The semi-regular** (the founder's own profile) — has visited 3–8 times,
  knows the basics, can plan a day in Tiruvannamalai, but doesn't know
  everything. Wants companion features more than instructions.
- **The local / frequent pilgrim** — lives in or visits Tiruvannamalai often,
  already knows the route by heart, uses the app for tools (japa counter,
  audio, photo capture, journaling), not for guidance.

### The structure that serves all three: **PILLARS**

Each pillar is built so a beginner uses 100% of it, and a regular uses the
right 20%. Nothing in any pillar should feel useless to either end.

- **Pillar 1 — The Girivalam Walk**
  Route, tracking, lingams, geofences, sankalpa, silent mode, end ritual,
  audio overlays, japa counter, photo / video capture, notes, utilities
  (water, toilets, food, ashramas), session memories.

- **Pillar 2 — History, Meditation & Inner Practice**
  Stories of Arunachala, Ramana, Seshadri, Yogi Ramsuratkumar.
  **Meditation library** from beginner to expert — this should grow its
  own fan base, not just serve pilgrims.
  Journaling — the pilgrim writes their own views and thoughts.
  **AI Saint** — lives *inside* Pillar 2, scoped to inner practice and
  reflection. Not a general chatbot.

- **Pillar 3 — Local Guide**
  Temples, ashramas, routes, stays, food, travel.
  Future additions (Prototype 2+):
  - Live hotel availability + booking
  - Live bus & train availability + booking
  - Day-planner / trip-planner

### The founder's own confusion (named honestly)
> "That's why I'm more confused. That's why I'm bothered about everyone.
> That's why I want to include more features."

The confusion is real. The cure is not to drop the three-depth ambition —
it is to give the app **one default voice** so it doesn't have to negotiate
who it's talking to on every screen. Default voice candidate: the
first-timer's voice (because regulars can always *skip*; first-timers can
never *ask*). **This is open and not yet decided.**

---

## Q2 — Business or offering?

**Answered:** Both, but cleanly separated.

### The promise to the pilgrim
- The pilgrim **never pays.** Not now, not ever.
- The app is positioned and promoted as a **service-oriented, free app**
  for pilgrims. That is the public face. That is the truth.
- Influencer promotion frames it this way: free, devotional, in service.

### How revenue is generated (without the pilgrim feeling it)
- **Advertisements** — not in Prototype 1. Introduced near the end of
  Prototype 1 / start of Prototype 2, once there are enough users.
- **Commissions** on stay bookings, travel bookings (hotels, buses, trains)
  — when the user voluntarily uses the booking feature in Pillar 3, the
  app earns a quiet commission from the provider, not from the pilgrim.
- Purpose of revenue: **to run the app and cover the founder's basic
  expenses.** Not to extract wealth from pilgrims.

### The thin line, named
- If the app ever charges the pilgrim to use a feature, it flops.
- If the app's "free service" framing is later contradicted by visible ads,
  it loses trust. So ads must be tasteful, opt-in feeling, and clearly
  separated from the spiritual surface.
- Bookings & commissions are honest because the pilgrim is *already going
  to book a hotel anyway* — the app is just a more convenient surface.

### The rule
> Revenue is generated **around** the pilgrim, never **from** the pilgrim.

---

## Q3 — Are you in Tiruvannamalai, or visiting?

**Answered:** The founder does **not** stay in Tiruvannamalai. The app is
built remotely.

### On the local helper
- A local presence in Tiruvannamalai is understood as necessary — for
  verifying annadhanam, recording real ashram audio, photographing the
  route, holding relationships with priests and ashram people.
- This person is **not a co-founder.** The founder is the sole runner of
  the app.
- The right framing is: a **trusted helper** — an employee, or a devotee
  who helps out of concern and devotion for Arunachala, not for
  ownership of the product.
- Boundary is clean: the founder makes all product decisions. The local
  helper does the on-ground work that cannot be done remotely.

### What this means for how we build
- Anything that needs a *human in Tiruvannamalai* (recording audio,
  verifying free-food spots, photographing lingams, getting ashram
  permissions) is **work that must be scheduled and paid for**, not
  assumed to happen.
- Until that helper exists, content from Tiruvannamalai is the
  bottleneck — not code. We must not over-build features that depend on
  content we don't yet have.
- The first hire / helper should probably happen around the end of
  Prototype 1, so Prototype 2 can ship with real Tiruvannamalai content.

---

## Q4 — What is your personal sankalpa for building this app?

**Answered, in the founder's own words:**

> "My sankalpa is to serve the nation, to save the temple.
>
> Arunachala is a place where you have to visit it multiple times. First
> you visit it, and for a reason — you get clarity, you get mental peace,
> stability in life. So if all the people find it very easy coming and
> going to Arunachala, they travel more to Arunachala. That is why I am
> building this.
>
> I want to make the people comfortable while they come to Arunachala
> and while they leave. The thought of Arunachala in their mind should
> be enough to come here. They should come here very peacefully —
> without any travel problem, stay problem, experience problem, food
> problem. Cleanliness in Arunachala — through this app I want to
> spread that all over Arunachala.
>
> And not only Arunachala. As the founder, I also want to create more
> apps for all the big temples in India, and add more comfort around
> the temple."

### What this means — translated into product law
- This app is a **friction-remover for the pilgrim**, so that the call of
  Arunachala is the only thing they have to feel. Everything mundane —
  travel, stay, food, route, cleanliness — is the app's job to dissolve.
- The success metric is not downloads. It is **return visits.** A pilgrim
  who came once and came back is the only number that proves the app
  worked.
- The app is **Arunachala first, but not Arunachala only.** The
  architecture — pillars, companion-style features, the three-depth
  audience model — should be built so it can be lifted and re-applied
  to other major Indian temples without being rebuilt from scratch.
- "Save the temple" is not a small phrase. It implies the app also
  carries some responsibility for cleanliness, respect, and the
  sustained dignity of the place — not just the comfort of the visitor.
  This may become a feature later (report cleanliness, volunteer
  drives, donations to temple maintenance).

### Implications we must hold
- Architecture decisions should be checked twice: *"Could this also work
  for Tirupati / Madurai / Kashi / Rameshwaram?"* If a decision locks us
  to Arunachala-only, we're paying a future cost.
- Branding: the long game is a family of temple apps, not one app. The
  Girivalam app is the first born — and the proof.
- The local-helper model (Q3) will need to be repeated per temple. So
  the *system* for finding, paying, and trusting a local helper is itself
  a thing worth designing well — not improvised once for Arunachala.

---

## Q5 — What is the shape of your commitment?

**Answered, in the founder's own words:**

> "I really don't have any idea on the questions you asked me, but I
> have only one thought — to really work hard, get it done successfully.
> That's it."

### What this means
- The founder is not measuring this in hours per week, months until
  break-even, or money spent. The commitment is **uncapped and
  open-ended.** Work hard. Finish it. That's the whole rule.
- This is rare and honest. Most people overthink their commitment to
  protect themselves from disappointment. The founder is not protecting
  himself. He is just walking.
- For the working partnership: do not ask "how much time can you
  give this week?" — ask "what's the next thing to get done?" The
  commitment is assumed. The execution is the only conversation.

### The risk we must respect
- Open-ended commitment can become **burnout** if there are no checkpoints.
- So even though the founder has not named limits, *we* — as the
  working system around him — should quietly create natural pauses:
  end of Prototype 1, end of Prototype 2, after each Pournami.
  These are not "are you still committed?" moments. They are
  *"come up for air, look at what you built, then keep walking"* moments.

---

## The "no's" — things we have deliberately said no to
*(empty for now — to fill as we say no to things)*

## The promises — things we will never compromise on
- The pilgrim never pays.
- No feature ships if it would confuse a 65-year-old grandmother who
  doesn't read English.
- The Girivalam walk must work fully offline.
- Audio content must come from real ashrams of Tiruvannamalai, not
  generic stock spirituality.
- The success metric is **return visits to Arunachala**, not downloads.
- Every architecture decision is checked against the question:
  *"Could this work for any major Indian temple, not just Arunachala?"*

## Open questions to revisit
> **Reminder for the companion (the AI):** The founder has chosen to
> pause these questions and continue building. Bring them back up
> *before launch* — not during day-to-day building. Do not nag.

- What is the app's **default voice** when it doesn't know who's holding it?
- Who is the local **helper** (not co-founder) in Tiruvannamalai, and when do we bring them on?
- Which ashram do we approach first for blessing?
- When does Pillar 2's AI Saint launch — Prototype 1 or 2?
- The funding gap: how do we pay the local helper before ad/commission revenue starts?
- Should ads be promised to **only ever appear in Pillar 3** (never in the walk or the inner-practice screens)?
