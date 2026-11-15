import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ThemeToggleButtonComponent } from '../../components/common/theme-toggle/theme-toggle-button.component';
import { NotificationDropdownComponent } from '../../components/header/notification-dropdown/notification-dropdown.component';
import { UserDropdownComponent } from '../../components/header/user-dropdown/user-dropdown.component';
import { LanguageToggleComponent } from '../../components/common/language-toggle/language-toggle.component';
import { TranslationService } from '../../services/translation.service';
import { ADMIN_NAV_PAGES, AdminNavPage } from '../admin-nav';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterModule,
    ThemeToggleButtonComponent,
    NotificationDropdownComponent,
    UserDropdownComponent,
    LanguageToggleComponent,
  ],
  templateUrl: './app-header.component.html',
})
export class AppHeaderComponent {
  isScrolled = false;
  readonly isMobileOpen$;

  /** Page-jump search state (filters ADMIN_NAV_PAGES). */
  searchQuery = '';
  searchOpen = false;
  activeIndex = 0;

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(
    public sidebarService: SidebarService,
    public translationService: TranslationService,
    private router: Router
  ) {
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
  }

  handleToggle() {
    if (window.innerWidth >= 1280) {
      this.sidebarService.toggleExpanded();
    } else {
      this.sidebarService.toggleMobileOpen();
    }
  }

  /** Pages whose translated label contains the query (max 8). */
  get filteredPages(): AdminNavPage[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) return [];
    return ADMIN_NAV_PAGES.filter((page) =>
      this.translationService.t(page.labelKey).toLowerCase().includes(query)
    ).slice(0, 8);
  }

  onSearchInput(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.searchOpen = true;
    this.activeIndex = 0;
  }

  onSearchFocus() {
    if (this.searchQuery.trim()) {
      this.searchOpen = true;
    }
  }

  onSearchKeydown(event: KeyboardEvent) {
    const items = this.filteredPages;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex = Math.min(this.activeIndex + 1, items.length - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex = Math.max(this.activeIndex - 1, 0);
    } else if (event.key === 'Enter' && items.length) {
      event.preventDefault();
      this.goToPage(items[this.activeIndex]);
    } else if (event.key === 'Escape') {
      this.closeSearch();
      this.searchInput?.nativeElement.blur();
    }
  }

  goToPage(page: AdminNavPage) {
    this.router.navigateByUrl(page.path);
    this.closeSearch();
    this.searchInput?.nativeElement.blur();
  }

  closeSearch() {
    this.searchOpen = false;
    this.searchQuery = '';
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.scrollY > 8;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.ayar-header-search')) {
      this.searchOpen = false;
    }
  }

  ngAfterViewInit() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.searchInput?.nativeElement.focus();
    }
  };
}
