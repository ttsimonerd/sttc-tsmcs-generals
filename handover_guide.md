# 📜 The Legacy of TSmc's Generals: Handover Protocol

**Greetings, AMP! 🤖👋**

I am Antigravity. I've been shaping this chaotic and beautiful system for the user. It is now your turn to take the helm. This document serves as your map, your instruction manual, and your warning label.

This project, **TSmc's Generals**, is a React + Vite + Tailwind CSS application designed to manage a community game involving RNG, punishments, points, and a lot of personality.

---

## 🏗️ System Architecture

### Core Tech Stack
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS (Custom glassmorphism design system)
- **Persistence**: `localStorage` (No backend yet, browser-based state)
- **Icons**: SVG paths directly embedded (Heroicons style)

### Key Components

#### 1. 👁️ The Arbiter (`RngTactician.tsx`)
The heart of the system.
- **Function**: Handles the daily RNG spins.
- **Logic**:
    - Users get limited "Yes" results (def: 3/day).
    - **Logic of Note**: There is a **5% chance** on any spin to trigger a **FORCED PUNISHMENT**.
    - If triggered, it sets a "Redirection State" and moves the user to the `PunishmentWheel`.
    - **Debugging**: "Reset Daily Wins" is hidden in `SystemControl.tsx` under "Danger Zone".

#### 2. 🎡 Punishment Wheel (`PunishmentWheel.tsx`)
- **Modes**:
    - **Standard**: Manual spinning.
    - **Forced**: Triggered by The Arbiter. The user *cannot* leave until they spin.
- **Editing**: The "Owner" role can edit the wheel options directly in the UI.
- **Persistence**: Saves outcomes to recent history.

#### 3. 🎒 Economy: Shop & Inventory
- **`Shop.tsx`**: Allows purchasing items using points (`sp` or "Social Points").
    - **Actions**: Items can have programmatic actions (e.g., `DOUBLE_POINTS`, `SKIP_PUNISHMENT`).
- **`Inventory.tsx`**: *Newly implemented*.
    - Lists purchased items.
    - "USE" button consumes the item and triggers its `processItemAction`.
- **`pointsService.ts`**: The backend logic for points, inventory, and transactions. **Crucial file.**

#### 4. 🎛️ System Control (`SystemControl.tsx`)
- **Broadcasts**: A global message system.
- **Theming**: Preset theme switcher.
- **Danger Zone**: Reset tools for debugging.

---

## 🔄 Recent Changes (State of the Union)

Here is what I just finished implementing, so you know where the code stands:

1.  **Inventory System**: A brand new view where users can see and use their items. It's fully functional but might need UI polish.
2.  **Navigation Cleanup**:
    - Removed "Riddles", "Tuner", "Materials" from the sidebar to clean up clutter.
    - Hided "Punishment Wheel" for non-owners (they only see it when forced).
    - Hided Mini-games (Crash, Minesweeper, Slots) from the main sidebar (accessible via "Mini Games" hub).
3.  **Forced Redirection**: Implemented the "Red Screen of Death" when the 5% punishment triggers.
4.  **Bug Fixes**:
    - Fixed Shop not deducting points.
    - Fixed "Reset Daily Wins" disappearing (restored in System Control).

---

## 🛠️ The "To-Do" / Future Roadmap

If the user asks you "What's next?", here are the loose ends or ideas:

*   **Mini-Games**: The `SlotMachine` and `Minesweeper` are basic. They could use more visual flair or integration with the Points system (betting?).
*   **Persistence Upgrade**: Currently, everything is in `localStorage`. If the user clears cache, they lose everything. migrating to a simple backend (Supabase/Firebase) might be a future request.
*   **Mobile Responsiveness**: The UI is *mostly* responsive, but some complex glass panels might need tweaking on very small screens.
*   **Inventory Expansion**: Currently "Using" an item just shows a notification. You might want to add more complex effects (like actually skipping a punishment mechanically).

---

**Good luck, AMP. Treat the user well, and keep the chaos organized.**

*   *Antigravity* 🚀
