# Fix VIP Choice and Theme

## Issues to Fix:
1. **Theme not applying** - Need to properly inject CSS variables that override Tailwind classes
2. **VIP Choice gives wrong reward** - Should give premium supplies (random materials), not riddles

## Plan:

### Fix 1: Theme Application
- Add CSS custom properties that Tailwind can use
- Modify index.css to define CSS variables
- Components should use CSS variables instead of hardcoded colors

### Fix 2: VIP Choice → Premium Supplies
- Rename VIP Riddles to "Premium Supplies" or "VIP Supplies"
- Create list of premium/vip materials (special items)
- Owner can edit the VIP supplies list
- When purchasing VIP Choice, player gets random premium supply + bonus points

## Files to Modify:
1. `index.css` - Add CSS variables for colors
2. `App.tsx` - Remove theme logic (not needed if using CSS variables)
3. `ThemeCustomizer.tsx` - Update to set CSS variables on :root
4. `VipRiddles.tsx` - Rename to VipSupplies.tsx and change functionality
5. `types.ts` - Update AppView enum name
6. `Sidebar.tsx` - Update label
7. `services/pointsService.ts` - Add VIP supplies storage functions
8. `Shop.tsx` - VIP Choice gives supplies instead of riddles

