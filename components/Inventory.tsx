import React, { useEffect, useState } from 'react';
import {
    getItemInventory,
    getShopItems,
    useFromInventory,
    processItemAction,
    getInventoryCount,
} from '../services/pointsService';
import { ItemAction } from '../types';
import type { ShopItem } from '../types';
import { Badge, Button, EmptyState, PageHeader, Panel } from './ui/Primitives';
import { useToast } from './ui/Toast';

const Inventory: React.FC = () => {
    const { toast } = useToast();
    const [inventory, setInventory] = useState<{ [key: string]: number }>({});
    const [shopItems, setShopItems] = useState<ShopItem[]>([]);

    const refreshData = () => {
        setInventory(getItemInventory());
        setShopItems(getShopItems());
    };

    useEffect(() => {
        refreshData();
    }, []);

    const handleUseItem = (itemId: string) => {
        const item = shopItems.find(i => i.id === itemId);

        // Passive items are spent by the feature that owns them (the Arbiter), never here.
        // Using one used to consume it and re-grant it, which made USE a no-op.
        if (item?.action === ItemAction.GIVE_EXTRA_ROLL) {
            toast(`${item.name} is used from The Arbiter, not from the Inventory.`, 'error');
            return;
        }

        if (!getInventoryCount(itemId)) {
            toast('Failed to use item (not in inventory)', 'error');
            return;
        }

        // If item has an action, try it BEFORE consuming
        if (item && item.action && item.action !== ItemAction.NONE) {
            const { success, message } = processItemAction(item.action, item.actionValue);
            if (success) {
                useFromInventory(itemId);
                toast(message || `Used ${item.name}!`, 'success');
            } else {
                toast(message || 'Failed to use item.', 'error');
            }
        } else {
            useFromInventory(itemId);
            toast(`Used ${item?.name || 'Item'} (no effect defined)`, 'info');
        }

        refreshData();
    };

    const inventoryList = Object.keys(inventory)
        .map(itemId => {
            const itemDef = shopItems.find(i => i.id === itemId);
            return {
                id: itemId,
                count: inventory[itemId],
                name: itemDef?.name || 'Unknown artifact',
                description: itemDef?.description || 'An item from a forgotten era.',
                action: itemDef?.action,
            };
        })
        .filter(item => item.count > 0);

    return (
        <div className="space-y-7">
            <PageHeader
                eyebrow="Economy"
                title="Inventory"
                description="Consumables you own. Passive items such as Extra Roll are spent inside The Arbiter."
            />

            {inventoryList.length === 0 ? (
                <EmptyState
                    title="Your inventory is empty"
                    description="Buy consumables from the shop — they land here and can be used whenever you need them."
                />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {inventoryList.map((item) => (
                        <Panel key={item.id} className="flex flex-col gap-4 p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[color:var(--line)] bg-black/30 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                    {item.name.slice(0, 2)}
                                </div>
                                <Badge tone="primary">x{item.count}</Badge>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-sm font-semibold text-white">{item.name}</h3>
                                <p className="text-xs leading-relaxed text-zinc-500">{item.description}</p>
                            </div>

                            <div className="mt-auto pt-1">
                                {item.action === ItemAction.GIVE_EXTRA_ROLL ? (
                                    <div className="rounded-lg border border-dashed border-[color:var(--line)] px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                                        Spent from The Arbiter
                                    </div>
                                ) : (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => handleUseItem(item.id)}
                                    >
                                        Use item
                                    </Button>
                                )}
                            </div>
                        </Panel>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Inventory;
