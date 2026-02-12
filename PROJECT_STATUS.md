# TSmc's Generals - Project Status & Development Notes

**Last Updated:** January 27, 2026  
**Current Version:** 1.5.0  
**Dev Server:** `npm run dev` (usually runs on port 3001)

---

## 📋 PROJECT OVERVIEW

This is a gamified decision-making web app built with React + TypeScript + Vite + TailwindCSS. It features:
- A main "Arbiter" wheel for YES/NO/Edge outcomes
- Mini-games (Crash, Minesweeper, Slots, Coin Flip, Dice)
- Points economy with a Shop system
- Punishment wheel for consequences
- Owner-only configuration panels

---

## ✅ COMPLETED FEATURES

### 1. Shop Item Effects (COMPLETED - Jan 27, 2026)

All 5 shop items now have working effects:

| Item | ID | Price | Effect | Status |
|------|-----|-------|--------|--------|
| **Extra Roll** | '1' | 50 pts | Consumable. Bypasses weekly 3-win limit in The Arbiter. Added to inventory, can stack. | ✅ DONE |
| **Skip Punishment** | '2' | 100 pts | Consumable. After punishment wheel lands, user can skip the result. Uses 1 from inventory. | ✅ DONE |
| **Double Points** | '3' | 200 pts | Timed effect (1 hour). All point earnings are doubled. Timer shown in Shop. | ✅ DONE |
| **Mystery Box** | '4' | 75 pts | Immediate. Opens and gives random points (10-500) with weighted rarity tiers. | ✅ DONE |
| **VIP Badge** | '5' | 500 pts | Permanent. Shows 👑 badge next to user role in Sidebar. One-time purchase. | ✅ DONE |

**Files Modified:**
- `services/pointsService.ts` - Added inventory system, double points timer, VIP badge, mystery box functions
- `components/Shop.tsx` - Purchase handling for each item type, inventory display, mystery box modal
- `components/RngTactician.tsx` - Extra Roll usage when hitting limit
- `components/PunishmentWheel.tsx` - Skip Punishment button after spin
- `components/Sidebar.tsx` - VIP badge display next to user role
- `App.tsx` - Pass VIP badge status to Sidebar

### 2. Mini-Games Bug Fixes (COMPLETED - Jan 27, 2026)

| Issue | Description | Fix |
|-------|-------------|-----|
| **Coin Flip not working** | Button set state but didn't call `playCoinFlip()` | Changed `onClick` to call `playCoinFlip()` directly |
| **Dice Roll not working** | Button set state but didn't call `playDiceRoll()` | Changed `onClick` to call `playDiceRoll()` directly |
| **Slot Machine stale state** | Win check used old `reels` state before animation finished | Pre-determine results with `finalReelsRef` and use that for win calculation |
| **Double Points not applied** | Mini-games didn't use double points multiplier | Added `addPointsWithMultiplier()` to all games |

**Files Modified:**
- `components/MiniGames.tsx` - Fixed button handlers, added double points support
- `components/SlotMachine.tsx` - Fixed stale state bug, added double points
- `components/CrashGame.tsx` - Added double points support
- `components/Minesweeper.tsx` - Added double points support

---

## 🏗️ ARCHITECTURE

### File Structure
```
TSmc-Generals/
├── App.tsx                 # Main app, routing, login
├── index.tsx               # Entry point
├── types.ts                # TypeScript types and constants
├── services/
│   ├── pointsService.ts    # Points, shop, inventory, effects management
│   └── rngService.ts       # RNG logic, probabilities, materials
├── components/
│   ├── RngTactician.tsx    # Main "Arbiter" wheel game
│   ├── PunishmentWheel.tsx # Punishment spinner
│   ├── Shop.tsx            # Shop UI and purchase logic
│   ├── MiniGames.tsx       # Hub for mini-games (Coin, Dice)
│   ├── CrashGame.tsx       # Crash betting game
│   ├── Minesweeper.tsx     # Minesweeper game
│   ├── SlotMachine.tsx     # Slot machine game
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── DatabaseRegistry.tsx # Owner: Edit materials list
│   ├── ProbabilityConfig.tsx # Owner: Configure probabilities
│   ├── ThemeCustomizer.tsx # Owner: Change app theme
│   └── VipSupplies.tsx     # Owner: Manage VIP supplies
└── data/
    └── materials.ts        # Default materials list
```

### Key Functions in `pointsService.ts`

```typescript
// Points
getPoints(), setPoints(), addPoints(), spendPoints()
addPointsWithMultiplier(amount) // Returns { total, doubled }

// Inventory (for consumables)
getItemInventory(), addToInventory(itemId), useFromInventory(itemId)
hasItem(itemId), getInventoryCount(itemId)

// Double Points Effect
activateDoublePoints() // 1 hour timer
isDoublePointsActive(), getDoublePointsRemaining()

// VIP Badge
hasVipBadge(), grantVipBadge()

// Mystery Box
openMysteryBox() // Returns random 10-500 points

// Item IDs
ITEM_IDS = { EXTRA_ROLL: '1', SKIP_PUNISHMENT: '2', DOUBLE_POINTS: '3', MYSTERY_BOX: '4', VIP_BADGE: '5' }
```

---

## 🔧 HOW TO CONTINUE DEVELOPMENT

### Running the Project
```bash
cd /home/smorenoc/AI-Projects/.venv/CODE\ HERE/-ONLINE-HOST-SELF---1.-TSmc-s-Generals-main/TSmc-Generals
npm run dev     # Start dev server
npm run build   # Production build
```

### Login Credentials

| User | Password | Access Level |
|------|----------|--------------|
| Owner | `[REDACTED]` | Full access (all config panels) |
| Gooner 💔🥀 | `[REDACTED]` | Standard user |
| Migueeeel [Beta Tester] | `[REDACTED]` | Standard user (Beta tester) |

**Note:** Passwords are defined in `App.tsx` in the `USER_CREDENTIALS` object.

### Storage Keys (localStorage)

**User-Specific Keys** (prefixed with `{username}::`)
- `{user}::user-points` - Current points
- `{user}::item-inventory` - JSON object of consumable item counts
- `{user}::double-points-expiry` - Timestamp when 2x effect expires
- `{user}::vip-badge-owned` - "true" if user owns VIP badge
- `{user}::purchased-items` - Array of purchased item IDs
- `{user}::last-daily-bonus` - Last daily bonus claim date
- `{user}::rng_week_data` - Weekly win tracking (3-win limit)

**Shared Keys** (same for all users - Owner-managed)
- `shop-items` - Custom shop items
- `punishment-options` - Custom punishments
- `probability_config` - Day-by-day probabilities
- `materials_registry_data` - Custom materials list
- `vip-supplies-list` - VIP reward pool
- `vip-choice-item` - VIP Choice shop item config
- `app-theme` - Selected theme ID
- `current-user` - Currently logged in user

---

## 🚧 KNOWN ISSUES / TODO

1. **None currently identified** - All reported issues have been fixed.

---

## 📝 SESSION NOTES

### Session: January 27, 2026

**Tasks Completed:**
1. Implemented all 5 shop item effects (Extra Roll, Skip Punishment, Double Points, Mystery Box, VIP Badge)
2. Fixed Coin Flip and Dice Roll buttons not triggering games
3. Fixed Slot Machine using stale state for win detection
4. Added Double Points multiplier to all mini-games (Crash, Minesweeper, Slots, Coin, Dice)
5. **Multi-User Authentication System** - Each user now has their own password:
   - Changed from single shared password to per-user passwords
   - Added new user: "Migueeeel [Beta Tester]"
   - Passwords stored in `USER_CREDENTIALS` object in App.tsx

**Files Modified for Auth Update:**
- `types.ts` - Added 'Migueeeel [Beta Tester]' to UserRole type
- `App.tsx` - Added USER_CREDENTIALS object, updated login handler to check per-user password

6. **Per-User Data Isolation** - Each user now has their own:
   - Points balance
   - Item inventory (Extra Roll, Skip Punishment)
   - Double Points timer
   - VIP Badge ownership
   - Purchase history
   - Daily bonus tracking
   - Weekly win limit (3-win rule)

**Files Modified for Per-User Data:**
- `services/pointsService.ts` - Added `getCurrentUser()`, `setCurrentUser()`, `userKey()` helper. Updated all user-specific functions to use prefixed keys.
- `services/rngService.ts` - Updated week data storage to be user-specific
- `App.tsx` - Call `setCurrentUser()` on login

7. **UI Fix:** Changed "Gemini Powered" to "Beta" in Sidebar

**User Request for Next Session:**
- User requested this PROJECT_STATUS.md file to track progress
- User reported Edge feature not working (needs investigation)

---

## 🎯 IF CONTINUING FROM HERE

1. Start the dev server: `npm run dev`
2. Test the shop items and mini-games
3. Ask the user about the "big change" they mentioned wanting to make
4. Document any new changes in this file

---
