---
name: Girivalam persisted-data render crashes
description: Why "crashes every time on reload" on web maps to bad saved data, and the hardening pattern that fixes it.
---

# Persisted-data render crashes (the "reload → crash → reload" loop)

**Symptom signature:** app is healthy with EMPTY storage (screenshots/tsc/bundle all clean) but a
user reports it "crashes again immediately, every time" on the web preview. That loop is the tell:
a render crash from the user's POPULATED/old-shaped AsyncStorage (web = localStorage) that a plain
reload re-reads. The app's ErrorBoundary → ErrorFallback only offered "Try Again" = `reloadAppAsync()`,
so it reloaded into the same data and crashed forever.

**Why screenshots never catch it:** the screenshot/app_preview browser has a fresh, empty localStorage,
and deep-links bypass intro. Empty-state branches render fine; the bug lives only in populated-state
render paths. You usually cannot reproduce it locally because the data lives in the user's browser.

**Hardening pattern (apply all three):**
1. Store layer — `loadList<T>()` in `lib/pilgrimage-store.ts` guarantees array-of-objects (drops
   non-arrays and non-object items). Route every list getter through it. Raw `JSON.parse` lets a
   non-array make `[...list]`/`.sort`/`.filter`/`.map` throw.
2. Escape hatch — `ErrorFallback` has a "Reset app data & reload" button (`AsyncStorage.clear()` then
   reload). Without it, any persistent data crash is an unbreakable loop. Keep `clear()` (broad) over
   namespaced removal: it also wipes non-namespaced keys (FloatingAssistant POS_KEY, wisdom bookmarks,
   route-map prep-seen) that could themselves be the crash source.
3. Per-item field guards — `loadList` guarantees objects, NOT field presence. Guard dereferences on
   saved items: `(s.body ?? "").slice(...)`, `KIND_META[m.kind] ?? KIND_META.note`,
   `CAT_ICON[r.kind] ?? "document-outline"`. Old data often lacks fields added in later versions.

**Why:** old app versions wrote different/partial shapes; `load<T>` only falls back on JSON throw, not
on shape mismatch, so valid-but-stale data passes straight through to consumers.

**How to apply:** when a Girivalam (or similar local-first Expo) crash only reproduces for a user and
not with empty storage, suspect a populated-render path. Harden the store load + add/verify the reset
escape hatch before hunting individual screens; then guard the specific item-field dereferences.
