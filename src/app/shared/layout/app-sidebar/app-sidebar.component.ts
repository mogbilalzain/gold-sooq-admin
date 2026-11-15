import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';
import { combineLatest, Subscription } from 'rxjs';
import { TranslationService } from '../../services/translation.service';
import { StatsService, StatsOverview } from '../../services/data/stats.service';
import {
  MetalsPricesService,
  CurrentPricesResponse,
} from '../../services/data/metals-prices.service';
import { ADMIN_NAV_GROUPS, AdminNavItem } from '../admin-nav';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, SafeHtmlPipe],
  templateUrl: './app-sidebar.component.html',
})
export class AppSidebarComponent implements OnInit, OnDestroy {
  readonly groups = ADMIN_NAV_GROUPS;

  /** Feeds the nav badges; shared with the dashboard via the 30s cache. */
  stats: StatsOverview | null = null;
  /** Feeds the 24K gold card at the bottom of the sidebar. */
  prices: CurrentPricesResponse | null = null;

  openSubmenu: string | null = null;
  subMenuHeights: { [key: string]: number } = {};

  readonly isExpanded$;
  readonly isMobileOpen$;
  readonly isHovered$;

  private subscription: Subscription = new Subscription();

  constructor(
    public sidebarService: SidebarService,
    public translationService: TranslationService,
    private statsService: StatsService,
    private metalsPricesService: MetalsPricesService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.isExpanded$ = this.sidebarService.isExpanded$;
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
    this.isHovered$ = this.sidebarService.isHovered$;
  }

  ngOnInit() {
    // Close the drawer + reopen the active submenu after each navigation
    this.subscription.add(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.syncSubmenuWithRoute(this.router.url);
        }
      })
    );

    this.subscription.add(
      combineLatest([this.isExpanded$, this.isMobileOpen$, this.isHovered$]).subscribe(
        ([isExpanded, isMobileOpen, isHovered]) => {
          if (!isExpanded && !isMobileOpen && !isHovered) {
            this.cdr.detectChanges();
          }
        }
      )
    );

    this.subscription.add(
      this.translationService.currentLanguage.subscribe(() => {
        this.cdr.detectChanges();
      })
    );

    this.statsService.getOverview().subscribe({
      next: (response) => {
        this.stats = response.data ?? null;
        this.cdr.detectChanges();
      },
      error: () => {
        // Badges are optional chrome — the nav must still render without them.
      },
    });

    this.metalsPricesService.getCurrentPrices({ countryCode: 'AE' }).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.prices = response.data;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        // The gold card is decorative; ignore failures.
      },
    });

    this.syncSubmenuWithRoute(this.router.url);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  isActive(path: string): boolean {
    return path === '/' ? this.router.url === '/' : this.router.url.startsWith(path);
  }

  /** Raw counter behind an item badge; 0 hides the "new" badges. */
  badgeCount(item: AdminNavItem): number {
    if (!item.badge || !this.stats) return 0;
    const source = item.badge.source;
    if (source === 'totalPosts') return this.stats.totals.posts;
    return this.stats.pending[source] ?? 0;
  }

  /** 24K gold gram price in local currency for the footer card. */
  get gold24kPerGram(): number | null {
    const gold = this.prices?.metals?.gold;
    return gold?.by_carat?.['24k'] ?? gold?.local_per_gram ?? null;
  }

  get pricesCurrency(): string {
    return this.prices?.currency ?? 'AED';
  }

  get pricesUpdatedAt(): string | null {
    return this.prices?.timestamps?.metal ?? null;
  }

  toggleSubmenu(key: string) {
    if (this.openSubmenu === key) {
      this.openSubmenu = null;
      this.subMenuHeights[key] = 0;
    } else {
      this.openSubmenu = key;
      setTimeout(() => {
        const el = document.getElementById('ayar-submenu-' + key);
        if (el) {
          this.subMenuHeights[key] = el.scrollHeight;
          this.cdr.detectChanges();
        }
      });
    }
  }

  onSidebarMouseEnter() {
    this.isExpanded$.subscribe((expanded) => {
      if (!expanded) {
        this.sidebarService.setHovered(true);
      }
    }).unsubscribe();
  }

  /** Close the slide-in drawer after tapping a link on mobile. */
  onNavClick() {
    this.isMobileOpen$.subscribe((isMobile) => {
      if (isMobile) {
        this.sidebarService.setMobileOpen(false);
      }
    }).unsubscribe();
  }

  private syncSubmenuWithRoute(currentUrl: string) {
    this.groups.forEach((group, groupIndex) => {
      group.items.forEach((item, itemIndex) => {
        if (item.children?.some((child) => currentUrl.startsWith(child.path))) {
          const key = `${groupIndex}-${itemIndex}`;
          this.openSubmenu = key;
          setTimeout(() => {
            const el = document.getElementById('ayar-submenu-' + key);
            if (el) {
              this.subMenuHeights[key] = el.scrollHeight;
              this.cdr.detectChanges();
            }
          });
        }
      });
    });
  }
}
