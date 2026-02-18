import React, { useState, useEffect } from 'react';
import {
  getPoints,
  spendPoints,
  getShopItems,
  saveShopItems,
  getPurchasedItems,
  addPurchasedItem,
  addPoints,
  getVipChoiceItem,
  saveVipChoiceItem,
  getVipSupplies,
  ITEM_IDS,
  getInventoryCount,
  getDoublePointsRemaining,
  hasVipBadge,
  processItemAction
} from '../services/pointsService';
import { ItemAction, ShopItem } from '../types';

interface ShopProps {
  isOwner?: boolean;
}

const Shop: React.FC<ShopProps> = ({ isOwner = false }) => {
  const [points, setPointsState] = useState(0);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // VIP Choice state
  const [showVipReward, setShowVipReward] = useState(false);
  const [vipRewards, setVipRewards] = useState<string[]>([]);

  // Mystery Box state
  const [showMysteryReward, setShowMysteryReward] = useState(false);
  const [mysteryReward, setMysteryReward] = useState(0);

  // Double points timer
  const [doublePointsTime, setDoublePointsTime] = useState(0);

  // Inventory counts for display
  const [inventoryCounts, setInventoryCounts] = useState<Record<string, number>>({});

  // Edit form state
  const [newItem, setNewItem] = useState({ name: '', description: '', price: 50, icon: '🎁', stock: -1, action: ItemAction.NONE, actionValue: 0 });

  // VIP Choice item state
  const [vipChoiceItem, setVipChoiceItem] = useState<ShopItem>({
    id: 'vip-riddle',
    name: 'VIP Choice',
    description: 'Acquire premium supplies!',
    price: 120,
    icon: '👑',
    stock: -1,
  });

  // Edit VIP Choice form state
  const [editingVipChoice, setEditingVipChoice] = useState(false);
  const [vipChoiceForm, setVipChoiceForm] = useState({ price: 120, name: '', description: '', icon: '👑' });

  const refreshInventory = () => {
    setInventoryCounts({
      [ITEM_IDS.EXTRA_ROLL]: getInventoryCount(ITEM_IDS.EXTRA_ROLL),
    });
    setDoublePointsTime(getDoublePointsRemaining());
  };

  useEffect(() => {
    setPointsState(getPoints());
    setShopItems(getShopItems());
    setPurchasedItems(getPurchasedItems());
    const savedVipItem = getVipChoiceItem();
    setVipChoiceItem(savedVipItem);
    setVipChoiceForm({
      price: savedVipItem.price,
      name: savedVipItem.name,
      description: savedVipItem.description,
      icon: savedVipItem.icon,
    });
    refreshInventory();
  }, []);

  // Update double points timer
  useEffect(() => {
    if (doublePointsTime > 0) {
      const timer = setInterval(() => {
        const remaining = getDoublePointsRemaining();
        setDoublePointsTime(remaining);
        if (remaining === 0) {
          clearInterval(timer);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [doublePointsTime]);

  const refreshPoints = () => {
    setPointsState(getPoints());
  };

  const showNotif = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePurchase = (item: ShopItem) => {
    if (points < item.price) {
      showNotif("Not enough points!", 'error');
      return;
    }

    if (item.stock === 0) {
      showNotif("Out of stock!", 'error');
      return;
    }

    // Handle VIP Choice purchase (gives premium supplies)
    if (item.id === 'vip-riddle') {
      if (spendPoints(item.price)) {
        const vipSupplies = getVipSupplies();
        if (vipSupplies.length === 0) {
          showNotif("No premium supplies available!", 'error');
          return;
        }

        // Get 1 random premium supply
        const randomSupplies = [];
        const randomIndex = Math.floor(Math.random() * vipSupplies.length);
        randomSupplies.push(vipSupplies[randomIndex]);

        // Add bonus points
        addPoints(50);
        refreshPoints();

        setVipRewards(randomSupplies);
        setShowVipReward(true);
      }
      return;
    }

    // Process action if defined — check feasibility BEFORE spending points
    if (item.action && item.action !== ItemAction.NONE) {
      // Pre-check: for VIP, verify they don't already own it
      if (item.action === ItemAction.GRANT_VIP && hasVipBadge()) {
        showNotif("You already own the VIP Badge!", 'error');
        return;
      }

      // Now deduct points
      if (!spendPoints(item.price)) {
        showNotif("Not enough points!", 'error');
        return;
      }

      const { success, message } = processItemAction(item.action, item.actionValue);
      if (success) {
        showNotif(message || `Purchased ${item.name}!`, 'success');
      } else {
        // Refund points if action failed
        addPoints(item.price);
        showNotif(message || "Transaction failed! Points refunded.", 'error');
        return;
      }
    } else {
      // Regular purchase — deduct points first
      if (!spendPoints(item.price)) {
        showNotif("Not enough points!", 'error');
        return;
      }
      // Regular purchase for custom items (with no specific functional action)
      addPurchasedItem(item.id);
      setPurchasedItems([...purchasedItems, item.id]);
      showNotif(`Purchased ${item.name}!`, 'success');
    }

    // Update stock if applicable
    if (item.stock > 0) {
      const updated = shopItems.map(i =>
        i.id === item.id ? { ...i, stock: i.stock - 1 } : i
      );
      setShopItems(updated);
      saveShopItems(updated);
    }

    refreshInventory();
    refreshPoints();
  };


  const handleAddItem = () => {
    if (!newItem.name.trim()) return;

    const item: ShopItem = {
      id: Date.now().toString(),
      name: newItem.name,
      description: newItem.description,
      price: newItem.price,
      icon: newItem.icon,
      stock: newItem.stock,
      action: newItem.action,
      actionValue: newItem.actionValue,
    };

    const updated = [...shopItems, item];
    setShopItems(updated);
    saveShopItems(updated);
    setNewItem({ name: '', description: '', price: 50, icon: '🎁', stock: -1, action: ItemAction.NONE, actionValue: 0 });
    showNotif("Item added!", 'success');
  };

  const handleRemoveItem = (id: string) => {
    const updated = shopItems.filter(i => i.id !== id);
    setShopItems(updated);
    saveShopItems(updated);
    showNotif("Item removed!", 'success');
  };

  const handleSaveVipChoice = () => {
    const updatedVip: ShopItem = {
      id: 'vip-riddle',
      name: vipChoiceForm.name || 'VIP Choice',
      description: vipChoiceForm.description || 'Acquire premium supplies!',
      price: vipChoiceForm.price,
      icon: vipChoiceForm.icon,
      stock: -1,
    };
    saveVipChoiceItem(updatedVip);
    setVipChoiceItem(updatedVip);
    setEditingVipChoice(false);
    showNotif("VIP Choice settings saved!", 'success');
  };

  // All shop items including VIP Choice from storage
  const allItems: ShopItem[] = [vipChoiceItem, ...shopItems];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Points */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Shop</h1>
          <p className="text-zinc-500 text-sm mt-1">Spend your hard-earned points</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-xl">
            <span className="text-amber-400 font-bold text-xl">💰 {points} pts</span>
          </div>
          {isOwner && (
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${editMode ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
            >
              {editMode ? '✕ Close' : '⚙ Manage'}
            </button>
          )}
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-xl border animate-fade-in ${notification.type === 'success'
          ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
          : 'bg-red-500/20 border-red-500/30 text-red-400'
          }`}>
          {notification.message}
        </div>
      )}

      {/* Active Effects Banner */}
      {(doublePointsTime > 0 || inventoryCounts[ITEM_IDS.EXTRA_ROLL] > 0 || hasVipBadge()) && (
        <div className="glass-panel p-4 rounded-xl border border-purple-500/20 space-y-2">
          <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest">Active Effects & Inventory</h3>
          <div className="flex flex-wrap gap-3">
            {doublePointsTime > 0 && (
              <div className="px-3 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center gap-2">
                <span>✨</span>
                <span className="text-emerald-400 text-sm font-medium">
                  2x Points: {Math.floor(doublePointsTime / 60000)}:{String(Math.floor((doublePointsTime % 60000) / 1000)).padStart(2, '0')}
                </span>
              </div>
            )}
            {inventoryCounts[ITEM_IDS.EXTRA_ROLL] > 0 && (
              <div className="px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center gap-2">
                <span>🎲</span>
                <span className="text-blue-400 text-sm font-medium">Extra Rolls: {inventoryCounts[ITEM_IDS.EXTRA_ROLL]}</span>
              </div>
            )}
            {hasVipBadge() && (
              <div className="px-3 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center gap-2">
                <span>👑</span>
                <span className="text-amber-400 text-sm font-medium">VIP Member</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIP Reward Modal */}
      {showVipReward && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-panel p-8 rounded-2xl border border-amber-500/30 max-w-lg w-full space-y-6 text-center">
            <div>
              <span className="text-5xl animate-bounce inline-block">👑</span>
              <h2 className="text-2xl font-bold text-amber-400 mt-2">VIP Choice Acquired!</h2>
              <p className="text-zinc-500 text-sm mt-1">Premium supplies have been allocated</p>
            </div>

            <div className="space-y-3">
              {vipRewards.map((reward, i) => (
                <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
                  <span className="text-white font-bold text-lg">{reward}</span>
                </div>
              ))}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-fade-in-up" style={{ animationDelay: '450ms' }}>
                <span className="text-emerald-400 font-bold text-lg">+ 50 Bonus Points</span>
              </div>
            </div>

            <button
              onClick={() => setShowVipReward(false)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold rounded-xl hover:scale-105 transition-all"
            >
              COLLECT REWARDS
            </button>
          </div>
        </div>
      )}

      {/* Mystery Box Reward Modal */}
      {showMysteryReward && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-panel p-8 rounded-2xl border border-purple-500/30 max-w-lg w-full space-y-6 text-center">
            <div>
              <span className="text-5xl animate-bounce inline-block">📦</span>
              <h2 className="text-2xl font-bold text-purple-400 mt-2">Mystery Box Opened!</h2>
              <p className="text-zinc-500 text-sm mt-1">You found something inside...</p>
            </div>

            <div className={`p-6 rounded-xl animate-fade-in-up ${mysteryReward >= 251 ? 'bg-amber-500/20 border border-amber-500/30' :
              mysteryReward >= 101 ? 'bg-purple-500/20 border border-purple-500/30' :
                mysteryReward >= 51 ? 'bg-blue-500/20 border border-blue-500/30' :
                  'bg-zinc-500/20 border border-zinc-500/30'
              }`}>
              <span className={`text-4xl font-black ${mysteryReward >= 251 ? 'text-amber-400' :
                mysteryReward >= 101 ? 'text-purple-400' :
                  mysteryReward >= 51 ? 'text-blue-400' :
                    'text-zinc-300'
                }`}>
                +{mysteryReward} Points!
              </span>
              <p className="text-xs text-zinc-500 mt-2">
                {mysteryReward >= 251 ? '🌟 LEGENDARY FIND!' :
                  mysteryReward >= 101 ? '💎 RARE FIND!' :
                    mysteryReward >= 51 ? '🔷 UNCOMMON FIND' :
                      '⚪ Common find'}
              </p>
            </div>

            <button
              onClick={() => { setShowMysteryReward(false); refreshPoints(); }}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:scale-105 transition-all"
            >
              COLLECT
            </button>
          </div>
        </div>
      )}


      {/* Owner Edit Mode */}
      {isOwner && editMode && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 animate-fade-in">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">VIP Choice Settings</h2>

          {!editingVipChoice ? (
            <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-amber-500/20">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{vipChoiceItem.icon}</span>
                <div>
                  <p className="text-white font-medium">{vipChoiceItem.name}</p>
                  <p className="text-zinc-500 text-xs">{vipChoiceItem.price} pts</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setVipChoiceForm({
                    price: vipChoiceItem.price,
                    name: vipChoiceItem.name,
                    description: vipChoiceItem.description,
                    icon: vipChoiceItem.icon,
                  });
                  setEditingVipChoice(true);
                }}
                className="px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-sm hover:bg-amber-500/30 transition-all"
              >
                Edit
              </button>
            </div>
          ) : (
            <div className="p-4 bg-zinc-900/50 rounded-lg border border-amber-500/20 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={vipChoiceForm.name}
                  onChange={(e) => setVipChoiceForm({ ...vipChoiceForm, name: e.target.value })}
                  placeholder="Item name..."
                  title="VIP Item Name"
                  aria-label="VIP Item Name"
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
                />
                <input
                  type="text"
                  value={vipChoiceForm.description}
                  onChange={(e) => setVipChoiceForm({ ...vipChoiceForm, description: e.target.value })}
                  placeholder="Description..."
                  title="VIP Item Description"
                  aria-label="VIP Item Description"
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
                />
                <input
                  type="text"
                  value={vipChoiceForm.icon}
                  onChange={(e) => setVipChoiceForm({ ...vipChoiceForm, icon: e.target.value })}
                  placeholder="Icon emoji..."
                  title="VIP Item Icon"
                  aria-label="VIP Item Icon"
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 w-24"
                />
                <input
                  type="number"
                  value={vipChoiceForm.price}
                  onChange={(e) => setVipChoiceForm({ ...vipChoiceForm, price: parseInt(e.target.value) || 0 })}
                  placeholder="Price..."
                  title="VIP Item Price"
                  aria-label="VIP Item Price"
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 w-24"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveVipChoice}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium text-sm transition-all"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingVipChoice(false)}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg font-medium text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pt-4">Add New Item</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              value={newItem.name}
              title="Item Name"
              aria-label="Item Name"
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="Item name..."
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
            />
            <input
              type="text"
              value={newItem.description}
              title="Item Description"
              aria-label="Item Description"
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="Description..."
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
            />
            <input
              type="text"
              value={newItem.icon}
              title="Item Icon"
              aria-label="Item Icon"
              onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })}
              placeholder="Icon emoji..."
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
            />
            <input
              type="number"
              value={newItem.price}
              title="Item Price"
              aria-label="Item Price"
              onChange={(e) => setNewItem({ ...newItem, price: parseInt(e.target.value) || 0 })}
              placeholder="Price..."
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
            />
            <div className="flex gap-2">
              <select
                value={newItem.action}
                onChange={(e) => setNewItem({ ...newItem, action: e.target.value as ItemAction })}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
              >
                {Object.values(ItemAction).map(action => (
                  <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <input
                type="number"
                value={newItem.actionValue}
                onChange={(e) => setNewItem({ ...newItem, actionValue: parseInt(e.target.value) || 0 })}
                placeholder="Value..."
                className="w-20 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-zinc-400 text-sm" htmlFor="item-stock">Stock (-1 = unlimited):</label>
            <input
              id="item-stock"
              type="number"
              value={newItem.stock}
              onChange={(e) => setNewItem({ ...newItem, stock: parseInt(e.target.value) })}
              className="w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
            />
            <button
              onClick={handleAddItem}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-all"
            >
              Add Item
            </button>
          </div>

          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pt-4">Current Items</h2>
          <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
            {shopItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-white text-sm font-medium">{item.name}</p>
                    <p className="text-zinc-500 text-xs">{item.price} pts</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shop Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allItems.map((item) => {
          const canAfford = points >= item.price;
          const inStock = item.stock === -1 || item.stock > 0;
          const isVip = item.id === 'vip-riddle';

          return (
            <div
              key={item.id}
              className={`relative p-6 rounded-2xl border transition-all ${isVip
                ? 'bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-500/30'
                : 'bg-zinc-900/50 border-white/5 hover:bg-zinc-800/50'
                }`}
            >
              {/* VIP badge */}
              {isVip && (
                <div className="absolute top-3 right-3 px-2 py-1 bg-amber-500/20 rounded-full">
                  <span className="text-amber-400 text-xs font-bold">VIP</span>
                </div>
              )}

              {/* Stock indicator */}
              {item.stock > 0 && item.stock <= 5 && (
                <div className="absolute top-3 right-3 px-2 py-1 bg-red-500/20 rounded-full">
                  <span className="text-red-400 text-xs font-bold">{item.stock} left</span>
                </div>
              )}

              <div className="flex flex-col items-center text-center gap-4">
                <span className="text-5xl">{item.icon}</span>
                <div>
                  <h3 className="text-white font-bold text-lg">{item.name}</h3>
                  <p className="text-zinc-500 text-sm mt-1">{item.description}</p>
                </div>
                <div className="text-amber-400 font-bold text-xl">{item.price} pts</div>
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={!canAfford || !inStock}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${!inStock
                    ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                    : canAfford
                      ? isVip
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:scale-105'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105'
                      : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                    }`}
                >
                  {!inStock ? 'OUT OF STOCK' : canAfford ? 'PURCHASE' : 'NOT ENOUGH'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="text-center text-zinc-600 text-xs">
        <p>Earn points by playing games and getting lucky rolls!</p>
      </div>
    </div>
  );
};

export default Shop;
