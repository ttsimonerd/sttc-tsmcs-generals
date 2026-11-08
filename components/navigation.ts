import { AppView } from '../types';

export interface NavItem {
  id: AppView;
  label: string;
  icon: string;
}

export interface NavSection {
  label: string;
  ownerOnly?: boolean;
  items: NavItem[];
}

export const ICON = {
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  gamepad:
    'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  bag: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
  box:
    'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  wheel:
    'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  chart:
    'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  doc:
    'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  book:
    'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  gear:
    'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  riddles:
    'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  users:
    'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  speaker:
    'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
  download:
    'M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4',
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'M6 18L18 6M6 6l12 12',
} as const;

const PLAY_ITEMS: NavItem[] = [
  { id: AppView.RNG_TACTICIAN, label: 'The Arbiter', icon: ICON.clock },
  { id: AppView.MINI_GAMES, label: 'Mini games', icon: ICON.gamepad },
  { id: AppView.SHOP, label: 'Shop', icon: ICON.bag },
  { id: AppView.INVENTORY, label: 'Inventory', icon: ICON.box },
];

export const NAV_SECTIONS: NavSection[] = [
  { label: 'Play', items: PLAY_ITEMS },
  {
    label: 'Configure',
    ownerOnly: true,
    items: [
      { id: AppView.PUNISHMENT_WHEEL, label: 'Punishment wheel', icon: ICON.wheel },
      { id: AppView.PROBABILITIES, label: 'Probabilities', icon: ICON.chart },
      { id: AppView.MATERIAL_REGISTRY, label: 'Materials', icon: ICON.doc },
      { id: AppView.VIP_SUPPLIES, label: 'VIP supplies', icon: ICON.book },
      { id: AppView.GAME_TUNER, label: 'Game tuner', icon: ICON.gear },
      { id: AppView.RIDDLE_EDITOR, label: 'Riddles', icon: ICON.riddles },
      { id: AppView.USER_MANAGEMENT, label: 'Users', icon: ICON.users },
    ],
  },
  {
    label: 'System',
    ownerOnly: true,
    items: [
      { id: AppView.SYSTEM_CONTROL, label: 'System control', icon: ICON.speaker },
      { id: AppView.CONFIG_EXPORT, label: 'Solidify config', icon: ICON.download },
    ],
  },
];

/** The four destinations that live in the mobile tab bar. */
export const PRIMARY_NAV: NavItem[] = PLAY_ITEMS;

const GAME_VIEWS: Partial<Record<AppView, string>> = {
  [AppView.CRASH_GAME]: 'Crash',
  [AppView.MINESWEEPER]: 'Minesweeper',
  [AppView.SLOT_MACHINE]: 'Slots',
};

/** Human label + section for the shell breadcrumb. */
export const viewMeta = (view: AppView): { label: string; section: string } => {
  const game = GAME_VIEWS[view];
  if (game) return { label: game, section: 'Play' };

  for (const section of NAV_SECTIONS) {
    const item = section.items.find((entry) => entry.id === view);
    if (item) return { label: item.label, section: section.label };
  }

  return { label: 'Session', section: 'System' };
};

export const sectionsFor = (isOwner?: boolean): NavSection[] =>
  NAV_SECTIONS.filter((section) => !section.ownerOnly || isOwner);
