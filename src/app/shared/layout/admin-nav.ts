/**
 * Single source of truth for the admin navigation structure (Stitch redesign).
 * Used by the sidebar and by the header page-jump search.
 */

export interface AdminNavBadge {
  /** Which StatsOverview counter feeds this badge. */
  source: 'totalPosts' | 'identity' | 'business' | 'contactMessages';
  /** total: raw count in a slate chip · new: "N جديدة" in an amber chip */
  kind: 'total' | 'new';
}

export interface AdminNavItem {
  path: string;
  /** Translation key resolved through TranslationService.t() */
  labelKey: string;
  /** Inline SVG markup (stroke-based, inherits currentColor) */
  icon: string;
  badge?: AdminNavBadge;
  /** Amber highlight + live dot, like the metals link in the design. */
  accent?: boolean;
  children?: { path: string; labelKey: string }[];
}

export interface AdminNavGroup {
  labelKey: string;
  items: AdminNavItem[];
}

const ICONS = {
  dashboard:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/></svg>',
  categories:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>',
  posts:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
  attributes:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>',
  identity:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/></svg>',
  business:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
  mail:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
  analytics:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>',
  users:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
  bell:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>',
  metals:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
  profile:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  lock:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>',
  settings:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h.01a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h.01a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.01a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
  charts:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-6 4 3 5-8"/></svg>',
};

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    labelKey: 'sidebar.groupMain',
    items: [
      { path: '/', labelKey: 'sidebar.dashboard', icon: ICONS.dashboard },
      { path: '/categories', labelKey: 'sidebar.categories', icon: ICONS.categories },
      {
        path: '/posts-ads',
        labelKey: 'sidebar.posts',
        icon: ICONS.posts,
        badge: { source: 'totalPosts', kind: 'total' },
      },
      { path: '/ad-attributes', labelKey: 'sidebar.adAttributes', icon: ICONS.attributes },
    ],
  },
  {
    labelKey: 'sidebar.groupVerification',
    items: [
      {
        path: '/identity-requests',
        labelKey: 'sidebar.identityVerification',
        icon: ICONS.identity,
        badge: { source: 'identity', kind: 'new' },
      },
      {
        path: '/business-requests',
        labelKey: 'sidebar.businessVerification',
        icon: ICONS.business,
        badge: { source: 'business', kind: 'new' },
      },
    ],
  },
  {
    labelKey: 'sidebar.groupCommunication',
    items: [
      {
        path: '/contact-messages',
        labelKey: 'sidebar.contactMessages',
        icon: ICONS.mail,
        badge: { source: 'contactMessages', kind: 'new' },
      },
      { path: '/site-analytics', labelKey: 'sidebar.siteAnalytics', icon: ICONS.analytics },
      { path: '/users', labelKey: 'sidebar.customers', icon: ICONS.users },
      { path: '/notifications', labelKey: 'sidebar.notifications', icon: ICONS.bell },
    ],
  },
  {
    labelKey: 'sidebar.groupMarket',
    items: [
      {
        path: '/metals-prices',
        labelKey: 'sidebar.goldPrices',
        icon: ICONS.metals,
        accent: true,
      },
    ],
  },
  {
    labelKey: 'sidebar.groupAccount',
    items: [
      { path: '/profile', labelKey: 'sidebar.profile', icon: ICONS.profile },
      { path: '/change-password', labelKey: 'sidebar.changePassword', icon: ICONS.lock },
      { path: '/settings', labelKey: 'sidebar.settings', icon: ICONS.settings },
      {
        path: '/line-chart',
        labelKey: 'sidebar.charts',
        icon: ICONS.charts,
        children: [
          { path: '/line-chart', labelKey: 'sidebar.lineChart' },
          { path: '/bar-chart', labelKey: 'sidebar.barChart' },
        ],
      },
    ],
  },
];

/** Flat list of navigable pages — feeds the header page-jump search. */
export interface AdminNavPage {
  path: string;
  labelKey: string;
}

export const ADMIN_NAV_PAGES: AdminNavPage[] = ADMIN_NAV_GROUPS.flatMap((group) =>
  group.items.flatMap((item) =>
    item.children?.length
      ? item.children.map((child) => ({ path: child.path, labelKey: child.labelKey }))
      : [{ path: item.path, labelKey: item.labelKey }]
  )
);
