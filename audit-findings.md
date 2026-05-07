# Comprehensive Audit Report — 7 Deadly Sins Card Game

## 1. SECURITY AUDIT

### Critical Issues
1. ~~**Blog search SQL injection via Supabase `.or()` filter**~~ — **Fixed.** `getBlogPosts` now strips every PostgREST `.or()` metacharacter (`. , ( ) : % _ * " \`) before interpolation and caps the value at 64 chars (`server/db-supabase.ts`). Zod still validates max length 200 at the router boundary.

2. ~~**Discussion delete has NO ownership check**~~ — **Fixed.** `discussion.delete` requires `guestId` at the router (no longer optional), and `deleteDiscussionComment` short-circuits when the stored `guest_id` doesn't match — no fallthrough path. The router now throws `FORBIDDEN` instead of silently returning `false`. The client (`DiscussionThread.tsx`) passes the stored guestId. Covered by `server/discussion.auth.test.ts`.

3. ~~**Discussion upvote has NO rate limiting**~~ — **Fixed.** `discussion.upvote` is now wrapped in an IP-based sliding-window limiter (`server/rateLimit.ts`, 30 upvotes / minute / IP). Per-instance only — see CODEBASE.md §11 limitation 4.

4. ~~**User purge endpoint has NO auth verification**~~ — **Fixed.** `user.purge` now requires the caller's Supabase access token; the server verifies via `supabase.auth.getUser()` and rejects mismatches with `FORBIDDEN`/`UNAUTHORIZED`. Covered by `server/user.purge.test.ts`.

5. ~~**Blog content rendered via dangerouslySetInnerHTML without sanitization**~~ — **Already fixed in code.** `client/src/pages/BlogPost.tsx:13,285` imports DOMPurify and runs `DOMPurify.sanitize(renderContent(post.content), {...})` before injecting into the page. The audit note predates that change.

### Medium Issues
6. **Client-side playerId is trusted for all mutations** — the entire auth model still relies on client-generated UUIDs for game/community operations. The newly-added `accessToken` check on `user.purge` is the pattern to extend if/when other procedures need real auth (`deck.delete`, `community.unpublish`, etc. currently still trust the client UUID).

7. ~~**No Content-Security-Policy header**~~ — **Fixed.** CSP, X-Frame-Options, and frame-ancestors were already set in `server/_core/index.ts` (Express dev server) but were missing from `api/_source.ts` (the Vercel serverless entry that actually serves production traffic). Both paths now share the same header set.

### Good Practices Already in Place
- Zod input validation on all endpoints with max lengths
- HTML entity stripping on user inputs (`.replace(/[<>"'&]/g, "")`)
- Security headers (X-Content-Type-Options, X-Frame-Options, HSTS in prod)
- Service role key only on server side, anon key on client
- Ownership checks on deck CRUD and community deck operations
- Author-only delete on community comments (deleteDeckComment checks playerId)

---

## 2. BRANDBOOK AUDIT

### Background Color Inconsistency (HIGH) — **Fixed**
The Brandbook still shows `#141210` ("Cathedral Stone") in its swatch, but pages now route through two CSS variables defined in `client/src/index.css`:

- `--color-page-bg` (`#0a0a0f`) — standard page bg, used by Blog, BlogPost, Account, Collection, MatchupMatrix, GameRules, Chronicles, ChronicleView, etc.
- `--color-page-bg-deep` (`#050508`) — hero/landing bg, used by Home, Cookies, Privacy, Terms, Changelog, BalanceAnalysis.

A grep for raw `bg-[#0…]` page wrappers returns only the Brandbook swatch boxes (intentional). To change the background palette site-wide, edit the two CSS variables.

### Font Usage Inconsistency (MEDIUM) — **Resolved**
Pages now use `font-[Cinzel]` (no quotes) consistently — the previous `font-['Cinzel']` quoted form has been removed. Some files still use `style={{ fontFamily: "var(--font-heading)" }}` inline, which is intentional for elements that render before Tailwind classes are applied.

### Accent Color Consistency (LOW)
- Brandbook defines "Candlelight" `#d4a854` as the accent
- Most pages use `amber-400`/`amber-500` which is close but not exact
- CommunityDecks/PlayerProfile use `amber-` Tailwind classes consistently — acceptable

### Good Brand Practices
- Consistent gothic/dark theme across all pages
- Self-hosted fonts (no Google Fonts render-blocking)
- Sin-specific OKLCH color system in CSS variables
- Consistent use of Cinzel for headings across most pages

---

## 3. PERFORMANCE AUDIT

### Critical: Babylon.js Bundle (6.7MB gzipped 1.5MB)
- `babylon-DOCJ3LV6.js` is 6,786 KB — dominates the entire bundle
- Already dynamically imported (good) but still a massive download for game pages
- Only used by GameBoard, Lobby, and Home (hero scene)
- **Recommendation**: Consider tree-shaking specific Babylon modules more aggressively in GameBoardBabylonScene.tsx (it already imports specific paths)

### Large Page Chunks
| Page | Raw | Gzipped | Status |
|------|-----|---------|--------|
| GameBoard | 277 KB | 49 KB | Acceptable (complex game UI) |
| vendor | 563 KB | 169 KB | React + deps, normal |
| framer-motion | 123 KB | 41 KB | Consider replacing with CSS animations where possible |
| DeckBuilder | 118 KB | 21 KB | Large but lazy-loaded |
| cardData | 113 KB | 15 KB | Static data, could be split |
| Brandbook | 113 KB | 22 KB | Large but rarely visited |
| BalanceAnalysis | 83 KB | 14 KB | Acceptable |
| MatchupMatrix | 72 KB | 13 KB | Acceptable |
| CommunityDecks | 69 KB | 11 KB | Acceptable |

### Positive Performance Patterns
- All pages are lazy-loaded via React.lazy()
- Fonts use `font-display: swap` (no FOIT)
- Self-hosted fonts from Supabase CDN (fast)
- Images use CDN URLs
- Supabase queries use `.select()` with specific columns in most cases

### Opportunities
1. **Supabase query batching**: Some pages make multiple sequential queries that could be batched
2. **Comment counts**: `getDeckCommentCounts` makes individual queries per deck ID — could use `.in()` filter
3. **Win rate batch**: `batchDeckWinRates` iterates deck IDs — could be optimized with a single query

---

## 4. CODE REVIEW

### Dead Code
1. ~~**server/db.ts** (414 lines)~~ — **Removed.** The file was previously renamed to `server/db.deprecated.ts` and all imports already live on `db-supabase.ts`; the deprecated file is now deleted.

2. **drizzle/schema.ts** — Still kept for `discussion.test.ts` schema-shape assertions and Drizzle types referenced by `_core/context.ts`. Keep for now; revisit if the Drizzle types are no longer consumed.

3. ~~**getDeckCommentCount** (singular)~~ — Already removed (see Changelog v6.x). Only `getDeckCommentCounts` (batched) remains.

### Architecture Issues
1. ~~**routers.ts is 700+ lines**~~ — **Resolved.** Split into `server/routers/` with one file per top-level domain (`auth`, `discussion`, `deck`, `community`, `profile`, `user`, `blog`, `game`, `indexnow`) plus an `index.ts` that composes them. The `from "./routers"` / `from "../../../server/routers"` imports still resolve via `routers/index.ts`.

2. **db-supabase.ts is ~1100 lines** — Still monolithic but well-sectioned with `// ─── X ───` markers. Splitting would touch every importer and only marginally improves comprehension. Defer until the file gains another major domain.

3. **CommunityDecks.tsx is 1500+ lines** — Still monolithic. Modal extraction is mechanical but high state-coupling; defer until specific UX work needs to touch it.

### Type Safety
- Many `any` types in row mappers (db-supabase.ts) — acceptable for Supabase SDK but could use generated types
- Good Zod validation on all tRPC inputs

### todo.md Inconsistency — **Documented**
The todo.md is effectively a historical changelog from v0 → v6.7.x. The "v5.8.0 unchecked items" the audit flagged are actually all checked off in the current file; what remains unchecked at the bottom is mostly residual "Push to GitHub" lines from sections whose code has long since shipped. A header note has been added to the top of `todo.md` so future readers don't treat it as an active task tracker.

---

## 5. RECOMMENDED SAFE REFACTORS (won't break anything)

### Priority 1 — Security Fixes
- [x] Sanitize blog search input (strip PostgREST operators)
- [x] Add DOMPurify to BlogPost.tsx
- [x] Add ownership check to discussion.delete
- [x] Add Content-Security-Policy header (Express + Vercel serverless entry)
- [x] Add auth verification to user.purge
- [x] Rate-limit discussion.upvote

### Priority 2 — Brand Consistency
- [x] Standardize page backgrounds to a single CSS variable
- [x] Normalize font-[Cinzel] syntax across all pages

### Priority 3 — Performance
- [x] Remove unused getDeckCommentCount (singular) function
- [x] Optimize batchDeckWinRates to use single Supabase query

### Priority 4 — Code Quality
- [x] Remove dead db.ts (was renamed to db.deprecated.ts, now deleted)
- [x] Documented todo.md as a historical changelog (residual unchecked items are stale "push" lines, not pending work)
- [x] Split `routers.ts` into per-domain sub-routers under `server/routers/`

### Still Open (Larger Refactors — explicitly deferred)
- [ ] Split `db-supabase.ts` (~1100 LOC) into domain modules — defer; well-sectioned today and splitting touches every importer
- [ ] Split `CommunityDecks.tsx` (1500+ LOC) — defer; modal extraction is mechanical but high state-coupling, do alongside specific UX work
- [ ] Tighten generated Supabase types instead of the `any` row mappers — needs Supabase project access and a type-generation step
- [ ] Move per-instance rate limit to Upstash/Redis if multi-lambda abuse becomes real

### Bugs Caught Along The Way
- [x] `game.chooseSin` Zod enum only accepted 4 sins (`wrath/sloth/greed/envy`) even though `SinType` lists all 7 and the Lobby UI surfaces all 7. Now accepts all `SinType` values.
