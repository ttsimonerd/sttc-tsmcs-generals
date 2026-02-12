import React, { useState, useEffect } from 'react';
import { getItemInventory, getShopItems, useFromInventory, processItemAction, getInventoryCount } from '../services/pointsService';
import { ShopItem, ItemAction } from '../types';

const Inventory: React.FC = () => {
    const [inventory, setInventory] = useState<{ [key: string]: number }>({});
    const [shopItems, setShopItems] = useState<ShopItem[]>([]);
    const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        refreshData();
    }, []);

    const refreshData = () => {
        setInventory(getItemInventory());
        setShopItems(getShopItems());
    };

    const showNotif = (msg: string, type: 'success' | 'error' = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleUseItem = (itemId: string) => {
        const item = shopItems.find(i => i.id === itemId);

        // Check if we even have the item
        if (!getInventoryCount(itemId)) {
            showNotif("Failed to use item (not in inventory)", 'error');
            return;
        }

        // If item has an action, try it BEFORE consuming
        if (item && item.action && item.action !== ItemAction.NONE) {
            const { success, message } = processItemAction(item.action, item.actionValue);
            if (success) {
                // Action succeeded — now consume from inventory
                useFromInventory(itemId);
                showNotif(message || `Used ${item.name}!`, 'success');
            } else {
                // Action failed — do NOT consume the item
                showNotif(message || "Failed to use item.", 'error');
            }
        } else {
            // No action defined — just consume it
            useFromInventory(itemId);
            showNotif(`Used ${item?.name || 'Item'} (No effect defined)`, 'success');
        }
        refreshData();
    };

    // Filter shop items to only those we have in inventory
    // We also need to handle items that might be in inventory but not in shop anymore (legacy/removed items)
    // For this simple version, we'll map through inventory keys.
    const inventoryList = Object.keys(inventory).map(itemId => {
        const itemDef = shopItems.find(i => i.id === itemId);
        return {
            id: itemId,
            count: inventory[itemId],
            name: itemDef?.name || 'Unknown Artifact',
            description: itemDef?.description || 'An item from a forgotten era.',
            icon: itemDef?.icon || '📦',
            action: itemDef?.action,
        };
    }).filter(i => i.count > 0);

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Inventory</h1>
                    <p className="text-zinc-500 text-sm mt-1">Your collected supplies and artifacts</p>
                </div>
                {notification && (
                    <div className={`px-4 py-2 ${notification.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'} border rounded-lg animate-fade-in`}>
                        <span className="text-sm font-bold">{notification.msg}</span>
                    </div>
                )}
            </div>

            {inventoryList.length === 0 ? (
                <div className="glass-panel p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
                    <span className="text-6xl opacity-20">🎒</span>
                    <h3 className="text-xl font-bold text-zinc-500">Inventory Empty</h3>
                    <p className="text-zinc-600 max-w-md">You haven't purchased any items yet. Visit the Shop to acquire supplies!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inventoryList.map((item) => (
                        <div key={item.id} className="glass-panel p-6 rounded-2xl border border-white/5 relative group hover:border-white/20 transition-all">
                            <div className="absolute top-4 right-4 bg-zinc-800 text-zinc-300 text-xs font-bold px-3 py-1 rounded-full border border-white/10">
                                x{item.count}
                            </div>

                            <div className="flex flex-col h-full">
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 w-fit">{item.icon}</div>
                                <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
                                <p className="text-sm text-zinc-400 mb-6 flex-1 leading-relaxed">
                                    {item.description}
                                </p>

                                <button
                                    onClick={() => handleUseItem(item.id)}
                                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 text-zinc-300 hover:text-emerald-400 rounded-xl font-bold transition-all text-sm uppercase tracking-wide"
                                >
                                    USE ITEM
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Inventory;
