import React, { useState, useEffect } from 'react';
import type { UserRole } from '../types';
import { getPoints, setPoints, getItemInventory, saveItemInventory, hasVipBadge, setVipBadge, ITEM_IDS } from '../services/pointsService';
import { Badge, Button, PageHeader, Panel, cn } from './ui/Primitives';
import { useToast } from './ui/Toast';
import { logAudit } from '../services/auditService';

const UserManagement: React.FC = () => {
    const { toast } = useToast();
    const USERS: UserRole[] = ['Owner', 'Gooner 💔🥀', 'Migueeeel [Beta Tester]'];
    const [selectedUser, setSelectedUser] = useState<UserRole>(USERS[0]);
    const [userData, setUserData] = useState({
        points: 0,
        hasVip: false,
        inventory: {} as Record<string, number>,
        password: ''
    });

    const loadUserData = (role: UserRole) => {
        const points = getPoints(role);
        const hasVip = hasVipBadge(role);
        const inventory = getItemInventory(role);

        // Load custom password if exists
        const storedPasswords = localStorage.getItem('custom-user-passwords');
        const passwords = storedPasswords ? JSON.parse(storedPasswords) : {};
        const password = passwords[role] || (role === 'Owner' ? 'goonmaster67' : role === 'Gooner 💔🥀' ? 'goontime67' : 'Betamiguel1');

        setUserData({ points, hasVip, inventory, password });
    };

    useEffect(() => {
        loadUserData(selectedUser);
    }, [selectedUser]);

    const updatePoints = (newPoints: number) => {
        setPoints(newPoints, selectedUser);
        setUserData(prev => ({ ...prev, points: newPoints }));
        toast('Balance updated.', 'success');
        logAudit('Updated balance', `${selectedUser} → ${newPoints} pts`);
    };

    const updatePassword = (newPass: string) => {
        const storedPasswords = localStorage.getItem('custom-user-passwords');
        const passwords = storedPasswords ? JSON.parse(storedPasswords) : {};
        passwords[selectedUser] = newPass;
        localStorage.setItem('custom-user-passwords', JSON.stringify(passwords));
        setUserData(prev => ({ ...prev, password: newPass }));
        toast('Access phrase updated.', 'success');
        logAudit('Updated access phrase', selectedUser);
    };

    const toggleVip = () => {
        const newState = !userData.hasVip;
        setVipBadge(newState, selectedUser);
        setUserData(prev => ({ ...prev, hasVip: newState }));
        toast(newState ? 'VIP granted.' : 'VIP revoked.', newState ? 'success' : 'info');
        logAudit(newState ? 'Granted VIP' : 'Revoked VIP', selectedUser);
    };

    const updateInventory = (itemId: string, increment: boolean) => {
        const current = userData.inventory[itemId] || 0;
        const next = increment ? current + 1 : Math.max(0, current - 1);

        const newInv = { ...userData.inventory };
        if (next === 0) delete newInv[itemId];
        else newInv[itemId] = next;

        saveItemInventory(newInv, selectedUser);
        setUserData(prev => ({ ...prev, inventory: newInv }));
        toast('Inventory updated.', 'success');
        logAudit('Updated extra rolls', `${selectedUser} → ${next}`);
    };

    const extraRolls = userData.inventory[ITEM_IDS.EXTRA_ROLL] || 0;
    const isOwnerAccount = selectedUser === 'Owner';

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Configure"
                title="Users"
                description="Balances, access phrases, VIP status and consumables for every account."
            />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
                <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-col">
                    {USERS.map(user => {
                        const active = selectedUser === user;
                        return (
                            <button
                                key={user}
                                type="button"
                                onClick={() => setSelectedUser(user)}
                                aria-pressed={active}
                                className={cn(
                                    'flex min-w-0 items-center gap-2.5 rounded-xl border px-3 py-3 text-left transition-all lg:w-full',
                                    active
                                        ? 'border-theme-primary-soft bg-theme-primary-soft'
                                        : 'border-[color:var(--line)] bg-white/[0.02] hover:border-[color:var(--line-strong)]'
                                )}
                            >
                                <span
                                    className={cn(
                                        'grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[12px] font-bold',
                                        active ? 'bg-theme-primary text-black' : 'bg-white/[0.06] text-zinc-400'
                                    )}
                                >
                                    {user.slice(0, 1)}
                                </span>
                                <span className="min-w-0">
                                    <span className={cn('block truncate text-[13px] font-medium', active ? 'text-white' : 'text-zinc-300')}>
                                        {user}
                                    </span>
                                    <span className="mt-0.5 block text-[9px] uppercase tracking-[0.14em] text-zinc-600">
                                        {isOwnerAccount && user === 'Owner' ? 'Administrator' : 'User account'}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="space-y-4">
                    <Panel className="p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--line)] pb-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <span
                                    className={cn(
                                        'grid h-11 w-11 shrink-0 place-items-center rounded-xl text-base font-bold',
                                        userData.hasVip
                                            ? 'border border-amber-400/30 bg-amber-400/10 text-amber-300'
                                            : 'border border-[color:var(--line)] bg-white/[0.05] text-zinc-300'
                                    )}
                                >
                                    {selectedUser.slice(0, 1)}
                                </span>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="truncate text-[15px] font-semibold text-white">{selectedUser}</p>
                                        {userData.hasVip && <Badge tone="warning">VIP</Badge>}
                                    </div>
                                    <p className="mt-0.5 text-[11px] text-zinc-500">
                                        {selectedUser === 'Owner' ? 'Full system access' : 'Player account'}
                                    </p>
                                </div>
                            </div>
                            <Button variant={userData.hasVip ? 'danger' : 'secondary'} size="sm" onClick={toggleVip}>
                                {userData.hasVip ? 'Revoke VIP' : 'Grant VIP'}
                            </Button>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="field-label" htmlFor="user-password">Access phrase</label>
                                <input
                                    id="user-password"
                                    type="text"
                                    value={userData.password}
                                    onChange={(e) => updatePassword(e.target.value)}
                                    className="field field-mono"
                                    autoComplete="off"
                                    spellCheck={false}
                                />
                                <p className="mt-1.5 text-[10px] text-zinc-600">Saved as you type.</p>
                            </div>

                            <div>
                                <label className="field-label" htmlFor="user-points">Points balance</label>
                                <input
                                    id="user-points"
                                    type="number"
                                    value={userData.points}
                                    onChange={(e) => updatePoints(parseInt(e.target.value) || 0)}
                                    className="field field-mono font-bold text-amber-300"
                                />
                                <p className="mt-1.5 text-[10px] text-zinc-600">Grants immediately.</p>
                            </div>
                        </div>
                    </Panel>

                    <Panel className="p-5">
                        <div className="flex items-center justify-between gap-3">
                            <p className="eyebrow">Consumables</p>
                            <span className="text-[10px] uppercase tracking-wider text-zinc-600">Live inventory</span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[color:var(--line)] bg-black/25 px-4 py-3">
                            <div className="min-w-0">
                                <p className="text-[13px] font-medium text-white">Extra rolls</p>
                                <p className="mt-0.5 text-[11px] text-zinc-500">Bypasses the weekend block once.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateInventory(ITEM_IDS.EXTRA_ROLL, false)}
                                    aria-label="Remove one extra roll"
                                    className="grid h-8 w-8 place-items-center rounded-lg border border-[color:var(--line)] text-lg leading-none text-zinc-300 transition-colors hover:border-[color:var(--line-strong)] hover:text-white"
                                >
                                    −
                                </button>
                                <span className="w-7 text-center font-mono text-sm font-bold text-white">{extraRolls}</span>
                                <button
                                    type="button"
                                    onClick={() => updateInventory(ITEM_IDS.EXTRA_ROLL, true)}
                                    aria-label="Add one extra roll"
                                    className="grid h-8 w-8 place-items-center rounded-lg border border-[color:var(--line)] text-lg leading-none text-zinc-300 transition-colors hover:border-[color:var(--line-strong)] hover:text-white"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <p className="mt-3 text-[10px] leading-relaxed text-zinc-600">
                            Consumables are stored per account. Other supplies live in the player inventory.
                        </p>
                    </Panel>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
