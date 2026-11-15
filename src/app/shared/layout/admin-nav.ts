/**
 * Single source of truth for the admin navigation structure (Stitch redesign).
 * Used by the sidebar and by the header page-jump search.
 */

export interface AdminNavBadge {
  /** Which StatsOverview counter feeds this badge. */
  source: 'totalPosts' | 'identity' | 'business' | 'contactMessages';
  /** total: raw count in a slate chip - new: "N جديدة" in an amber chip */
  kind: 'total' | 'new';
}

export interface AdminNavItem {
  path: string;
  /** Translation key resolved through TranslationService.t() */
  labelKey: string;
  /** Material Symbols ligature name */
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
  dashboard: 'dashboard',
  categories: 'category',
  posts: 'article',
  attributes: 'tune',
  identity: 'badge',
  business: 'storefront',
  mail: 'mail',
  analytics: 'insights',
  users: 'group',
  bell: 'notifications',
  metals: 'price_change',
  profile: 'person',
  lock: 'lock',
  settings: 'settings',
  charts: 'bar_chart',
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

/** Flat list of navigable pages â€” feeds the header page-jump search. */
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
