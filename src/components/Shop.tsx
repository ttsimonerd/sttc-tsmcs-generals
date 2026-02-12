import React, { useState, useEffect } from 'react';
import {
  getPoints,
  spendPoints,
  getShopItems,
  saveShopItems,
  getPurchasedItems,
  addPurchasedItem,
  getVipRiddleItem,
  saveVipRiddleItem,
  getVipSupplies
} from '../services/pointsService';
import type { ShopItem } from '../types';


interface ShopProps {
  isOwner?: boolean;
}

const Shop: React.FC<ShopProps> = ({ isOwner = false }) => {
  const [points, setPointsState] = useState(0);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // VIP Supplies state
  const [showVipSupplies, setShowVipSupplies] = useState(false);
  const [currentVipSupplies, setCurrentVipSupplies] = useState<string[]>([]);

  // Edit form state
  const [newItem, setNewItem] = useState({ name: '', description: '', price: 50, icon: '🎁', stock: -1 });

  // VIP Riddle item state (kept for backward compatibility)
  const [vipRiddleItem, setVipRiddleItem] = useState<ShopItem>({
    id: 'vip-riddle',
    name: 'VIP Choice',
    description: 'Get 3 premium supplies!',
    price: 120,
    icon: '👑',
    stock: -1,
  });

  // Edit VIP Riddle form state
  const [editingVipRiddle, setEditingVipRiddle] = useState(false);
  const [vipRiddleForm, setVipRiddleForm] = useState({ price: 120, name: '', description: '', icon: '👑' });

  useEffect(() => {
    setPointsState(getPoints());
    setShopItems(getShopItems());
    setPurchasedItems(getPurchasedItems());
    setVipRiddleItem(getVipRiddleItem());
    setVipRiddleForm({
      price: getVipRiddleItem().price,
      name: getVipRiddleItem().name,
      description: getVipRiddleItem().description,
      icon: getVipRiddleItem().icon,
    });
  }, []);

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

    // Handle VIP Choice purchase - gives 3 random VIP supplies
    if (item.id === 'vip-riddle') {
      if (spendPoints(item.price)) {
        const allSupplies = getVipSupplies();
        // Get 3 random supplies
        const shuffled = [...allSupplies].sort(() => Math.random() - 0.5);
        const selectedSupplies = shuffled.slice(0, 3);
        setCurrentVipSupplies(selectedSupplies);
        setShowVipSupplies(true);
        refreshPoints();
        showNotif("VIP Supplies unlocked!", 'success');
      }
      return;
    }

    // Regular purchase
    if (spendPoints(item.price)) {
      addPurchasedItem(item.id);
      setPurchasedItems([...purchasedItems, item.id]);

      // Update stock
      if (item.stock > 0) {
        const updated = shopItems.map(i =>
          i.id === item.id ? { ...i, stock: i.stock - 1 } : i
        );
        setShopItems(updated);
        saveShopItems(updated);
      }

      refreshPoints();
      showNotif(`Purchased ${item.name}!`, 'success');
    }
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
    };

    const updated = [...shopItems, item];
    setShopItems(updated);
    saveShopItems(updated);
    setNewItem({ name: '', description: '', price: 50, icon: '🎁', stock: -1 });
    showNotif("Item added!", 'success');
  };

  const handleRemoveItem = (id: string) => {
    const updated = shopItems.filter(i => i.id !== id);
    setShopItems(updated);
    saveShopItems(updated);
    showNotif("Item removed!", 'success');
  };

  const handleSaveVipRiddle = () => {
    const updatedVip: ShopItem = {
      id: 'vip-riddle',
      name: vipRiddleForm.name || 'VIP Choice',
      description: vipRiddleForm.description || 'Get 3 premium supplies!',
      price: vipRiddleForm.price,
      icon: vipRiddleForm.icon,
      stock: -1,
    };
    saveVipRiddleItem(updatedVip);
    setVipRiddleItem(updatedVip);
    setEditingVipRiddle(false);
    showNotif("VIP Choice settings saved!", 'success');
  };

  // All shop items including VIP Choice from storage
  const allItems: ShopItem[] = [vipRiddleItem, ...shopItems];

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

      {/* VIP Supplies Modal */}
      {showVipSupplies && currentVipSupplies.length > 0 && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-panel p-8 rounded-2xl border border-amber-500/30 max-w-lg w-full space-y-6">
            <div className="text-center">
              <span className="text-4xl">👑</span>
              <h2 className="text-2xl font-bold text-amber-400 mt-2">VIP Choice</h2>
              <p className="text-zinc-500 text-sm mt-1">You received 3 premium supplies!</p>
            </div>

            <div className="space-y-3">
              {currentVipSupplies.map((supply, index) => (
                <div
                  key={index}
                  className="p-4 bg-zinc-900/50 rounded-xl border border-amber-500/20 flex items-center gap-3 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="text-2xl">✨</span>
                  <span className="text-white font-medium">{supply}</span>
                </div>
              ))}
            </div>

            <div className="text-center pt-4">
              <button
                onClick={() => setShowVipSupplies(false)}
                className="px-6 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Owner Edit Mode */}
      {isOwner && editMode && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 animate-fade-in">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">VIP Choice Settings</h2>

          {!editingVipRiddle ? (
            <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-amber-500/20">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{vipRiddleItem.icon}</span>
                <div>
                  <p className="text-white font-medium">{vipRiddleItem.name}</p>
                  <p className="text-zinc-500 text-xs">{vipRiddleItem.price} pts - {vipRiddleItem.description}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setVipRiddleForm({
                    price: vipRiddleItem.price,
                    name: vipRiddleItem.name,
                    description: vipRiddleItem.description,
                    icon: vipRiddleItem.icon,
                  });
                  setEditingVipRiddle(true);
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
                  value={vipRiddleForm.name}
                  onChange={(e) => setVipRiddleForm({ ...vipRiddleForm, name: e.target.value })}
                  placeholder="Item name..."
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
                />
                <input
                  type="text"
                  value={vipRiddleForm.description}
                  onChange={(e) => setVipRiddleForm({ ...vipRiddleForm, description: e.target.value })}
                  placeholder="Description..."
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
                />
                <input
                  type="text"
                  value={vipRiddleForm.icon}
                  onChange={(e) => setVipRiddleForm({ ...vipRiddleForm, icon: e.target.value })}
                  placeholder="Icon emoji..."
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 w-24"
                />
                <input
                  type="number"
                  value={vipRiddleForm.price}
                  onChange={(e) => setVipRiddleForm({ ...vipRiddleForm, price: parseInt(e.target.value) || 0 })}
                  placeholder="Price..."
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 w-24"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveVipRiddle}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium text-sm transition-all"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingVipRiddle(false)}
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
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="Item name..."
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
            />
            <input
              type="text"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="Description..."
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
            />
            <input
              type="text"
              value={newItem.icon}
              onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })}
              placeholder="Icon emoji..."
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
            />
            <input
              type="number"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: parseInt(e.target.value) || 0 })}
              placeholder="Price..."
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="text-zinc-400 text-sm">Stock (-1 = unlimited):</label>
            <input
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

