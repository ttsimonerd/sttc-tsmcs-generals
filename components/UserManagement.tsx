import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { getPoints, setPoints, getItemInventory, saveItemInventory, hasVipBadge, setVipBadge, ITEM_IDS } from '../services/pointsService';

const UserManagement: React.FC = () => {
    const USERS: UserRole[] = ['Owner', 'Gooner 💔🥀', 'Migueeeel [Beta Tester]'];
    const [selectedUser, setSelectedUser] = useState<UserRole>(USERS[0]);
    const [userData, setUserData] = useState({
        points: 0,
        hasVip: false,
        inventory: {} as Record<string, number>,
        password: ''
    });
    const [notification, setNotification] = useState<string | null>(null);

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

    const showNotif = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const updatePoints = (newPoints: number) => {
        setPoints(newPoints, selectedUser);
        setUserData(prev => ({ ...prev, points: newPoints }));
        showNotif('Points updated! 💰');
    };

    const updatePassword = (newPass: string) => {
        const storedPasswords = localStorage.getItem('custom-user-passwords');
        const passwords = storedPasswords ? JSON.parse(storedPasswords) : {};
        passwords[selectedUser] = newPass;
        localStorage.setItem('custom-user-passwords', JSON.stringify(passwords));
        setUserData(prev => ({ ...prev, password: newPass }));
        showNotif('Password updated! 🔐');
    };

    const toggleVip = () => {
        const newState = !userData.hasVip;
        setVipBadge(newState, selectedUser);
        setUserData(prev => ({ ...prev, hasVip: newState }));
        showNotif(newState ? 'VIP Granted! 👑' : 'VIP Revoked.');
    };

    const updateInventory = (itemId: string, increment: boolean) => {
        const current = userData.inventory[itemId] || 0;
        const next = increment ? current + 1 : Math.max(0, current - 1);

        const newInv = { ...userData.inventory };
        if (next === 0) delete newInv[itemId];
        else newInv[itemId] = next;

        saveItemInventory(newInv, selectedUser);
        setUserData(prev => ({ ...prev, inventory: newInv }));
        showNotif('Inventory updated! 📦');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">User Management</h1>
                    <p className="text-zinc-500 text-sm mt-1">Manage accounts, balances, and permissions</p>
                </div>
                {notification && (
                    <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg animate-fade-in">
                        <span className="text-emerald-400 text-sm font-medium">{notification}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* User Sidebar */}
                <div className="lg:col-span-1 space-y-3">
                    {USERS.map(user => (
                        <button
                            key={user}
                            onClick={() => setSelectedUser(user)}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${selectedUser === user
                                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                                    : 'bg-zinc-900 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white'
                                }`}
                        >
                            <div className="font-bold truncate">{user}</div>
                            <div className="text-[10px] uppercase tracking-widest mt-1 opacity-60">
                                {user === 'Owner' ? 'Administrator' : 'User Account'}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Editor Main */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-8">
                        <div className="flex items-center justify-between border-b border-white/5 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-2xl">
                                    {userData.hasVip ? '👑' : '👤'}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedUser}</h2>
                                    <p className="text-zinc-500 text-xs">Manage detailed user properties</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleVip}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${userData.hasVip
                                        ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30 hover:bg-amber-500/30'
                                        : 'bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                {userData.hasVip ? 'REVOKE VIP' : 'GRANT VIP STATUS'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Security */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Authentication</h3>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-zinc-600 uppercase ml-1">Access Passphrase</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={userData.password}
                                            onChange={(e) => updatePassword(e.target.value)}
                                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white font-mono text-sm focus:border-emerald-500/50 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Economy */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Economy</h3>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-zinc-600 uppercase ml-1">Total Points Balance</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="number"
                                            value={userData.points}
                                            onChange={(e) => updatePoints(parseInt(e.target.value) || 0)}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-amber-400 font-bold text-lg focus:border-emerald-500/50 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Inventory */}
                        <div className="space-y-4 pt-4">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Inventory Management</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Extra Rolls */}
                                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🎲</span>
                                        <div>
                                            <p className="text-white text-sm font-medium">Extra Rolls</p>
                                            <p className="text-zinc-500 text-xs">Consumable items</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => updateInventory(ITEM_IDS.EXTRA_ROLL, false)} className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 text-white">-</button>
                                        <span className="text-white font-bold w-4 text-center">{userData.inventory[ITEM_IDS.EXTRA_ROLL] || 0}</span>
                                        <button onClick={() => updateInventory(ITEM_IDS.EXTRA_ROLL, true)} className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 text-white">+</button>
                                    </div>
                                </div>

                                {/* Skip Punishment */}
                                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🛡️</span>
                                        <div>
                                            <p className="text-white text-sm font-medium">Skip Punishment</p>
                                            <p className="text-zinc-500 text-xs">Consumable items</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => updateInventory(ITEM_IDS.SKIP_PUNISHMENT, false)} className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 text-white">-</button>
                                        <span className="text-white font-bold w-4 text-center">{userData.inventory[ITEM_IDS.SKIP_PUNISHMENT] || 0}</span>
                                        <button onClick={() => updateInventory(ITEM_IDS.SKIP_PUNISHMENT, true)} className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 text-white">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
