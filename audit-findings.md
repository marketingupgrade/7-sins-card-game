# Comprehensive Audit Report — 7 Deadly Sins Card Game

## 1. SECURITY AUDIT

### Critical Issues
1. **Blog search SQL injection via Supabase `.or()` filter** (db-supabase.ts:155-157)
   - `opts.search` is interpolated directly into the `.or()` filter string without escaping
   - Zod validates max length (200) but doesn't sanitize special chars like `%`, `.`, `,`
   - An attacker could inject PostgREST filter operators
   - **Fix**: Sanitize search input to strip PostgREST operators

2. **Discussion delete has NO ownership check** (routers.ts:127-129, db-supabase.ts:304)
   - `discussion.delete` accepts any `commentId` and deletes it — no author verification
   - Anyone can delete anyone's discussion comments
   - **Fix**: Add guestId/userId ownership check to deleteDiscussionComment

3. **Discussion upvote has NO rate limiting** (routers.ts:134, db-supabase.ts:315)
   - `discussion.upvote` just increments a counter — can be spammed infinitely
   - No per-user tracking, no cooldown
   - **Fix**: Add upvote tracking table or at minimum IP-based throttle

4. **User purge endpoint has NO auth verification** (routers.ts:508-521)
   - `user.purge` accepts any `supabaseUserId` and deletes ALL their data
   - An attacker who guesses/knows a UUID can wipe another player's data
   - **Fix**: Verify the requesting user matches the target user

5. **Blog content rendered via dangerouslySetInnerHTML without sanitization** (BlogPost.tsx:374)
   - Blog content from Supabase is rendered as raw HTML with no DOMPurify
   - If blog content is ever user-generated or compromised, this is XSS
   - Currently mitigated by admin-only blog content, but fragile
   - **Fix**: Add DOMPurify sanitization before rendering

### Medium Issues
6. **Client-side playerId is trusted for all mutations** — the entire auth model relies on client-generated UUIDs passed in requests. No server-side session verification for game/community operations. This is by design (Vercel deployment without Manus OAuth) but means any user can impersonate another by knowing their UUID.

7. **No Content-Security-Policy header** — the server sets X-Frame-Options, X-XSS-Protection, etc. but no CSP header, which is the modern defense against XSS.

### Good Practices Already in Place
- Zod input validation on all endpoints with max lengths
- HTML entity stripping on user inputs (`.replace(/[<>"'&]/g, "")`)
- Security headers (X-Content-Type-Options, X-Frame-Options, HSTS in prod)
- Service role key only on server side, anon key on client
- Ownership checks on deck CRUD and community deck operations
- Author-only delete on community comments (deleteDeckComment checks playerId)

---

## 2. BRANDBOOK AUDIT

### Background Color Inconsistency (HIGH)
The Brandbook defines `#141210` ("Cathedral Stone") as the primary background, but pages use 5 different background colors:
- `bg-[#050508]` — Home, BalanceAnalysis, Terms, Privacy, Cookies, Changelog
- `bg-[#0a0a0f]` — Collection, MatchupMatrix, GameRules
- `bg-[#0a0810]` — Profile, Account
- `bg-[#0a0a0a]` — Blog, BlogPost
- `bg-zinc-950` — CommunityDecks, PlayerProfile (≈ `#09090b`)
- `bg-arena` — GameBoard, Lobby, NotFound
- `bg-[#141210]` — Brandbook itself

**Impact**: Subtle but noticeable color shifts when navigating between pages.
**Fix**: Standardize to a single CSS variable for page backgrounds.

### Font Usage Inconsistency (MEDIUM)
- Most pages use `font-[Cinzel]` for headings — correct per brandbook
- CommunityDecks and PlayerProfile use `font-['Cinzel']` (with quotes) — works but inconsistent syntax
- Some pages use `style={{ fontFamily: "var(--font-heading)" }}` inline
- Brandbook specifies: Cinzel (headings), Cormorant Garamond (body), Uncial Antiqua (decorative)

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
1. **server/db.ts** (414 lines) — The original Drizzle ORM database layer is still present but only imported by:
   - `server/_core/index.ts` for sitemap generation (getAllBlogSlugs, getRecentBlogPosts)
   - `server/discussion.test.ts` for testing
   - All actual app logic uses `db-supabase.ts`
   - **Recommendation**: Migrate the 2 remaining imports to db-supabase.ts and remove db.ts

2. **drizzle/schema.ts** — Drizzle schema file still exists but is unused since all DB ops go through Supabase
   - Keep for reference but mark as deprecated

3. **getDeckCommentCount** (singular) in db-supabase.ts:804 — exists alongside `getDeckCommentCounts` (plural) but is never imported anywhere

### Architecture Issues
1. **db-supabase.ts is 950+ lines** — should be split into domain modules:
   - `db/blog.ts`, `db/discussion.ts`, `db/deck.ts`, `db/community.ts`, `db/profile.ts`

2. **routers.ts is 667 lines** — should be split into sub-routers:
   - Already has logical sections but could use separate files

3. **CommunityDecks.tsx is 1529 lines** — contains modals, cards, comments, and main page all in one file
   - Should extract: GamertagModal, PublishModal, LogMatchModal, DeckCard, CommentSection

### Type Safety
- Many `any` types in row mappers (db-supabase.ts) — acceptable for Supabase SDK but could use generated types
- Good Zod validation on all tRPC inputs

### todo.md Inconsistency
- The todo.md still has old unchecked items from v5.8.0 at the bottom (the original items before they were completed) — these were never cleaned up, creating confusion about what's actually done

---

## 5. RECOMMENDED SAFE REFACTORS (won't break anything)

### Priority 1 — Security Fixes
- [ ] Sanitize blog search input (strip PostgREST operators)
- [ ] Add DOMPurify to BlogPost.tsx
- [ ] Add ownership check to discussion.delete
- [ ] Add Content-Security-Policy header

### Priority 2 — Brand Consistency
- [ ] Standardize page backgrounds to a single CSS variable
- [ ] Normalize font-[Cinzel] syntax across all pages

### Priority 3 — Performance
- [ ] Remove unused getDeckCommentCount (singular) function
- [ ] Optimize batchDeckWinRates to use single Supabase query

### Priority 4 — Code Quality
- [ ] Remove dead db.ts (migrate 2 remaining imports to db-supabase.ts)
- [ ] Clean up duplicate todo.md entries
