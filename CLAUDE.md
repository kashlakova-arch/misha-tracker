# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Misha Health Tracker — a single-file PWA for calmly tracking a dog's health. No build step, no
dependencies, no framework. The entire app (HTML + CSS + JS) lives in `index.html`; `manifest.json`,
`sw.js`, and `icon.svg` support install/offline. UI and all code comments are in Russian.

`PLAN.md` is the roadmap from this prototype to the full product/tech spec; `README.md` has the run
instructions and a summary of the status logic.

## Commands

- **Run the app:** open `index.html` directly in a browser (`file://`). Everything works; data persists
  in `localStorage`.
- **Run as an installable PWA:** the manifest and service worker only activate over `http(s)`. Serve the
  folder — `npx serve .` — and open the served URL.
- **Test the status logic:** `node tests.js` from the repo root. The harness reads `index.html`, slices
  out the rules block + `evaluate` function (the text between `var RULES = {` and `var STATUS_TEXT =`),
  builds it with `new Function`, and asserts on scenario cases. Keep this file in sync with every change
  to `evaluate()`, `RULES`, or the `QUESTIONS` answer values.
- No linter, no `package.json`, no bundler. Node is only used for the logic tests.
- After changing any cached asset, bump `CACHE` in `sw.js` — otherwise the old cache is served.

## Code style constraints

- `index.html` and `sw.js` target **iPhone Safari** — keep them ES5-ish: `var`, `function`, string
  concatenation (no arrow functions / template literals / optional chaining). The inline app script is a
  single `"use strict"` IIFE. Test files under Node may use modern JS freely.
- Section boundaries in the inline script are marked with Cyrillic box-drawing comment banners
  (`/* ═══ ... ═══ */`); follow that convention.

## Architecture

### Screens and navigation
Each screen is a `<section class="screen" id="s-...">` (`s-setup`, `s-home`, `s-check`, `s-quick`,
`s-result`, `s-diary`). `show(id)` toggles the `.active` class — there is no router and no history.
Each screen has its own `render*()` function that rebuilds its DOM from state on entry.

### State and storage
Module-level `profile` and `entries` are the app state, read once at startup and written through
`load` / `save` / `drop` — thin `try/catch` + `JSON` wrappers over `localStorage`. Keys:
`misha.profile.v2`, `misha.entries.v2`, `misha.reminder` (a `{at}` timestamp set by the yellow-result
"Напомнить через 3 часа" button, cleared on the next completed check, surfaced on Home). `migrate()`
copies `misha.*.v1` forward (v1 left intact). `normalizeProfile(p)` fills every key from
`PROFILE_DEFAULTS` (so old thin profiles gain the new fields) and is applied on load, on import, and in
`readProfileForm()`. New check results are `unshift`ed onto `entries` (newest first), capped at 400.
Export/import round-trips `{app:"misha-health-tracker", schema, profile, entries}` as a JSON file; the
profile screen's "Удалить все данные" drops both keys.

The profile screen (`#s-setup`, titled "Профиль Миши") is one scrollable form: photo (tap avatar →
file → canvas-downscaled 320px JPEG data URI, default `assets/misha.webp`), identity, chronic notes,
appetite norm, limp norm (0–3 + paw + "when it worsens"), GI, `tempNorm`, and two emergency clinics
(name / phone / address). `renderSetup` populates inputs and calls the small `render*` helpers for the
dynamic controls (`renderSkips`, `renderLimpNorm`, `renderNormPaws`, `renderSexSeg`); `readProfileForm`
reads it all back.

### The decision engine — `evaluate(answers, profile)`
The core of the product. Returns `{ status, red[], yellow[], ok[] }`:
- **`red`** — hard signs, evaluated **without** reference to the personal norm (dark/red urine, very pale
  or yellow gums, labored breathing, sudden weakness or fainting, vomiting blood, repeated vomiting
  *with* clear deterioration, 40 °C+ with overheating signs).
- **`yellow`** — deviations **from this dog's personal norm** (clear deterioration, not eating >24h,
  repeated vomiting, limp worse than baseline or a new paw, ≥39.4 °C while unwell) **or** two or more
  small differences at once (`moderate[]`: a bit quieter, ate less, redder gums, heavier breathing,
  one-off vomiting) — one alone stays green with an `ok` note.
- **`neutral`** — "Проверка неполная": no red signs and ≥2 key objective indicators (urine, gums,
  breathing) answered "Не проверяла". Sits between yellow and green; never alarming.
- **`ok`** — things deliberately **not** treated as alarms, with an explanation (a single skipped meal,
  one small difference, habitual chronic limp at or below baseline, and — for `neutral` — what was left
  unchecked). Shown to the owner so it's visible the sign was seen, not missed.
- **Status precedence:** `red` > `yellow` > `neutral` > `green`.

Tunable thresholds live in the `RULES` object (`version`, `temp.yellowMin/redMin`, `fastHours`,
`moderateForYellow`, `keyUnknownForNeutral`) — product rules pending veterinary confirmation. Changing
any threshold means bumping `RULES.version`; each entry stores `rulesVersion` so history stays readable.

### Data-driven questionnaires
- `QUESTIONS` — the 9-step guided check. Each entry: `id`, `title`, `hint`, `options[]`
  (`{v, label, desc, skip?}`), and a `short` map (answer value → diary label). Every question carries the
  shared `UNKNOWN` option ("Не проверяла"). Two steps are special-cased: `type:"limp"`
  (`renderLimpQuestion`, `LIMP_SCALE` 0–3 rating + paw picker + "не смотрела") and `type:"temp"`
  (`renderTempQuestion`, °C text input + "не мерила" + an overheating checkline → `answers.overheat`).
  `renderQuestion()` walks this array; the progress bar is `step / QUESTIONS.length`.
- `QUICK` — the "Что-то не так" shortcut list. Each item has a `level` (`red` / `yellow`) and an optional
  `redIf` (escalates to red only when another named item is also checked). Its handler builds an entry
  directly without running `evaluate()`.
- Reference tables shared across screens: `PAWS`, `LIMP_SCALE`, `SKIPS`, `STATUS_TEXT` (title + guidance
  text per status), `Q_TITLES` (short labels for the diary).

Both flows produce the same entry shape, so `renderResult()` and `renderDiary()` handle full and quick
checks uniformly.

### Walk log, media, vet report (screens `s-walk`, `s-report`)
`s-walk` (Home's quiet "Отметить после прогулки") writes a diary entry with `type:"walk"`,
`status:"log"`, observations in `ok[]`, a `note`, and `media[]` — no evaluation. Ticking "Нашли клеща"
routes to `openTickForm(null)` on save. `renderHome` skips `type:"walk"` when picking the "last check";
`renderDiary` renders walk entries with their own observation list. `mediaBlock(entry)` (shown on the
result screen for non-quick checks and in every diary detail) manages `entry.media` — downscaled JPEG
data URIs; its buttons `stopPropagation()` because the diary card is itself a `<button>`. `s-report`
(diary foot "Отчёт ветеринару"): `reportDraft` holds the period + section toggles + `questions`
(persisted to `misha.reportNotes`); `renderReportView` builds a print-friendly summary (only checks
that deviated from norm, counts, temps, meds/ticks/events/photos) with `window.print()` (`@media print`
hides chrome) and a plain-text copy via `buildReportText` + `copyText`.

### Calendar / meds / tick (screens `s-calendar`, `s-meds`, `s-tick`)
Three more localStorage arrays alongside `entries`: `meds` (`misha.meds.v1`), `ticks`
(`misha.ticks.v1`), `events` (`misha.events.v1`) — all in the export/import/wipe set. Each screen is a
JS-rendered list + inline form (`fieldInput` / `segControl` build the form controls; `downscaleImage`
turns a picked photo into a JPEG data URI). `meds` items are `kind:"med"|"treatment"` with a `log[]`
of `{ts,status}` ("дано"/"пропущено"/"отменено врачом" — no nagging, no dose/interaction advice).
`ticks` items carry two photos, an `analyses[]` sub-list, and drive `tickControlDay()` — a
`День X из 21` counter that auto-retires after `TICK_CONTROL_DAYS`. `calendarItems()` merges the next
scheduled check, meds/treatments with a `nextDate`, active tick-control windows, and `events` into one
date-sorted list; overdue rows get a muted `.pill.over`, never an alarm. Reached from the new Home
top-bar calendar icon (`#toCalendar`); meds/tick back-nav returns to the calendar.

### Schedule & reminders
`RULES`-adjacent but profile-driven: `profile.checkAM` / `checkPM` (default 09:00 / 20:00). The
"Расписание и напоминания" module computes `scheduleTimes()` / `nextDue()` / `openWindow()` (a window
is "open" for `WINDOW_MS` after each time, satisfied by a check within `GRACE_MS` before it). Home shows
`#homeNext` ("Проверка на утро" while a window is open and undone, else "Следующая проверка — …") and
`updateStartButton()` demotes `#startCheck` to soft "Проверить ещё раз" once the current window is done.
`scheduleTick()` (run on load + every 60 s) fires local `Notification`s while the page is open — one per
window plus one soft repeat after `REPEAT_MS`, tracked in `misha.notified`; it no-ops unless permission
is granted. `buildIcs()` emits a two-VEVENT daily `.ics` for the system calendar — the reliable path,
since real Web Push needs a server this app doesn't have.

### Editing a past check
`renderResultFoot` shows one status-appropriate primary action (call clinic / set 3h reminder /
"Досмотреть Мишу" / "Готово") plus, for `type:"full"`, "Исправить ответы". Both re-enter the check flow
with `editing = entry.id` set (`editCheck` from step 0, `resumeCheck` from `firstUnanswered`). On
finish, `finishCheck` updates that entry in place rather than creating a new one: it recomputes status,
stores the first pre-edit answers as `answersOriginal`, appends a `{ts, changes:[{field,from,to}]}` to
`revisions` (diffed via `diffAnswers`/`fmtAns`), and sets `editedTs` — surfaced as an "изменено" badge
and a change log in the diary.

### Design rules that are product requirements, not preferences
Warm, calm palette defined as CSS custom properties on `:root` (cream / muted sage / muted amber / muted
terracotta). **The yellow status must never use alarm styling** — no red screens, sirens, vibration, or
"danger" wording. Large one-handed tap targets: icon buttons ≥44px, primary buttons ≥60px. A missed
scheduled check must not raise the status or use anxious language.

### Photos
`2.webp`–`9.webp` in the repo root are source photos from the owner, not finished assets. `6.webp` and
`9.webp` contain people and are private — do not publish them to artifacts or the cloud. PLAN step 0.4
moves the sources to `assets/source/` and derives the app icon and profile avatar from them.
